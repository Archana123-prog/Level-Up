# Network Error Fixes - Login/Signup Issues

## ✅ Issues Fixed

### 1. **CORS Configuration**
   - ✅ Fixed CORS to properly allow localhost development
   - Added support for `http://localhost:3000` and `http://localhost:5000`
   - Improved CORS error handling with proper headers
   - Added `Access-Control-Allow-Methods` for all HTTP verbs
   - Added `Access-Control-Allow-Headers` for auth and content-type

### 2. **API Error Handling**
   - ✅ Added comprehensive error interceptor in axios
   - Added timeout handling (10 seconds)
   - Added network error detection with specific messages
   - Added proper error parsing for different HTTP status codes:
     - 400: Bad Request (validation errors)
     - 401: Unauthorized (invalid credentials, token expired)
     - 409: Conflict (duplicate email/username)
     - 500: Server Error
   - Added fallback error messages

### 3. **Frontend API Configuration**
   - ✅ Set default API URL to `http://localhost:5000`
   - Added console logging for debugging
   - Added request timeout (10 seconds)
   - Added Accept header for JSON responses
   - Improved error message propagation

### 4. **AuthContext Improvements**
   - ✅ Added try-catch blocks for better error handling
   - Added console logging for debugging auth errors
   - Improved error propagation to UI layer

### 5. **AuthPage Error Handling**
   - ✅ Enhanced error messages with emojis for clarity
   - Added specific messages for:
     - Network connectivity issues
     - Request timeouts
     - Duplicate email/username
     - General server errors
   - Added debugging output to console

## 🚀 How to Run the Application

### Prerequisites
- Node.js v16+ installed
- MongoDB Atlas account or local MongoDB running
- Git installed

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create/check .env file with:
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/levelup?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Start backend server
npm run dev
# or
npm start

# Server should output: 🚀 Server running on port 5000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Make sure .env has:
REACT_APP_API_URL=http://localhost:5000

# Start frontend dev server
npm start

# App opens at http://localhost:3000
```

## 🔍 Troubleshooting Network Errors

### Error: "Network error: Make sure the backend server is running"
**Cause**: Backend server is not running or not accessible
**Fix**:
1. Make sure backend server is running: `npm run dev` in backend folder
2. Check if server is on port 5000: `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)
3. Verify backend URL in frontend `.env`: `REACT_APP_API_URL=http://localhost:5000`
4. Check firewall isn't blocking port 5000

### Error: "Request timeout" or "Cannot reach server"
**Cause**: Network connectivity issue or server too slow to respond
**Fix**:
1. Check internet connection
2. Verify backend is running: `curl http://localhost:5000/api/health`
3. Check MongoDB connection (should see "✅ MongoDB connected" in backend console)
4. If using MongoDB Atlas, ensure:
   - Your IP is whitelisted in Network Access
   - Connection string is correct
   - Firewall allows outbound connections

### Error: "Invalid email or password"
**Cause**: Wrong credentials or account doesn't exist
**Fix**:
1. Double-check email and password spelling
2. Try registering a new account
3. Check browser console (F12) for more details

### Error: "This email or username is already registered"
**Cause**: Account already exists
**Fix**:
1. Try logging in instead
2. Use a different email
3. Reset password if you forgot it (implement password reset flow)

### Backend Console Shows: "Connection failed for ..."
**Cause**: MongoDB connection issues
**Fix**:
1. Check MongoDB URI in `.env`:
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - Replace username, password, cluster, database
2. Ensure username and password are correct (URL encode special characters)
3. Whitelist your IP in MongoDB Atlas:
   - Go to Network Access
   - Click "Add IP Address"
   - Select "Allow Access From Anywhere" for testing
   - Use specific IP for production

### Browser Console Shows: "Mixed Content Error"
**Cause**: Trying to access HTTP from HTTPS (or vice versa)
**Fix**:
1. If production, use HTTPS for both frontend and backend
2. If development, use HTTP for both
3. Update `.env` accordingly

## 📋 Health Check

Test if backend is running and accessible:
```bash
# In terminal/PowerShell
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-05-04T10:30:00.000Z","mockMode":false}
```

## 🔐 CORS Requirements

The backend now properly handles CORS with:
- Allowed origins: `http://localhost:3000`, `http://localhost:5000`, and `FRONTEND_URL` env variable
- Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Allowed headers: Content-Type, Authorization
- Credentials: enabled

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Sign up
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user (requires auth)

### Health Check
- `GET /api/health` - Check if server is running

## 🐛 Debug Mode

To see detailed network requests:
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try login/signup
4. Click on requests to see:
   - Request headers and body
   - Response status and body
   - Timing information

## 📦 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## ✨ Testing Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] MongoDB connection successful (check backend console)
- [ ] CORS is configured properly
- [ ] Email validation works
- [ ] Password validation works
- [ ] Username validation works
- [ ] Can sign up with valid credentials
- [ ] Can log in with correct credentials
- [ ] Get proper error message for wrong credentials
- [ ] Get proper error message for duplicate email
- [ ] Form is responsive on mobile devices
