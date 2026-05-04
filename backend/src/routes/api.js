const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const inventoryController = require('../controllers/inventoryController');
const salesController = require('../controllers/salesController');
const statsController = require('../controllers/statsController');
const jwt = require('jsonwebtoken');

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'Token requerido' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para requerir Rol Admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Acceso denegado: Se requiere rol de administrador' });
  }
};

// Rutas Públicas
router.post('/login', authController.login);

// Rutas Protegidas Generales (Vendedor + Admin)
router.use(verifyToken);
router.get('/productos', inventoryController.getProductos);
router.get('/alertas', inventoryController.getAlertas);
router.post('/ventas', salesController.registerVenta);

// Rutas Protegidas de Administrador
router.get('/estadisticas', requireAdmin, statsController.getDashboardStats);
router.get('/usuarios', requireAdmin, userController.getUsers);
router.post('/usuarios', requireAdmin, userController.createUser);
router.put('/usuarios/:id/unlock', requireAdmin, userController.unlockUser);

router.post('/productos', requireAdmin, inventoryController.createProducto);
router.put('/stock/:id/add', requireAdmin, inventoryController.updateStock);
router.put('/productos/:id/edit', requireAdmin, inventoryController.updateProducto);
router.delete('/productos/:id', requireAdmin, inventoryController.deleteProducto);

module.exports = router;
