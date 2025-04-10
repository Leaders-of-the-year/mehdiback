// db.js
const { Pool } = require('pg');
const pool = new Pool({
  user: 'mehdi',
  host: 'localhost', 
  database: 'doctori_db', 
  password: 'password123', 
  port: 5432,
});

module.exports = pool;
