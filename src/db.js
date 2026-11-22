// src/db.js — conexión a MySQL con los datos del archivo .env
// Un "pool" mantiene varias conexiones abiertas y las reutiliza entre peticiones.
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dateStrings: true,      // las fechas llegan como texto '2026-12-03', no como objetos Date
});

module.exports = pool;
