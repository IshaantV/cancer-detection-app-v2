# ⚠️ IMPORTANT: Server Must Be Running

## The Error You're Seeing

If you're getting:
- "NetworkError when attempting to fetch resource"
- "Failed to add medication. Please try again."
- Images not loading

**This means the backend server is NOT running!**

## How to Fix It

### Step 1: Start the Backend Server

Open a **new terminal/command prompt** and run:

```bash
cd server
node index.js
```

You should see:
```
Server running on port 5000
```

**Keep this terminal open!** The server needs to keep running.

### Step 2: Start the Frontend (if not already running)

In a **separate terminal**, run:

```bash
cd client
npm start
```

The frontend will open at `http://localhost:3000`

### Step 3: Verify It's Working

1. Check the browser console (F12) - you should see: `🔧 API Base URL: http://localhost:5000`
2. Try adding a medication - it should work now
3. Try viewing images - they should load now

## Quick Start Scripts

I've created batch files for Windows:

- **START_SERVER.bat** - Double-click to start backend
- **START_CLIENT.bat** - Double-click to start frontend

Or use the npm script:
```bash
npm run dev
```
This starts both server and client together (if you have `concurrently` installed).

## Troubleshooting

### Port 5000 Already in Use
If you get "port 5000 already in use":
1. Find what's using it: `netstat -ano | findstr :5000` (Windows)
2. Kill the process or change the port in `server/index.js`

### Still Getting Errors?
1. Check that both terminals are running
2. Check browser console (F12) for detailed errors
3. Make sure no firewall is blocking localhost:5000
4. Try restarting both server and client

## What Each Server Does

- **Backend (port 5000)**: Handles API requests, stores data, processes images
- **Frontend (port 3000)**: The React app you see in the browser

Both need to be running for the app to work!

