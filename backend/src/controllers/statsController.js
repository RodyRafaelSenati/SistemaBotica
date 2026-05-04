const { poolPromise } = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const pool = await poolPromise;

    // Métricas principales del mes actual
    const statsQuery = await pool.request().query(`
      SELECT 
        COUNT(id) as total_ventas,
        ISNULL(SUM(total), 0) as ingresos,
        ISNULL(SUM(ganancia), 0) as ganancias
      FROM ventas
      WHERE MONTH(fecha) = MONTH(GETDATE()) AND YEAR(fecha) = YEAR(GETDATE())
    `);
    const { total_ventas, ingresos, ganancias } = statsQuery.recordset[0];

    // Productos críticos
    const criticosQuery = await pool.request().query('SELECT COUNT(id) as count FROM productos WHERE stock < 5');
    const productos_criticos = criticosQuery.recordset[0].count;

    // Top 5 más vendidos
    const topVendidosQuery = await pool.request().query(`
      SELECT TOP 5 
          p.nombre, 
          ISNULL(SUM(v.cantidad), 0) as unidades_vendidas
      FROM productos p
      JOIN ventas v ON p.id = v.producto_id
      GROUP BY p.id, p.nombre
      ORDER BY unidades_vendidas DESC
    `);
    
    // Top 5 menos vendidos (o sin ventas)
    const menosVendidosQuery = await pool.request().query(`
      SELECT TOP 5 
          p.nombre, 
          ISNULL(SUM(v.cantidad), 0) as unidades_vendidas
      FROM productos p
      LEFT JOIN ventas v ON p.id = v.producto_id
      GROUP BY p.id, p.nombre
      ORDER BY unidades_vendidas ASC
    `);

    res.json({
      metrics: {
        total_ventas,
        ingresos,
        ganancias,
        productos_criticos
      },
      topVendidos: topVendidosQuery.recordset,
      menosVendidos: menosVendidosQuery.recordset
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

module.exports = { getDashboardStats };
