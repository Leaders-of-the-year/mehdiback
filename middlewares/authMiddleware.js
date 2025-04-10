const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET;



const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); 

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token is required for authentication.' });
  }

  try {
    
    const decoded = jwt.verify(token, JWT_SECRET);

    
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;
