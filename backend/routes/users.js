const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/users/profile
router.get('/profile', async (req, res) => {
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
      createdAt: user.createdAt,
    },
  });
});

// PUT /api/users/profile
router.put('/profile', async (req, res, next) => {
  try {
    const allowedUpdates = ['username', 'avatarColor', 'activeTheme'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        avatarColor: user.avatarColor,
        activeTheme: user.activeTheme,
      },
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Username already taken.' });
    next(err);
  }
});

module.exports = router;
