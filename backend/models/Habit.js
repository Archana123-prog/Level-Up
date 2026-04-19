const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  xpEarned: { type: Number, default: 10 },
  note: String,
});

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [100, 'Habit name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      enum: ['Health', 'Fitness', 'Study', 'Mindfulness', 'Productivity', 'Social', 'Finance', 'Creative', 'Other'],
      default: 'Other',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    icon: { type: String, default: '✨' },
    color: { type: String, default: '#7c3aed' },
    targetDays: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] }, // 0=Sun, 6=Sat
    completions: [completionSchema],
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    xpMultiplier: { type: Number, default: 1 },
    reminderTime: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Check if completed today
habitSchema.methods.isCompletedToday = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.completions.some((c) => {
    const d = new Date(c.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
};

// Calculate streak bonus XP
habitSchema.methods.calculateXP = function (streak) {
  const base = 10;
  const streakBonus = Math.floor(streak / 7) * 5; // +5 XP every 7-day streak
  return (base + streakBonus) * this.xpMultiplier;
};

// Update streak
habitSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const completedToday = this.completions.some((c) => {
    const d = new Date(c.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const completedYesterday = this.completions.some((c) => {
    const d = new Date(c.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === yesterday.getTime();
  });

  if (completedToday) {
    if (completedYesterday || this.currentStreak === 0) {
      this.currentStreak += completedToday ? 1 : 0;
    } else {
      this.currentStreak = 1;
    }
  }

  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
};

module.exports = mongoose.model('Habit', habitSchema);
