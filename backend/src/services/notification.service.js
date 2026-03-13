const { AppError } = require("../lib/errors");
const { notificationRepository } = require("../repositories/notification.repository");

const notificationService = {
  createNotification(payload) {
    return notificationRepository.createNotification(payload);
  },

  async listForUser(userId, options = {}) {
    const items = await notificationRepository.listForUser(userId, options);
    const unreadCount = await notificationRepository.countUnread(userId);

    return {
      unreadCount,
      items,
    };
  },

  async getUnreadSummary(userId) {
    const unreadCount = await notificationRepository.countUnread(userId);
    return { unreadCount };
  },

  async markOneRead(userId, notificationId) {
    const existing = await notificationRepository.findByIdForUser(notificationId, userId);

    if (!existing) {
      throw new AppError("Notification not found.", 404, "NOTIFICATION_NOT_FOUND");
    }

    await notificationRepository.markRead(notificationId, userId);
    return notificationRepository.findByIdForUser(notificationId, userId);
  },

  async markAllRead(userId) {
    const result = await notificationRepository.markAllRead(userId);
    return {
      updatedCount: result.count,
    };
  },

  async deleteOne(userId, notificationId) {
    const existing = await notificationRepository.findByIdForUser(notificationId, userId);

    if (!existing) {
      throw new AppError("Notification not found.", 404, "NOTIFICATION_NOT_FOUND");
    }

    await notificationRepository.deleteForUser(notificationId, userId);
    return {
      deleted: true,
      id: notificationId,
    };
  },

  notifyClaimChange({ userId, claimId, claimNumber, title, status, message }) {
    return this.createNotification({
      userId,
      type: "CLAIM_UPDATE",
      title,
      message,
      metadata: {
        claimId,
        claimNumber,
        status,
      },
    });
  },

  notifyPremiumReminder({ userId, policyId, policyNumber, planName, message }) {
    return this.createNotification({
      userId,
      type: "PREMIUM_REMINDER",
      title: "Premium reminder",
      message,
      metadata: {
        policyId,
        policyNumber,
        planName,
      },
    });
  },

  notifyRecordAccess({ userId, medicalRecordId, message, actorRole, actorUserId }) {
    return this.createNotification({
      userId,
      type: "RECORD_ACCESS",
      title: "Record access activity",
      message,
      metadata: {
        medicalRecordId,
        actorRole,
        actorUserId,
      },
    });
  },

  notifyGrantChange({ userId, grantId, scope, status, message, doctorId }) {
    return this.createNotification({
      userId,
      type: "SYSTEM",
      title: "Access grant updated",
      message,
      metadata: {
        grantId,
        scope,
        status,
        doctorId,
      },
    });
  },

  notifyEmergencyAccess({ userId, patientId, message, metadata = {} }) {
    return this.createNotification({
      userId,
      type: "EMERGENCY_ACCESS",
      title: "Emergency access event",
      message,
      metadata: {
        patientId,
        ...metadata,
      },
    });
  },
};

module.exports = {
  notificationService,
};
