const { BaseRepository, prisma } = require("./base.repository");

class PatientRepository extends BaseRepository {
  constructor() {
    super(prisma.patient);
  }

  findDashboardByUserId(userId) {
    return this.model.findFirst({
      where: { userId },
      include: {
        user: true,
        insurancePolicies: {
          include: {
            benefits: true,
          },
          orderBy: { validTo: "desc" },
        },
        claims: {
          include: {
            documents: true,
            insurancePolicy: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        medicalRecords: {
          include: {
            files: true,
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        emergencyAccessSettings: true,
        _count: {
          select: {
            claims: true,
            medicalRecords: true,
            insurancePolicies: true,
          },
        },
      },
    });
  }

  findByUserId(userId) {
    return this.model.findUnique({
      where: { userId },
      include: {
        user: true,
        emergencyAccessSettings: true,
      },
    });
  }

  findById(id) {
    return this.model.findUnique({
      where: { id },
      include: {
        user: true,
        emergencyAccessSettings: true,
      },
    });
  }

  searchForDoctor(query) {
    const normalized = String(query || "").trim();

    return this.model.findMany({
      where: normalized
        ? {
            OR: [
              { patientCode: { contains: normalized, mode: "insensitive" } },
              { user: { is: { firstName: { contains: normalized, mode: "insensitive" } } } },
              { user: { is: { lastName: { contains: normalized, mode: "insensitive" } } } },
              { user: { is: { email: { contains: normalized, mode: "insensitive" } } } },
            ],
          }
        : undefined,
      include: {
        user: true,
        insurancePolicies: {
          orderBy: { validTo: "desc" },
          take: 1,
        },
        _count: {
          select: {
            medicalRecords: true,
            claims: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
  }

  findDoctorWorkflowProfile(patientId) {
    return this.model.findUnique({
      where: { id: patientId },
      include: {
        user: true,
        insurancePolicies: {
          include: {
            benefits: true,
          },
          orderBy: { validTo: "desc" },
        },
        claims: {
          include: {
            documents: true,
            insurancePolicy: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        emergencyAccessSettings: true,
        _count: {
          select: {
            medicalRecords: true,
            claims: true,
          },
        },
      },
    });
  }

  findEmergencyProfileByPatientCode(patientCode) {
    return this.model.findUnique({
      where: { patientCode },
      include: {
        user: true,
        emergencyAccessSettings: true,
        medicalRecords: {
          where: {
            verificationStatus: "VERIFIED",
          },
          include: {
            files: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  }

  upsertEmergencySettings(patientId, data) {
    return prisma.emergencyAccessSetting.upsert({
      where: { patientId },
      update: data,
      create: {
        patientId,
        ...data,
      },
    });
  }
}

module.exports = {
  patientRepository: new PatientRepository(),
};
