const { sql, poolPromise } = require('../config/db');

async function initDB() {
  try {
    const pool = await poolPromise;

    // Drop and Create tables (SQL Server syntax)
    await pool.request().query(`
      DROP TABLE IF EXISTS ventas;
      DROP TABLE IF EXISTS productos;
      DROP TABLE IF EXISTS usuarios;

      CREATE TABLE usuarios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'admin',
        failed_attempts INT DEFAULT 0 NOT NULL,
        is_locked BIT DEFAULT 0 NOT NULL
      );

      CREATE TABLE productos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        fecha_vencimiento DATE NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        costo DECIMAL(10, 2) NOT NULL DEFAULT 0
      );

      CREATE TABLE ventas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        ganancia DECIMAL(10, 2) NOT NULL DEFAULT 0,
        fecha DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      );
    `);

    // Insertar un usuario admin por defecto si no hay usuarios
    const usersResult = await pool.request().query('SELECT * FROM usuarios');
    if (usersResult.recordset.length === 0) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('admin123', 10);
      await pool.request()
        .input('username', sql.VarChar(50), 'admin')
        .input('password', sql.VarChar(255), hash)
        .input('rol', sql.VarChar(20), 'admin')
        .query('INSERT INTO usuarios (username, password, rol) VALUES (@username, @password, @rol)');
      console.log('Usuario admin creado por defecto. (admin / admin123)');
    }
    
    // Insertar productos de prueba si está vacío
    const prodResult = await pool.request().query('SELECT * FROM productos');
    if (prodResult.recordset.length === 0) {
        await pool.request().query(`
            INSERT INTO productos (nombre, stock, fecha_vencimiento, precio) VALUES 
            ('Paracetamol 500mg', 50, DATEADD(month, 6, GETDATE()), 1.50),
            ('Amoxicilina 500mg', 3, DATEADD(month, 1, GETDATE()), 2.50),
            ('Ibuprofeno 400mg', 20, DATEADD(day, 15, GETDATE()), 1.80)
        `);
        console.log('Productos de prueba creados.');
    }

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  initDB().then(() => {
    console.log('Script finalizado');
    process.exit(0);
  });
}

module.exports = initDB;
