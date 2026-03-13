const crypto = require("crypto");

const { AppError } = require("../lib/errors");
const { claimRepository } = require("../repositories/claim.repository");
const { auditService } = require("./audit.service");
const { insuranceService } = require("./insurance.service");
const { notificationService } = require("./notification.service");
const { patientService } = require("./patient.service");
const { storageService } = require("./storage.service");

const claimStatuses = new Set(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "DOCS_VERIFIED", "APPROVED", "REJECTED", "DISBURSED"]);

const normalizeStatus = (status) => {
  if (!status) {
    return null;
  }

  const normalized = String(status).trim().toUpperCase();

  if (!claimStatuses.has(normalized)) {
    throw new AppError("Invalid claim status.", 400, "VALIDATION_ERROR", {
      allowedStatuses: Array.from(claimStatuses),
    });
  }

  return normalized;
};

const parseDate = (value, fieldName) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`Invalid ${fieldName}.`, 400, "VALIDATION_ERROR");
  }

  return parsed;
};

const parseAmount = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    throw new AppError(`Invalid ${fieldName}.`, 400, "VALIDATION_ERROR");
  }

  return amount.toFixed(2);
};

const requestAuditContext = (requestContext = {}) => ({
  ipAddress: requestContext.ipAddress,
  userAgent: requestContext.userAgent,
});

const mapDocument = (document) => ({
  id: document.id,
  originalName: document.originalName,
  mimeType: document.mimeType,
  fileSizeBytes: document.fileSizeBytes,
  uploadedAt: document.uploadedAt,
});

const mapStatusHistory = (entry) => ({
  id: entry.id,
  fromStatus: entry.fromStatus,
  toStatus: entry.toStatus,
  note: entry.note,
  metadata: entry.metadata,
  createdAt: entry.createdAt,
});

const mapClaim = (claim) => ({
  id: claim.id,
  claimNumber: claim.claimNumber,
  patientId: claim.patientId,
  insurancePolicyId: claim.insurancePolicyId,
  status: claim.status,
  title: claim.title,
  description: claim.description,
  amountClaimed: claim.amountClaimed,
  amountApproved: claim.amountApproved,
  insurerReference: claim.insurerReference,
  insurerDecisionAt: claim.insurerDecisionAt,
  insurerDecision: claim.insurerDecision,
  decisionNotes: claim.decisionNotes,
  payoutAmount: claim.payoutAmount,
  payoutReference: claim.payoutReference,
  payoutProcessedAt: claim.payoutProcessedAt,
  submittedAt: claim.submittedAt,
  resolvedAt: claim.resolvedAt,
  metadata: claim.metadata,
  createdAt: claim.createdAt,
  updatedAt: claim.updatedAt,
  insurancePolicy: claim.insurancePolicy,
  documents: claim.documents.map(mapDocument),
  statusHistory: claim.statusHistory.map(mapStatusHistory),
});

const buildClaimNumber = () => `CLM-${Date.now()}-${crypto.randomInt(1000, 9999)}`;

const requireClaimAmount = (value) => {
  const amount = parseAmount(value, "amountClaimed");

  if (amount === null) {
    throw new AppError("amountClaimed is required.", 400, "VALIDATION_ERROR");
  }

  return amount;
};

const claimService = {
  async listForPatient(userId) {
    const patient = await patientService.getPatientProfile(userId);
    const claims = await claimRepository.findForPatient(patient.id);
    return claims.map(mapClaim);
  },

  async getForPatient(userId, claimId) {
    const patient = await patientService.getPatientProfile(userId);
    const claim = await claimRepository.findByIdForPatient(claimId, patient.id);

    if (!claim) {
      throw new AppError("Claim not found.", 404, "CLAIM_NOT_FOUND");
    }

    return mapClaim(claim);
  },

  async createForPatient(userId, payload, requestContext) {
    const patient = await patientService.getPatientProfile(userId);
    const status = normalizeStatus(payload.status) || "DRAFT";
    const submittedAt = status === "SUBMITTED" ? new Date() : null;

    await insuranceService.ensurePatientOwnsPolicy(patient.id, payload.insurancePolicyId || null);

    const claim = await claimRepository.createClaim({
      claimData: {
        patientId: patient.id,
        insurancePolicyId: payload.insurancePolicyId || null,
        claimNumber: buildClaimNumber(),
        status,
        title: payload.title,
        description: payload.description || null,
        amountClaimed: requireClaimAmount(payload.amountClaimed),
        amountApproved: parseAmount(payload.amountApproved, "amountApproved"),
        insurerReference: payload.insurerReference || null,
        insurerDecisionAt: parseDate(payload.insurerDecisionAt, "insurerDecisionAt"),
        insurerDecision: payload.insurerDecision || null,
        decisionNotes: payload.decisionNotes || null,
        payoutAmount: parseAmount(payload.payoutAmount, "payoutAmount"),
        payoutReference: payload.payoutReference || null,
        payoutProcessedAt: parseDate(payload.payoutProcessedAt, "payoutProcessedAt"),
        submittedAt,
        resolvedAt: payload.resolvedAt ? parseDate(payload.resolvedAt, "resolvedAt") : null,
        metadata: payload.metadata || null,
      },
      initialStatusHistory: {
        actorUserId: patient.userId,
        fromStatus: null,
        toStatus: status,
        note: payload.statusNote || "Claim created",
        metadata: {
          source: "patient",
        },
      },
    });

    await auditService.logEvent({
      actorUserId: patient.userId,
      action: "CLAIM_CREATED",
      targetResource: "claim",
      targetResourceId: claim.id,
      reason: "Patient created claim",
      metadata: {
        patientId: patient.id,
        claimNumber: claim.claimNumber,
        status: claim.status,
      },
      ...requestAuditContext(requestContext),
    });

    await notificationService.notifyClaimChange({
      userId: patient.userId,
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      title: "Claim created",
      status: claim.status,
      message: `Claim ${claim.claimNumber} was created with status ${claim.status}.`,
    });

    return mapClaim(claim);
  },

  async updateForPatient(userId, claimId, payload, requestContext) {
    const patient = await patientService.getPatientProfile(userId);
    const existingClaim = await claimRepository.findByIdForPatient(claimId, patient.id);

    if (!existingClaim) {
      throw new AppError("Claim not found.", 404, "CLAIM_NOT_FOUND");
    }

    if (payload.insurancePolicyId !== undefined) {
      await insuranceService.ensurePatientOwnsPolicy(patient.id, payload.insurancePolicyId || null);
    }

    const nextStatus = normalizeStatus(payload.status) || existingClaim.status;
    const statusChanged = nextStatus !== existingClaim.status;

    const updatedClaim = await claimRepository.updateClaim(
      claimId,
      {
        title: payload.title ?? existingClaim.title,
        description: payload.description ?? existingClaim.description,
        insurancePolicyId: payload.insurancePolicyId ?? existingClaim.insurancePolicyId,
        amountClaimed:
          payload.amountClaimed !== undefined
            ? requireClaimAmount(payload.amountClaimed)
            : existingClaim.amountClaimed,
        amountApproved:
          payload.amountApproved !== undefined
            ? parseAmount(payload.amountApproved, "amountApproved")
            : existingClaim.amountApproved,
        status: nextStatus,
        insurerReference: payload.insurerReference ?? existingClaim.insurerReference,
        insurerDecisionAt:
          payload.insurerDecisionAt !== undefined
            ? parseDate(payload.insurerDecisionAt, "insurerDecisionAt")
            : existingClaim.insurerDecisionAt,
        insurerDecision: payload.insurerDecision ?? existingClaim.insurerDecision,
        decisionNotes: payload.decisionNotes ?? existingClaim.decisionNotes,
        payoutAmount:
          payload.payoutAmount !== undefined
            ? parseAmount(payload.payoutAmount, "payoutAmount")
            : existingClaim.payoutAmount,
        payoutReference: payload.payoutReference ?? existingClaim.payoutReference,
        payoutProcessedAt:
          payload.payoutProcessedAt !== undefined
            ? parseDate(payload.payoutProcessedAt, "payoutProcessedAt")
            : existingClaim.payoutProcessedAt,
        submittedAt:
          nextStatus === "SUBMITTED" && !existingClaim.submittedAt ? new Date() : existingClaim.submittedAt,
        resolvedAt:
          payload.resolvedAt !== undefined
            ? parseDate(payload.resolvedAt, "resolvedAt")
            : ["APPROVED", "REJECTED", "DISBURSED"].includes(nextStatus)
              ? existingClaim.resolvedAt || new Date()
              : existingClaim.resolvedAt,
        metadata: payload.metadata ?? existingClaim.metadata,
      },
      statusChanged
        ? {
            actorUserId: patient.userId,
            fromStatus: existingClaim.status,
            toStatus: nextStatus,
            note: payload.statusNote || `Claim status changed from ${existingClaim.status} to ${nextStatus}`,
            metadata: {
              source: "patient-update",
            },
          }
        : null,
    );

    await auditService.logEvent({
      actorUserId: patient.userId,
      action: "CLAIM_UPDATED",
      targetResource: "claim",
      targetResourceId: updatedClaim.id,
      reason: "Patient updated claim",
      metadata: {
        patientId: patient.id,
        claimNumber: updatedClaim.claimNumber,
        status: updatedClaim.status,
        statusChanged,
      },
      ...requestAuditContext(requestContext),
    });

    if (statusChanged) {
      await notificationService.notifyClaimChange({
        userId: patient.userId,
        claimId: updatedClaim.id,
        claimNumber: updatedClaim.claimNumber,
        title: "Claim status updated",
        status: updatedClaim.status,
        message: `Claim ${updatedClaim.claimNumber} moved to ${updatedClaim.status}.`,
      });
    }

    return mapClaim(updatedClaim);
  },

  async uploadDocumentForPatient(userId, claimId, file, requestContext) {
    const patient = await patientService.getPatientProfile(userId);
    const claim = await claimRepository.findByIdForPatient(claimId, patient.id);

    if (!claim) {
      throw new AppError("Claim not found.", 404, "CLAIM_NOT_FOUND");
    }

    if (!file) {
      throw new AppError("A claim document file is required.", 400, "VALIDATION_ERROR");
    }

    const checksumSha256 = crypto.createHash("sha256").update(file.buffer).digest("hex");
    const storageKey = storageService.buildClaimStorageKey(claim.claimNumber, file.originalname);

    await storageService.uploadBuffer({
      key: storageKey,
      buffer: file.buffer,
      mimeType: file.mimetype,
      checksumSha256,
    });

    const document = await claimRepository.addDocument(claim.id, {
      storageKey,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
    });

    const updatedClaim = await claimRepository.updateClaim(
      claim.id,
      {},
      {
        actorUserId: patient.userId,
        fromStatus: claim.status,
        toStatus: claim.status,
        note: "Claim document uploaded",
        metadata: {
          documentId: document.id,
          fileName: document.originalName,
        },
      },
    );

    await auditService.logEvent({
      actorUserId: patient.userId,
      action: "CLAIM_UPDATED",
      targetResource: "claim_document",
      targetResourceId: document.id,
      reason: "Patient uploaded claim document",
      metadata: {
        patientId: patient.id,
        claimId: claim.id,
        claimNumber: claim.claimNumber,
      },
      ...requestAuditContext(requestContext),
    });

    await notificationService.notifyClaimChange({
      userId: patient.userId,
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      title: "Claim document uploaded",
      status: updatedClaim.status,
      message: `A new document was uploaded for claim ${claim.claimNumber}.`,
    });

    return {
      document: mapDocument(document),
      claim: mapClaim(updatedClaim),
    };
  },

  async downloadDocumentForPatient(userId, claimId, documentId, requestContext) {
    const patient = await patientService.getPatientProfile(userId);
    const document = await claimRepository.findDocumentForPatient(claimId, documentId, patient.id);

    if (!document) {
      throw new AppError("Claim document not found.", 404, "CLAIM_DOCUMENT_NOT_FOUND");
    }

    const storedFile = await storageService.getFile(document.storageKey);

    await auditService.logEvent({
      actorUserId: patient.userId,
      action: "CLAIM_UPDATED",
      targetResource: "claim_document",
      targetResourceId: document.id,
      reason: "Patient downloaded claim document",
      metadata: {
        patientId: patient.id,
        claimId,
      },
      ...requestAuditContext(requestContext),
    });

    return {
      document,
      stream: storedFile.stream,
      contentType: storedFile.contentType || document.mimeType,
      contentLength: storedFile.contentLength || document.fileSizeBytes,
    };
  },
};

module.exports = {
  claimService,
};
