const jwt = require('jsonwebtoken');

// Sample data taken from seed.js
const SAMPLE_USER = {
  id: 'mock_user_123',
  _id: 'mock_user_123',
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
  badges: [{ id: 'first_habit', name: 'First Step', description: 'Completed first habit', icon: '🌱' }],
  unlockedThemes: ['default'],
  activeTheme: 'default',
  xpForNextLevel: () => 1000,
  levelProgress: () => 32
};

const SAMPLE_HABITS = [
  { _id: 'h1', id: 'h1', name: 'Morning Meditation', category: 'Mindfulness', icon: '🧘', color: '#8b5cf6', frequency: 'daily', completedToday: false, currentStreak: 5 },
  { _id: 'h2', id: 'h2', name: 'Read 20 Pages', category: 'Study', icon: '📚', color: '#06b6d4', frequency: 'daily', completedToday: true, currentStreak: 12 },
  { _id: 'h3', id: 'h3', name: 'Drink Water', category: 'Health', icon: '💧', color: '#0ea5e9', frequency: 'daily', completedToday: false, currentStreak: 3 }
];

const mockMiddleware = (app) => (req, res, next) => {
  if (!app.get('mockMode')) return next();

  const { method, url } = req;
  console.log(`💡 MOCK: ${method} ${url}`);

  // Auth: Login
  if (method === 'POST' && url === '/api/auth/login') {
    const { email, password } = req.body;
    if (email === SAMPLE_USER.email && password === SAMPLE_USER.password) {
      const token = jwt.sign({ id: SAMPLE_USER.id }, process.env.JWT_SECRET || 'mock_secret');
      return res.json({ token, user: { ...SAMPLE_USER, xpForNextLevel: 1000, levelProgress: 32 } });
    }
    return res.status(401).json({ error: 'Invalid mock credentials. Use demo@levelup.gg / demo123' });
  }

  // Auth: Me
  if (method === 'GET' && url === '/api/auth/me') {
    return res.json({ user: { ...SAMPLE_USER, xpForNextLevel: 1000, levelProgress: 32 } });
  }

  // Habits: Get All
  if (method === 'GET' && url === '/api/habits') {
    return res.json({ habits: SAMPLE_HABITS });
  }

  // Habits: Stats
  if (method === 'GET' && url === '/api/habits/stats') {
    return res.json({ totalCompleted: 34, currentStreak: 5, longestStreak: 12 });
  }

  // Challenges: Daily
  if (method === 'GET' && url === '/api/challenges/daily') {
    return res.json({
      challenges: [
        { _id: 'c1', title: 'Triple Threat', description: 'Complete 3 habits today', icon: '⚡', xpReward: 50, coinReward: 25, progress: 1, target: 3 },
        { _id: 'c2', title: 'Fitness Focus', description: 'Complete a Fitness habit', icon: '💪', xpReward: 30, coinReward: 15, progress: 0, target: 1 }
      ]
    });
  }

  // Leaderboard
  if (method === 'GET' && url.includes('/api/leaderboard')) {
    return res.json({
      total: 150,
      currentUserRank: 42,
      entries: [
        { userId: 'u1', username: 'NightHawk_99', totalXp: 8450, level: 12, streak: 15, avatarColor: '#7c3aed' },
        { userId: 'u2', username: 'ZenMaster_X', totalXp: 5200, level: 9, streak: 30, avatarColor: '#06b6d4' },
        { userId: 'u3', username: 'IronWill_Pro', totalXp: 3800, level: 7, streak: 7, avatarColor: '#f59e0b' }
      ]
    });
  }

  // Rewards
  if (method === 'GET' && url === '/api/rewards') {
    return res.json({
      items: [
        { id: 't1', name: 'Cyberpunk Theme', type: 'theme', cost: 500, icon: '🌃', owned: false, canAfford: false },
        { id: 'b1', name: 'XP Booster', type: 'boost', cost: 100, icon: '🚀', owned: false, canAfford: false }
      ]
    });
  }

  // Fallback for mock mode
  if (url.startsWith('/api/')) {
    return res.json({ message: 'Mock Mode: Operation successful (simulated)', success: true });
  }

  next();
};

module.exports = mockMiddleware;
