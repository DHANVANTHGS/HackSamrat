const { AppError } = require("../lib/errors");
const { accessGrantRepository } = require("../repositories/access-grant.repository");
const { doctorRepository } = require("../repositories/doctor.repository");
const { patientRepository } = require("../repositories/patient.repository");
const { auditService } = require("./audit.service");
const { notificationService } = require("./notification.service");
const { patientService } = require("./patient.service");

const requestAuditContext = (requestContext = {}) => ({
  ipAddress: requestContext.ipAddress,
  userAgent: requestContext.userAgent,
});

const toCriticalRecord = (record) => ({
  id: record.id,
  title: record.title,
  recordType: record.recordType,
  occurredAt: record.occurredAt,
  createdAt: record.createdAt,
  verificationStatus: record.verificationStatus,
  files: record.files.map((file) => ({
    id: file.id,
    originalName: file.originalName,
    mimeType: file.mimeType,
  })),
});

const emergencyService = {
  async getPatientSettings(userId) {
    const patient = await patientService.getPatientProfile(userId);

    return (
      patient.emergencyAccessSettings || {
        patientId: patient.id,
        enabled: false,
        allowCriticalOnly: true,
        unlockWindowMinutes: 30,
        notes: null,
      }
    );
  },

  async updatePatientSettings(userId, payload) {
    const patient = await patientService.getPatientProfile(userId);

    return patientRepository.upsertEmergencySettings(patient.id, {
      enabled: payload.enabled ?? patient.emergencyAccessSettings?.enabled ?? false,
      allowCriticalOnly: payload.allowCriticalOnly ?? patient.emergencyAccessSettings?.allowCriticalOnly ?? true,
      unlockWindowMinutes: Number(payload.unlockWindowMinutes ?? patient.emergencyAccessSettings?.unlockWindowMinutes ?? 30),
      notes: payload.notes ?? patient.emergencyAccessSettings?.notes ?? null,
    });
  },

  async emergencyLookup({ doctorUserId, patientCode, reason, requestContext }) {
    const doctor = await doctorRepository.findByUserId(doctorUserId);

    if (!doctor) {
      throw new AppError("Doctor profile not found.", 404, "DOCTOR_NOT_FOUND");
    }

    if (doctor.verificationStatus !== "VERIFIED") {
      throw new AppError("Only verified clinicians can perform emergency lookup.", 403, "DOCTOR_NOT_VERIFIED");
    }

    const patient = await patientRepository.findEmergencyProfileByPatientCode(patientCode);

    if (!patient) {
      throw new AppError("Patient not found.", 404, "PATIENT_NOT_FOUND");
    }

    const settings = patient.emergencyAccessSettings;

    if (!settings || !settings.enabled) {
      throw new AppError("Emergency access is disabled for this patient.", 403, "EMERGENCY_ACCESS_DISABLED");
    }

    const expiresAt = new Date(Date.now() + settings.unlockWindowMinutes * 60 * 1000);

    const grant = await accessGrantRepository.createGrant({
      patientId: patient.id,
      doctorId: doctor.id,
      scope: "EMERGENCY_ONLY",
      status: "ACTIVE",
      reason,
      grantedToName: `${doctor.user.firstName} ${doctor.user.lastName}`.trim(),
      grantedToType: "DOCTOR",
      expiresAt,
    });

    await auditService.logEvent({
      actorUserId: doctor.userId,
      action: "EMERGENCY_LOOKUP",
      targetResource: "patient",
      targetResourceId: patient.id,
      reason,
      metadata: {
        patientCode: patient.patientCode,
        emergencyGrantId: grant.id,
        expiresAt,
      },
      ...requestAuditContext(requestContext),
    });

    await notificationService.notifyEmergencyAccess({
      userId: patient.userId,
      patientId: patient.id,
      message: `Emergency access was used by Dr. ${doctor.user.lastName} for reason: ${reason}.`,
      metadata: {
        emergencyGrantId: grant.id,
        expiresAt,
        doctorId: doctor.id,
      },
    });

    return {
      accessGrantId: grant.id,
      expiresAt,
      patient: {
        id: patient.id,
        patientCode: patient.patientCode,
        firstName: patient.user.firstName,
        lastName: patient.user.lastName,
        bloodGroup: patient.bloodGroup,
        healthSummary: patient.healthSummary,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
      },
      criticalData: {
        allowCriticalOnly: settings.allowCriticalOnly,
        recentVerifiedRecords: patient.medicalRecords.map(toCriticalRecord),
      },
    };
  },
};

module.exports = {
  emergencyService,
};
