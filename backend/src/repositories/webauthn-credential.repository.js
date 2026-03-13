const { BaseRepository, prisma } = require("./base.repository");

class WebAuthnCredentialRepository extends BaseRepository {
  constructor() {
    super(prisma.webAuthnCredential);
  }

  findByUserId(userId) {
    return this.model.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  findByCredentialId(credentialId) {
    return this.model.findUnique({ where: { credentialId } });
  }

  upsertCredential({ credentialId, ...data }) {
    return this.model.upsert({
      where: { credentialId },
      update: data,
      create: {
        credentialId,
        ...data,
      },
    });
  }

  updateCounter(id, counter, deviceType, backedUp) {
    return this.model.update({
      where: { id },
      data: {
        counter,
        deviceType,
        backedUp,
      },
    });
  }
}

module.exports = {
  webAuthnCredentialRepository: new WebAuthnCredentialRepository(),
};
