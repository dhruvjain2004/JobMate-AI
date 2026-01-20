# JobMate AI - A Job Portal

JobMate AI is a full-featured job portal web application that connects job seekers with top companies. It allows users to search and apply for jobs, while recruiters can post and manage job listings. The platform features custom authentication, comprehensive user profiles, and admin controls. The platform is designed for a seamless, modern experience for both candidates and recruiters.

---

## 🚀 Features

### For Job Seekers
- **User Registration & Authentication**
  - Register with email, password, and mobile number
  - Login with email/password or Google OAuth
  - **Email OTP Login** - Passwordless login via OTP sent to registered email
  - Secure JWT-based authentication
- **Profile Management**
  - Complete editable profile page with progress tracking
  - Update personal information (name, location, mobile, email)
  - Add education details (degree, institute)
  - Set career preferences (job type, availability, work status)
  - Upload and manage profile photo
  - Add personal details (gender, birthday, about section)
  - Profile completion percentage indicator
- **Job Search & Application**
  - Browse and search thousands of job listings by title, location, and category
  - View detailed job descriptions, key responsibilities, and company info
  - Apply for jobs directly through the portal
  - Track your applications in one place
  - Upload and manage resume

### For Recruiters
- Register and log in as a company
- Post new job openings with rich descriptions and requirements
- Manage, edit, and delete job listings
- View and manage applications for posted jobs
- Toggle job visibility
- Access recruiter dashboard with sidebar navigation

### For Admins
- Admin authentication system
- Access to both recruiter and user functionalities
- Full control over the platform (future enhancements planned)

### General
- Responsive, modern UI (React + Tailwind CSS)
- Rich text editor for job descriptions (Quill)
- Company logos and branding
- Custom authentication system (JWT-based)
- Google OAuth integration
- Email OTP authentication
- Cloudinary integration for file uploads (resumes, profile photos)
- RESTful API (Node.js + Express + MongoDB)
- Deployed on Vercel (frontend) and suitable for cloud backend

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Vite, Axios, Quill, React Router, React Toastify
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT
- **Authentication:** Custom JWT-based auth, Google OAuth, Email OTP (Nodemailer)
- **File Storage:** Cloudinary
- **Deployment:** Vercel (frontend), suitable for Render/Heroku/Atlas (backend)

---

## 📁 Folder Structure

```
Job-Portal/
  client/        # Frontend (React)
    src/
      assets/    # Images, icons, logos
      components/# Reusable React components
      context/   # App-wide context (state management)
      pages/     # Main pages (Home, Login, Register, Profile, Dashboard, etc.)
    public/      # Static files (favicon, vite.png, etc.)
    ...
  server/        # Backend (Node.js/Express)
    controllers/ # API route handlers
    models/      # Mongoose models (User, Company, Job, etc.)
    routes/      # Express routes
    config/      # DB, Cloudinary, multer middleware
    middleware/  # Authentication middleware
    utils/       # Utility functions (token generation, email sending)
    ...
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB Atlas or local MongoDB instance
- Cloudinary account (for file uploads)
- Google Cloud Console account (for OAuth - optional)
- SMTP email service (for OTP emails - optional, can use Gmail, SendGrid, etc.)

### 1. Clone the Repository
```bash
git clone https://github.com/dhruvjain2004/JobMate-AI.git
cd Job-Portal
```

### 2. Setup Backend
```bash
cd server
npm install
```

#### Create a `.env` file in `server/` with:
```env
# Database
MONGO_URL=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id

# Email/SMTP (for OTP - optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_SECURE=false
EMAIL_FROM=noreply@naukriverse.com
```

**Note:** 
- For Google OAuth, register your app in [Google Cloud Console](https://console.cloud.google.com/) and add authorized JavaScript origins (e.g., `http://localhost:5173`)
- For email OTP, you can use Gmail with an [App Password](https://support.google.com/accounts/answer/185833) or services like SendGrid, Mailgun, etc.

#### Start the backend server:
```bash
npm run dev
# or
node app.js
```

The backend will run on `http://localhost:5000` (or as configured)

### 3. Setup Frontend
```bash
cd ../client
npm install
```

#### Create a `.env` file in `client/` with:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

#### Start the frontend:
```bash
npm run dev
```

- The app will be available at `http://localhost:5173` (or as shown in your terminal)

---

## 🔐 Authentication Features

### User Registration
- Full name, email, password, mobile number
- Work status selection (Experienced/Fresher)
- Google OAuth registration option

### User Login
- **Email/Password Login** - Traditional login method
- **Google OAuth Login** - One-click Google sign-in
- **Email OTP Login** - Passwordless login:
  1. Enter registered email address
  2. Receive 6-digit OTP via email
  3. Enter OTP to login (valid for 5 minutes)
  4. Resend OTP option available

### Admin Authentication
- Separate admin login system
- Access to both recruiter and user features

---

## 📄 Key Pages

### Public Pages
- **Home** - Job search and listings
- **Login** - User authentication (email/password, Google, OTP)
- **Register** - New user registration

### User Pages (Protected)
- **Profile** - Complete profile management with editable fields
- **Applications** - View all job applications
- **Dashboard** - Access to recruiter features (if applicable)

### Recruiter Pages (Protected)
- **Add Job** - Post new job listings
- **Manage Jobs** - Edit, delete, toggle visibility of jobs
- **View Applications** - See applications for posted jobs

### Admin Pages
- **Admin Auth** - Admin login page
- Full access to all features

---

## 🌐 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd client && npm install && npm run build`
3. Set output directory: `client/dist`
4. Add environment variables:
   - `VITE_BACKEND_URL` - Your backend API URL
   - `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth client ID

### Backend Deployment
- Deploy to Render, Heroku, Railway, or any Node.js hosting
- Set all environment variables from the `.env` file
- Ensure MongoDB connection is accessible
- Update CORS settings to allow your frontend domain

### Google OAuth Setup for Production
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Add your production domain to **Authorized JavaScript origins**
3. Add your production callback URL to **Authorized redirect URIs**
4. Update `VITE_GOOGLE_CLIENT_ID` in frontend environment variables

---

## 🔄 Recent Changes

### Removed
- **Clerk Authentication** - Replaced with custom JWT-based authentication system

### Added
- **Custom Authentication System** - Email/password, Google OAuth, Email OTP
- **User Profile Page** - Comprehensive profile management with:
  - Editable personal information
  - Education details
  - Career preferences
  - Profile photo upload
  - Profile completion tracking
- **Email OTP Login** - Passwordless authentication via email
- **Admin System** - Admin authentication and access controls
- **Profile Photo Upload** - Cloudinary integration for profile images
- **Enhanced User Model** - Additional fields for profile completion

---

## 🤖 AI Integration & Future Enhancements

NaukriVerse is designed with AI capabilities in mind for future advancements. The platform architecture supports seamless integration of AI-powered features to enhance user experience and streamline recruitment processes.

### Planned AI Features

#### 🤖 AI Chatbot Assistant
- **24/7 Support Chatbot** - Intelligent virtual assistant to help users:
  - Answer questions about job listings and application processes
  - Provide career guidance and job search tips
  - Assist with profile optimization suggestions
  - Help recruiters with job posting best practices
  - Handle common queries and FAQs

#### 🎯 AI-Powered Job Matching
- **Smart Job Recommendations** - Machine learning algorithms to:
  - Match candidates with the most relevant job opportunities based on skills, experience, and preferences
  - Analyze job descriptions and candidate profiles for better compatibility
  - Provide personalized job suggestions in real-time
  - Improve match accuracy over time with user feedback

#### ✍️ AI Resume & Profile Optimization
- **Resume Analyzer** - AI tools to:
  - Analyze and score resumes for ATS (Applicant Tracking System) compatibility
  - Suggest improvements for better visibility
  - Identify missing keywords and skills
  - Provide personalized recommendations for profile enhancement

#### 📊 AI Analytics & Insights
- **Recruitment Analytics** - AI-driven insights for recruiters:
  - Predict application success rates
  - Analyze market trends and salary benchmarks
  - Identify best-performing job descriptions
  - Optimize job posting strategies

#### 🔍 AI-Powered Search
- **Semantic Job Search** - Natural language processing for:
  - Understanding search intent beyond keywords
  - Contextual job matching
  - Intelligent filtering and sorting
  - Voice-activated job search

#### 💬 AI Interview Assistant
- **Interview Preparation** - AI tools to help candidates:
  - Practice interviews with AI-powered mock interviews
  - Get feedback on responses
  - Receive industry-specific interview questions
  - Improve communication skills

### Technical Integration Points

The platform is structured to support AI integration through:
- **RESTful API endpoints** ready for AI service integration
- **Modular architecture** allowing easy addition of AI services
- **Data models** designed to store AI-generated insights and recommendations
- **Scalable backend** capable of handling AI processing workloads

### Potential AI Services & Tools
- OpenAI GPT models for chatbot and content generation
- TensorFlow/PyTorch for machine learning models
- Natural Language Processing (NLP) libraries
- Computer Vision for document analysis
- Recommendation system frameworks

---

## 🤝 Contributing

1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudinary](https://cloudinary.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Nodemailer](https://nodemailer.com/)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)

---

## 📬 Contact
For questions, suggestions, or support, please open an issue or contact the maintainer at [dhruvjain527@gmail.com](mailto:dhruvjain527@gmail.com).
