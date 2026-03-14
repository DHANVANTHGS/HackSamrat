const { AppError } = require("../lib/errors");
const { aiRepository } = require("../repositories/ai.repository");
const { auditService } = require("./audit.service");
const { claimService } = require("./claim.service");
const { insuranceService } = require("./insurance.service");
const { patientService } = require("./patient.service");

const MAX_HISTORY_MESSAGES = 10;

const buildConversationTitle = (message) => {
  const normalized = String(message || "").trim().replace(/\s+/g, " ");
  return normalized.slice(0, 60) || "Patient support chat";
};

const { GoogleGenAI } = require("@google/genai");

const buildGroundedAnswer = async ({ question, policies, claims, messageHistory }) => {
  const context = {
    policyIds: policies.map((policy) => policy.id),
    claimIds: claims.map((claim) => claim.id),
    retrievalSources: [],
  };

  if (!process.env.GEMINI_API_KEY) {
    return {
      answer: "I am currently not connected to an LLM. Please ask your administrator to add `GEMINI_API_KEY` to the backend `.env` file and restart the server.",
      context,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    if (policies.length) context.retrievalSources.push("insurance");
    if (claims.length) context.retrievalSources.push("claims");

    const systemInstruction = `
You are the HackSamrat HealthVault AI Assistant, an expert healthcare advisor for patients in India. Your role is twofold:
1. Answer patient questions strictly grounded in their specific backend medical, insurance, and claim records (provided below).
2. Educate the user about relevant government health schemes (e.g., Ayushman Bharat / PM-JAY, CGHS, state-specific schemes) and private health insurance options available across India that they might benefit from.

Here is the user's active data:
---
POLICIES:
${JSON.stringify(policies, null, 2)}

CLAIMS:
${JSON.stringify(claims, null, 2)}
---

CRITICAL RULES:
1. When answering questions about the user's *existing* coverage, records, or claims, you MUST ONLY use the exact backend data provided above.
2. When asked about new policies, better schemes, or general healthcare, use your comprehensive knowledge of the Indian healthcare system to provide accurate, up-to-date recommendations.
3. Proactively suggest a relevant Indian scheme if the user's context (like lacking insurance or having high claim rejections) implies they need better coverage.
4. Be professional, concise, and helpful. Do not hallucinate or make up backend data.
5. Format your responses in simple markdown.
`;

    const formattedHistory = (messageHistory || []).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: question }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.1, // Keep it deterministic
      }
    });

    return {
      answer: response.text || "I was unable to formulate a response.",
      context,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      answer: "I encountered an error connecting to my AI brain. Please try again later.",
      context,
    };
  }
};

const aiService = {
  async chat({ userId, conversationId, message, requestContext }) {
    const patient = await patientService.getPatientProfile(userId);
    const [policies, claims] = await Promise.all([
      insuranceService.listPolicies(userId),
      claimService.listForPatient(userId),
    ]);

    let conversation = null;

    if (conversationId) {
      conversation = await aiRepository.getConversationForPatient(conversationId, userId, patient.id);

      if (!conversation) {
        throw new AppError("Conversation not found.", 404, "AI_CONVERSATION_NOT_FOUND");
      }
    }

    if (!conversation) {
      conversation = await aiRepository.createConversation({
        userId,
        patientId: patient.id,
        title: buildConversationTitle(message),
      });
    }

    await aiRepository.appendMessage(conversation.id, {
      role: "user",
      content: message,
      grounded: true,
      metadata: {
        source: "patient",
      },
    });

    await aiRepository.touchConversation(
      conversation.id,
      conversation.title || buildConversationTitle(message),
    );

    let persistedConversation = await aiRepository.getConversationForPatient(conversation.id, userId, patient.id);

    const grounded = await buildGroundedAnswer({
      question: message,
      policies,
      claims,
      messageHistory: persistedConversation.messages.slice(-MAX_HISTORY_MESSAGES),
    });

    const assistantMessage = await aiRepository.appendMessage(conversation.id, {
      role: "assistant",
      content: grounded.answer,
      grounded: true,
      metadata: {
        retrieval: grounded.context,
        safeguards: {
          groundedOnly: true,
          externalModelUsed: true,
          model: "gemini-2.5-flash",
        },
      },
    });

    await auditService.logEvent({
      actorUserId: userId,
      action: "AI_MESSAGE",
      targetResource: "ai_conversation",
      targetResourceId: conversation.id,
      reason: "Patient used grounded AI assistant chat",
      metadata: {
        patientId: patient.id,
        conversationId: conversation.id,
        messageId: assistantMessage.id,
        retrievalSources: grounded.context.retrievalSources,
      },
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });

    persistedConversation = await aiRepository.getConversationForPatient(conversation.id, userId, patient.id);

    return {
      conversationId: conversation.id,
      title: persistedConversation.title,
      grounded: true,
      safeguards: {
        groundedOnly: true,
        approvedDomains: ["insurance", "claims", "policy-benefits"],
      },
      response: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        metadata: assistantMessage.metadata,
        createdAt: assistantMessage.createdAt,
      },
      messages: persistedConversation.messages.slice(-MAX_HISTORY_MESSAGES),
    };
  },
};

module.exports = {
  aiService,
};
