const { sql, poolPromise } = require('../config/db');

const getProductos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM productos');
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

const createProducto = async (req, res) => {
  try {
    const { nombre, stock, fecha_vencimiento, precio, costo } = req.body;
    if (!nombre || stock === undefined || !fecha_vencimiento || precio === undefined || costo === undefined) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.VarChar(100), nombre)
      .input('stock', sql.Int, stock)
      .input('fecha_vencimiento', sql.Date, fecha_vencimiento)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('costo', sql.Decimal(10, 2), costo)
      .query('INSERT INTO productos (nombre, stock, fecha_vencimiento, precio, costo) VALUES (@nombre, @stock, @fecha_vencimiento, @precio, @costo)');
    res.status(201).json({ message: 'Producto creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body; 
    if (stock === undefined) {
      return res.status(400).json({ message: 'Stock es requerido' });
    }
    const pool = await poolPromise;
    await pool.request()
      .input('stock', sql.Int, stock)
      .input('id', sql.Int, id)
      .query('UPDATE productos SET stock = stock + @stock WHERE id = @id');
    res.json({ message: 'Stock abastecido correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar stock' });
  }
};

const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, costo, fecha_vencimiento } = req.body;
    if (!nombre || precio === undefined || costo === undefined || !fecha_vencimiento) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.VarChar(100), nombre)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('costo', sql.Decimal(10, 2), costo)
      .input('fecha_vencimiento', sql.Date, fecha_vencimiento)
      .input('id', sql.Int, id)
      .query('UPDATE productos SET nombre = @nombre, precio = @precio, costo = @costo, fecha_vencimiento = @fecha_vencimiento WHERE id = @id');
    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    
    // Check if it has sales to prevent foreign key errors and return a better message
    const salesCheck = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT TOP 1 id FROM ventas WHERE producto_id = @id');
      
    if (salesCheck.recordset.length > 0) {
      return res.status(400).json({ message: 'No se puede borrar el producto porque ya tiene ventas registradas.' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM productos WHERE id = @id');
      
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al borrar producto' });
  }
};

const getAlertas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const resultBajoStock = await pool.request().query('SELECT * FROM productos WHERE stock < 5');
    const resultPorVencer = await pool.request().query(`
      SELECT * FROM productos 
      WHERE fecha_vencimiento BETWEEN GETDATE() AND DATEADD(day, 30, GETDATE())
    `);
    res.json({ bajoStock: resultBajoStock.recordset, porVencer: resultPorVencer.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener alertas' });
  }
};

module.exports = { getProductos, createProducto, updateStock, updateProducto, deleteProducto, getAlertas };
