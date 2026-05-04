const { sql, poolPromise } = require('../config/db');

const registerVenta = async (req, res) => {
  let transaction;
  try {
    const { producto_id, cantidad } = req.body;
    
    if (!producto_id || !cantidad || cantidad <= 0) {
      return res.status(400).json({ message: 'Datos de venta inválidos' });
    }

    const pool = await poolPromise;
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);
    
    // Check stock with UPDLOCK equivalent to FOR UPDATE
    const productResult = await request
      .input('id', sql.Int, producto_id)
      .query('SELECT * FROM productos WITH (UPDLOCK) WHERE id = @id');
      
    const producto = productResult.recordset[0];

    if (!producto) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (producto.stock < cantidad) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Stock insuficiente para realizar la venta' });
    }

    const total = producto.precio * cantidad;
    const ganancia = (producto.precio - producto.costo) * cantidad;

    const insertRequest = new sql.Request(transaction);
    await insertRequest
      .input('producto_id', sql.Int, producto_id)
      .input('cantidad', sql.Int, cantidad)
      .input('total', sql.Decimal(10, 2), total)
      .input('ganancia', sql.Decimal(10, 2), ganancia)
      .query('INSERT INTO ventas (producto_id, cantidad, total, ganancia) VALUES (@producto_id, @cantidad, @total, @ganancia)');

    const updateRequest = new sql.Request(transaction);
    await updateRequest
      .input('cantidad', sql.Int, cantidad)
      .input('id', sql.Int, producto_id)
      .query('UPDATE productos SET stock = stock - @cantidad WHERE id = @id');

    await transaction.commit();
    res.status(201).json({ message: 'Venta registrada con éxito', total });
  } catch (error) {
    if (transaction) {
      try { await transaction.rollback(); } catch (err) {}
    }
    console.error(error);
    res.status(500).json({ message: 'Error al registrar venta' });
  }
};

module.exports = { registerVenta };
