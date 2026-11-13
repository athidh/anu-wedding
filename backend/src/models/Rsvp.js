const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    attending: {
      type: Boolean,
      required: [true, 'Attending status is required'],
    },
    guests: {
      type: Number,
      required: true,
      default: function () {
        return this.attending ? 1 : 0;
      },
      min: [0, 'Guest count cannot be negative'],
      max: [10, 'Maximum 10 guests allowed'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [300, 'Message cannot exceed 300 characters'],
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for duplicate detection and fast sorting
rsvpSchema.index({ name: 'text' });
rsvpSchema.index({ attending: 1, createdAt: -1 });

module.exports = mongoose.model('Rsvp', rsvpSchema);

