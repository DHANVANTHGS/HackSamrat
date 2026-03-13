const { blockchainService } = require("./blockchain.service");
const { auditRepository } = require("../repositories/audit.repository");

const auditService = {
  async logEvent({ actorUserId, action, targetResource, targetResourceId, reason, metadata, ipAddress, userAgent }) {
    const auditLog = await auditRepository.log({
      actorUserId,
      action,
      targetResource,
      targetResourceId,
      reason,
      metadata,
      ipAddress,
      userAgent,
    });

    if (blockchainService.shouldAnchorAuditAction(action)) {
      await blockchainService.anchorAuditLog(auditLog);
    }

    return auditLog;
  },

  listEvents(filters) {
    return auditRepository.list(filters);
  },

  logAuthEvent(payload) {
    return this.logEvent(payload);
  },
};

module.exports = {
  auditService,
};
