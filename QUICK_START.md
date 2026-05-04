# 🚀 Quick Start Guide - Running LevelUp

## ⚡ The Fastest Way to Get Started

### Step 1: Open Two Terminal Windows

**Terminal 1 - Backend Server:**
```bash
cd backend
npm install  # Only needed first time
npm run dev
```

You should see:
```
🔌 Attempting connection to: ac-heapu1t-shard-00-00.jkr9py2.mongodb.net:27017...
✅ MongoDB connected: Atlas Cluster
🚀 Server running on port 5000
📨 GET /api/health
```

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm install  # Only needed first time
npm start
```

You should see:
```
Compiled successfully!
You can now view levelup-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### Step 2: Open Browser

Navigate to: `http://localhost:3000`

## ✅ Verify Everything is Working

### Backend Health Check
Open a new terminal and run:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-05-04T10:30:00.000Z",
  "mockMode": false
}
```

If you get an error, the backend server isn't running. Go back to Terminal 1 and check the error messages.

### Test Login/Signup

1. On the login page, fill in the form
2. Open Developer Tools (F12)
3. Go to "Network" tab
4. Click "Sign In" or "Sign Up"
5. Check the network request - it should show:
   - URL: `http://localhost:5000/api/auth/login` (or `/register`)
   - Status: 200 (success) or 400-401 (validation error)

## 🆘 Common Issues & Quick Fixes

### Issue: "Network error: Make sure the backend server is running"

**Check 1:** Is backend running?
```bash
# Terminal 1 should show: 🚀 Server running on port 5000
# If not, go to backend folder and run: npm run dev
```

**Check 2:** Is port 5000 available?
```bash
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Mac/Linux
lsof -i :5000

# If port is taken, either:
# 1. Stop the process using that port
# 2. Change PORT in backend/.env to a different port
```

**Check 3:** Check frontend .env file
```bash
# frontend/.env should contain:
REACT_APP_API_URL=http://localhost:5000
```

### Issue: Backend shows "Cannot connect to MongoDB"

**Solution:** Check MongoDB connection string in `backend/.env`
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

Make sure:
1. Username and password are correct (URL encode special characters like `@` → `%40`)
2. IP address is whitelisted in MongoDB Atlas Network Access
3. Database name exists in your cluster

If connection keeps failing, the app will automatically start in **MOCK MODE** so you can still test the UI.

### Issue: "Invalid email or password" when trying to login

**Possible causes:**
1. You haven't signed up yet - use "Sign Up" instead
2. Email/password typo - check spelling
3. Database issue - check backend console for errors

**Test:** Try signing up with a new account first, then log in.

## 📊 Testing the Full Flow

### Test 1: Sign Up
1. Click "Sign Up" tab
2. Enter:
   - Username: `testuser123`
   - Email: `test@example.com`
   - Password: `password123`
   - Select an avatar color
3. Click "🚀 Start Your Quest"
4. Should see success message and redirect to dashboard

### Test 2: Log In
1. Click "Sign In" tab
2. Enter:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "⚔️ Enter the Arena"
4. Should see success message and redirect to dashboard

### Test 3: Responsive Design
1. In browser, press F12 to open Developer Tools
2. Click device toolbar icon (top-left of DevTools)
3. Select different devices:
   - iPhone 12
   - iPad
   - Desktop
4. Form should scale properly on all screen sizes

## 🔧 Environment Variables

### backend/.env (Required for production)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/levelup?retryWrites=true&w=majority
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### frontend/.env (Required)
```
REACT_APP_API_URL=http://localhost:5000
```

## 📝 Logs to Watch For

### Backend Logs (What to look for)

✅ **Good:**
```
✅ MongoDB connected: Atlas Cluster
🚀 Server running on port 5000
📨 POST /api/auth/login
   Status: 200
```

❌ **Bad:**
```
❌ ERROR: No MongoDB URI found in environment variables
❌ Connection failed for ...
```

### Frontend Logs (Open with F12)

✅ **Good:**
```
🔗 API Base URL: http://localhost:5000/api
✅ Server health: { status: 'ok', mockMode: false }
```

❌ **Bad:**
```
❌ Network Error: Network error
❌ Request timeout
```

## 🎯 Next Steps After Getting Started

1. **Test Habits Feature** - Create a new habit
2. **Test Leaderboard** - Check global rankings
3. **Test Profile** - Update profile information
4. **Test Responsive Design** - Use DevTools to test mobile view
5. **Test API Endpoints** - Use Postman or curl to test APIs directly

## 🐛 Still Having Issues?

**Step 1:** Check browser console (F12)
- Go to "Console" tab
- Look for red error messages
- Screenshot and note the error

**Step 2:** Check backend console (Terminal 1)
- Look for error messages
- Note any failed connection attempts
- Check for database connection errors

**Step 3:** Test health endpoint
```bash
curl http://localhost:5000/api/health
```

**Step 4:** Restart servers
- Stop backend (Ctrl+C in Terminal 1)
- Stop frontend (Ctrl+C in Terminal 2)
- Run both again from Step 1

## 🎓 Pro Tips

1. **Faster Development:** Keep both servers running and just refresh browser
2. **Debug Network:** Use Network tab in DevTools to see all API calls
3. **Debug State:** Use React DevTools extension to inspect component state
4. **Debug Backend:** Add `console.log()` statements in route handlers
5. **Mock Mode:** If MongoDB isn't available, the app runs in mock mode (data resets on server restart)

## 📞 Support

If you're still having issues:
1. Check NETWORK_ERROR_FIXES.md for detailed troubleshooting
2. Check FIXES_SUMMARY.md for what was recently fixed
3. Look at error messages in both console and backend logs
4. Ensure all dependencies are installed (`npm install`)
5. Try clearing node_modules and reinstalling: `rm -rf node_modules && npm install`
