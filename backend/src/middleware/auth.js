import jwt from 'jsonwebtoken';
import TokenBlacklist from '../models/TokenBlacklist.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Check if token is blacklisted
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.message.includes('append-only')) {
    return res.status(403).json({ error: 'Operation not allowed - append-only system' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key error' });
  }

  res.status(500).json({ error: 'Internal server error' });
};
