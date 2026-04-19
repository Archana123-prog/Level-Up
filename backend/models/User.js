const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const badgeSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  icon: String,
  unlockedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    avatarColor: {
      type: String,
      default: '#7c3aed',
    },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null },
    badges: [badgeSchema],
    unlockedThemes: { type: [String], default: ['default'] },
    activeTheme: { type: String, default: 'default' },
    coins: { type: Number, default: 0 },
    totalHabitsCompleted: { type: Number, default: 0 },
    friendIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dailyChallengeCompletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// XP required for next level (exponential growth)
userSchema.methods.xpForNextLevel = function () {
  return Math.floor(100 * Math.pow(1.5, this.level - 1));
};

userSchema.methods.levelProgress = function () {
  const required = this.xpForNextLevel();
  return Math.min((this.xp / required) * 100, 100);
};

// Add XP and handle level-ups
userSchema.methods.addXP = async function (amount) {
  this.xp += amount;
  this.totalXp += amount;
  this.coins += Math.floor(amount / 2);

  let leveled = false;
  while (this.xp >= this.xpForNextLevel()) {
    this.xp -= this.xpForNextLevel();
    this.level += 1;
    leveled = true;
  }

  await this.save();
  return { leveled, newLevel: this.level };
};

// Update streak
userSchema.methods.updateStreak = async function () {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!this.lastActivityDate) {
    this.streak = 1;
  } else {
    const lastDate = new Date(this.lastActivityDate);
    const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already active today
    } else if (diffDays === 1) {
      this.streak += 1;
    } else {
      this.streak = 1;
    }
  }

  if (this.streak > this.longestStreak) {
    this.longestStreak = this.streak;
  }

  this.lastActivityDate = now;
  await this.save();
};

// Check and award badges
userSchema.methods.checkBadges = async function () {
  const newBadges = [];
  const badgeIds = this.badges.map((b) => b.id);

  const badgeCriteria = [
    { id: 'first_habit', name: 'First Step', description: 'Completed your first habit', icon: '🌱', check: () => this.totalHabitsCompleted >= 1 },
    { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: '🔥', check: () => this.streak >= 7 },
    { id: 'streak_30', name: 'Month Master', description: '30 day streak', icon: '⚡', check: () => this.streak >= 30 },
    { id: 'level_5', name: 'Rising Star', description: 'Reached level 5', icon: '⭐', check: () => this.level >= 5 },
    { id: 'level_10', name: 'Veteran', description: 'Reached level 10', icon: '💎', check: () => this.level >= 10 },
    { id: 'habits_50', name: 'Half Century', description: 'Completed 50 habits', icon: '🏆', check: () => this.totalHabitsCompleted >= 50 },
    { id: 'habits_100', name: 'Centurion', description: 'Completed 100 habits', icon: '👑', check: () => this.totalHabitsCompleted >= 100 },
  ];

  for (const badge of badgeCriteria) {
    if (!badgeIds.includes(badge.id) && badge.check()) {
      this.badges.push({ id: badge.id, name: badge.name, description: badge.description, icon: badge.icon });
      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) await this.save();
  return newBadges;
};

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
