const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const Habit = require('../models/Habit');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

// Generate or get today's challenges
const getOrCreateDailyChallenges = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let challenges = await Challenge.find({
    validDate: { $gte: today, $lt: tomorrow },
  });

  if (challenges.length === 0) {
    const templates = [
      {
        title: 'Triple Threat',
        description: 'Complete 3 habits today',
        icon: '⚡',
        xpReward: 50,
        coinReward: 25,
        type: 'complete_habits',
        target: 3,
        difficulty: 'easy',
      },
      {
        title: 'Fitness Focus',
        description: 'Complete a Fitness habit today',
        icon: '💪',
        xpReward: 30,
        coinReward: 15,
        type: 'specific_category',
        target: 1,
        category: 'Fitness',
        difficulty: 'easy',
      },
      {
        title: 'Perfect Day',
        description: 'Complete all your daily habits',
        icon: '🏆',
        xpReward: 100,
        coinReward: 50,
        type: 'log_all_daily',
        target: 1,
        difficulty: 'hard',
      },
      {
        title: 'Mind & Body',
        description: 'Complete a Mindfulness habit',
        icon: '🧘',
        xpReward: 30,
        coinReward: 15,
        type: 'specific_category',
        target: 1,
        category: 'Mindfulness',
        difficulty: 'easy',
      },
      {
        title: 'Knowledge Seeker',
        description: 'Complete a Study habit today',
        icon: '📚',
        xpReward: 30,
        coinReward: 15,
        type: 'specific_category',
        target: 1,
        category: 'Study',
        difficulty: 'easy',
      },
    ];

    // Pick 3 random challenges for today
    const shuffled = templates.sort(() => Math.random() - 0.5).slice(0, 3);
    challenges = await Challenge.insertMany(shuffled.map((c) => ({ ...c, validDate: today })));
  }

  return challenges;
};

// GET /api/challenges/daily
router.get('/daily', async (req, res, next) => {
  try {
    const challenges = await getOrCreateDailyChallenges();

    const challengesWithStatus = challenges.map((c) => ({
      ...c.toObject(),
      completed: c.completedBy.includes(req.user._id),
    }));

    res.json({ challenges: challengesWithStatus });
  } catch (err) {
    next(err);
  }
});

// POST /api/challenges/:id/claim
router.post('/:id/claim', async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

    // Check if already claimed
    if (challenge.completedBy.includes(req.user._id)) {
      return res.status(400).json({ error: 'Challenge already claimed.' });
    }

    // Verify challenge completion
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedTodayHabits = habits.filter((h) => h.isCompletedToday());
    let isComplete = false;

    if (challenge.type === 'complete_habits') {
      isComplete = completedTodayHabits.length >= challenge.target;
    } else if (challenge.type === 'specific_category') {
      isComplete = completedTodayHabits.some((h) => h.category === challenge.category);
    } else if (challenge.type === 'log_all_daily') {
      const dailyHabits = habits.filter((h) => h.frequency === 'daily');
      isComplete = dailyHabits.length > 0 && dailyHabits.every((h) => h.isCompletedToday());
    }

    if (!isComplete) {
      return res.status(400).json({ error: 'Challenge requirements not met yet.' });
    }

    challenge.completedBy.push(req.user._id);
    await challenge.save();

    const user = await User.findById(req.user._id);
    const { leveled, newLevel } = await user.addXP(challenge.xpReward);

    res.json({
      message: 'Challenge claimed!',
      xpEarned: challenge.xpReward,
      coinsEarned: challenge.coinReward,
      leveled,
      newLevel,
      user: {
        level: user.level,
        xp: user.xp,
        coins: user.coins,
        xpForNextLevel: user.xpForNextLevel(),
        levelProgress: user.levelProgress(),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
