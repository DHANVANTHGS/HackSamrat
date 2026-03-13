const { BaseRepository, prisma } = require("./base.repository");

class ClaimRepository extends BaseRepository {
  constructor() {
    super(prisma.claim);
  }

  findForPatient(patientId) {
    return this.model.findMany({
      where: { patientId },
      include: {
        documents: true,
        insurancePolicy: {
          include: {
            benefits: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findByIdForPatient(claimId, patientId) {
    return this.model.findFirst({
      where: {
        id: claimId,
        patientId,
      },
      include: {
        documents: true,
        insurancePolicy: {
          include: {
            benefits: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  createClaim({ claimData, initialStatusHistory }) {
    return this.model.create({
      data: {
        ...claimData,
        statusHistory: {
          create: initialStatusHistory,
        },
      },
      include: {
        documents: true,
        insurancePolicy: {
          include: {
            benefits: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  updateClaim(claimId, data, statusHistoryEntry) {
    return this.model.update({
      where: { id: claimId },
      data: {
        ...data,
        ...(statusHistoryEntry
          ? {
              statusHistory: {
                create: statusHistoryEntry,
              },
            }
          : {}),
      },
      include: {
        documents: true,
        insurancePolicy: {
          include: {
            benefits: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  addDocument(claimId, document) {
    return prisma.claimDocument.create({
      data: {
        claimId,
        ...document,
      },
    });
  }

  findDocumentForPatient(claimId, documentId, patientId) {
    return prisma.claimDocument.findFirst({
      where: {
        id: documentId,
        claimId,
        claim: {
          patientId,
        },
      },
      include: {
        claim: true,
      },
    });
  }
}

module.exports = {
  claimRepository: new ClaimRepository(),
};
