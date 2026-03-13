const crypto = require("crypto");

const { AppError } = require("../lib/errors");
const { medicalRecordRepository } = require("../repositories/medical-record.repository");
const { auditService } = require("./audit.service");
const { notificationService } = require("./notification.service");
const { patientService } = require("./patient.service");
const { storageService } = require("./storage.service");

const allowedRecordTypes = new Set([
  "REPORT",
  "PRESCRIPTION",
  "LAB_RESULT",
  "IMAGING",
  "DISCHARGE_SUMMARY",
  "CLAIM_DOCUMENT",
  "OTHER",
]);

const toFileResponse = (file) => ({
  id: file.id,
  originalName: file.originalName,
  mimeType: file.mimeType,
  fileSizeBytes: file.fileSizeBytes,
  checksumSha256: file.checksumSha256,
  uploadedAt: file.uploadedAt,
});

const toRecordResponse = (record) => ({
  id: record.id,
  title: record.title,
  description: record.description,
  recordType: record.recordType,
  verificationStatus: record.verificationStatus,
  source: record.source,
  occurredAt: record.occurredAt,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
  uploadedByUser: record.uploadedByUser,
  uploadedByDoctor: record.uploadedByDoctor,
  files: record.files.map(toFileResponse),
});

const validateRecordType = (recordType) => {
  if (!recordType) {
    return null;
  }

  const normalized = String(recordType).trim().toUpperCase();

  if (!allowedRecordTypes.has(normalized)) {
    throw new AppError("Invalid medical record type.", 400, "VALIDATION_ERROR", {
      allowedRecordTypes: Array.from(allowedRecordTypes),
    });
  }

  return normalized;
};

const requestAuditContext = (requestContext = {}) => ({
  ipAddress: requestContext.ipAddress,
  userAgent: requestContext.userAgent,
});

const ensureFiles = (files) => {
  if (!files?.length) {
    throw new AppError("At least one file is required.", 400, "VALIDATION_ERROR");
  }
};

const buildUploadedFiles = async (patientCode, files) => {
  const uploadedFiles = [];

  for (const file of files) {
    const checksumSha256 = crypto.createHash("sha256").update(file.buffer).digest("hex");
    const storageKey = storageService.buildRecordStorageKey(patientCode, file.originalname);

    await storageService.uploadBuffer({
      key: storageKey,
      buffer: file.buffer,
      mimeType: file.mimetype,
      checksumSha256,
    });

    uploadedFiles.push({
      storageKey,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      checksumSha256,
    });
  }

  return uploadedFiles;
};

const notifyPatientRecordAccess = async (record, actorUserId, actorRole, message) => {
  const patientNotificationUserId = record.patient?.userId || null;

  if (!patientNotificationUserId) {
    return;
  }

  await notificationService.notifyRecordAccess({
    userId: patientNotificationUserId,
    medicalRecordId: record.id,
    actorRole,
    actorUserId,
    message,
  });
};

const medicalRecordService = {
  validateRecordType,

  async listPatientRecords(userId, { recordType }, requestContext) {
    const patient = await patientService.getPatientProfile(userId);
    const records = await medicalRecordRepository.findForPatient(patient.id, {
      recordType: validateRecordType(recordType),
    });

    return {
      patientId: patient.id,
      items: records.map(toRecordResponse),
    };
  },

  async getPatientRecord(userId, recordId, requestContext) {
    const patient = await patientService.getPatientProfile(userId);
    const record = await medicalRecordRepository.findPatientRecordById(patient.id, recordId);

    if (!record) {
      throw new AppError("Medical record not found.", 404, "RECORD_NOT_FOUND");
    }

    await auditService.logEvent({
      actorUserId: patient.userId,
      action: "RECORD_VIEWED",
      targetResource: "medical_record",
      targetResourceId: record.id,
      reason: "Patient viewed medical record details",
      metadata: { patientId: patient.id },
      ...requestAuditContext(requestContext),
    });

    return toRecordResponse(record);
  },

  async uploadPatientRecord(userId, payload, files, requestContext) {
    const patient = await patientService.getPatientProfile(userId);
    ensureFiles(files);

    const recordType = validateRecordType(payload.recordType);

    if (!payload.title || !recordType) {
      throw new AppError("Title and record type are required.", 400, "VALIDATION_ERROR");
    }

    const uploadedFiles = await buildUploadedFiles(patient.patientCode, files);

    const record = await medicalRecordRepository.createWithFiles(
      {
        patientId: patient.id,
        uploadedByUserId: patient.userId,
        title: payload.title,
        description: payload.description || null,
        recordType,
        source: payload.source || "patient-upload",
        occurredAt: payload.occurredAt ? new Date(payload.occurredAt) : null,
      },
      uploadedFiles,
    );

    await auditService.logEvent({
      actorUserId: patient.userId,
      action: "RECORD_UPLOADED",
      targetResource: "medical_record",
      targetResourceId: record.id,
      reason: "Patient uploaded medical record",
      metadata: {
        patientId: patient.id,
        fileCount: uploadedFiles.length,
        recordType,
      },
      ...requestAuditContext(requestContext),
    });

    return toRecordResponse(record);
  },

  async getDoctorPatientRecord({ doctorUserId, patientId, recordId, requestContext }) {
    const record = await medicalRecordRepository.findPatientRecordById(patientId, recordId);

    if (!record) {
      throw new AppError("Medical record not found.", 404, "RECORD_NOT_FOUND");
    }

    await auditService.logEvent({
      actorUserId: doctorUserId,
      action: "RECORD_VIEWED",
      targetResource: "medical_record",
      targetResourceId: record.id,
      reason: "Doctor viewed patient medical record",
      metadata: { patientId },
      ...requestAuditContext(requestContext),
    });

    await notifyPatientRecordAccess(
      record,
      doctorUserId,
      "DOCTOR",
      `A doctor viewed your record ${record.title}.`,
    );

    return toRecordResponse(record);
  },

  async listDoctorPatientRecords({ doctorUserId, patientId, recordType, requestContext }) {
    const normalizedRecordType = validateRecordType(recordType);
    const records = await medicalRecordRepository.findForPatient(patientId, {
      recordType: normalizedRecordType,
    });

    await auditService.logEvent({
      actorUserId: doctorUserId,
      action: "RECORD_VIEWED",
      targetResource: "patient_records",
      targetResourceId: patientId,
      reason: "Doctor listed patient medical records",
      metadata: { patientId, recordType: normalizedRecordType },
      ...requestAuditContext(requestContext),
    });

    if (records[0]) {
      await notifyPatientRecordAccess(
        records[0],
        doctorUserId,
        "DOCTOR",
        "A doctor accessed your medical record list.",
      );
    }

    return {
      patientId,
      items: records.map(toRecordResponse),
    };
  },

  async uploadDoctorPatientRecord({ doctor, patient, payload, files, requestContext }) {
    ensureFiles(files);

    const recordType = validateRecordType(payload.recordType);

    if (!payload.title || !recordType) {
      throw new AppError("Title and record type are required.", 400, "VALIDATION_ERROR");
    }

    const uploadedFiles = await buildUploadedFiles(patient.patientCode, files);

    const record = await medicalRecordRepository.createWithFiles(
      {
        patientId: patient.id,
        uploadedByDoctorId: doctor.id,
        title: payload.title,
        description: payload.description || null,
        recordType,
        source: payload.source || "doctor-upload",
        occurredAt: payload.occurredAt ? new Date(payload.occurredAt) : null,
      },
      uploadedFiles,
    );

    await auditService.logEvent({
      actorUserId: doctor.userId,
      action: "RECORD_UPLOADED",
      targetResource: "medical_record",
      targetResourceId: record.id,
      reason: "Doctor uploaded medical record for patient",
      metadata: {
        patientId: patient.id,
        doctorId: doctor.id,
        fileCount: uploadedFiles.length,
        recordType,
      },
      ...requestAuditContext(requestContext),
    });

    await notificationService.notifyRecordAccess({
      userId: patient.userId,
      medicalRecordId: record.id,
      actorRole: "DOCTOR",
      actorUserId: doctor.userId,
      message: `A doctor uploaded a new record (${record.title}) to your profile.`,
    });

    return toRecordResponse(record);
  },

  async downloadPatientRecordFile(userId, recordId, fileId, requestContext) {
    const patient = await patientService.getPatientProfile(userId);
    const record = await medicalRecordRepository.findPatientRecordById(patient.id, recordId);

    if (!record) {
      throw new AppError("Medical record not found.", 404, "RECORD_NOT_FOUND");
    }

    const file = record.files.find((item) => item.id === fileId);

    if (!file) {
      throw new AppError("Medical record file not found.", 404, "FILE_NOT_FOUND");
    }

    const storedFile = await storageService.getFile(file.storageKey);

    await auditService.logEvent({
      actorUserId: patient.userId,
      action: "RECORD_DOWNLOADED",
      targetResource: "record_file",
      targetResourceId: file.id,
      reason: "Patient downloaded medical record file",
      metadata: {
        patientId: patient.id,
        medicalRecordId: record.id,
      },
      ...requestAuditContext(requestContext),
    });

    return {
      file,
      stream: storedFile.stream,
      contentType: storedFile.contentType || file.mimeType,
      contentLength: storedFile.contentLength || file.fileSizeBytes,
    };
  },

  async downloadDoctorPatientRecordFile({ doctorUserId, patientId, recordId, fileId, requestContext }) {
    const record = await medicalRecordRepository.findPatientRecordById(patientId, recordId);

    if (!record) {
      throw new AppError("Medical record not found.", 404, "RECORD_NOT_FOUND");
    }

    const file = record.files.find((item) => item.id === fileId);

    if (!file) {
      throw new AppError("Medical record file not found.", 404, "FILE_NOT_FOUND");
    }

    const storedFile = await storageService.getFile(file.storageKey);

    await auditService.logEvent({
      actorUserId: doctorUserId,
      action: "RECORD_DOWNLOADED",
      targetResource: "record_file",
      targetResourceId: file.id,
      reason: "Doctor downloaded patient medical record file",
      metadata: {
        patientId,
        medicalRecordId: record.id,
      },
      ...requestAuditContext(requestContext),
    });

    await notifyPatientRecordAccess(
      record,
      doctorUserId,
      "DOCTOR",
      `A doctor downloaded a file from your record ${record.title}.`,
    );

    return {
      file,
      stream: storedFile.stream,
      contentType: storedFile.contentType || file.mimeType,
      contentLength: storedFile.contentLength || file.fileSizeBytes,
    };
  },
};

module.exports = {
  medicalRecordService,
};
