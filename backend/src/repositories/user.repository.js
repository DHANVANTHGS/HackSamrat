const { BaseRepository, prisma } = require("./base.repository");

const authUserInclude = {
  patient: true,
  doctor: true,
  roleAssignments: {
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  },
};

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  findByEmail(email) {
    return this.model.findUnique({
      where: { email },
      include: authUserInclude,
    });
  }

  findByIdWithAuthContext(id) {
    return this.model.findUnique({
      where: { id },
      include: authUserInclude,
    });
  }

  findDoctorByEmail(email) {
    return this.model.findUnique({
      where: { email },
      include: authUserInclude,
    });
  }

  findPatientByEmail(email) {
    return this.model.findUnique({
      where: { email },
      include: authUserInclude,
    });
  }

  async recordFailedLogin(userId, { maxAttempts, lockoutMinutes }) {
    const user = await this.model.findUnique({ where: { id: userId } });
    const failedLoginAttempts = (user?.failedLoginAttempts ?? 0) + 1;
    const lockedUntil = failedLoginAttempts >= maxAttempts
      ? new Date(Date.now() + lockoutMinutes * 60 * 1000)
      : null;

    return this.model.update({
      where: { id: userId },
      data: {
        failedLoginAttempts,
        lockedUntil,
      },
    });
  }

  resetLoginState(userId, lastLoginAt = null) {
    return this.model.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt,
      },
    });
  }
}

module.exports = {
  authUserInclude,
  userRepository: new UserRepository(),
};
