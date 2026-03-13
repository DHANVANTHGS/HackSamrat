const { AppError } = require("../lib/errors");
const { insurancePolicyRepository } = require("../repositories/insurance-policy.repository");
const { patientService } = require("./patient.service");

const insuranceService = {
  async getSummary(userId) {
    const patient = await patientService.getPatientProfile(userId);
    const policies = await insurancePolicyRepository.listForPatient(patient.id);

    return {
      totalPolicies: policies.length,
      activePolicies: policies.filter((policy) => new Date(policy.validTo) >= new Date()).length,
      policies,
    };
  },

  async listPolicies(userId) {
    const patient = await patientService.getPatientProfile(userId);
    return insurancePolicyRepository.listForPatient(patient.id);
  },

  async getPolicy(userId, policyId) {
    const patient = await patientService.getPatientProfile(userId);
    const policy = await insurancePolicyRepository.findByIdForPatient(policyId, patient.id);

    if (!policy) {
      throw new AppError("Insurance policy not found.", 404, "POLICY_NOT_FOUND");
    }

    return policy;
  },

  async getPolicyBenefits(userId, policyId) {
    const policy = await this.getPolicy(userId, policyId);
    return policy.benefits;
  },

  async ensurePatientOwnsPolicy(patientId, policyId) {
    if (!policyId) {
      return null;
    }

    const policy = await insurancePolicyRepository.findByIdForPatient(policyId, patientId);

    if (!policy) {
      throw new AppError("Insurance policy not found for this patient.", 404, "POLICY_NOT_FOUND");
    }

    return policy;
  },
};

module.exports = {
  insuranceService,
};
