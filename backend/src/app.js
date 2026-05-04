const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const initDB = require('./models/init');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);

// Inicializar DB
initDB();

module.exports = app;
