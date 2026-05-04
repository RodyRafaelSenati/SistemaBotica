const { sql, poolPromise } = require('./src/config/db');
async function migrate() {
  try {
    const pool = await poolPromise;
    // Add columns
    await pool.request().query("ALTER TABLE productos ADD costo DECIMAL(10,2) DEFAULT 0 NOT NULL");
    await pool.request().query("ALTER TABLE ventas ADD ganancia DECIMAL(10,2) DEFAULT 0 NOT NULL");
    
    // Default the cost to 50% of the price for existing products
    await pool.request().query("UPDATE productos SET costo = precio * 0.5 WHERE costo = 0");
    
    // Default the ganancia for existing sales (assuming the cost is 50% of price)
    await pool.request().query(`
      UPDATE v
      SET v.ganancia = v.cantidad * (p.precio - p.costo)
      FROM ventas v
      JOIN productos p ON v.producto_id = p.id
      WHERE v.ganancia = 0
    `);

    console.log("Migration 2 successful");
  } catch (err) {
    console.error("Migration error:", err.message);
  }
  process.exit(0);
}
migrate();
