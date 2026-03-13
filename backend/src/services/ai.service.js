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

const summarizePolicy = (policy) =>
  `${policy.providerName} ${policy.planName} policy ${policy.policyNumber} is valid until ${new Date(policy.validTo).toLocaleDateString('en-IN')} with coverage ${policy.coverageLimit} and used coverage ${policy.usedCoverage}.`;

const summarizeClaim = (claim) => {
  const payout = claim.payoutAmount ? ` Payout amount is ${claim.payoutAmount}.` : "";
  const insurer = claim.insurerDecision ? ` Insurer decision is ${claim.insurerDecision}.` : "";
  return `Claim ${claim.claimNumber} for ${claim.title} is currently ${claim.status}.${insurer}${payout}`;
};

const buildGroundedAnswer = ({ question, policies, claims }) => {
  const lowered = question.toLowerCase();
  const context = {
    policyIds: policies.map((policy) => policy.id),
    claimIds: claims.map((claim) => claim.id),
    retrievalSources: [],
  };

  if (/(claim|reimburse|status|payout|insurer)/.test(lowered)) {
    context.retrievalSources.push("claims");

    if (!claims.length) {
      return {
        answer: "I could not find any claims in your account right now. I can help once a claim exists in your backend records.",
        context,
      };
    }

    const claimMentions = claims.slice(0, 3).map(summarizeClaim).join(" ");
    return {
      answer: `Based on your saved claim data: ${claimMentions}`,
      context,
    };
  }

  if (/(policy|insurance|benefit|coverage|premium|renewal)/.test(lowered)) {
    context.retrievalSources.push("insurance");

    if (!policies.length) {
      return {
        answer: "I could not find any insurance policy data in your account right now.",
        context,
      };
    }

    const activePolicies = policies.filter((policy) => new Date(policy.validTo) >= new Date());
    const sourcePolicies = activePolicies.length ? activePolicies : policies;
    const policySummary = sourcePolicies.slice(0, 2).map(summarizePolicy).join(" ");

    return {
      answer: `Based on your saved insurance data: ${policySummary}`,
      context,
    };
  }

  if (policies.length || claims.length) {
    context.retrievalSources.push("claims", "insurance");
    const latestClaim = claims[0] ? summarizeClaim(claims[0]) : null;
    const latestPolicy = policies[0] ? summarizePolicy(policies[0]) : null;
    const parts = [latestPolicy, latestClaim].filter(Boolean).join(" ");

    return {
      answer: `I can answer questions grounded in your insurance and claims data only. Here is the most relevant information I found: ${parts}`,
      context,
    };
  }

  return {
    answer:
      "I can only answer using your insurance policies, benefits, and claim records that are stored in this backend. I could not find relevant grounded data for your question.",
    context,
  };
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

    const grounded = buildGroundedAnswer({
      question: message,
      policies,
      claims,
    });

    const assistantMessage = await aiRepository.appendMessage(conversation.id, {
      role: "assistant",
      content: grounded.answer,
      grounded: true,
      metadata: {
        retrieval: grounded.context,
        safeguards: {
          groundedOnly: true,
          externalModelUsed: false,
        },
      },
    });

    await aiRepository.touchConversation(
      conversation.id,
      conversation.title || buildConversationTitle(message),
    );

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

    const persistedConversation = await aiRepository.getConversationForPatient(conversation.id, userId, patient.id);

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
