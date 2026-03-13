const { BaseRepository, prisma } = require("./base.repository");

class AccessGrantRepository extends BaseRepository {
  constructor() {
    super(prisma.accessGrant);
  }

  findActiveForDoctorPatient(doctorId, patientId) {
    return this.model.findMany({
      where: {
        doctorId,
        patientId,
        status: "ACTIVE",
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  listForPatient(patientId) {
    return this.model.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: true,
            hospital: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findByIdForPatient(id, patientId) {
    return this.model.findFirst({
      where: { id, patientId },
      include: {
        doctor: {
          include: {
            user: true,
            hospital: true,
          },
        },
      },
    });
  }

  createGrant(data) {
    return this.model.create({
      data,
      include: {
        doctor: {
          include: {
            user: true,
            hospital: true,
          },
        },
      },
    });
  }

  updateGrant(id, patientId, data) {
    return this.model.update({
      where: { id },
      data,
      include: {
        doctor: {
          include: {
            user: true,
            hospital: true,
          },
        },
      },
    });
  }
}

module.exports = {
  accessGrantRepository: new AccessGrantRepository(),
};
