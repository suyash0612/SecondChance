# Deployment Guide: GitHub Pages + Render

This app uses a hybrid deployment strategy:
- **Frontend**: GitHub Pages (static hosting)
- **Backend**: Render (Python/FastAPI)

## Architecture

```
GitHub Pages (Frontend)
        ↓ (API calls via CORS)
        ↓
Render Backend (FastAPI + Gemini)
```

---

## Frontend Deployment (GitHub Pages)

### Automatic Deployment
The GitHub Actions workflow (`.github/workflows/deploy-frontend.yml`) automatically:
1. Builds the Expo web app: `npm run build`
2. Deploys to GitHub Pages on every push to `master`

### Manual Deployment (Local)
```bash
npm run deploy
```

This runs:
1. `npm run build` → Creates optimized build in `dist/`
2. `gh-pages -d dist` → Pushes to `gh-pages` branch

### Access Frontend
```
https://suyash0612.github.io/SecondChance
```

---

## Backend Deployment (Render)

### Setup Instructions

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Create Web Service**:
   - Click **"New"** → **"Web Service"**
   - Connect GitHub repo: `SecondChance`
   - Render auto-detects `render.yaml`

3. **Service Settings**:
   - **Name**: `second-opinion-backend`
   - **Language**: Python
   - **Build**: `cd backend && pip install -r requirements.txt`
   - **Start**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables**:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `PORT`: 8000 (auto-set by Render)

5. **Deploy** → Service goes live at:
   ```
   https://second-opinion-backend.onrender.com
   ```

### Health Check
```bash
curl https://second-opinion-backend.onrender.com/health
# Response: {"status": "ok", "version": "1.1.0"}
```

---

## Connecting Frontend to Backend

### Step 1: Update Backend URL
Once your backend is deployed on Render, update the frontend configuration:

**Option A: Environment Variable**
```bash
export EXPO_PUBLIC_BACKEND_URL=https://second-opinion-backend.onrender.com
npm run build
npm run deploy
```

**Option B: Edit `.env.example`**
```
EXPO_PUBLIC_BACKEND_URL=https://second-opinion-backend.onrender.com
```

### Step 2: Rebuild & Deploy
```bash
npm install
npm run build
npm run deploy
```

---

## CORS Configuration

The backend already allows cross-origin requests from any origin:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows GitHub Pages requests
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)
```

If you want to restrict to only GitHub Pages:
```python
allow_origins=[
    "https://suyash0612.github.io",
    "http://localhost:5173",  # Local development
]
```

---

## Development Workflow

### Local Testing
```bash
# Terminal 1: Run frontend
npm run web

# Terminal 2: Run backend
cd backend && python -m uvicorn main:app --reload
```

### Staging (Before Deployment)
```bash
# Build frontend (creates dist/)
npm run build

# Test backend health
curl http://localhost:8000/health

# Test extract endpoint
curl -X POST http://localhost:8000/extract \
  -F "file=@sample.pdf"
```

### Deploy to Production
```bash
# Push to master (triggers both GitHub Pages + Render)
git push origin master

# Check GitHub Actions: https://github.com/suyash0612/SecondChance/actions
# Check Render: https://dashboard.render.com
```

---

## Troubleshooting

### Frontend won't load from GitHub Pages
- Check: https://github.com/suyash0612/SecondChance/actions
- Verify `homepage` in package.json matches your GitHub Pages URL
- Clear browser cache and rebuild

### Backend API calls failing
- Check backend is deployed: `https://second-opinion-backend.onrender.com/health`
- Verify `EXPO_PUBLIC_BACKEND_URL` env var is set correctly
- Check browser console for CORS errors
- Verify `GEMINI_API_KEY` is set in Render dashboard

### Build errors
- Backend: Check `backend/requirements.txt` dependencies
- Frontend: Run `npm install` and `npm run build` locally first
- Check GitHub Actions logs for build errors

---

## URLs Summary

| Service | URL |
|---------|-----|
| Frontend | https://suyash0612.github.io/SecondChance |
| Backend API | https://second-opinion-backend.onrender.com |
| Backend Docs | https://second-opinion-backend.onrender.com/docs |
| GitHub Actions | https://github.com/suyash0612/SecondChance/actions |
| Render Dashboard | https://dashboard.render.com |

---

## Next Steps

1. ✅ Update `EXPO_PUBLIC_BACKEND_URL` with your Render backend URL
2. ✅ Deploy backend on Render
3. ✅ Deploy frontend via `npm run deploy` or GitHub Actions
4. ✅ Test the full workflow
5. ✅ Monitor logs in Render dashboard
