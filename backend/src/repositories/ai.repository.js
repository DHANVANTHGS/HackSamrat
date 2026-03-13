const { prisma } = require("./base.repository");

class AIRepository {
  async getConversationForPatient(conversationId, userId, patientId) {
    return prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        userId,
        patientId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async createConversation({ userId, patientId, title }) {
    return prisma.aIConversation.create({
      data: {
        userId,
        patientId,
        title,
        lastMessageAt: new Date(),
      },
    });
  }

  async appendMessage(conversationId, { role, content, grounded, metadata }) {
    return prisma.aIMessage.create({
      data: {
        conversationId,
        role,
        content,
        grounded,
        metadata,
      },
    });
  }

  async touchConversation(conversationId, title) {
    return prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        ...(title ? { title } : {}),
      },
    });
  }
}

module.exports = {
  aiRepository: new AIRepository(),
};
