const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = require('../config/db');  
const cors = require('cors');
const authenticateToken = require('../middlewares/authMiddleware'); 
const authenticateRole = require('../middlewares/authenticateRole');  
router.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // If you use cookies or HTTP auth
}));

// Route for creating a new doctor-general (only accessible by authenticated users)
router.post('/doctor-general', authenticateToken, authenticateRole('doctor_general'), async (req, res) => {
  const { first_name, last_name, doctor_number, specialization, years_of_experience } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO doctor_general 
       (first_name, last_name, doctor_number, specialization, years_of_experience) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [first_name, last_name, doctor_number, specialization, years_of_experience]
    );
    res.status(201).json({ success: true, doctor: result.rows[0] });
  } catch (err) {
    console.error('Error inserting doctor:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route to get all doctor-general records (only accessible by authenticated users)
router.get('/doctor-general', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM doctor_general');
    res.json({ success: true, doctors: result.rows });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route for fetching the doctor profile (only accessible by authenticated users with doctor_general role)
router.get('/doctor-profile', authenticateToken, authenticateRole('doctor_general'), async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query('SELECT * FROM doctor_general_profile WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, doctor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
