const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

const STORE_ITEMS = [
  { id: 'theme_cyberpunk', name: 'Cyberpunk Theme', description: 'Neon green hacker aesthetic', icon: '🤖', cost: 200, type: 'theme', preview: '#00ff41' },
  { id: 'theme_sunset', name: 'Sunset Theme', description: 'Warm orange and pink gradients', icon: '🌅', cost: 200, type: 'theme', preview: '#f59e0b' },
  { id: 'theme_ocean', name: 'Ocean Theme', description: 'Deep blue ocean vibes', icon: '🌊', cost: 150, type: 'theme', preview: '#0ea5e9' },
  { id: 'theme_forest', name: 'Forest Theme', description: 'Calm green nature tones', icon: '🌿', cost: 150, type: 'theme', preview: '#10b981' },
  { id: 'badge_star', name: 'Gold Star Badge', description: 'Show off your dedication', icon: '⭐', cost: 100, type: 'cosmetic' },
  { id: 'badge_dragon', name: 'Dragon Badge', description: 'Legendary status symbol', icon: '🐉', cost: 300, type: 'cosmetic' },
  { id: 'xp_boost_2x', name: '2x XP Boost (24h)', description: 'Double XP for 24 hours', icon: '⚡', cost: 250, type: 'boost' },
];

// GET /api/rewards/store
router.get('/store', async (req, res) => {
  const user = req.user;
  const itemsWithStatus = STORE_ITEMS.map((item) => ({
    ...item,
    owned: user.unlockedThemes.includes(item.id),
    canAfford: user.coins >= item.cost,
  }));
  res.json({ items: itemsWithStatus, userCoins: user.coins });
});

// POST /api/rewards/purchase
router.post('/purchase', async (req, res, next) => {
  try {
    const { itemId } = req.body;
    const item = STORE_ITEMS.find((i) => i.id === itemId);
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    const user = await User.findById(req.user._id);

    if (user.unlockedThemes.includes(itemId)) {
      return res.status(400).json({ error: 'Item already owned.' });
    }

    if (user.coins < item.cost) {
      return res.status(400).json({ error: 'Insufficient coins.' });
    }

    user.coins -= item.cost;
    user.unlockedThemes.push(itemId);
    await user.save();

    res.json({
      message: `${item.name} purchased!`,
      item,
      userCoins: user.coins,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
