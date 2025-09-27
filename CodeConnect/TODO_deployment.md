# Deployment TODO for CodeConnect

## Overview
Fix Vercel frontend deployment by deploying backend to Render.com, updating env vars, and testing.

## Steps

### 1. Prepare Backend Files
- [x] Read/Confirm CodeConnect/backend/package.json content.
- [x] Create/Update CodeConnect/backend/package.json with dependencies (express, socket.io, mongoose, cors, multer, dotenv).
- [x] Edit CodeConnect/backend/server.js: Update CORS origins to include Vercel URL, comment out local static serve (app.use(express.static('../frontend/build'))).
- [x] Create CodeConnect/backend/.env.example with MONGODB_URI placeholder.
- [x] Troubleshoot deployment: Added async MongoDB connection with error handling (server starts even if DB fails, logs error); added "engines": {"node": "18.x"} to package.json for Render compatibility.

### 2. Prepare Frontend
- [x] Edit CodeConnect/frontend/src/components/Editor.js: Ensure backendURL prioritizes REACT_APP_BACKEND_URL. (No changes needed; already configured correctly.)

### 3. Setup Database
- [ ] User: Create MongoDB Atlas account/cluster if not exists, get MONGODB_URI. Whitelist IP 0.0.0.0/0 in Network Access.

### 4. Deploy Backend
- [ ] User: Push changes to GitHub repo (git add . && git commit -m "Fix backend for deployment with error handling" && git push).
- [ ] User: In Render dashboard, redeploy the service (or clear build cache if available). Confirm MONGODB_URI env var is set correctly (no extra spaces, full Atlas URI). Check Logs tab for errors (e.g., connection timeout – verify Atlas whitelist).
- [ ] Note backend URL (e.g., https://codeconnect-backend.onrender.com). Test locally: cd CodeConnect/backend && npm install && npm start (set .env with MONGODB_URI).

### 5. Update Frontend Deployment
- [ ] User: In Vercel dashboard for the project, add Environment Variable: REACT_APP_BACKEND_URL = backend URL (e.g., https://codeconnect-backend.onrender.com).
- [ ] User: Redeploy the project (automatic on Git push, or manual).

### 6. Test
- [ ] Launch browser to https://codeconnect-zeta-pied.vercel.app/, create/join a room, verify Socket.io connects (console shows "Connected"), code editing syncs in real-time, chat messages send/receive, no 404 errors for API calls.
- [ ] If DB connected: Room data persists across refreshes. If not: In-memory only (data lost on restart/disconnect).
- [ ] Troubleshooting: If Render fails again, check logs for "MongoDB connection error" (fix URI/whitelist), or dependency issues (run npm install locally). For frontend, clear browser cache if "firebaseConfig" error persists (unrelated to code).

Progress: Backend now robust for deployment. Follow steps 3-6 to complete.
