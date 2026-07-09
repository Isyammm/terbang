const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),  // XAMPP MySQL port
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',               // XAMPP default: kosong
  database: process.env.DB_NAME || 'flight_booking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

module.exports = pool;
