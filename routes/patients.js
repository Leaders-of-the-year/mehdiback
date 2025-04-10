const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = require('../config/db');  

const authenticateToken = require('../middlewares/authMiddleware'); 
const authenticateRole = require('../middlewares/authenticateRole');  


router.post('/patients', authenticateToken, authenticateRole('admin'), async (req, res) => {
  const { first_name, last_name, email, phone_number, address, medical_history } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO patients 
       (first_name, last_name, email, phone_number, address, medical_history) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, last_name, email, phone_number, address, medical_history]
    );
    res.status(201).json({ success: true, patient: result.rows[0] });
  } catch (err) {
    console.error('Error inserting patient:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route to get all patient records (Only accessible by authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients');
    res.json({ success: true, patients: result.rows });
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Example: Route to fetch a specific patient (Restricted to doctors or admins)
router.get('/patient/:id', authenticateToken, authenticateRole('doctor_general'), async (req, res) => {
  const patientId = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [patientId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, patient: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
