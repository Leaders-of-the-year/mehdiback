const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER || 'mehdi',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'doctori_db',
  password: process.env.DB_PASSWORD || 'password123',
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => console.log('PostgreSQL connected'))
  .catch(err => console.error('Connection error', err));

// Basic Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route Imports
const authRoutes = require('./routes/auth');
const doctorGeneralRoutes = require('./routes/doctorGeneral');
const patientRoutes = require('./routes/patients');
const doctorSpecialtyRoutes = require('./routes/doctorSpecialty');

// Route Usage
app.use('/api/auth', authRoutes);
app.use('/api', doctorGeneralRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api', doctorSpecialtyRoutes);

// Start Server
app.listen(PORT, '0.0.0.0' ,() => {
  console.log(`Server running on port ${PORT}`);
});
