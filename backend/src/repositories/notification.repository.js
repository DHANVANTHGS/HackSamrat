const { BaseRepository, prisma } = require("./base.repository");

class NotificationRepository extends BaseRepository {
  constructor() {
    super(prisma.notification);
  }

  createNotification(data) {
    return this.model.create({ data });
  }

  listForUser(userId, { unreadOnly = false, limit = 50 } = {}) {
    return this.model.findMany({
      where: {
        userId,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(Number(limit) || 50, 100),
    });
  }

  countUnread(userId) {
    return this.model.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  findByIdForUser(id, userId) {
    return this.model.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  markRead(id, userId) {
    return this.model.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  markAllRead(userId) {
    return this.model.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  deleteForUser(id, userId) {
    return this.model.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
}

module.exports = {
  notificationRepository: new NotificationRepository(),
};
