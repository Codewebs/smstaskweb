const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: "db4free.net",
  user: "indiza",
  password: "Securise21",
  database: "indizapaiebd",
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});
module.exports = pool;
