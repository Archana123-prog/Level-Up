const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Habit = require('../models/Habit');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

const habitSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().max(500).optional().allow(''),
  category: Joi.string().valid('Health', 'Fitness', 'Study', 'Mindfulness', 'Productivity', 'Social', 'Finance', 'Creative', 'Other').default('Other'),
  frequency: Joi.string().valid('daily', 'weekly').default('daily'),
  icon: Joi.string().optional().default('✨'),
  color: Joi.string().optional().default('#7c3aed'),
  targetDays: Joi.array().items(Joi.number().min(0).max(6)).optional(),
  reminderTime: Joi.string().optional().allow(''),
});

// GET /api/habits - Get all habits for user
router.get('/', async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true }).sort({ order: 1, createdAt: 1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habitsWithStatus = habits.map((h) => ({
      ...h.toObject(),
      completedToday: h.isCompletedToday(),
      completionsCount: h.completions.length,
    }));

    res.json({ habits: habitsWithStatus });
  } catch (err) {
    next(err);
  }
});

// POST /api/habits - Create a new habit
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = habitSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const count = await Habit.countDocuments({ userId: req.user._id, isActive: true });
    if (count >= 30) return res.status(400).json({ error: 'Maximum of 30 active habits allowed.' });

    const habit = await Habit.create({ ...value, userId: req.user._id, order: count });

    res.status(201).json({ habit: { ...habit.toObject(), completedToday: false } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/habits/:id - Update habit
router.put('/:id', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });

    const { error, value } = habitSchema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ error: error.details[0].message });

    Object.assign(habit, value);
    await habit.save();

    res.json({ habit: { ...habit.toObject(), completedToday: habit.isCompletedToday() } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/habits/:id - Soft delete
router.delete('/:id', async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });
    res.json({ message: 'Habit deleted.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/habits/:id/complete - Mark habit complete
router.post('/:id/complete', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id, isActive: true });
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });

    if (habit.isCompletedToday()) {
      return res.status(400).json({ error: 'Habit already completed today.' });
    }

    // Update user streak first
    const user = await User.findById(req.user._id);
    await user.updateStreak();

    // Calculate XP with streak bonus
    const streakBonus = Math.floor(user.streak / 7) * 5;
    const xpEarned = (10 + streakBonus) * habit.xpMultiplier;

    // Add completion
    habit.completions.push({ date: new Date(), xpEarned });
    habit.totalCompletions += 1;
    habit.updateStreak();
    await habit.save();

    // Update user stats
    user.totalHabitsCompleted += 1;
    await user.save();

    // Award XP
    const { leveled, newLevel } = await user.addXP(xpEarned);

    // Check badges
    const newBadges = await user.checkBadges();

    res.json({
      message: 'Habit completed!',
      xpEarned,
      streakBonus,
      leveled,
      newLevel,
      newBadges,
      user: {
        level: user.level,
        xp: user.xp,
        totalXp: user.totalXp,
        streak: user.streak,
        coins: user.coins,
        xpForNextLevel: user.xpForNextLevel(),
        levelProgress: user.levelProgress(),
        badges: user.badges,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/habits/:id/uncomplete - Undo completion
router.post('/:id/uncomplete', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completionIndex = habit.completions.findIndex((c) => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (completionIndex === -1) return res.status(400).json({ error: 'Habit not completed today.' });

    const xpEarned = habit.completions[completionIndex].xpEarned;
    habit.completions.splice(completionIndex, 1);
    habit.totalCompletions = Math.max(0, habit.totalCompletions - 1);
    await habit.save();

    // Remove XP
    const user = await User.findById(req.user._id);
    user.xp = Math.max(0, user.xp - xpEarned);
    user.totalXp = Math.max(0, user.totalXp - xpEarned);
    user.totalHabitsCompleted = Math.max(0, user.totalHabitsCompleted - 1);
    await user.save();

    res.json({ message: 'Completion undone.', xpRemoved: xpEarned });
  } catch (err) {
    next(err);
  }
});

// GET /api/habits/stats - Get habit statistics
router.get('/stats', async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    const user = await User.findById(req.user._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = habits.filter((h) => h.isCompletedToday()).length;
    const totalToday = habits.filter((h) => {
      if (h.frequency === 'daily') return true;
      return h.targetDays.includes(today.getDay());
    }).length;

    // Last 7 days completion data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const completions = habits.reduce((count, h) => {
        return count + h.completions.filter((c) => c.date >= date && c.date < nextDate).length;
      }, 0);

      last7Days.push({
        date: date.toISOString().split('T')[0],
        completions,
        total: habits.length,
      });
    }

    res.json({
      completedToday,
      totalToday,
      totalHabits: habits.length,
      streak: user.streak,
      longestStreak: user.longestStreak,
      totalXp: user.totalXp,
      level: user.level,
      last7Days,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/habits/ai-suggestions - AI habit suggestions
router.get('/ai-suggestions', async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    const categories = [...new Set(habits.map((h) => h.category))];

    // Rule-based suggestions based on existing habits
    const allSuggestions = [
      { name: 'Morning Meditation', category: 'Mindfulness', icon: '🧘', description: '10 minutes of mindfulness to start your day', reason: 'Great for mental clarity' },
      { name: 'Read 20 Pages', category: 'Study', icon: '📚', description: 'Read 20 pages of any book daily', reason: 'Builds knowledge consistently' },
      { name: 'Drink 8 Glasses of Water', category: 'Health', icon: '💧', description: 'Stay hydrated throughout the day', reason: 'Essential for energy and focus' },
      { name: '30-Minute Walk', category: 'Fitness', icon: '🚶', description: 'A brisk daily walk for health', reason: 'Low-impact, high benefit' },
      { name: 'Gratitude Journal', category: 'Mindfulness', icon: '📔', description: 'Write 3 things you are grateful for', reason: 'Boosts happiness and positivity' },
      { name: 'No Social Media Before 10am', category: 'Productivity', icon: '📵', description: 'Protect your morning focus time', reason: 'Reduces anxiety, boosts productivity' },
      { name: '5-Minute Stretching', category: 'Fitness', icon: '🤸', description: 'Quick stretching routine', reason: 'Reduces tension and improves flexibility' },
      { name: 'Save $5 Daily', category: 'Finance', icon: '💰', description: 'Small daily savings add up fast', reason: 'Builds financial discipline' },
      { name: 'Creative Writing', category: 'Creative', icon: '✍️', description: 'Write 200 words of anything creative', reason: 'Unlocks creativity and self-expression' },
      { name: 'Call a Friend', category: 'Social', icon: '📞', description: 'Maintain social connections', reason: 'Reduces loneliness, boosts mood' },
    ];

    // Filter out habits user already has (by name similarity)
    const existingNames = habits.map((h) => h.name.toLowerCase());
    const suggestions = allSuggestions
      .filter((s) => !existingNames.some((n) => n.includes(s.name.toLowerCase().split(' ')[0])))
      .slice(0, 5);

    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
