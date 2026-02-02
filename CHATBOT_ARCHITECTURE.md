# JobMate AI Chatbot - Research-Grade Architecture

## Overview
This document describes the architecture of the intelligent chatbot system integrated into JobMate AI, designed for academic research and final-year projects. The system addresses two key research problems:
1. **Explainable AI for Job Matching**
2. **AI-based Career Path and Skill Growth Guidance**

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Chat Widget (ChatWidget.jsx)                       │  │
│  │  - Real-time messaging UI                                 │  │
│  │  - Context-aware conversations                            │  │
│  │  - File upload for resumes                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/REST
┌─────────────────────────────────────────────────────────────────┐
│                    Node.js Backend Gateway                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js API Gateway (/api/chat)                       │  │
│  │  - JWT Authentication & Authorization                     │  │
│  │  - Request validation & rate limiting                     │  │
│  │  - Session management                                     │  │
│  │  - MongoDB integration                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ REST API
┌─────────────────────────────────────────────────────────────────┐
│                   Python ML Microservice                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FastAPI Server (Port 8000)                               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Endpoints:                                         │  │  │
│  │  │  - POST /api/ml/explain-match                       │  │  │
│  │  │  - POST /api/ml/career-path                         │  │  │
│  │  │  - POST /api/ml/chat                                │  │  │
│  │  │  - POST /api/ml/ats-score                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  ML Pipeline Components:                            │  │  │
│  │  │                                                      │  │  │
│  │  │  1. Job Matching Engine                             │  │  │
│  │  │     - spaCy NLP (en_core_web_md)                    │  │  │
│  │  │     - TF-IDF Vectorization                          │  │  │
│  │  │     - Cosine Similarity                             │  │  │
│  │  │     - Skill extraction & matching                   │  │  │
│  │  │                                                      │  │  │
│  │  │  2. Explainability Module                           │  │  │
│  │  │     - SHAP (SHapley Additive exPlanations)          │  │  │
│  │  │     - LIME (Local Interpretable Model-agnostic)     │  │  │
│  │  │     - Feature importance analysis                   │  │  │
│  │  │     - Human-readable explanations                   │  │  │
│  │  │                                                      │  │  │
│  │  │  3. Career Path Predictor                           │  │  │
│  │  │     - scikit-learn (KMeans, RandomForest)           │  │  │
│  │  │     - pandas & NumPy for data processing            │  │  │
│  │  │     - Job trend analysis                            │  │  │
│  │  │     - Skill gap identification                      │  │  │
│  │  │                                                      │  │  │
│  │  │  4. ATS Resume Scorer                               │  │  │
│  │  │     - Keyword density analysis                      │  │  │
│  │  │     - Format compliance checking                    │  │  │
│  │  │     - Section completeness scoring                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer (MongoDB)                        │
│  - ChatConversation (conversation history)                       │
│  - ChatMessage (individual messages)                             │
│  - MLAnalysis (cached ML results)                                │
│  - CareerPath (career recommendations)                           │
└─────────────────────────────────────────────────────────────────┘
```

## Research Problem 1: Explainable AI for Job Matching

### Objective
Provide transparent, interpretable explanations for why a candidate matches or doesn't match a job posting.

### Technical Implementation

#### 1.1 Resume & Job Description Processing
```python
# Pipeline:
1. Text Extraction (PyPDF2, python-docx)
2. Preprocessing (spaCy tokenization, lemmatization)
3. Named Entity Recognition (skills, experience, education)
4. Feature Extraction (TF-IDF vectors)
```

#### 1.2 Matching Algorithm
```python
# Components:
- Skill Matching: Exact + Semantic similarity using spaCy word vectors
- Experience Gap Analysis: Years of experience comparison
- Education Matching: Degree level and field alignment
- Location Compatibility: Geographic matching
- Salary Expectation: Range compatibility check

# Scoring Formula:
match_score = (
    0.40 * skill_match_score +
    0.25 * experience_score +
    0.15 * education_score +
    0.10 * location_score +
    0.10 * salary_compatibility
)
```

#### 1.3 Explainability Layer
```python
# SHAP Integration:
- Train a lightweight classifier (RandomForest/XGBoost)
- Generate SHAP values for each feature
- Identify top positive/negative contributors

# LIME Integration:
- Create interpretable representations
- Generate local explanations for individual predictions
- Visualize feature importance

# Human-Readable Output:
{
  "match_percentage": 78,
  "matched_skills": ["Python", "React", "MongoDB"],
  "missing_skills": ["Docker", "Kubernetes"],
  "experience_gap": "2 years short",
  "strengths": ["Strong technical skills", "Relevant education"],
  "weaknesses": ["Limited DevOps experience"],
  "recommendation": "Consider upskilling in containerization",
  "ats_score": 85,
  "explanation": "Your profile strongly matches due to..."
}
```

### Evaluation Metrics
- **Accuracy**: Precision, Recall, F1-Score of match predictions
- **Explainability Quality**: User comprehension surveys
- **ATS Score Correlation**: Comparison with commercial ATS systems
- **Processing Time**: Latency measurements

## Research Problem 2: AI-based Career Path & Skill Growth Guidance

### Objective
Predict next career moves and recommend personalized learning paths based on job market trends and individual profiles.

### Technical Implementation

#### 2.1 Data Collection & Processing
```python
# Data Sources:
- Historical job postings (MongoDB)
- User career trajectories
- Skill co-occurrence patterns
- Salary progression data
- Industry trends (synthetic/scraped data)

# Feature Engineering:
- Current role encoding
- Skills vector (multi-hot encoding)
- Experience level
- Industry sector
- Geographic location
- Salary range
```

#### 2.2 Career Path Prediction
```python
# Clustering Approach:
1. K-Means clustering on job profiles
2. Identify career clusters and transitions
3. Build transition probability matrix

# Classification Approach:
1. Train RandomForest/XGBoost classifier
2. Features: current_role, skills, experience
3. Target: next_role (multi-class)
4. Confidence scores for recommendations

# Recommendation Engine:
- Collaborative filtering for skill recommendations
- Association rule mining for skill bundles
- Temporal analysis for trending skills
```

#### 2.3 Skill Gap Analysis
```python
# Algorithm:
1. Extract skills from target role
2. Compare with user's current skills
3. Prioritize by:
   - Frequency in job postings
   - Salary impact
   - Learning difficulty (estimated)
   - Time to acquire

# Output:
{
  "current_role": "Junior Developer",
  "predicted_roles": [
    {
      "role": "Senior Developer",
      "probability": 0.65,
      "timeline": "2-3 years",
      "required_skills": ["System Design", "Mentoring"],
      "salary_growth": "+40%"
    }
  ],
  "skill_recommendations": [
    {
      "skill": "Docker",
      "priority": "High",
      "reason": "Required in 85% of target roles",
      "resources": ["Docker Mastery Course", "Official Docs"]
    }
  ],
  "certifications": ["AWS Solutions Architect"],
  "learning_path": "Step-by-step roadmap..."
}
```

### Evaluation Metrics
- **Prediction Accuracy**: How often predicted roles match actual transitions
- **Skill Relevance**: Percentage of recommended skills appearing in target jobs
- **User Satisfaction**: Survey-based feedback
- **Salary Prediction Error**: MAE/RMSE for salary estimates

## API Contracts

### 1. Explain Job Match
```http
POST /api/chat/explain-match
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request:
{
  "userId": "user_id",
  "jobId": "job_id",
  "resumeText": "optional_resume_text",
  "conversationId": "optional_conversation_id"
}

Response:
{
  "success": true,
  "data": {
    "matchScore": 78,
    "matchedSkills": ["Python", "React"],
    "missingSkills": ["Docker"],
    "experienceGap": "2 years",
    "atsScore": 85,
    "explanation": "Detailed explanation...",
    "recommendations": ["Learn Docker", "Gain 2 more years experience"],
    "shapValues": {...},
    "conversationalResponse": "Based on your profile..."
  }
}
```

### 2. Career Path Guidance
```http
POST /api/chat/career-path
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request:
{
  "userId": "user_id",
  "currentRole": "Junior Developer",
  "skills": ["Python", "React"],
  "experience": 2,
  "targetRole": "optional_target_role"
}

Response:
{
  "success": true,
  "data": {
    "predictedRoles": [
      {
        "role": "Senior Developer",
        "probability": 0.65,
        "timeline": "2-3 years",
        "salaryGrowth": "+40%"
      }
    ],
    "skillGaps": ["Docker", "System Design"],
    "learningPath": [...],
    "certifications": ["AWS SA"],
    "conversationalResponse": "Your career path shows..."
  }
}
```

### 3. Chat Interface
```http
POST /api/chat/message
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request:
{
  "userId": "user_id",
  "message": "Why was I rejected for this job?",
  "conversationId": "optional_conversation_id",
  "context": {
    "jobId": "optional_job_id",
    "type": "job_match" | "career_guidance"
  }
}

Response:
{
  "success": true,
  "data": {
    "response": "Based on the analysis...",
    "conversationId": "conv_id",
    "suggestions": ["View detailed analysis", "Get career guidance"],
    "mlData": {...}
  }
}
```

## Security & Authentication

### JWT Flow
```
1. User logs in → Node.js backend generates JWT
2. Frontend stores JWT in localStorage/httpOnly cookie
3. All chat requests include JWT in Authorization header
4. Node.js validates JWT before forwarding to Python service
5. Python service receives validated user context
```

### Python Service Authentication
```python
# Shared secret between Node.js and Python
# Node.js signs requests with HMAC
# Python validates signature before processing
```

## Scalability Considerations

### Horizontal Scaling
- Python ML service can run multiple instances behind load balancer
- Stateless design enables easy replication
- MongoDB handles concurrent connections

### Caching Strategy
- Cache ML analysis results in MongoDB (TTL: 24 hours)
- Redis for session management (optional)
- Model predictions cached by user+job combination

### Performance Optimization
- Lazy loading of ML models
- Batch processing for multiple job matches
- Asynchronous processing for long-running tasks
- WebSocket support for real-time updates (future)

## Model Pipeline

### Training Pipeline
```python
# Offline Training (periodic):
1. Extract features from historical data
2. Train classification models
3. Validate on test set
4. Save models to disk
5. Update model registry

# Online Inference:
1. Load pre-trained models
2. Process user input
3. Generate predictions
4. Apply explainability
5. Format response
```

### Model Versioning
- Models stored in `/ml-service/models/` directory
- Version naming: `model_v{version}_{date}.pkl`
- A/B testing capability for model comparison

## Research Publication Readiness

### Datasets
- Synthetic job posting dataset (included)
- User interaction logs
- Model performance metrics
- Explainability evaluation data

### Reproducibility
- Requirements.txt with pinned versions
- Seed values for random operations
- Detailed documentation
- Unit tests for critical components

### Evaluation Framework
- Automated metric calculation
- Confusion matrices
- ROC curves
- SHAP summary plots
- User study templates

## Technology Stack Summary

### Frontend
- React 18.2
- Axios for API calls
- TailwindCSS for styling
- React Context for state management

### Backend (Node.js)
- Express.js 4.22
- JWT for authentication
- Mongoose for MongoDB
- Axios for ML service communication

### ML Service (Python)
- FastAPI (async web framework)
- spaCy 3.7+ (NLP)
- scikit-learn 1.3+ (ML algorithms)
- SHAP 0.43+ (explainability)
- LIME 0.2+ (explainability)
- pandas 2.0+ (data processing)
- NumPy 1.24+ (numerical computing)
- PyPDF2 (PDF parsing)
- python-docx (DOCX parsing)
- uvicorn (ASGI server)

### Database
- MongoDB 7.0+ (primary database)
- Mongoose ODM

## Deployment Architecture

### Development
```
- Node.js: localhost:5000
- Python ML: localhost:8000
- React: localhost:5173
- MongoDB: localhost:27017
```

### Production
```
- Node.js: Deployed on Vercel/Railway
- Python ML: Deployed on Railway/Render/AWS EC2
- React: Deployed on Vercel
- MongoDB: MongoDB Atlas
```

## Future Enhancements

1. **Real-time Learning**: Incorporate user feedback to improve models
2. **Multi-modal Analysis**: Process video resumes, portfolios
3. **Advanced NLP**: Fine-tune BERT/GPT models for better understanding
4. **Graph Neural Networks**: Model career transitions as graphs
5. **Reinforcement Learning**: Optimize recommendation strategies
6. **Federated Learning**: Privacy-preserving model training

## References & Citations

This architecture is designed to support academic research in:
- Explainable AI (XAI)
- Recommender Systems
- Natural Language Processing
- Human-Computer Interaction
- Career Analytics

Suitable for publication in:
- IEEE Transactions on AI
- ACM RecSys
- AAAI Conference
- CHI Conference
- Journal of Career Development

---

**Version**: 1.0  
**Last Updated**: 2026-02-02  
**Authors**: JobMate AI Research Team
