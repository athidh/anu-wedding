const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Rsvp = require('../models/Rsvp');
const { requireAdminAuth, REQUIRE_PASSWORD } = require('../middleware/auth');
const { adminLoginLimiter } = require('../middleware/rateLimiter');
const { isConnected } = require('../config/db');

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin password and return JWT
 * @access  Public
 */
router.post('/login', adminLoginLimiter, async (req, res) => {
  try {
    // If password requirement is disabled, immediately authenticate
    if (!REQUIRE_PASSWORD) {
      return res.json({
        success: true,
        message: 'Password requirement is currently disabled.',
        token: 'public-access-token',
        expiresIn: 'unlimited',
      });
    }

    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
      });
    }

    const storedHash = process.env.ADMIN_PASSWORD_HASH;
    if (!storedHash) {
      console.error('[Admin Auth Error] ADMIN_PASSWORD_HASH is not set.');
      return res.status(500).json({
        success: false,
        message: 'Admin account has not been configured yet. Please run npm run setup.',
      });
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect admin password.',
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign(
      { role: 'admin', loggedInAt: Date.now() },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      expiresIn: '24h',
    });
  } catch (error) {
    console.error('[Admin Login Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get aggregate RSVP statistics (headcount, attendance, replies)
 * @access  Admin
 */
router.get('/stats', requireAdminAuth, async (req, res) => {
  try {
    if (!isConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently connecting. Please try again in a few moments.',
      });
    }

    const totalReplies = await Rsvp.countDocuments();
    const totalAttending = await Rsvp.countDocuments({ attending: true });
    const totalDeclined = await Rsvp.countDocuments({ attending: false });

    // Aggregate total head count (sum of guests for all attending)
    const headcountAggregate = await Rsvp.aggregate([
      { $match: { attending: true } },
      { $group: { _id: null, totalGuests: { $sum: '$guests' } } },
    ]);

    const totalHeadcount = headcountAggregate.length > 0 ? headcountAggregate[0].totalGuests : 0;

    return res.json({
      success: true,
      data: {
        totalReplies,
        totalAttending,
        totalDeclined,
        totalHeadcount,
        acceptanceRate: totalReplies > 0 ? Math.round((totalAttending / totalReplies) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('[Admin Stats Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stats.',
    });
  }
});

/**
 * @route   GET /api/admin/rsvps
 * @desc    Get searchable and filterable RSVP entries with duplicate warnings
 * @access  Admin
 */
router.get('/rsvps', requireAdminAuth, async (req, res) => {
  try {
    if (!isConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently connecting. Please try again in a few moments.',
      });
    }

    const { search = '', status = 'all' } = req.query;

    const query = {};

    // Filter by attendance status
    if (status === 'attending') {
      query.attending = true;
    } else if (status === 'declined') {
      query.attending = false;
    }

    // Search by name or message
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { message: searchRegex }];
    }

    const rsvps = await Rsvp.find(query).sort({ createdAt: -1 }).lean();

    // Find duplicates (case-insensitive name matches) to help admin flag repetitions
    const nameCounts = {};
    rsvps.forEach((r) => {
      const lower = r.name.toLowerCase().trim();
      nameCounts[lower] = (nameCounts[lower] || 0) + 1;
    });

    const enrichedRsvps = rsvps.map((r) => ({
      ...r,
      isDuplicate: nameCounts[r.name.toLowerCase().trim()] > 1,
    }));

    return res.json({
      success: true,
      count: enrichedRsvps.length,
      data: enrichedRsvps,
    });
  } catch (error) {
    console.error('[Admin List Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch RSVPs.',
    });
  }
});

/**
 * @route   DELETE /api/admin/rsvps/:id
 * @desc    Delete an RSVP entry by ID
 * @access  Admin
 */
router.delete('/rsvps/:id', requireAdminAuth, async (req, res) => {
  try {
    if (!isConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently connecting. Please try again in a few moments.',
      });
    }

    const { id } = req.params;
    const deleted = await Rsvp.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'RSVP entry not found.',
      });
    }

    return res.json({
      success: true,
      message: `RSVP for "${deleted.name}" was successfully removed.`,
      data: { id: deleted._id },
    });
  } catch (error) {
    console.error('[Admin Delete Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete RSVP.',
    });
  }
});

/**
 * @route   GET /api/admin/export.csv
 * @desc    Export all RSVP replies as CSV with formula-injection sanitization
 * @access  Admin
 */
router.get('/export.csv', requireAdminAuth, async (req, res) => {
  try {
    if (!isConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently connecting. Please try again in a few moments.',
      });
    }

    const rsvps = await Rsvp.find().sort({ createdAt: -1 }).lean();

    // Helper to escape CSV values and protect against formula injection
    const sanitizeCsvField = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      // Escape CSV formula characters (=, +, -, @)
      if (/^[=+\-@]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str}"`;
    };

    const headers = ['Name', 'Attending', 'Guests', 'Message', 'Submitted At (UTC)'];
    const rows = [headers.join(',')];

    rsvps.forEach((r) => {
      const row = [
        sanitizeCsvField(r.name),
        sanitizeCsvField(r.attending ? 'Yes' : 'No'),
        sanitizeCsvField(r.guests),
        sanitizeCsvField(r.message || ''),
        sanitizeCsvField(new Date(r.createdAt).toISOString()),
      ];
      rows.push(row.join(','));
    });

    // Prepend UTF-8 BOM so Excel opens Malayalam / Unicode characters correctly
    const csvContent = '\uFEFF' + rows.join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="wedding-rsvp-${new Date().toISOString().slice(0, 10)}.csv"`
    );

    return res.send(csvContent);
  } catch (error) {
    console.error('[Admin CSV Export Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export CSV.',
    });
  }
});

module.exports = router;
