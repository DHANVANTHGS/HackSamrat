const { BaseRepository, prisma } = require("./base.repository");

class MedicalRecordRepository extends BaseRepository {
  constructor() {
    super(prisma.medicalRecord);
  }

  findForPatient(patientId, { recordType } = {}) {
    return this.model.findMany({
      where: {
        patientId,
        ...(recordType ? { recordType } : {}),
      },
      include: {
        files: true,
        uploadedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        uploadedByDoctor: {
          select: {
            id: true,
            doctorCode: true,
            specialty: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findPatientRecordById(patientId, recordId) {
    return this.model.findFirst({
      where: {
        id: recordId,
        patientId,
      },
      include: {
        files: true,
        uploadedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        uploadedByDoctor: {
          select: {
            id: true,
            doctorCode: true,
            specialty: true,
          },
        },
      },
    });
  }

  createWithFiles(data, files) {
    return this.model.create({
      data: {
        ...data,
        files: {
          create: files,
        },
      },
      include: {
        files: true,
      },
    });
  }
}

module.exports = {
  medicalRecordRepository: new MedicalRecordRepository(),
};
