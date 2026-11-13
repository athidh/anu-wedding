const jwt = require('jsonwebtoken');

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Missing or invalid authorization token.',
    });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('[Auth Error] JWT_SECRET is not configured.');
    return res.status(500).json({
      success: false,
      message: 'Internal server configuration error.',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Invalid token credentials.',
      });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or token invalid. Please log in again.',
    });
  }
}

module.exports = { requireAdminAuth };

