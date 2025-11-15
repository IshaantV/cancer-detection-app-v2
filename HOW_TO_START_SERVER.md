# ✅ How to Start the Server - Step by Step

## Current Situation
You're getting the error because **the backend server is not running on port 5000**.

## Solution: Start the Server

### Step 1: Open a New Terminal/Command Prompt
- Press `Windows Key + R`
- Type `cmd` or `powershell`
- Press Enter

### Step 2: Navigate to Server Folder
Type this command:
```bash
cd C:\cancer-detection-app\server
```

### Step 3: Start the Server
Type this command:
```bash
node index.js
```

### Step 4: Verify It Started
You should see:
```
Server running on port 5000
```

**IMPORTANT:** Keep this terminal window open! Don't close it.

### Step 5: Refresh Your Browser
- Go back to your browser
- Refresh the page (F5)
- Try adding a medication or viewing images
- It should work now! ✅

## Alternative: Use the Batch File

1. Open File Explorer
2. Navigate to: `C:\cancer-detection-app`
3. Double-click `START_SERVER.bat`
4. A black window will open showing the server running
5. **Keep that window open!**
6. Refresh your browser

## What You Should See

When the server is running correctly, the terminal will show:
```
Server running on port 5000
```

And it will stay there (not return to a prompt). That's normal - it means the server is running!

## Common Issues

### "Cannot find module 'express'"
**Fix:** Run this first:
```bash
cd C:\cancer-detection-app\server
npm install
```

### "Port 5000 already in use"
**Fix:** Something else is using the port. Close other Node.js windows or change the port.

### Server starts but still get errors
**Fix:** 
1. Check the server terminal for error messages
2. Make sure you're accessing `http://localhost:3000` (not 5000)
3. Check browser console (F12) for specific errors

## Quick Test

Once the server is running, test it:
1. Open browser to: `http://localhost:5000/api/gamification/YOUR_USER_ID`
2. Replace `YOUR_USER_ID` with your actual user ID (check browser console)
3. You should see JSON data, not an error

## Remember

- ✅ Server must stay running (keep terminal open)
- ✅ Frontend runs on port 3000 (usually auto-starts)
- ✅ Backend runs on port 5000 (you need to start this)
- ✅ Both must be running for the app to work

