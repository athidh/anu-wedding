const rateLimit = require('express-rate-limit');

// Rate limiter for public RSVP submissions (prevents flooding / spam)
const rsvpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 submissions per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many RSVP requests from this connection. Please try again in a few minutes.',
  },
  statusCode: 429,
});

// Strict rate limiter for admin login endpoint (prevents brute-force)
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 failed attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  },
  statusCode: 429,
});

module.exports = {
  rsvpLimiter,
  adminLoginLimiter,
};

