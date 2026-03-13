const { checkDatabaseConnection } = require("../db/postgres");

const getDependencyStatus = async (config) => {
  const dependencies = {
    postgres: {
      configured: Boolean(config.postgres.url),
      host: config.postgres.host,
      port: config.postgres.port,
    },
    redis: {
      configured: Boolean(config.redis.url),
      host: config.redis.host,
      port: config.redis.port,
    },
    storage: {
      configured: Boolean(config.storage.endpoint),
      endpoint: config.storage.endpoint,
      bucket: config.storage.bucket,
    },
  };

  try {
    const dbStatus = await checkDatabaseConnection();
    dependencies.postgres = {
      ...dependencies.postgres,
      connected: true,
      database: dbStatus.database,
      schema: dbStatus.schema,
      serverTime: dbStatus.serverTime,
    };
  } catch (error) {
    dependencies.postgres = {
      ...dependencies.postgres,
      connected: false,
      error: error.message,
    };
  }

  return dependencies;
};

module.exports = {
  getDependencyStatus,
};
