const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  avatarColor: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const existingUser = await User.findOne({
      $or: [{ email: value.email }, { username: value.username }],
    });
    if (existingUser) {
      const field = existingUser.email === value.email ? 'Email' : 'Username';
      return res.status(409).json({ error: `${field} already in use.` });
    }

    const avatarColors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const user = await User.create({
      username: value.username,
      email: value.email,
      password: value.password,
      avatarColor: value.avatarColor || randomColor,
    });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        totalXp: user.totalXp,
        streak: user.streak,
        coins: user.coins,
        badges: user.badges,
        avatarColor: user.avatarColor,
        xpForNextLevel: user.xpForNextLevel(),
        levelProgress: user.levelProgress(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findOne({ email: value.email }).select('+password');
    if (!user || !(await user.comparePassword(value.password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        totalXp: user.totalXp,
        streak: user.streak,
        longestStreak: user.longestStreak,
        coins: user.coins,
        badges: user.badges,
        avatarColor: user.avatarColor,
        unlockedThemes: user.unlockedThemes,
        activeTheme: user.activeTheme,
        totalHabitsCompleted: user.totalHabitsCompleted,
        xpForNextLevel: user.xpForNextLevel(),
        levelProgress: user.levelProgress(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        totalXp: user.totalXp,
        streak: user.streak,
        longestStreak: user.longestStreak,
        coins: user.coins,
        badges: user.badges,
        avatarColor: user.avatarColor,
        unlockedThemes: user.unlockedThemes,
        activeTheme: user.activeTheme,
        totalHabitsCompleted: user.totalHabitsCompleted,
        xpForNextLevel: user.xpForNextLevel(),
        levelProgress: user.levelProgress(),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
