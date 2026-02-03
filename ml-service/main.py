"""
FastAPI ML Microservice for JobMate AI Chatbot
Main application entry point
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
from loguru import logger
import sys
import hmac
import hashlib
import time

from config import settings
from models.job_matcher import JobMatcher
from models.career_predictor import CareerPathPredictor

# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level=settings.LOG_LEVEL
)
logger.add(
    settings.LOG_FILE,
    rotation="500 MB",
    retention="10 days",
    level=settings.LOG_LEVEL
)

# Initialize FastAPI app
app = FastAPI(
    title="JobMate AI - ML Microservice",
    description="Research-grade ML service for explainable job matching and career guidance",
    version="1.0.0",
    docs_url="/api/ml/docs",
    redoc_url="/api/ml/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML models (lazy loading)
job_matcher: Optional[JobMatcher] = None
career_predictor: Optional[CareerPathPredictor] = None


def get_job_matcher() -> JobMatcher:
    """Lazy load job matcher"""
    global job_matcher
    if job_matcher is None:
        logger.info("Initializing Job Matcher...")
        job_matcher = JobMatcher(spacy_model=settings.SPACY_MODEL)
    return job_matcher


def get_career_predictor() -> CareerPathPredictor:
    """Lazy load career predictor"""
    global career_predictor
    if career_predictor is None:
        logger.info("Initializing Career Predictor...")
        career_predictor = CareerPathPredictor()
    return career_predictor


def verify_request_signature(
    x_signature: Optional[str] = Header(None),
    x_timestamp: Optional[str] = Header(None)
) -> bool:
    """
    Verify request signature from Node.js backend
    """
    if settings.ENVIRONMENT == "development":
        return True  # Skip verification in development
    
    if not x_signature or not x_timestamp:
        raise HTTPException(status_code=401, detail="Missing authentication headers")
    
    # Verify signature
    expected_signature = hmac.new(
        settings.SHARED_SECRET.encode(),
        x_timestamp.encode(),
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected_signature, x_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    return True


# Pydantic models for request/response
class ExplainMatchRequest(BaseModel):
    """Request model for job match explanation"""
    userId: str = Field(..., description="User ID")
    jobId: str = Field(..., description="Job ID")
    resumeText: str = Field(..., description="Resume text content")
    jobDescription: str = Field(..., description="Job description")
    jobSkills: List[str] = Field(..., description="Required job skills")
    requiredExperience: float = Field(0.0, description="Required years of experience")
    jobTitle: str = Field("", description="Job title")
    conversationId: Optional[str] = Field(None, description="Conversation ID for context")


class CareerPathRequest(BaseModel):
    """Request model for career path prediction"""
    userId: str = Field(..., description="User ID")
    currentRole: str = Field(..., description="Current job role")
    skills: List[str] = Field(..., description="Current skills")
    experienceYears: float = Field(..., description="Years of experience")
    education: Optional[str] = Field("", description="Education level")
    certifications: Optional[List[str]] = Field(default_factory=list, description="Certifications")
    targetRole: Optional[str] = Field(None, description="Target role (optional)")


class ChatMessageRequest(BaseModel):
    """Request model for chat interaction"""
    userId: str = Field(..., description="User ID")
    message: str = Field(..., description="User message")
    conversationId: Optional[str] = Field(None, description="Conversation ID")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Context data")


class ATSScoreRequest(BaseModel):
    """Request model for ATS score calculation"""
    resumeText: str = Field(..., description="Resume text")
    jobSkills: List[str] = Field(..., description="Job skills")


# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "JobMate AI ML Microservice",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/api/ml/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models": {
            "job_matcher": job_matcher is not None,
            "career_predictor": career_predictor is not None
        },
        "environment": settings.ENVIRONMENT
    }


@app.post("/api/ml/explain-match")
async def explain_match(
    request: ExplainMatchRequest,
    authenticated: bool = Depends(verify_request_signature)
):
    """
    Explain job match with AI-powered analysis
    Research Problem 1: Explainable AI for Job Matching
    """
    try:
        logger.info(f"Processing match explanation for user {request.userId}, job {request.jobId}")
        
        matcher = get_job_matcher()
        
        # Perform matching analysis
        match_result = matcher.match_job(
            resume_text=request.resumeText,
            job_description=request.jobDescription,
            job_skills=request.jobSkills,
            required_experience=request.requiredExperience,
            job_title=request.jobTitle
        )
        
        # Generate conversational response
        conversational_response = _generate_conversational_match_response(match_result)
        
        return {
            "success": True,
            "data": {
                **match_result,
                "conversationalResponse": conversational_response,
                "userId": request.userId,
                "jobId": request.jobId,
                "conversationId": request.conversationId
            }
        }
    
    except Exception as e:
        logger.error(f"Error in explain_match: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Match explanation failed: {str(e)}")


@app.post("/api/ml/career-path")
async def predict_career_path(
    request: CareerPathRequest,
    authenticated: bool = Depends(verify_request_signature)
):
    """
    Predict career path and provide skill growth guidance
    Research Problem 2: AI-based Career Path and Skill Growth Guidance
    """
    try:
        logger.info(f"Processing career path prediction for user {request.userId}")
        
        predictor = get_career_predictor()
        
        # Predict career path
        career_result = predictor.predict_career_path(
            current_role=request.currentRole,
            skills=request.skills,
            experience_years=request.experienceYears,
            education=request.education or "",
            certifications=request.certifications or []
        )
        
        # Generate conversational response
        conversational_response = _generate_conversational_career_response(career_result)
        
        return {
            "success": True,
            "data": {
                **career_result,
                "conversationalResponse": conversational_response,
                "userId": request.userId
            }
        }
    
    except Exception as e:
        logger.error(f"Error in predict_career_path: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Career prediction failed: {str(e)}")


@app.post("/api/ml/chat")
async def chat_interaction(
    request: ChatMessageRequest,
    authenticated: bool = Depends(verify_request_signature)
):
    """
    Handle conversational chat interactions
    Routes to appropriate ML service based on context
    """
    try:
        logger.info(f"Processing chat message for user {request.userId}")
        
        message_lower = request.message.lower()
        context = request.context or {}
        context_type = context.get('type', '')
        
        # Determine intent
        if any(keyword in message_lower for keyword in ['match', 'job', 'apply', 'qualify', 'rejected']):
            intent = 'job_match'
        elif any(keyword in message_lower for keyword in ['career', 'growth', 'next role', 'promotion', 'learn']):
            intent = 'career_guidance'
        elif context_type:
            intent = context_type
        else:
            intent = 'general'
        
        # Generate response based on intent
        if intent == 'job_match' and context.get('jobId'):
            response = (
                "To analyze your match for a specific job, please use the 'Analyze Match' button on the job details page. "
                "This will give me the context I need to provide a detailed explanation."
            )
        elif intent == 'career_guidance':
            response = (
                "I can provide career guidance. To start, you can ask me to 'predict my career path' or 'show me skills to learn'. "
                "For a detailed analysis, please use the 'Career Path' feature."
            )
        else:
            response = (
                "Hello! I'm JobMate AI. I can help you with job matching, career guidance, and resume analysis. "
                "What would you like to explore?"
            )
        
        return {
            "success": True,
            "data": {
                "response": response,
                "intent": intent,
                "conversationId": request.conversationId or f"conv_{request.userId}_{int(time.time())}",
                "suggestions": _generate_suggestions(intent)
            }
        }
    
    except Exception as e:
        import traceback
        logger.error(f"Error in chat_interaction: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")


@app.post("/api/ml/ats-score")
async def calculate_ats_score(
    request: ATSScoreRequest,
    authenticated: bool = Depends(verify_request_signature)
):
    """
    Calculate ATS (Applicant Tracking System) score for resume
    """
    try:
        logger.info("Calculating ATS score")
        
        matcher = get_job_matcher()
        ats_score = matcher._calculate_ats_score(request.resumeText, request.jobSkills)
        
        # Generate feedback
        feedback = []
        if ats_score >= 80:
            feedback.append("Excellent! Your resume is well-optimized for ATS.")
        elif ats_score >= 60:
            feedback.append("Good, but there's room for improvement.")
            feedback.append("Consider adding more relevant keywords.")
        else:
            feedback.append("Your resume needs optimization for ATS.")
            feedback.append("Add more relevant skills and keywords.")
            feedback.append("Ensure proper formatting with clear sections.")
        
        return {
            "success": True,
            "data": {
                "atsScore": ats_score,
                "rating": "Excellent" if ats_score >= 80 else "Good" if ats_score >= 60 else "Needs Improvement",
                "feedback": feedback
            }
        }
    
    except Exception as e:
        logger.error(f"Error in calculate_ats_score: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ATS score calculation failed: {str(e)}")


# Helper functions for conversational responses

def _generate_conversational_match_response(match_result: Dict[str, Any]) -> str:
    """Generate natural language response for match results"""
    score = match_result['overall_match_score']
    
    if score >= 80:
        intro = "Great news! 🎉 You're an excellent match for this position."
    elif score >= 60:
        intro = "Good news! ✅ You're a solid match for this role."
    elif score >= 40:
        intro = "You have potential for this role, but there are some gaps to address."
    else:
        intro = "This role might be challenging given your current profile."
    
    response_parts = [intro]
    
    # Add skill analysis
    if match_result['matched_skills']:
        response_parts.append(
            f"\n\n💪 Your strengths include: {', '.join(match_result['matched_skills'][:5])}"
        )
    
    if match_result['missing_skills']:
        response_parts.append(
            f"\n\n📚 Skills to develop: {', '.join(match_result['missing_skills'][:5])}"
        )
    
    # Add experience feedback
    if match_result['experience_gap'] > 0:
        response_parts.append(
            f"\n\n⏰ You need {match_result['experience_gap']} more years of experience for this role."
        )
    
    # Add ATS score
    response_parts.append(
        f"\n\n📄 Your ATS score is {match_result['ats_score']}/100"
    )
    
    # Add recommendation
    if match_result['recommendation']:
        response_parts.append(f"\n\n💡 Recommendation: {match_result['recommendation'][0]}")
    
    return "".join(response_parts)


def _generate_conversational_career_response(career_result: Dict[str, Any]) -> str:
    """Generate natural language response for career predictions"""
    response_parts = [
        f"Based on your profile as a {career_result['current_role']}, here's your career roadmap:"
    ]
    
    # Add top prediction
    if career_result['predicted_roles']:
        top_role = career_result['predicted_roles'][0]
        response_parts.append(
            f"\n\n🎯 Next Role: {top_role['role'].title()}"
        )
        response_parts.append(
            f"   Readiness: {top_role.get('readiness_score', 0)}%"
        )
        response_parts.append(
            f"   Timeline: {career_result['timeline']}"
        )
    
    # Add salary growth
    if career_result['salary_growth']:
        response_parts.append(
            f"\n\n💰 Expected Salary Growth: {career_result['salary_growth']['expected_growth']}"
        )
    
    # Add learning path
    if career_result['learning_path']:
        response_parts.append("\n\n📚 Priority Skills to Learn:")
        for item in career_result['learning_path'][:3]:
            response_parts.append(f"\n   • {item['skill'].title()} ({item['priority']} priority)")
    
    # Add recommendation
    if career_result['recommendations']:
        response_parts.append(f"\n\n💡 {career_result['recommendations'][0]}")
    
    return "".join(response_parts)


def _generate_suggestions(intent: str) -> List[str]:
    """Generate contextual suggestions"""
    suggestions_map = {
        'job_match': [
            "Analyze my match for a specific job",
            "Check my ATS score",
            "What skills am I missing?"
        ],
        'career_guidance': [
            "Show my career path",
            "What skills should I learn?",
            "Predict my next role"
        ],
        'general': [
            "Analyze a job match",
            "Get career guidance",
            "Check ATS score"
        ]
    }
    
    return suggestions_map.get(intent, suggestions_map['general'])


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error"
        }
    )


if __name__ == "__main__":
    import uvicorn
    import platform
    
    # Windows compatibility: use app object directly
    is_windows = platform.system() == "Windows"
    
    if is_windows:
        # Windows: use app object directly, disable reload
        uvicorn.run(
            app,
            host=settings.HOST,
            port=settings.PORT,
            reload=False,
            log_level=settings.LOG_LEVEL.lower()
        )
    else:
        # Linux/Mac: can use string reference with reload
        uvicorn.run(
            "main:app",
            host=settings.HOST,
            port=settings.PORT,
            reload=settings.ENVIRONMENT == "development",
            log_level=settings.LOG_LEVEL.lower()
        )
