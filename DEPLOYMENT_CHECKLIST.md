# 🚀 Deployment Checklist for JobMate AI Chatbot

## ✅ Pre-Deployment Checklist

### 1. Files to Keep (DO NOT add to .gitignore)
- [x] All source code files
- [x] `package.json` and `package-lock.json`
- [x] `requirements.txt`
- [x] `.env.example` files
- [x] Documentation (*.md files)
- [x] Configuration files

### 2. Files Already in .gitignore (Good!)
- [x] `.env` (secrets)
- [x] `node_modules/`
- [x] `venv/`
- [x] `__pycache__/`
- [x] `logs/`
- [x] `cache/`
- [x] `.DS_Store`

### 3. Environment Variables to Set

#### Backend (Render/Railway)
```env
PORT=5000
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<generate-strong-secret>
CLOUDINARY_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
ML_SERVICE_URL=<your-ml-service-url>
SHARED_SECRET=<generate-strong-shared-secret>
NODE_ENV=production
```

#### ML Service (Railway/Render)
```env
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production
SECRET_KEY=<generate-strong-secret>
SHARED_SECRET=<same-as-backend>
NODE_BACKEND_URL=<your-backend-url>
MONGODB_URI=<your-mongodb-atlas-uri>
SPACY_MODEL=en_core_web_sm
LOG_LEVEL=INFO
ALLOWED_ORIGINS=<your-frontend-url>
```

#### Frontend (Vercel)
```env
VITE_BACKEND_URL=<your-backend-url>
```

## 📦 Deployment Steps

### Step 1: Push to GitHub

```bash
# Make sure you're in the project root
cd "d:/major prj/A Job-Portal"

# Check git status
git status

# Add all files
git add .

# Commit
git commit -m "Add intelligent chatbot with ML features"

# Push to GitHub
git push origin main
```

### Step 2: Deploy Backend (Render/Railway)

**Option A: Railway**
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Select `server` folder as root directory
5. Add environment variables (see above)
6. Deploy
7. Copy the deployment URL (e.g., `https://your-app.railway.app`)

**Option B: Render**
1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables
8. Deploy

### Step 3: Deploy ML Service (Railway/Render)

**Railway:**
1. Create new service
2. Root Directory: `ml-service`
3. Build Command: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy
7. Copy the deployment URL

**Render:**
1. New Web Service
2. Root Directory: `ml-service`
3. Runtime: Python 3.11
4. Build Command: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
5. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables
7. Deploy

### Step 4: Update Backend Environment

After ML service is deployed, update backend's `ML_SERVICE_URL`:
```env
ML_SERVICE_URL=https://your-ml-service.railway.app
```

### Step 5: Deploy Frontend (Vercel)

```bash
cd client

# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy
vercel --prod

# Or use Vercel dashboard:
# 1. Go to vercel.com
# 2. Import project from GitHub
# 3. Root Directory: client
# 4. Framework: Vite
# 5. Add environment variable: VITE_BACKEND_URL
# 6. Deploy
```

### Step 6: Update CORS Origins

Update ML service environment variable:
```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-backend.railway.app
```

## 🔍 Post-Deployment Verification

### 1. Test Backend
```bash
curl https://your-backend.railway.app/
# Should return: "API Working Properly"
```

### 2. Test ML Service
```bash
curl https://your-ml-service.railway.app/api/ml/health
# Should return: {"status":"healthy",...}
```

### 3. Test Frontend
1. Open: https://your-frontend.vercel.app
2. Register/Login
3. Look for chatbot icon (bottom-right)
4. Click and test chat

### 4. Test Chat Routes
```bash
# Test conversation endpoint
curl -X POST https://your-backend.railway.app/api/chat/conversation \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"general"}'
```

## ⚠️ Common Deployment Issues

### Issue 1: 404 on /api/chat routes
**Cause:** Routes not deployed or backend not restarted
**Solution:**
1. Make sure `chatRoutes.js` is in your repository
2. Verify `app.js` imports and uses chat routes
3. Redeploy backend
4. Check deployment logs

### Issue 2: ML Service build fails
**Cause:** Python version or missing dependencies
**Solution:**
1. Use Python 3.11 (not 3.13)
2. Check `requirements.txt` is in repository
3. Verify build command includes spaCy download
4. Check deployment logs

### Issue 3: CORS errors
**Cause:** Frontend URL not in ALLOWED_ORIGINS
**Solution:**
1. Update ML service `ALLOWED_ORIGINS` environment variable
2. Include both frontend and backend URLs
3. Restart ML service

### Issue 4: Chat widget not visible
**Cause:** Token issue or component not loaded
**Solution:**
1. Clear browser cache
2. Check browser console for errors
3. Verify user is logged in
4. Check `VITE_BACKEND_URL` is correct

## 📋 Environment Variables Summary

### Backend (8 variables)
- PORT
- MONGODB_URI
- JWT_SECRET
- CLOUDINARY_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- ML_SERVICE_URL
- SHARED_SECRET

### ML Service (9 variables)
- HOST
- PORT
- ENVIRONMENT
- SECRET_KEY
- SHARED_SECRET
- NODE_BACKEND_URL
- MONGODB_URI
- SPACY_MODEL
- ALLOWED_ORIGINS

### Frontend (1 variable)
- VITE_BACKEND_URL

## 🎯 Deployment Order

1. ✅ MongoDB Atlas (database)
2. ✅ Backend (Node.js)
3. ✅ ML Service (Python)
4. ✅ Update Backend with ML_SERVICE_URL
5. ✅ Frontend (React)
6. ✅ Update ML Service with Frontend URL in CORS

## 📝 Post-Deployment Tasks

- [ ] Test all chat features
- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry)
- [ ] Configure auto-scaling
- [ ] Set up monitoring/alerts
- [ ] Document deployment URLs
- [ ] Update README with live URLs

## 🔐 Security Checklist

- [ ] All `.env` files in .gitignore
- [ ] Strong secrets generated
- [ ] HTTPS enabled on all services
- [ ] CORS properly configured
- [ ] JWT secrets are strong
- [ ] MongoDB has authentication
- [ ] No hardcoded secrets in code

## 📊 Monitoring

### Check Logs
- **Backend:** Railway/Render dashboard → Logs
- **ML Service:** Railway/Render dashboard → Logs
- **Frontend:** Vercel dashboard → Logs

### Monitor Performance
- Response times
- Error rates
- Memory usage
- CPU usage

## 🎉 Success Indicators

✅ Backend returns "API Working Properly"
✅ ML Service health check passes
✅ Frontend loads without errors
✅ User can login
✅ Chatbot icon appears
✅ Chat messages work
✅ No CORS errors in console
✅ All API calls succeed

---

**Ready to deploy? Follow the steps above in order!** 🚀
