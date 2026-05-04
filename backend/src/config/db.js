const sql = require('mssql');
require('dotenv').config();

const dbSettings = {
  server: 'someeraodyrafael.mssql.somee.com',
  user: 'bustinciocalsin',
  password: 'elrafa921.',
  database: 'someeraodyrafael',
  options: {
    encrypt: false,
    trustServerCertificate: false
  }
};

const poolPromise = new sql.ConnectionPool(dbSettings)
  .connect()
  .then(pool => {
    console.log('Conectado a MS SQL Server en Somee');
    return pool;
  })
  .catch(err => {
    console.error('Error al conectar a la BD:', err);
    throw err;
  });

module.exports = { sql, poolPromise };
