const { BaseRepository, prisma } = require("./base.repository");

class AuditRepository extends BaseRepository {
  constructor() {
    super(prisma.auditLog);
  }

  log(data) {
    return this.model.create({ data });
  }

  list(args = {}) {
    const { action, targetResource, actorUserId, limit = 50 } = args;

    return this.model.findMany({
      where: {
        ...(action ? { action } : {}),
        ...(targetResource ? { targetResource } : {}),
        ...(actorUserId ? { actorUserId } : {}),
      },
      orderBy: { occurredAt: "desc" },
      take: Math.min(Number(limit) || 50, 100),
    });
  }
}

module.exports = {
  auditRepository: new AuditRepository(),
};
