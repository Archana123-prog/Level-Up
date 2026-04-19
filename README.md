# 🎮 LevelUp – Gamified Habit Tracker

> Turn your daily habits into an epic RPG adventure. Earn XP, level up, maintain streaks, unlock rewards, and compete on global leaderboards.

---

## 🖼️ UI Preview

- **Dashboard**: Dark glassmorphism cards with neon purple/cyan glow. XP progress bar with shimmer animation. Live streak counter with fire animation. Floating +XP numbers on habit completion. Level-up confetti burst.
- **Habits**: Grid of glowing habit cards with category color badges. Completion button triggers particle burst. Filter pills for all/pending/done.
- **Leaderboard**: Podium visualization for top 3 with gold/silver/bronze glow. Full scrollable ranking below.
- **Rewards Store**: Shop grid with coin display. Purchase animations with confetti.
- **Profile**: Avatar with level badge overlay. Achievement grid (locked = greyed out).

---

## 📁 Project Structure

```
levelup/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with XP/level/streak methods
│   │   ├── Habit.js         # Habit schema with completion tracking
│   │   └── Challenge.js     # Daily challenge schema
│   ├── routes/
│   │   ├── auth.js          # Register, Login, /me
│   │   ├── habits.js        # Full CRUD + complete + AI suggestions
│   │   ├── users.js         # Profile management
│   │   ├── leaderboard.js   # Global + weekly rankings
│   │   ├── challenges.js    # Daily challenges + claim
│   │   └── rewards.js       # Store + purchase
│   ├── middleware/
│   │   └── auth.js          # JWT protection middleware
│   ├── server.js            # Express app + MongoDB connection
│   ├── seed.js              # Demo data seeder
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html       # PWA meta tags + Google Fonts
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── AuthPage.js       # Login + Register with color picker
    │   │   ├── layout/
    │   │   │   └── Layout.js         # Sidebar + mobile bottom nav
    │   │   ├── dashboard/
    │   │   │   ├── Dashboard.js      # Main hub (XP bar, habits, challenges)
    │   │   │   └── ProfilePage.js    # Profile + badge showcase
    │   │   ├── habits/
    │   │   │   └── HabitsPage.js     # Full habit management + AI suggestions
    │   │   ├── leaderboard/
    │   │   │   └── LeaderboardPage.js # Global + streak leaderboards
    │   │   └── rewards/
    │   │       └── RewardsPage.js    # Reward store
    │   ├── context/
    │   │   └── AuthContext.js        # Global auth state
    │   ├── utils/
    │   │   ├── api.js                # Axios instance + all API calls
    │   │   ├── sounds.js             # Web Audio API sound effects
    │   │   └── animations.js         # XP float, confetti, particles
    │   ├── styles/
    │   │   └── index.css             # Global CSS, neon theme, animations
    │   ├── App.js                    # Router + auth guards
    │   └── index.js                  # React root
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm or yarn

---

### 1. Clone & Install

```bash
# Backend
cd levelup/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/levelup
JWT_SECRET=change_this_to_something_random_and_long_32chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**For MongoDB Atlas** replace `MONGODB_URI` with your Atlas connection string.

---

### 3. Seed Sample Data (Optional but Recommended)

```bash
cd backend
node seed.js
```

This creates:
- **Demo user**: `demo@levelup.gg` / `demo123` (Level 4, with habits and badges)
- 5 leaderboard competitor users  
- Today's daily challenges

---

### 4. Start Backend

```bash
cd backend
npm run dev    # Development with auto-reload
# or
npm start      # Production
```

Server runs on: `http://localhost:5000`

---

### 5. Start Frontend

```bash
cd frontend
npm start
```

App opens at: `http://localhost:3000`

---

## 🎮 Gamification System

### XP & Levels
| Action | XP Earned |
|--------|-----------|
| Complete habit | +10 XP base |
| 7-day streak bonus | +5 XP per 7 days |
| Complete daily challenge (Easy) | +30–50 XP |
| Complete daily challenge (Hard) | +100 XP |

**Level formula**: `XP needed = 100 × 1.5^(level-1)`
- Level 1→2: 100 XP
- Level 2→3: 150 XP  
- Level 3→4: 225 XP
- Level 5→6: 506 XP

### Coins
- Earned alongside XP (1 coin per 2 XP)
- Spend in Reward Store on themes, cosmetics, boosts

### Streaks
- Daily streak resets if you miss a day
- Streak bonus: +5 XP for every 7-day streak maintained
- Longest streak tracked and displayed

### Badges (Achievements)
| Badge | Requirement |
|-------|-------------|
| 🌱 First Step | Complete 1 habit |
| 🔥 Week Warrior | 7-day streak |
| ⚡ Month Master | 30-day streak |
| ⭐ Rising Star | Reach Level 5 |
| 💎 Veteran | Reach Level 10 |
| 🏆 Half Century | 50 habits completed |
| 👑 Centurion | 100 habits completed |

---

## 🌐 API Reference

### Auth
```
POST /api/auth/register    { username, email, password }
POST /api/auth/login       { email, password }
GET  /api/auth/me          → current user
```

### Habits
```
GET    /api/habits                → all habits
POST   /api/habits                → create habit
PUT    /api/habits/:id            → update habit
DELETE /api/habits/:id            → delete habit
POST   /api/habits/:id/complete   → complete (award XP)
POST   /api/habits/:id/uncomplete → undo completion
GET    /api/habits/stats          → weekly stats
GET    /api/habits/ai-suggestions → habit suggestions
```

### Leaderboard
```
GET /api/leaderboard/global    → ranked by total XP
GET /api/leaderboard/weekly    → ranked by streak
```

### Challenges
```
GET  /api/challenges/daily      → today's challenges
POST /api/challenges/:id/claim  → claim challenge reward
```

### Rewards
```
GET  /api/rewards/store        → store items with ownership
POST /api/rewards/purchase     → buy item { itemId }
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 |
| Animations | Framer Motion |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Toast Notifications | React Hot Toast |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Validation | Joi |
| Security | Helmet, CORS, Rate Limiting |
| Fonts | Orbitron (titles), Rajdhani (UI), Inter (body) |
| Sound | Web Audio API (no external files) |

---

## 🔧 Customization

### Add New Habit Categories
In `backend/models/Habit.js`, add to the `category` enum.
In `frontend/src/components/habits/HabitsPage.js`, add to `CATEGORIES` and `CATEGORY_COLORS`.

### Add New Badges
In `backend/models/User.js`, add to `badgeCriteria` in `checkBadges()`.
In `frontend/src/components/dashboard/ProfilePage.js`, add to `ALL_BADGES`.

### Add New Store Items
In `backend/routes/rewards.js`, add to `STORE_ITEMS` array.

### Change XP Formula
In `backend/models/User.js`, modify `xpForNextLevel()` method.

---

## 💡 Bonus Features Included
- ✅ Web Audio API sound effects (XP gain, level up, badge unlock)
- ✅ Particle burst animations on habit completion
- ✅ Confetti on level up
- ✅ Floating XP text animation
- ✅ PWA meta tags (add to home screen)
- ✅ Mobile-first responsive design
- ✅ Rate limiting + security headers
- ✅ AI habit suggestions (rule-based)
- ✅ Dark mode (always on by design)

---

## 📱 Production Deployment

### Backend (Railway / Render / Heroku)
```bash
# Set environment variables in dashboard:
MONGODB_URI=your_atlas_uri
JWT_SECRET=your_secure_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel / Netlify)
```bash
# In frontend directory:
npm run build

# Set environment variable:
REACT_APP_API_URL=https://your-backend.railway.app/api
```

---

*Built with ❤️ and neon glow. May your streaks never break.*
