const { BaseRepository, prisma } = require("./base.repository");

class BlockchainAnchorRepository extends BaseRepository {
  constructor() {
    super(prisma.blockchainAnchor);
  }

  createAnchor(data) {
    return this.model.create({ data });
  }

  findById(id) {
    return this.model.findUnique({
      where: { id },
      include: {
        auditLog: true,
      },
    });
  }

  findByDigest(digest) {
    return this.model.findMany({
      where: { digest },
      include: {
        auditLog: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  updateStatus(id, data) {
    return this.model.update({
      where: { id },
      data,
      include: {
        auditLog: true,
      },
    });
  }

  listRecent(limit = 20) {
    return this.model.findMany({
      include: {
        auditLog: true,
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(Number(limit) || 20, 100),
    });
  }
}

module.exports = {
  blockchainAnchorRepository: new BlockchainAnchorRepository(),
};
