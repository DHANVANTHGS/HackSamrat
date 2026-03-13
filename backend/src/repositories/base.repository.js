const { getPrisma } = require("../db/prisma");

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findById(id) {
    return this.model.findUnique({ where: { id } });
  }

  findMany(args = {}) {
    return this.model.findMany(args);
  }

  create(data) {
    return this.model.create({ data });
  }

  update(id, data) {
    return this.model.update({ where: { id }, data });
  }

  delete(id) {
    return this.model.delete({ where: { id } });
  }
}

module.exports = {
  BaseRepository,
  prisma: getPrisma(),
};
