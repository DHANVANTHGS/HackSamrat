const crypto = require("crypto");

const { config } = require("../config/env");
const { AppError } = require("../lib/errors");
const { blockchainAnchorRepository } = require("../repositories/blockchain-anchor.repository");

const canonicalize = (value) => JSON.stringify(value, Object.keys(value).sort());

const buildDigest = (payload) => crypto.createHash("sha256").update(canonicalize(payload)).digest("hex");
const buildTxHash = (digest) => `0x${digest.slice(0, 64)}`;

const blockchainService = {
  shouldAnchorAuditAction(action) {
    return config.blockchain.enabled && config.blockchain.anchorAuditActions.includes(action);
  },

  async anchorAuditLog(auditLog) {
    const payload = {
      auditLogId: auditLog.id,
      actorUserId: auditLog.actorUserId,
      action: auditLog.action,
      targetResource: auditLog.targetResource,
      targetResourceId: auditLog.targetResourceId,
      occurredAt: auditLog.occurredAt,
      metadata: auditLog.metadata,
    };

    const digest = buildDigest(payload);

    return blockchainAnchorRepository.createAnchor({
      auditLogId: auditLog.id,
      sourceEntityType: "audit_log",
      sourceEntityId: auditLog.id,
      digest,
      chainName: config.blockchain.chainName,
      status: "ANCHORED",
      transactionHash: buildTxHash(digest),
      anchoredAt: new Date(),
    });
  },

  async verifyDigest({ digest, anchorId }) {
    const anchors = anchorId
      ? [await blockchainAnchorRepository.findById(anchorId)].filter(Boolean)
      : await blockchainAnchorRepository.findByDigest(digest);

    if (!anchors.length) {
      throw new AppError("Blockchain anchor not found.", 404, "BLOCKCHAIN_ANCHOR_NOT_FOUND");
    }

    return {
      matches: anchors.some((anchor) => anchor.digest === digest),
      anchors,
    };
  },

  listRecentAnchors(limit) {
    return blockchainAnchorRepository.listRecent(limit);
  },
};

module.exports = {
  blockchainService,
};
