// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AuditLogAnchor
 * @dev Emits an event to permanently anchor a SHA256 digest hash on the blockchain.
 * This proves that a specific medical audit log existed at a specific time and hasn't been tampered with.
 */
contract AuditLogAnchor {
    
    // Event emitted whenever a new audit log digest is anchored
    event LogAnchored(
        string auditLogId,
        string digest,
        uint256 timestamp
    );

    /**
     * @dev Anchors a new audit log digest.
     * @param auditLogId The UUID of the audit log from the centralized database.
     * @param digest The SHA256 hex string of the canonicalized audit log payload.
     */
    function anchorLog(string calldata auditLogId, string calldata digest) external {
        emit LogAnchored(auditLogId, digest, block.timestamp);
    }
}
