const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const getUserTable = (type) => {
  switch (type) {
    case 'doctor_general':
      return 'doctor_general_profile';
    case 'doctor_special':
      return 'doctor_specialty_profile';
    case 'patient':
      return 'patients_profile';
    default:
      throw new Error('Invalid user type');
  }
};

// Register Route - keep using separate tables
router.post('/register', async (req, res) => {
  const { type, username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user to shared users table
    const userInsert = await pool.query(
      `INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role_id`,
      [username, email, hashedPassword, type]
    );

    const userId = userInsert.rows[0].id;

    // Insert into specific profile table
    const profileTable = getUserTable(type);
    await pool.query(`INSERT INTO ${profileTable} (user_id) VALUES ($1)`, [userId]);

    res.status(201).json({ success: true, user: userInsert.rows[0] });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login Route - use shared users table
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
