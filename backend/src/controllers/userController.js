const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT id, username, rol, failed_attempts, is_locked FROM usuarios');
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, rol } = req.body;
    
    if (!username || !password || !rol) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (rol !== 'admin' && rol !== 'vendedor') {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const pool = await poolPromise;
    
    const checkResult = await pool.request()
      .input('username', sql.VarChar(50), username)
      .query('SELECT id FROM usuarios WHERE username = @username');

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.request()
      .input('username', sql.VarChar(50), username)
      .input('password', sql.VarChar(255), hash)
      .input('rol', sql.VarChar(20), rol)
      .query('INSERT INTO usuarios (username, password, rol) VALUES (@username, @password, @rol)');

    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

const unlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE usuarios SET failed_attempts = 0, is_locked = 0 WHERE id = @id');
      
    res.json({ message: 'Usuario desbloqueado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al desbloquear usuario' });
  }
};

module.exports = { getUsers, createUser, unlockUser };
