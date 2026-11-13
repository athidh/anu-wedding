const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB, isConnected } = require('./config/db');
const rsvpRoutes = require('./routes/rsvp');
const adminRoutes = require('./routes/admin');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath) && !process.env.MONGODB_URI) {
  console.warn('\x1b[33m[Warning]\x1b[0m No .env file found.');
  console.warn('Run \x1b[36mnpm run setup\x1b[0m to configure your MongoDB Atlas and Admin credentials.\n');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Render, Cloudflare, load balancers)
app.set('trust proxy', 1);

// Security Headers (disable CSP so dashboard.html can load styles, fonts and scripts easily)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// CORS configuration
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '*';
const allowedOrigins = allowedOriginsEnv === '*' 
  ? '*' 
  : allowedOriginsEnv.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins === '*') return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parser
app.use(express.json({ limit: '50kb' }));

// Health & Ping Endpoints (Never rate-limited, ideal for UptimeRobot / uptime monitors)
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'anu-wedding-backend',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: isConnected() ? 'connected' : 'connecting_or_disconnected',
  });
});

// Redirect to modern React dashboard
app.get(['/monitoring', '/dashboard'], (req, res) => {
  res.redirect('http://localhost:3001');
});

// Serve monitoring assets statically as fallback
app.use('/monitoring', express.static(path.join(__dirname, '..', 'monitoring')));

// API Routes
app.use('/api/rsvp', rsvpRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server after connecting to Database
async function startServer() {
  if (process.env.MONGODB_URI) {
    await connectDB();
  }

  app.listen(PORT, () => {
    console.log(`\n\x1b[32m[RSVP API Server Running]\x1b[0m`);
    console.log(`- API URL:    http://localhost:${PORT}`);
    console.log(`- Health:     http://localhost:${PORT}/api/health`);
    console.log(`- RSVP:       POST http://localhost:${PORT}/api/rsvp`);
    console.log(`- Admin:      http://localhost:${PORT}/api/admin/*`);
    console.log(`- Dashboard:  http://localhost:3001\n`);
  });
}

startServer();

module.exports = app;
