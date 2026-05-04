const { sql, poolPromise } = require('./src/config/db');
async function check() {
  const pool = await poolPromise;
  const result = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES");
  console.log(result.recordset);
  process.exit(0);
}
check();
