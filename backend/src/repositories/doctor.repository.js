const { BaseRepository, prisma } = require("./base.repository");

class DoctorRepository extends BaseRepository {
  constructor() {
    super(prisma.doctor);
  }

  findByUserId(userId) {
    return this.model.findUnique({
      where: { userId },
      include: {
        user: true,
        hospital: true,
        organization: true,
      },
    });
  }

  async getDashboard(userId) {
    const doctor = await this.model.findUnique({
      where: { userId },
      include: {
        user: true,
        hospital: true,
        organization: true,
        accessGrants: {
          where: {
            status: "ACTIVE",
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          include: {
            patient: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            accessGrants: true,
            uploadedRecords: true,
            verifications: true,
          },
        },
      },
    });

    return doctor;
  }

  searchDirectory(query) {
    const normalized = String(query || "").trim();

    return this.model.findMany({
      where: normalized
        ? {
            OR: [
              { doctorCode: { contains: normalized, mode: "insensitive" } },
              { specialty: { contains: normalized, mode: "insensitive" } },
              { hospital: { is: { name: { contains: normalized, mode: "insensitive" } } } },
              { user: { is: { firstName: { contains: normalized, mode: "insensitive" } } } },
              { user: { is: { lastName: { contains: normalized, mode: "insensitive" } } } },
              { user: { is: { email: { contains: normalized, mode: "insensitive" } } } },
            ],
          }
        : undefined,
      include: {
        user: true,
        hospital: true,
        organization: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
  }
}

module.exports = {
  doctorRepository: new DoctorRepository(),
};
