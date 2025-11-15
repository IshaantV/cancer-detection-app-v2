# Troubleshooting Guide

## Network Error (localhost:3000 or localhost:5000)

### Issue: "Network error" when taking pictures or viewing timeline

**Solution:**

1. **Make sure the backend server is running:**
   ```bash
   cd server
   npm install  # If you haven't installed dependencies
   node index.js
   ```
   
   You should see: `Server running on port 5000`

2. **Make sure the frontend is running:**
   ```bash
   cd client
   npm install  # If you haven't installed dependencies
   npm start
   ```
   
   The frontend should run on `http://localhost:3000`

3. **Check if ports are available:**
   - Backend: Port 5000
   - Frontend: Port 3000
   
   If ports are in use, you can change them:
   - Backend: Set `PORT=5001` in `server/.env` or `server/index.js`
   - Frontend: Set `PORT=3001` in `client/.env` or use `PORT=3001 npm start`

4. **Check CORS settings:**
   The server should have CORS enabled (it does by default). If you're still getting CORS errors, check `server/index.js` line 15-20.

## Gamification Features Not Showing

### Issue: Can't see gamification features on Dashboard

**Solution:**

1. **The gamification features should now show even if the API fails** - they'll show default values.

2. **If you still don't see them:**
   - Open browser console (F12)
   - Check for any JavaScript errors
   - Look for API errors in the Network tab

3. **Make sure all files are created:**
   - `client/src/components/GamificationBar.js`
   - `client/src/components/LevelDisplay.js`
   - `client/src/components/StreakDisplay.js`
   - `client/src/components/Achievements.js`
   - `client/src/utils/gamification.js`
   - `client/src/data/achievements.js`
   - `client/src/styles/pixelated.css`

4. **Clear browser cache and restart:**
   ```bash
   # Stop the frontend (Ctrl+C)
   # Then restart
   cd client
   npm start
   ```

## Quick Fix Commands

```bash
# Install all dependencies
cd server && npm install
cd ../client && npm install

# Start backend (in one terminal)
cd server
node index.js

# Start frontend (in another terminal)
cd client
npm start
```

## Common Issues

1. **"Cannot find module 'express'"**
   - Run `npm install` in the `server` directory

2. **"Cannot find module 'react'"**
   - Run `npm install` in the `client` directory

3. **Port already in use**
   - Kill the process using the port or change the port number

4. **CORS errors**
   - Make sure backend is running on port 5000
   - Check that CORS is enabled in `server/index.js`

## Testing the API

You can test if the backend is working by visiting:
- `http://localhost:5000/api/gamification/YOUR_USER_ID` (replace YOUR_USER_ID with an actual user ID)

Or use the API Test component in the app (if available).

