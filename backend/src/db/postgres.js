const { Pool } = require("pg");

const { config } = require("../config/env");

let pool;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: config.postgres.url,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  return pool;
};

const withSchema = async (client) => {
  if (config.postgres.schema && config.postgres.schema !== "public") {
    await client.query(`set search_path to ${config.postgres.schema}`);
  }
};

const checkDatabaseConnection = async () => {
  const client = await getPool().connect();

  try {
    await withSchema(client);
    const result = await client.query(
      "select current_database() as database_name, current_schema() as schema_name, now() as server_time",
    );
    return {
      connected: true,
      database: result.rows[0]?.database_name ?? config.postgres.database,
      schema: result.rows[0]?.schema_name ?? null,
      serverTime: result.rows[0]?.server_time ?? null,
    };
  } finally {
    client.release();
  }
};

module.exports = {
  checkDatabaseConnection,
  getPool,
};
