const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/leaderboard/global
router.get('/global', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;

    const users = await User.find({})
      .select('username level totalXp streak badges avatarColor longestStreak totalHabitsCompleted')
      .sort({ totalXp: -1, level: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments();

    const currentUserRank = await User.countDocuments({ totalXp: { $gt: req.user.totalXp } }) + 1;

    const leaderboard = users.map((u, i) => ({
      rank: (page - 1) * limit + i + 1,
      id: u._id,
      username: u.username,
      level: u.level,
      totalXp: u.totalXp,
      streak: u.streak,
      longestStreak: u.longestStreak,
      badgeCount: u.badges.length,
      avatarColor: u.avatarColor,
      totalHabitsCompleted: u.totalHabitsCompleted,
      isCurrentUser: u._id.toString() === req.user._id.toString(),
    }));

    res.json({
      leaderboard,
      total,
      page,
      pages: Math.ceil(total / limit),
      currentUserRank,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/leaderboard/weekly
router.get('/weekly', async (req, res, next) => {
  try {
    // Weekly leaderboard based on streak
    const users = await User.find({})
      .select('username level totalXp streak badges avatarColor')
      .sort({ streak: -1, totalXp: -1 })
      .limit(20);

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      id: u._id,
      username: u.username,
      level: u.level,
      streak: u.streak,
      totalXp: u.totalXp,
      badgeCount: u.badges.length,
      avatarColor: u.avatarColor,
      isCurrentUser: u._id.toString() === req.user._id.toString(),
    }));

    res.json({ leaderboard });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
