# 🚀 Quick Start Guide - JobMate AI Chatbot

Get the intelligent chatbot system up and running in 15 minutes!

## ⚡ Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ (`node --version`)
- ✅ Python 3.9+ (`python --version`)
- ✅ MongoDB 7.0+ (`mongod --version`)
- ✅ Git (`git --version`)
- ✅ 4GB RAM available
- ✅ 2GB disk space

## 📦 Step 1: Clone & Navigate

```bash
git clone <your-repo-url>
cd A-Job-Portal
```

## 🗄️ Step 2: Start MongoDB

### Windows
```bash
# Start MongoDB service
net start MongoDB

# Or run manually
mongod --dbpath C:\data\db
```

### Linux/Mac
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or run manually
mongod --dbpath /data/db
```

Verify: `mongo --eval "db.adminCommand('ping')"`

## 🔧 Step 3: Setup Backend (Node.js)

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env (use your favorite editor)
nano .env
```

**Required .env variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobmate
JWT_SECRET=your-super-secret-jwt-key-change-this
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
ML_SERVICE_URL=http://localhost:8000
SHARED_SECRET=your-shared-secret-between-services-change-this
NODE_ENV=development
```

**Start backend:**
```bash
npm run dev
```

✅ Backend running at: http://localhost:5000

## 🤖 Step 4: Setup ML Service (Python)

Open a **new terminal**:

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Run automated setup
python setup.py
```

The setup script will:
- ✅ Check Python version
- ✅ Create directories
- ✅ Install dependencies
- ✅ Download spaCy model
- ✅ Create .env file

**Edit .env:**
```bash
nano .env
```

**Required .env variables:**
```env
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
SECRET_KEY=your-secret-key-change-this
SHARED_SECRET=your-shared-secret-between-services-change-this
NODE_BACKEND_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/jobmate
SPACY_MODEL=en_core_web_md
LOG_LEVEL=INFO
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000
```

**⚠️ IMPORTANT:** `SHARED_SECRET` must be the same in both backend and ML service!

**Start ML service:**
```bash
python main.py
```

✅ ML Service running at: http://localhost:8000

## 🎨 Step 5: Setup Frontend (React)

Open a **new terminal**:

```bash
cd client

# Install dependencies
npm install

# Create environment file
echo "VITE_BACKEND_URL=http://localhost:5000" > .env

# Start development server
npm run dev
```

✅ Frontend running at: http://localhost:5173

## ✅ Step 6: Verify Installation

### 1. Test Backend
```bash
curl http://localhost:5000
# Expected: "API Working Properly"
```

### 2. Test ML Service
```bash
curl http://localhost:8000/api/ml/health
# Expected: {"status":"healthy",...}
```

### 3. Test Frontend
Open browser: http://localhost:5173
- Should see JobMate AI homepage
- Register/Login
- Chat widget should appear (bottom-right)

## 🎯 Step 7: Test Chatbot Features

### Test 1: Basic Chat
1. Click chat widget button (bottom-right)
2. Type: "Hello"
3. Should receive welcome message

### Test 2: Job Match Analysis
1. Browse jobs on the homepage
2. Click on a job
3. Click "Apply" or use chat to ask: "Analyze my match for this job"
4. Should receive detailed match analysis

### Test 3: Career Guidance
1. In chat, type: "What's my career path?"
2. Should receive career predictions and learning path

### Test 4: ATS Score
1. In chat, type: "Check my ATS score"
2. Should receive resume ATS analysis

## 🐛 Troubleshooting

### Issue: ML Service won't start

**Error:** `ModuleNotFoundError: No module named 'spacy'`

**Solution:**
```bash
cd ml-service
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

---

**Error:** `Can't find model 'en_core_web_md'`

**Solution:**
```bash
python -m spacy download en_core_web_md
```

---

### Issue: Backend connection error

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
1. Check MongoDB is running: `mongod --version`
2. Start MongoDB: `sudo systemctl start mongod` (Linux) or `net start MongoDB` (Windows)
3. Verify connection: `mongo --eval "db.adminCommand('ping')"`

---

### Issue: Chat widget not appearing

**Solution:**
1. Ensure you're logged in (JWT token required)
2. Check browser console for errors (F12)
3. Verify backend is running: `curl http://localhost:5000`
4. Check [`ChatWidget.jsx`](client/src/components/ChatWidget.jsx) is imported in [`App.jsx`](client/src/App.jsx)

---

### Issue: CORS errors

**Solution:**
1. Check `ALLOWED_ORIGINS` in ML service .env
2. Ensure it includes: `http://localhost:5173,http://localhost:5000`
3. Restart ML service after changing .env

---

### Issue: SHARED_SECRET mismatch

**Error:** `Invalid signature` or `Authentication failed`

**Solution:**
1. Ensure `SHARED_SECRET` is **identical** in:
   - `server/.env`
   - `ml-service/.env`
2. Restart both services after changing

---

## 📊 View API Documentation

### Backend API
- Swagger/OpenAPI: Not configured (can add Swagger)
- Routes: Check [`server/routes/`](server/routes/)

### ML Service API
- Interactive docs: http://localhost:8000/api/ml/docs
- ReDoc: http://localhost:8000/api/ml/redoc

## 🎓 Next Steps

### For Development:
1. Read [`CHATBOT_ARCHITECTURE.md`](CHATBOT_ARCHITECTURE.md) - Understand the system
2. Read [`ml-service/README.md`](ml-service/README.md) - ML service details
3. Explore code in [`ml-service/models/`](ml-service/models/)
4. Test evaluation: `cd ml-service && python evaluation.py`

### For Deployment:
1. Read [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)
2. Choose deployment platform (Railway, Render, AWS)
3. Configure production environment variables
4. Deploy services

### For Research:
1. Run evaluation suite: `python ml-service/evaluation.py`
2. Collect metrics and generate reports
3. Document findings
4. Prepare research paper

## 📁 Project Structure Overview

```
A-Job-Portal/
├── client/              # React Frontend
│   └── src/
│       └── components/
│           └── ChatWidget.jsx    # ⭐ Chat UI
│
├── server/              # Node.js Backend
│   ├── controllers/
│   │   └── chatController.js     # ⭐ Chat API
│   ├── routes/
│   │   └── chatRoutes.js         # ⭐ Routes
│   └── models/
│       ├── ChatConversation.js   # ⭐ Schema
│       ├── ChatMessage.js        # ⭐ Schema
│       └── MLAnalysis.js         # ⭐ Schema
│
└── ml-service/          # ⭐ Python ML Service
    ├── main.py          # FastAPI app
    ├── config.py        # Configuration
    ├── models/
    │   ├── job_matcher.py        # Job matching
    │   └── career_predictor.py   # Career prediction
    └── evaluation.py    # Metrics
```

## 🔑 Key Features Implemented

✅ **Explainable Job Matching**
- TF-IDF + Cosine Similarity
- spaCy NLP processing
- SHAP/LIME explainability
- ATS score calculation

✅ **Career Path Prediction**
- K-Means clustering
- Random Forest classification
- Skill gap analysis
- Learning path generation

✅ **Conversational AI**
- Context-aware responses
- Natural language understanding
- Quick action suggestions
- Conversation history

✅ **Security**
- JWT authentication
- HMAC signature verification
- Request validation
- Rate limiting ready

✅ **Performance**
- Result caching (24h TTL)
- Lazy model loading
- Async processing
- Optimized queries

## 📞 Getting Help

### Documentation
- [`CHATBOT_README.md`](CHATBOT_README.md) - Complete overview
- [`CHATBOT_ARCHITECTURE.md`](CHATBOT_ARCHITECTURE.md) - System design
- [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) - Deployment
- [`ml-service/README.md`](ml-service/README.md) - ML service

### Common Commands

**Check service status:**
```bash
# Backend
curl http://localhost:5000

# ML Service
curl http://localhost:8000/api/ml/health

# MongoDB
mongo --eval "db.adminCommand('ping')"
```

**View logs:**
```bash
# ML Service logs
tail -f ml-service/logs/ml-service.log

# Backend logs (if using PM2)
pm2 logs jobmate-backend
```

**Restart services:**
```bash
# Backend: Ctrl+C then npm run dev
# ML Service: Ctrl+C then python main.py
# Frontend: Ctrl+C then npm run dev
```

## 🎉 Success!

If all services are running and you can interact with the chat widget, congratulations! 🎊

You now have a fully functional research-grade intelligent chatbot system for job matching and career guidance.

---

**Time to complete:** ~15 minutes  
**Difficulty:** Intermediate  
**Support:** Check documentation or create an issue

**Happy Coding! 🚀**
