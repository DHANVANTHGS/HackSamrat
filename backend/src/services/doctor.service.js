const { AppError } = require("../lib/errors");
const { accessGrantRepository } = require("../repositories/access-grant.repository");
const { doctorRepository } = require("../repositories/doctor.repository");
const { patientService } = require("./patient.service");

const buildDoctorDashboard = (doctor) => ({
  profile: {
    id: doctor.id,
    doctorCode: doctor.doctorCode,
    firstName: doctor.user.firstName,
    lastName: doctor.user.lastName,
    email: doctor.user.email,
    specialty: doctor.specialty,
    licenseNumber: doctor.licenseNumber,
    verificationStatus: doctor.verificationStatus,
    hospital: doctor.hospital,
    organization: doctor.organization,
  },
  stats: {
    activeAccessGrants: doctor.accessGrants.length,
    totalAccessGrantRecords: doctor._count.accessGrants,
    uploadedRecords: doctor._count.uploadedRecords,
    verifications: doctor._count.verifications,
  },
  recentPatients: doctor.accessGrants.map((grant) => ({
    grantId: grant.id,
    scope: grant.scope,
    expiresAt: grant.expiresAt,
    patient: {
      id: grant.patient.id,
      patientCode: grant.patient.patientCode,
      firstName: grant.patient.user.firstName,
      lastName: grant.patient.user.lastName,
      email: grant.patient.user.email,
    },
  })),
});

const doctorService = {
  async getDashboard(userId) {
    const doctor = await doctorRepository.getDashboard(userId);

    if (!doctor) {
      throw new AppError("Doctor profile not found.", 404, "DOCTOR_NOT_FOUND");
    }

    return buildDoctorDashboard(doctor);
  },

  async getDoctorProfile(userId) {
    const doctor = await doctorRepository.findByUserId(userId);

    if (!doctor) {
      throw new AppError("Doctor profile not found.", 404, "DOCTOR_NOT_FOUND");
    }

    return doctor;
  },

  async searchPatients(query) {
    return patientService.searchPatientsForDoctor(query);
  },

  async searchDirectory(query) {
    const doctors = await doctorRepository.searchDirectory(query);

    return doctors.map((doctor) => ({
      id: doctor.id,
      userId: doctor.userId,
      doctorCode: doctor.doctorCode,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      email: doctor.user.email,
      specialty: doctor.specialty,
      verificationStatus: doctor.verificationStatus,
      hospital: doctor.hospital,
      organization: doctor.organization,
    }));
  },

  async getPatientProfile(patientId) {
    return patientService.getDoctorWorkflowProfile(patientId);
  },

  async getPatientConsentSummary(patientId, doctorId) {
    const grants = await accessGrantRepository.findActiveForDoctorPatient(doctorId, patientId);

    return {
      active: grants.length > 0,
      scopes: grants.map((grant) => grant.scope),
      expiresAt: grants.map((grant) => grant.expiresAt).filter(Boolean).sort()[0] || null,
      grants,
    };
  },
};

module.exports = {
  doctorService,
};
