const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Habit = require('./models/Habit');
const Challenge = require('./models/Challenge');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/levelup';

const SAMPLE_USERS = [
  { username: 'NightHawk_99', email: 'nighthawk@demo.com', password: 'demo123', level: 12, xp: 450, totalXp: 8450, streak: 15, longestStreak: 22, coins: 340, totalHabitsCompleted: 127, avatarColor: '#7c3aed' },
  { username: 'ZenMaster_X', email: 'zen@demo.com', password: 'demo123', level: 9, xp: 220, totalXp: 5200, streak: 30, longestStreak: 30, coins: 280, totalHabitsCompleted: 98, avatarColor: '#06b6d4' },
  { username: 'IronWill_Pro', email: 'ironwill@demo.com', password: 'demo123', level: 7, xp: 800, totalXp: 3800, streak: 7, longestStreak: 14, coins: 190, totalHabitsCompleted: 72, avatarColor: '#f59e0b' },
  { username: 'StarChaser', email: 'star@demo.com', password: 'demo123', level: 5, xp: 150, totalXp: 2150, streak: 5, longestStreak: 8, coins: 125, totalHabitsCompleted: 45, avatarColor: '#ec4899' },
  { username: 'EpicGrinder', email: 'epic@demo.com', password: 'demo123', level: 3, xp: 60, totalXp: 660, streak: 2, longestStreak: 5, coins: 55, totalHabitsCompleted: 18, avatarColor: '#10b981' },
];

const SAMPLE_HABITS = [
  { name: 'Morning Meditation', category: 'Mindfulness', icon: '🧘', color: '#8b5cf6', frequency: 'daily', description: '10 minutes of mindfulness' },
  { name: 'Read 20 Pages', category: 'Study', icon: '📚', color: '#06b6d4', frequency: 'daily' },
  { name: 'Drink 8 Glasses of Water', category: 'Health', icon: '💧', color: '#0ea5e9', frequency: 'daily' },
  { name: '30-Minute Run', category: 'Fitness', icon: '🏃', color: '#f59e0b', frequency: 'daily' },
  { name: 'No Social Media Before 10am', category: 'Productivity', icon: '📵', color: '#ec4899', frequency: 'daily' },
  { name: 'Gratitude Journal', category: 'Mindfulness', icon: '📔', color: '#7c3aed', frequency: 'daily' },
];

const SAMPLE_BADGES_FOR_DEMO = [
  { id: 'first_habit', name: 'First Step', description: 'Completed first habit', icon: '🌱' },
  { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: '🔥' },
  { id: 'level_5', name: 'Rising Star', description: 'Reached level 5', icon: '⭐' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Habit.deleteMany({});
    await Challenge.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo user (easy to remember credentials)
    const demoUser = await User.create({
      username: 'DemoHero',
      email: 'demo@levelup.gg',
      password: 'demo123',
      level: 4,
      xp: 320,
      totalXp: 1820,
      streak: 5,
      longestStreak: 12,
      coins: 95,
      totalHabitsCompleted: 34,
      avatarColor: '#7c3aed',
      badges: SAMPLE_BADGES_FOR_DEMO,
      lastActivityDate: new Date(),
    });

    // Add sample habits for demo user
    for (const h of SAMPLE_HABITS) {
      const habit = await Habit.create({ ...h, userId: demoUser._id });

      // Add some past completions for realism
      const days = [1, 2, 3, 4, 5];
      for (const d of days) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        habit.completions.push({ date, xpEarned: 10 });
      }
      habit.currentStreak = 5;
      habit.totalCompletions = days.length;
      await habit.save();
    }

    console.log(`✅ Created demo user: demo@levelup.gg / demo123`);

    // Create sample leaderboard users
    for (const u of SAMPLE_USERS) {
      const user = await User.create({
        ...u,
        badges: u.streak >= 7 ? SAMPLE_BADGES_FOR_DEMO : SAMPLE_BADGES_FOR_DEMO.slice(0, 1),
        lastActivityDate: new Date(),
        unlockedThemes: ['default'],
      });
      console.log(`  ✅ Created: ${u.username}`);
    }

    // Create today's challenges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Challenge.insertMany([
      { title: 'Triple Threat', description: 'Complete 3 habits today', icon: '⚡', xpReward: 50, coinReward: 25, type: 'complete_habits', target: 3, difficulty: 'easy', validDate: today },
      { title: 'Fitness Focus', description: 'Complete a Fitness habit', icon: '💪', xpReward: 30, coinReward: 15, type: 'specific_category', target: 1, category: 'Fitness', difficulty: 'easy', validDate: today },
      { title: 'Perfect Day', description: 'Complete all your daily habits', icon: '🏆', xpReward: 100, coinReward: 50, type: 'log_all_daily', target: 1, difficulty: 'hard', validDate: today },
    ]);
    console.log('✅ Created daily challenges');

    console.log('\n🎮 Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Demo login credentials:');
    console.log('  Email:    demo@levelup.gg');
    console.log('  Password: demo123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
