const { BaseRepository, prisma } = require("./base.repository");

class InsurancePolicyRepository extends BaseRepository {
  constructor() {
    super(prisma.insurancePolicy);
  }

  listForPatient(patientId) {
    return this.model.findMany({
      where: { patientId },
      include: {
        benefits: true,
      },
      orderBy: { validTo: "desc" },
    });
  }

  findByIdForPatient(policyId, patientId) {
    return this.model.findFirst({
      where: {
        id: policyId,
        patientId,
      },
      include: {
        benefits: true,
      },
    });
  }
}

module.exports = {
  insurancePolicyRepository: new InsurancePolicyRepository(),
};
