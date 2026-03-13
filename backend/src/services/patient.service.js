const { patientRepository } = require("../repositories/patient.repository");
const { AppError } = require("../lib/errors");

const buildDashboardSummary = (patient) => ({
  profile: {
    id: patient.id,
    patientCode: patient.patientCode,
    firstName: patient.user.firstName,
    lastName: patient.user.lastName,
    email: patient.user.email,
    bloodGroup: patient.bloodGroup,
    gender: patient.gender,
    healthSummary: patient.healthSummary,
  },
  stats: {
    totalRecords: patient._count.medicalRecords,
    totalClaims: patient._count.claims,
    activePolicies: patient.insurancePolicies.filter((policy) => new Date(policy.validTo) >= new Date()).length,
    totalPolicies: patient._count.insurancePolicies,
  },
  recentRecords: patient.medicalRecords.map((record) => ({
    id: record.id,
    title: record.title,
    recordType: record.recordType,
    verificationStatus: record.verificationStatus,
    createdAt: record.createdAt,
    fileCount: record.files.length,
  })),
  recentClaims: patient.claims.map((claim) => ({
    id: claim.id,
    claimNumber: claim.claimNumber,
    title: claim.title,
    status: claim.status,
    amountClaimed: claim.amountClaimed,
    createdAt: claim.createdAt,
  })),
  insurancePolicies: patient.insurancePolicies.map((policy) => ({
    id: policy.id,
    providerName: policy.providerName,
    policyNumber: policy.policyNumber,
    planName: policy.planName,
    validFrom: policy.validFrom,
    validTo: policy.validTo,
    coverageLimit: policy.coverageLimit,
    usedCoverage: policy.usedCoverage,
    benefits: policy.benefits.map((benefit) => ({
      id: benefit.id,
      benefitCode: benefit.benefitCode,
      label: benefit.label,
      annualLimit: benefit.annualLimit,
      usedAmount: benefit.usedAmount,
    })),
  })),
  emergencyAccess: patient.emergencyAccessSettings,
});

const buildDoctorProfile = (patient) => ({
  profile: {
    id: patient.id,
    patientCode: patient.patientCode,
    firstName: patient.user.firstName,
    lastName: patient.user.lastName,
    email: patient.user.email,
    phone: patient.user.phone,
    bloodGroup: patient.bloodGroup,
    gender: patient.gender,
    healthSummary: patient.healthSummary,
    emergencyContactName: patient.emergencyContactName,
    emergencyContactPhone: patient.emergencyContactPhone,
  },
  stats: {
    totalRecords: patient._count.medicalRecords,
    totalClaims: patient._count.claims,
    totalPolicies: patient.insurancePolicies.length,
  },
  insurancePolicies: patient.insurancePolicies.map((policy) => ({
    id: policy.id,
    providerName: policy.providerName,
    policyNumber: policy.policyNumber,
    planName: policy.planName,
    validFrom: policy.validFrom,
    validTo: policy.validTo,
    coverageLimit: policy.coverageLimit,
    usedCoverage: policy.usedCoverage,
    benefits: policy.benefits.map((benefit) => ({
      id: benefit.id,
      benefitCode: benefit.benefitCode,
      label: benefit.label,
      annualLimit: benefit.annualLimit,
      usedAmount: benefit.usedAmount,
    })),
  })),
  recentClaims: patient.claims.map((claim) => ({
    id: claim.id,
    claimNumber: claim.claimNumber,
    title: claim.title,
    status: claim.status,
    amountClaimed: claim.amountClaimed,
    createdAt: claim.createdAt,
  })),
  emergencyAccess: patient.emergencyAccessSettings,
});

const patientService = {
  async getDashboard(userId) {
    const patient = await patientRepository.findDashboardByUserId(userId);

    if (!patient) {
      throw new AppError("Patient profile not found.", 404, "PATIENT_NOT_FOUND");
    }

    return buildDashboardSummary(patient);
  },

  async getPatientProfile(userId) {
    const patient = await patientRepository.findByUserId(userId);

    if (!patient) {
      throw new AppError("Patient profile not found.", 404, "PATIENT_NOT_FOUND");
    }

    return patient;
  },

  async getPatientById(patientId) {
    const patient = await patientRepository.findById(patientId);

    if (!patient) {
      throw new AppError("Patient profile not found.", 404, "PATIENT_NOT_FOUND");
    }

    return patient;
  },

  async searchPatientsForDoctor(query) {
    const patients = await patientRepository.searchForDoctor(query);

    return patients.map((patient) => ({
      id: patient.id,
      patientCode: patient.patientCode,
      firstName: patient.user.firstName,
      lastName: patient.user.lastName,
      email: patient.user.email,
      phone: patient.user.phone,
      healthSummary: patient.healthSummary,
      primaryPolicy: patient.insurancePolicies[0]
        ? {
            id: patient.insurancePolicies[0].id,
            providerName: patient.insurancePolicies[0].providerName,
            planName: patient.insurancePolicies[0].planName,
            validTo: patient.insurancePolicies[0].validTo,
          }
        : null,
      stats: {
        totalRecords: patient._count.medicalRecords,
        totalClaims: patient._count.claims,
      },
    }));
  },

  async getDoctorWorkflowProfile(patientId) {
    const patient = await patientRepository.findDoctorWorkflowProfile(patientId);

    if (!patient) {
      throw new AppError("Patient profile not found.", 404, "PATIENT_NOT_FOUND");
    }

    return buildDoctorProfile(patient);
  },
};

module.exports = {
  patientService,
};
