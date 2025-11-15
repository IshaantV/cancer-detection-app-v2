# 🚀 Quick Start Guide

## The Problem
You're seeing: "Cannot connect to server. Please make sure the backend server is running on port 5000."

## The Solution - Start the Backend Server

### Method 1: Double-Click (Easiest!)
1. Go to the root folder: `C:\cancer-detection-app`
2. Double-click `START_SERVER.bat`
3. A new window will open showing: `Server running on port 5000`
4. **Keep that window open!** Don't close it.
5. Refresh your browser - everything should work now!

### Method 2: Command Line
1. Open PowerShell or Command Prompt
2. Navigate to the project:
   ```bash
   cd C:\cancer-detection-app\server
   ```
3. Start the server:
   ```bash
   node index.js
   ```
4. You should see: `Server running on port 5000`
5. **Keep this window open!**
6. Refresh your browser

### Method 3: Start Both Servers
1. Double-click `START_BOTH.bat` in the root folder
2. This starts both backend (port 5000) and frontend (port 3000)
3. Two windows will open - keep both open!

## Verify It's Working

After starting the server:
1. Open your browser to `http://localhost:3000`
2. Try adding a medication - should work now!
3. Try viewing timeline - images should load!
4. Check browser console (F12) - no more network errors

## Important Notes

- ✅ **The server must stay running** - Don't close the terminal window
- ✅ **Port 5000 must be free** - If something else is using it, close that first
- ✅ **Both servers needed**:
  - Backend (port 5000) - Handles API requests
  - Frontend (port 3000) - The React app (usually auto-starts)

## Troubleshooting

### "Port 5000 already in use"
- Something else is using port 5000
- Find it: `netstat -ano | findstr :5000`
- Kill it or change port in `server/index.js` (line 12)

### "Cannot find module 'express'"
- Install dependencies: `cd server && npm install`

### Still not working?
1. Check the server window for error messages
2. Make sure you're in the `server` folder when running `node index.js`
3. Check browser console (F12) for detailed errors

## What Each Server Does

- **Backend (port 5000)**: 
  - Stores your data (images, medications, gamification)
  - Handles API requests
  - Processes images
  - **MUST BE RUNNING** for the app to work

- **Frontend (port 3000)**:
  - The React app you see
  - Usually auto-starts with `npm start`
  - Connects to backend on port 5000

## Success Indicators

When everything is working:
- ✅ No network errors in browser console
- ✅ Medications can be added
- ✅ Images load in timeline
- ✅ Gamification features work
- ✅ API calls succeed

