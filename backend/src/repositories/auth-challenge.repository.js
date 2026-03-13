const { BaseRepository, prisma } = require("./base.repository");

class AuthChallengeRepository extends BaseRepository {
  constructor() {
    super(prisma.authChallenge);
  }

  async replaceActiveChallenge({ userId, type, challenge, expiresAt, ipAddress, userAgent }) {
    await this.model.deleteMany({
      where: {
        userId,
        type,
        consumedAt: null,
      },
    });

    return this.model.create({
      data: {
        userId,
        type,
        challenge,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }

  findValidChallenge(userId, type) {
    return this.model.findFirst({
      where: {
        userId,
        type,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  consume(id) {
    return this.model.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }
}

module.exports = {
  authChallengeRepository: new AuthChallengeRepository(),
};
