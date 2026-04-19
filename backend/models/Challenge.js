const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    icon: { type: String, default: '⚡' },
    xpReward: { type: Number, default: 50 },
    coinReward: { type: Number, default: 25 },
    type: {
      type: String,
      enum: ['complete_habits', 'maintain_streak', 'specific_category', 'log_all_daily'],
      default: 'complete_habits',
    },
    target: { type: Number, default: 3 },
    category: String,
    validDate: { type: Date, required: true }, // The day this challenge is valid for
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Challenge', challengeSchema);
