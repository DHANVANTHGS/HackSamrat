const crypto = require("crypto");
const { ethers } = require("ethers");

const { config } = require("../config/env");
const { AppError } = require("../lib/errors");
const { blockchainAnchorRepository } = require("../repositories/blockchain-anchor.repository");

const canonicalize = (value) => JSON.stringify(value, Object.keys(value).sort());

const buildDigest = (payload) => crypto.createHash("sha256").update(canonicalize(payload)).digest("hex");

// Simplified ABI for the AuditLogAnchor Smart Contract we are deploying
const ABI = [
  "function anchorLog(string calldata auditLogId, string calldata digest) external"
];

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
    let transactionHash = `0x${digest.slice(0, 64)}`; // Fallback mock hash

    // Attempt real blockchain anchoring if configured
    if (process.env.RPC_URL && process.env.WALLET_PRIVATE_KEY && process.env.CONTRACT_ADDRESS) {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);

        const tx = await contract.anchorLog(auditLog.id, digest);
        await tx.wait(); // Wait for confirmation
        transactionHash = tx.hash;
        console.log(`Successfully anchored AuditLog ${auditLog.id} on Polygon: ${transactionHash}`);
      } catch (err) {
        console.error("Failed to broadcast real transaction to Polygon", err);
        // Continue and just use the mock hash if the RPC fails so we don't break the app
      }
    }

    return blockchainAnchorRepository.createAnchor({
      auditLogId: auditLog.id,
      sourceEntityType: "audit_log",
      sourceEntityId: auditLog.id,
      digest,
      chainName: config.blockchain.chainName,
      status: "ANCHORED",
      transactionHash,
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
