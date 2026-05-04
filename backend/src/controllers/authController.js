const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username y password requeridos' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT * FROM usuarios WHERE username = @username');
    
    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (user.is_locked) {
      return res.status(403).json({ message: 'Cuenta bloqueada. Contacte al administrador.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed attempts
      let newAttempts = (user.failed_attempts || 0) + 1;
      let isLocked = newAttempts >= 3 ? 1 : 0;
      
      await pool.request()
        .input('attempts', sql.Int, newAttempts)
        .input('locked', sql.Bit, isLocked)
        .input('id', sql.Int, user.id)
        .query('UPDATE usuarios SET failed_attempts = @attempts, is_locked = @locked WHERE id = @id');
        
      if (isLocked) {
        return res.status(403).json({ message: 'Cuenta bloqueada por demasiados intentos fallidos.' });
      }
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Reset failed attempts on success
    if (user.failed_attempts > 0) {
      await pool.request()
        .input('id', sql.Int, user.id)
        .query('UPDATE usuarios SET failed_attempts = 0 WHERE id = @id');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, username: user.username, rol: user.rol }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { login };
