const { BaseRepository, prisma } = require("./base.repository");
const { authUserInclude } = require("./user.repository");

class SessionRepository extends BaseRepository {
  constructor() {
    super(prisma.session);
  }

  createSession(data) {
    return this.model.create({ data });
  }

  findActiveByToken(token) {
    return this.model.findFirst({
      where: {
        token,
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: authUserInclude,
        },
      },
    });
  }

  touch(id) {
    return this.model.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });
  }

  revoke(id) {
    return this.model.update({
      where: { id },
      data: { status: "REVOKED" },
    });
  }
}

module.exports = {
  sessionRepository: new SessionRepository(),
};
