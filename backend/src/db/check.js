const dotenv = require("dotenv");

dotenv.config();

const { checkDatabaseConnection, getPool } = require("./postgres");

(async () => {
  try {
    const status = await checkDatabaseConnection();
    console.log(JSON.stringify({ success: true, data: status }, null, 2));
    await getPool().end();
  } catch (error) {
    console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
    process.exitCode = 1;
  }
})();
