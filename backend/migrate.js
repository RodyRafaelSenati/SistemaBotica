const { sql, poolPromise } = require('./src/config/db');
async function migrate() {
  const pool = await poolPromise;
  try {
    await pool.request().query("ALTER TABLE usuarios ADD failed_attempts INT DEFAULT 0 NOT NULL, is_locked BIT DEFAULT 0 NOT NULL");
    console.log("Migration successful");
  } catch (err) {
    console.log("Error or already exists:", err.message);
  }
  process.exit(0);
}
migrate();
