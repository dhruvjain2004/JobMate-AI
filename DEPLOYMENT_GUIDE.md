# JobMate AI Chatbot - Deployment Guide

Complete guide for deploying the research-grade intelligent chatbot system.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **Python**: 3.9 or higher
- **MongoDB**: 7.0 or higher
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 2GB free space

### Accounts Needed
- MongoDB Atlas (free tier available)
- Cloudinary (for file storage)
- Railway/Render (for Python ML service)
- Vercel (for frontend deployment)

## 🚀 Local Development Setup

### Step 1: Clone and Setup Repository

```bash
git clone <your-repo-url>
cd A-Job-Portal
```

### Step 2: Setup Node.js Backend

```bash
cd server
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobmate
JWT_SECRET=your-jwt-secret-key
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
ML_SERVICE_URL=http://localhost:8000
SHARED_SECRET=your-shared-secret-between-services
NODE_ENV=development
EOF

# Start server
npm run dev
```

### Step 3: Setup Python ML Service

```bash
cd ../ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_md

# Create .env file
cat > .env << EOF
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
SECRET_KEY=your-secret-key
SHARED_SECRET=your-shared-secret-between-services
NODE_BACKEND_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/jobmate
SPACY_MODEL=en_core_web_md
LOG_LEVEL=INFO
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000
EOF

# Start ML service
python main.py
```

### Step 4: Setup React Frontend

```bash
cd ../client
npm install

# Create .env file
cat > .env << EOF
VITE_BACKEND_URL=http://localhost:5000
EOF

# Start development server
npm run dev
```

### Step 5: Verify Setup

1. **Backend**: http://localhost:5000 - Should show "API Working Properly"
2. **ML Service**: http://localhost:8000/api/ml/health - Should return health status
3. **Frontend**: http://localhost:5173 - Should load the application

## 🌐 Production Deployment

### Option 1: All-in-One Cloud Deployment

#### A. Deploy MongoDB (MongoDB Atlas)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/jobmate`

#### B. Deploy Python ML Service (Railway)

1. **Create Railway Account**: https://railway.app
2. **Create New Project** → Deploy from GitHub
3. **Select Repository**: Choose your repository
4. **Configure Service**:
   - Root Directory: `ml-service`
   - Build Command: `pip install -r requirements.txt && python -m spacy download en_core_web_md`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Set Environment Variables**:
```
HOST=0.0.0.0
PORT=$PORT
ENVIRONMENT=production
SECRET_KEY=<generate-strong-key>
SHARED_SECRET=<same-as-nodejs>
NODE_BACKEND_URL=<your-nodejs-backend-url>
MONGODB_URI=<mongodb-atlas-uri>
SPACY_MODEL=en_core_web_md
LOG_LEVEL=INFO
ALLOWED_ORIGINS=<your-frontend-url>
```

6. **Deploy** and note the service URL (e.g., `https://your-ml-service.railway.app`)

#### C. Deploy Node.js Backend (Railway/Render)

**Railway:**
1. Create new service from GitHub
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `npm start`

**Environment Variables:**
```
PORT=$PORT
MONGODB_URI=<mongodb-atlas-uri>
JWT_SECRET=<generate-strong-key>
CLOUDINARY_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
ML_SERVICE_URL=<your-ml-service-url>
SHARED_SECRET=<same-as-python>
NODE_ENV=production
```

#### D. Deploy React Frontend (Vercel)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
cd client
vercel --prod
```

3. **Set Environment Variables** in Vercel Dashboard:
```
VITE_BACKEND_URL=<your-nodejs-backend-url>
```

### Option 2: Self-Hosted Deployment (AWS EC2)

#### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

#### Deploy Applications

```bash
# Clone repository
cd /opt
sudo git clone <your-repo-url> jobmate
cd jobmate

# Setup Node.js Backend
cd server
sudo npm install
sudo cp .env.example .env
# Edit .env with production values
sudo pm2 start app.js --name jobmate-backend
sudo pm2 save
sudo pm2 startup

# Setup Python ML Service
cd ../ml-service
sudo python3 -m venv venv
sudo venv/bin/pip install -r requirements.txt
sudo venv/bin/python -m spacy download en_core_web_md
sudo cp .env.example .env
# Edit .env with production values
sudo pm2 start "venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name jobmate-ml

# Build React Frontend
cd ../client
sudo npm install
sudo npm run build
```

#### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/jobmate
```

```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;
    
    root /opt/jobmate/client/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# ML Service
server {
    listen 80;
    server_name ml.your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/jobmate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS with SSL certificates (Let's Encrypt)
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for sensitive data
- [ ] Implement request validation
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Backup database regularly

## 🧪 Testing Deployment

### 1. Test ML Service

```bash
curl -X POST http://your-ml-service-url/api/ml/health
```

Expected response:
```json
{
  "status": "healthy",
  "models": {
    "job_matcher": true,
    "career_predictor": true
  }
}
```

### 2. Test Backend API

```bash
curl http://your-backend-url/
```

Expected: "API Working Properly"

### 3. Test Frontend

Open browser and navigate to your frontend URL. Test:
- User registration/login
- Job browsing
- Chat widget functionality
- Job match analysis
- Career path guidance

## 📊 Monitoring

### Application Logs

**Node.js Backend:**
```bash
pm2 logs jobmate-backend
```

**Python ML Service:**
```bash
pm2 logs jobmate-ml
# or
tail -f ml-service/logs/ml-service.log
```

### Database Monitoring

```bash
# MongoDB status
sudo systemctl status mongod

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### System Resources

```bash
# CPU and Memory
htop

# Disk usage
df -h

# Network
netstat -tulpn
```

## 🔄 Updates and Maintenance

### Update Application

```bash
cd /opt/jobmate
sudo git pull origin main

# Update backend
cd server
sudo npm install
sudo pm2 restart jobmate-backend

# Update ML service
cd ../ml-service
sudo venv/bin/pip install -r requirements.txt
sudo pm2 restart jobmate-ml

# Update frontend
cd ../client
sudo npm install
sudo npm run build
```

### Database Backup

```bash
# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/jobmate" --out=/backup/$(date +%Y%m%d)

# Restore MongoDB
mongorestore --uri="mongodb://localhost:27017/jobmate" /backup/20260202
```

## 🐛 Troubleshooting

### ML Service Not Starting

```bash
# Check Python version
python3 --version

# Check dependencies
pip list

# Check spaCy model
python -m spacy validate

# Check logs
tail -f ml-service/logs/ml-service.log
```

### Backend Connection Issues

```bash
# Check MongoDB connection
mongo --eval "db.adminCommand('ping')"

# Check environment variables
pm2 env jobmate-backend

# Check port availability
sudo netstat -tulpn | grep 5000
```

### Frontend Build Issues

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env

# Build with verbose output
npm run build -- --debug
```

## 📞 Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Test each service independently
4. Check firewall and security groups
5. Consult documentation

## 🎓 Academic Use

For research and academic projects:
- Document all deployment steps
- Include architecture diagrams
- Measure and report performance metrics
- Cite dependencies and frameworks
- Include evaluation results

---

**Last Updated**: 2026-02-02  
**Version**: 1.0.0
