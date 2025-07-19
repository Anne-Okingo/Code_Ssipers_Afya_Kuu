# 🚀 Afya Kuu Deployment Guide for Render

This guide will help you deploy the Afya Kuu cervical cancer risk assessment platform on Render.

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Your project code pushed to GitHub

## 🔧 Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## 🌐 Step 2: Deploy on Render

### 🔧 Backend API Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the backend service:

**Service Details:**
- **Name:** `afya-kuu-api`
- **Environment:** `Python 3`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** Leave empty (uses project root)

**Build & Deploy:**
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python flask_rf_api.py`

**Environment Variables:**
- `FLASK_ENV` = `production`
- `PORT` = `5001` (Render will override this)

### 🎨 Frontend Service

1. Click "New +" → "Web Service" again
2. Connect the same GitHub repository
3. Configure the frontend service:

**Service Details:**
- **Name:** `afya-kuu-frontend`
- **Environment:** `Node`
- **Region:** Same as backend
- **Branch:** `main`
- **Root Directory:** `Frontend/Code-Her-Care/afya-kuu`

**Build & Deploy:**
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`

**Environment Variables:**
- `NODE_ENV` = `production`
- `NEXT_PUBLIC_API_URL` = `https://afya-kuu-api.onrender.com`

## ⚙️ Step 3: Configure Environment Variables

### Backend Environment Variables:
```
FLASK_ENV=production
```

### Frontend Environment Variables:
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://afya-kuu-api.onrender.com
```

**Note:** Replace `afya-kuu-api` with your actual backend service name if different.

## 🔍 Step 4: Verify Deployment

1. **Check Backend Health:**
   - Visit: `https://your-backend-service.onrender.com/health`
   - Should return: `{"status": "healthy", "message": "API is running"}`

2. **Check Frontend:**
   - Visit: `https://your-frontend-service.onrender.com`
   - Should load the Afya Kuu homepage

3. **Test Full Integration:**
   - Navigate to the assessment page
   - Try creating a doctor account
   - Test the risk assessment form

## 🚨 Troubleshooting

### Common Issues:

1. **Backend fails to start:**
   - Check build logs for missing dependencies
   - Ensure all `.pkl` model files are in the repository
   - Verify Python version compatibility

2. **Frontend can't connect to backend:**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Ensure backend service is running
   - Check CORS configuration

3. **Model files missing:**
   - Run `python train_random_forest_model.py` locally
   - Commit and push the generated `.pkl` files

### Render-Specific Tips:

- **Free tier limitations:** Services sleep after 15 minutes of inactivity
- **Build time:** First deployment may take 5-10 minutes
- **Logs:** Check service logs in Render dashboard for debugging

## 📊 Performance Optimization

### Backend Optimizations:
- Use `gunicorn` for production WSGI server
- Enable model caching
- Optimize model loading time

### Frontend Optimizations:
- Enable Next.js static optimization
- Use CDN for static assets
- Implement proper caching headers

## 🔒 Security Considerations

1. **Environment Variables:**
   - Never commit sensitive data to repository
   - Use Render's environment variable system

2. **API Security:**
   - Implement rate limiting
   - Add request validation
   - Use HTTPS only (Render provides this automatically)

3. **Data Protection:**
   - Ensure patient data is not logged
   - Implement proper error handling

## 📈 Monitoring & Maintenance

1. **Health Checks:**
   - Backend: `/health` endpoint
   - Frontend: Root path `/`

2. **Logs:**
   - Monitor Render service logs
   - Set up alerts for errors

3. **Updates:**
   - Push to GitHub to trigger automatic redeployment
   - Test in staging environment first

## 🎉 Success!

Once deployed, your Afya Kuu application will be available at:
- **Frontend:** `https://your-frontend-service.onrender.com`
- **API:** `https://your-backend-service.onrender.com`

## 📞 Support

If you encounter issues:
1. Check Render documentation
2. Review service logs
3. Verify environment variables
4. Test locally first

Your Afya Kuu cervical cancer risk assessment platform is now live and helping healthcare practitioners worldwide! 🌍✨
