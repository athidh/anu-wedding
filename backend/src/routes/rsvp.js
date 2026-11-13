const express = require('express');
const router = express.Router();
const Rsvp = require('../models/Rsvp');
const { rsvpLimiter } = require('../middleware/rateLimiter');
const { isConnected } = require('../config/db');

/**
 * @route   POST /api/rsvp
 * @desc    Submit an RSVP response (Public)
 * @access  Public
 */
router.post('/', rsvpLimiter, async (req, res) => {
  try {
    const { name, attending, guests, message = '', website } = req.body;

    // 1. Honeypot check: If the hidden 'website' field was filled, it's a bot
    if (website && typeof website === 'string' && website.trim().length > 0) {
      console.warn(`[Bot Detected] Dropping spam submission from IP: ${req.ip}`);
      // Return 201 so the bot assumes it succeeded without polluting our database
      return res.status(201).json({
        success: true,
        message: 'RSVP received successfully.',
      });
    }

    // 2. Validate Name
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Your name is required.',
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 80 characters.',
      });
    }

    // 3. Validate Attending status
    if (typeof attending !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Attending status must be true or false.',
      });
    }

    // 4. Validate Guest Count
    let guestCount = 0;
    if (attending) {
      const parsedGuests = parseInt(guests, 10);
      if (isNaN(parsedGuests) || parsedGuests < 1 || parsedGuests > 10) {
        return res.status(400).json({
          success: false,
          message: 'Number of guests must be between 1 and 10.',
        });
      }
      guestCount = parsedGuests;
    }

    // 5. Validate Message
    let trimmedMessage = '';
    if (message && typeof message === 'string') {
      trimmedMessage = message.trim();
      if (trimmedMessage.length > 300) {
        return res.status(400).json({
          success: false,
          message: 'Message cannot exceed 300 characters.',
        });
      }
    }

    // 6. Check Database Connectivity
    if (!isConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently connecting. Please try again in a few moments.',
      });
    }

    // 7. Save to MongoDB
    const rsvp = await Rsvp.create({
      name: trimmedName,
      attending,
      guests: guestCount,
      message: trimmedMessage,
    });

    return res.status(201).json({
      success: true,
      message: 'RSVP confirmed successfully!',
      data: {
        id: rsvp._id,
        name: rsvp.name,
        attending: rsvp.attending,
        guests: rsvp.guests,
        message: rsvp.message,
        createdAt: rsvp.createdAt,
      },
    });
  } catch (error) {
    console.error('[RSVP Submission Error]', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while saving your RSVP. Please try again.',
    });
  }
});

module.exports = router;
