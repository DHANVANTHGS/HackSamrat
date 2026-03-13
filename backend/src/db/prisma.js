const dotenv = require("dotenv");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const { config } = require("../config/env");

dotenv.config();

let prisma;

const getPrisma = () => {
  if (!prisma) {
    const adapter = new PrismaPg(
      { connectionString: process.env.DATABASE_URL },
      { schema: config.postgres.schema },
    );
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
};

module.exports = {
  getPrisma,
};
