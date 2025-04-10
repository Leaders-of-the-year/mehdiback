const pool = require('../config/db');  
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

  

const authenticateRole = (role) => {
  return async (req, res, next) => {

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
    
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;

      // Get the user's role_id from the database
      const result = await pool.query('SELECT role_id FROM users WHERE id = $1', [userId]);

      // If user not found in database
      if (result.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'User not found' });
      }

      const userRoleId = result.rows[0].role_id;
      
      // Get the role name from the roles table based on role_id
      const roleResult = await pool.query('SELECT role_name FROM roles WHERE id = $1', [userRoleId]);

      // If role does not match the required role, deny access
      if (roleResult.rows[0].role_name !== role) {
        return res.status(403).json({ success: false, message: 'Access denied. You do not have the correct role.' });
      }

      req.user = decoded;  // Attach user info to request object for further use in route
      next();  // Allow the request to proceed to the next middleware or route handler
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to authenticate token.' });
    }
  };
};

module.exports = authenticateRole;
