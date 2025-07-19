# 🚀 Render Deployment Quick Reference

## 📦 Backend Service Configuration

**Service Type:** Web Service  
**Name:** `afya-kuu-api`  
**Environment:** Python 3  
**Build Command:** `pip install -r requirements.txt`  
**Start Command:** `python flask_rf_api.py`  

**Environment Variables:**
```
FLASK_ENV=production
```

---

## 🎨 Frontend Service Configuration

**Service Type:** Web Service  
**Name:** `afya-kuu-frontend`  
**Environment:** Node  
**Root Directory:** `Frontend/Code-Her-Care/afya-kuu`  
**Build Command:** `npm ci && npm run build`  
**Start Command:** `npm start`  

**Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://afya-kuu-api.onrender.com
```

---

## 🔍 Health Check URLs

- **Backend Health:** `https://afya-kuu-api.onrender.com/health`
- **Frontend:** `https://afya-kuu-frontend.onrender.com`

---

## ⚡ Quick Deploy Commands

```bash
# 1. Prepare and push to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# 2. Go to render.com and create services with above configs
# 3. Services will auto-deploy from GitHub
```

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Backend won't start | Check if all `.pkl` model files are committed |
| Frontend can't connect | Verify `NEXT_PUBLIC_API_URL` environment variable |
| Build fails | Check build logs and ensure dependencies are correct |
| Service sleeps (free tier) | Upgrade to paid plan or expect cold starts |

---

## 📊 Expected URLs After Deployment

- **Main App:** `https://afya-kuu-frontend.onrender.com`
- **API Docs:** `https://afya-kuu-api.onrender.com`
- **Health Check:** `https://afya-kuu-api.onrender.com/health`

---

## 🎯 Testing Checklist

- [ ] Backend health endpoint returns 200
- [ ] Frontend loads homepage
- [ ] Doctor registration works
- [ ] Risk assessment form submits
- [ ] Voice input functions
- [ ] Dark/light mode toggles
- [ ] Mobile responsive design works

---

**🎉 Your Afya Kuu app is now live and helping healthcare practitioners worldwide!**
