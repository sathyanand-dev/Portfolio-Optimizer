# Deployment Guide

## Deploying to Render (Backend) and Vercel (Frontend)

### Prerequisites
- GitHub account
- Render account (free tier)
- Vercel account (free tier)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy Backend to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository: `portfolio-optimizer`

3. **Configure the service:**
   - **Name:** `portfolio-optimizer-api`
   - **Environment:** `Python 3`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`

4. **Add Environment Variables:**
   Go to Environment tab and add:
   ```
   DATABASE_URL=sqlite:///./portfolio_optimizer.db
   SECRET_KEY=your-secret-key-here-make-it-long-and-random
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   RISK_FREE_RATE=0.07
   DEFAULT_MARKET_SUFFIX=.NS
   CACHE_DURATION_MINUTES=15
   ```

5. **Deploy:** Click "Create Web Service"

6. **Note your backend URL:** It will be something like `https://portfolio-optimizer-api.onrender.com`

### Step 3: Deploy Frontend to Vercel

1. **Update environment file:**
   Edit `frontend/.env.production` and replace with your actual Render URL:
   ```
   REACT_APP_API_URL=https://your-actual-render-url.onrender.com
   REACT_APP_ENV=production
   ```

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Import Project:**
   - Click "New Project"
   - Import from GitHub
   - Select your repository
   - Set **Root Directory** to `frontend`

4. **Configure Build Settings:**
   - **Framework Preset:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

5. **Add Environment Variables:**
   In Project Settings → Environment Variables:
   ```
   REACT_APP_API_URL=https://your-render-app-url.onrender.com
   REACT_APP_ENV=production
   ```

6. **Deploy:** Click "Deploy"

### Step 4: Update CORS Settings

After getting your Vercel URL, update the backend CORS settings in `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://your-vercel-app.vercel.app",  # Your actual Vercel URL
        "https://*.vercel.app",   # All Vercel deployments
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)
```

### Step 5: Testing

1. **Backend Health Check:**
   Visit: `https://your-render-app.onrender.com/health`

2. **Frontend:**
   Visit your Vercel URL and test the login/optimization features

### Troubleshooting

#### Common Issues:

1. **Render Build Fails:**
   - Check `requirements.txt` includes all dependencies
   - Ensure Python version compatibility

2. **Frontend API Calls Fail:**
   - Verify REACT_APP_API_URL is correct
   - Check CORS settings in backend
   - Check browser console for errors

3. **Database Issues:**
   - Render free tier has limited persistence
   - Consider upgrading to paid tier for production

#### Render Free Tier Limitations:
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month (sufficient for demo/portfolio)

#### Vercel Free Tier Limitations:
- 100GB bandwidth/month
- Unlimited deployments
- Perfect for frontend hosting

### Production Considerations

1. **Environment Variables:**
   - Use strong, unique SECRET_KEY
   - Consider using PostgreSQL on Render paid tier
   - Set up proper logging

2. **Security:**
   - Restrict CORS to specific domains
   - Implement rate limiting
   - Use HTTPS only

3. **Monitoring:**
   - Set up health checks
   - Monitor API response times
   - Track error rates

### Cost Optimization

**Free Tier Usage:**
- Render: Free for 750 hours/month
- Vercel: Free with reasonable limits
- **Total Cost: $0/month** for demo/portfolio use

**If scaling needed:**
- Render Pro: $7/month (persistent, faster)
- Vercel Pro: $20/month (more bandwidth, analytics)

### Automatic Deployments

Both platforms support automatic deployments:
- **Push to `main` branch** → Automatic deployment
- **Pull Request previews** available on both platforms
- **Rollback** capabilities if issues arise

Your portfolio optimizer will be live at:
- **Backend:** `https://your-app.onrender.com`
- **Frontend:** `https://your-app.vercel.app`

Perfect for showcasing to potential employers! 🚀
