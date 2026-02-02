# 🪟 Windows Setup Guide - JobMate AI Chatbot

## ⚠️ Python 3.13 Compatibility Issue

You're using Python 3.13, which is very new and some ML packages don't have pre-built wheels yet. You have **3 options**:

---

## ✅ OPTION 1: Use Python 3.11 (RECOMMENDED)

### Step 1: Install Python 3.11
1. Download Python 3.11 from: https://www.python.org/downloads/release/python-3119/
2. Run installer
3. ✅ Check "Add Python to PATH"
4. Install

### Step 2: Verify Installation
```bash
python --version
# Should show: Python 3.11.x
```

### Step 3: Setup ML Service
```bash
cd ml-service

# Create virtual environment with Python 3.11
python -m venv venv

# Activate
venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Create .env
copy .env.example .env
notepad .env

# Start service
python main.py
```

---

## ✅ OPTION 2: Install Visual Studio Build Tools (For Python 3.13)

If you want to keep Python 3.13, you need C++ compiler:

### Step 1: Install Build Tools
1. Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Run installer
3. Select "Desktop development with C++"
4. Install (takes ~6GB)

### Step 2: Retry Installation
```bash
cd ml-service
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## ✅ OPTION 3: Use Simplified Version (No spaCy)

Use a simplified version without spaCy (less accurate but works immediately):

### Step 1: Install Basic Dependencies
```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate

# Install basic requirements
pip install fastapi uvicorn pydantic python-dotenv scikit-learn pandas numpy nltk httpx aiofiles loguru python-multipart
```

### Step 2: Use Simplified Model

I'll create a simplified version that doesn't require spaCy:

```bash
# Create .env
copy .env.example .env
notepad .env
```

Edit `.env` and set:
```env
SPACY_MODEL=none
```

### Step 3: Start Service
```bash
python main.py
```

---

## 🎯 RECOMMENDED: Option 1 (Python 3.11)

**Why?**
- ✅ All packages have pre-built wheels
- ✅ No compiler needed
- ✅ Full functionality
- ✅ Faster installation
- ✅ Better compatibility

**Steps:**
1. Uninstall Python 3.13 (optional)
2. Install Python 3.11.9
3. Follow normal setup

---

## 🔧 Quick Fix Commands

### If you choose Python 3.11:
```bash
# Check Python version
python --version

# If still showing 3.13, use full path:
C:\Python311\python.exe --version

# Create venv with specific Python
C:\Python311\python.exe -m venv venv

# Activate and install
venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### If you choose Build Tools:
```bash
# After installing Visual Studio Build Tools
cd ml-service
venv\Scripts\activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### If you choose Simplified:
```bash
cd ml-service
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn pydantic python-dotenv scikit-learn pandas numpy nltk httpx aiofiles loguru python-multipart pydantic-settings
```

---

## 📝 After ML Service is Running

Continue with backend and frontend:

### Backend (Terminal 2):
```bash
cd server
npm install
copy .env.example .env
notepad .env
npm run dev
```

### Frontend (Terminal 3):
```bash
cd client
npm install
echo VITE_BACKEND_URL=http://localhost:5000 > .env
npm run dev
```

---

## 🐛 Still Having Issues?

### Error: "No module named 'spacy'"
**Solution:** Use Option 3 (Simplified) or install Python 3.11

### Error: "Microsoft Visual C++ 14.0 is required"
**Solution:** Install Build Tools (Option 2) or use Python 3.11 (Option 1)

### Error: "numpy" build failed
**Solution:** Use Python 3.11 which has pre-built numpy wheels

---

## 🎉 Success Indicators

When ML service starts successfully, you'll see:
```
INFO: Started server process
INFO: Uvicorn running on http://0.0.0.0:8000
```

Test it:
```bash
curl http://localhost:8000/api/ml/health
```

Should return:
```json
{"status":"healthy","models":{...}}
```

---

## 💡 My Recommendation

**Use Python 3.11** - It's the sweet spot:
- ✅ Stable
- ✅ All packages available
- ✅ No compiler needed
- ✅ Fast installation

Download: https://www.python.org/downloads/release/python-3119/

Then follow the normal setup in [`QUICK_START.md`](QUICK_START.md)

---

**Need more help?** Check [`QUICK_START.md`](QUICK_START.md) for detailed instructions.
