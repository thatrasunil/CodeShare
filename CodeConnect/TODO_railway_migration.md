# Railway Migration TODO

## Prerequisites
- [ ] Install Railway CLI: Since npm install failed, download from https://github.com/railwayapp/cli/releases/latest
  - Download `railway_windows_amd64.tar.gz` for Windows
  - Extract and add to PATH, or run the exe directly
- [ ] Login to Railway: `railway login` or `./railway.exe login`
- [ ] Ensure backend code is committed to Git repo

## Step 1: Create Railway Project
- [x] Created project "codeconnect-backend" with ID ae528b1f-96e3-495c-b818-79f5ccfa4b46
- [x] Railway is deploying the backend automatically

## Step 2: Configure for Backend Deployment
- [x] Created `backend/railway.toml` to configure build and deploy from the backend directory
- [ ] If issues, set the root directory to `backend/` in Railway dashboard or adjust config

## Step 3: Set Environment Variables
- [ ] Set `MONGODB_URI` to your MongoDB connection string (e.g., mongodb+srv://username:password@cluster.mongodb.net/codeconnect)
- [ ] Set `PORT` to `5000`
- [ ] Set any other required env vars from `.env.example` (like GOOGLE_AI_API_KEY if used)

## Step 4: Deploy
- [ ] Run `railway up` to deploy
- [ ] Monitor deployment logs: `railway logs`

## Step 5: Update Frontend
- [ ] Get the new Railway backend URL from Railway dashboard
- [ ] Update `REACT_APP_BACKEND_URL` in frontend environment variables
- [ ] Redeploy frontend on Vercel

## Step 6: Test
- [ ] Test the full app with new Railway backend
- [ ] Verify Socket.IO connections work
- [ ] Check file uploads and database connections

## Notes
- Railway auto-detects Node.js apps
- No need for Dockerfile unless custom setup
- Railway provides free tier with 512MB RAM, 1GB disk
- CORS in backend already allows the Vercel frontend URL
