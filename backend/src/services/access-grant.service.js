const { AppError } = require("../lib/errors");
const { accessGrantRepository } = require("../repositories/access-grant.repository");
const { doctorRepository } = require("../repositories/doctor.repository");
const { notificationService } = require("./notification.service");
const { patientService } = require("./patient.service");
const { auditService } = require("./audit.service");

const validScopes = new Set(["FULL_RECORDS", "PRESCRIPTIONS", "IMAGING", "INSURANCE", "CLAIMS", "EMERGENCY_ONLY"]);

const formatGrant = (grant) => ({
  id: grant.id,
  patientId: grant.patientId,
  doctorId: grant.doctorId,
  scope: grant.scope,
  status: grant.status,
  reason: grant.reason,
  expiresAt: grant.expiresAt,
  revokedAt: grant.revokedAt,
  createdAt: grant.createdAt,
  updatedAt: grant.updatedAt,
  doctor: grant.doctor
    ? {
        id: grant.doctor.id,
        doctorCode: grant.doctor.doctorCode,
        specialty: grant.doctor.specialty,
        firstName: grant.doctor.user.firstName,
        lastName: grant.doctor.user.lastName,
        email: grant.doctor.user.email,
        hospital: grant.doctor.hospital,
      }
    : null,
});

const parseScope = (scope) => {
  const normalized = String(scope || "").trim().toUpperCase();

  if (!validScopes.has(normalized)) {
    throw new AppError("Invalid access grant scope.", 400, "VALIDATION_ERROR", {
      validScopes: Array.from(validScopes),
    });
  }

  return normalized;
};

const parseExpiresAt = (expiresAt) => {
  if (!expiresAt) {
    return null;
  }

  const parsed = new Date(expiresAt);

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError("Invalid expiresAt value.", 400, "VALIDATION_ERROR");
  }

  return parsed;
};

const auditContext = (requestContext = {}) => ({
  ipAddress: requestContext.ipAddress,
  userAgent: requestContext.userAgent,
});

const accessGrantService = {
  async listPatientGrants(userId) {
    const patient = await patientService.getPatientProfile(userId);
    const grants = await accessGrantRepository.listForPatient(patient.id);
    return grants.map(formatGrant);
  },

  async createPatientGrant(userId, payload, requestContext) {
    const patient = await patientService.getPatientProfile(userId);
    const doctor = await doctorRepository.findByUserId(payload.doctorUserId);

    if (!doctor) {
      throw new AppError("Doctor not found.", 404, "DOCTOR_NOT_FOUND");
    }

    const grant = await accessGrantRepository.createGrant({
      patientId: patient.id,
      doctorId: doctor.id,
      scope: parseScope(payload.scope),
      reason: payload.reason || null,
      grantedToName: `${doctor.user.firstName} ${doctor.user.lastName}`.trim(),
      grantedToType: "DOCTOR",
      expiresAt: parseExpiresAt(payload.expiresAt),
      status: "ACTIVE",
    });

    await auditService.logEvent({
      actorUserId: patient.userId,
      action: "ACCESS_GRANTED",
      targetResource: "access_grant",
      targetResourceId: grant.id,
      reason: "Patient created access grant",
      metadata: {
        patientId: patient.id,
        doctorId: doctor.id,
        scope: grant.scope,
      },
      ...auditContext(requestContext),
    });

    await notificationService.notifyGrantChange({
      userId: patient.userId,
      grantId: grant.id,
      doctorId: doctor.id,
      scope: grant.scope,
      status: grant.status,
      message: `You granted ${doctor.user.firstName} ${doctor.user.lastName} access with scope ${grant.scope}.`,
    });

    return formatGrant(grant);
  },

  async updatePatientGrant(userId, grantId, payload, requestContext) {
    const patient = await patientService.getPatientProfile(userId);
    const existingGrant = await accessGrantRepository.findByIdForPatient(grantId, patient.id);

    if (!existingGrant) {
      throw new AppError("Access grant not found.", 404, "ACCESS_GRANT_NOT_FOUND");
    }

    const updatedGrant = await accessGrantRepository.updateGrant(grantId, patient.id, {
      scope: payload.scope ? parseScope(payload.scope) : existingGrant.scope,
      reason: payload.reason ?? existingGrant.reason,
      expiresAt: payload.expiresAt === undefined ? existingGrant.expiresAt : parseExpiresAt(payload.expiresAt),
      status: payload.status ? String(payload.status).trim().toUpperCase() : existingGrant.status,
      revokedAt:
        payload.status && String(payload.status).trim().toUpperCase() === "REVOKED"
          ? new Date()
          : existingGrant.revokedAt,
    });

    await auditService.logEvent({
      actorUserId: patient.userId,
      action: updatedGrant.status === "REVOKED" ? "ACCESS_REVOKED" : "ACCESS_GRANTED",
      targetResource: "access_grant",
      targetResourceId: updatedGrant.id,
      reason: updatedGrant.status === "REVOKED" ? "Patient revoked access grant" : "Patient updated access grant",
      metadata: {
        patientId: patient.id,
        doctorId: updatedGrant.doctorId,
        scope: updatedGrant.scope,
        status: updatedGrant.status,
      },
      ...auditContext(requestContext),
    });

    await notificationService.notifyGrantChange({
      userId: patient.userId,
      grantId: updatedGrant.id,
      doctorId: updatedGrant.doctorId,
      scope: updatedGrant.scope,
      status: updatedGrant.status,
      message:
        updatedGrant.status === "REVOKED"
          ? "You revoked a doctor access grant."
          : `You updated an access grant to scope ${updatedGrant.scope}.`,
    });

    return formatGrant(updatedGrant);
  },

  async revokePatientGrant(userId, grantId, requestContext) {
    return this.updatePatientGrant(
      userId,
      grantId,
      {
        status: "REVOKED",
      },
      requestContext,
    );
  },
};

module.exports = {
  accessGrantService,
};
