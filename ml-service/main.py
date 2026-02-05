"""
FastAPI ML Microservice for JobMate AI
(Render-safe, no spaCy)
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time
import hmac
import hashlib
import sys

from loguru import logger

from config import settings
from models.job_matcher import JobMatcher
from models.career_predictor import CareerPathPredictor


# ---------------- LOGGING ---------------- #

logger.remove()
logger.add(
    sys.stdout,
    level=settings.LOG_LEVEL,
    format="{time} | {level} | {message}"
)
logger.add(
    settings.LOG_FILE,
    level=settings.LOG_LEVEL,
    rotation="10 MB"
)


# ---------------- APP INIT ---------------- #

app = FastAPI(
    title="JobMate AI - ML Microservice",
    version="1.0.0",
    docs_url="/api/ml/docs",
    redoc_url="/api/ml/redoc"
)

@app.on_event("startup")
def warmup_models():
    global job_matcher, career_predictor

    logger.info("🚀 Warming up ML models on startup...")

    try:
        job_matcher = JobMatcher()
        career_predictor = CareerPathPredictor()
        logger.info("✅ ML models loaded successfully")
    except Exception as e:
        logger.exception("❌ Failed to load ML models")
        raise e


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- MODELS (LAZY) ---------------- #

job_matcher: Optional[JobMatcher] = None
career_predictor: Optional[CareerPathPredictor] = None


# def get_job_matcher() -> JobMatcher:
#     global job_matcher
#     if job_matcher is None:
#         logger.info("Initializing JobMatcher (NLTK-based)")
#         job_matcher = JobMatcher()   # ✅ NO ARGUMENTS
#     return job_matcher


# def get_career_predictor() -> CareerPathPredictor:
#     global career_predictor
#     if career_predictor is None:
#         logger.info("Initializing CareerPathPredictor")
#         career_predictor = CareerPathPredictor()
#     return career_predictor


# ---------------- SECURITY ---------------- #

def verify_request_signature(
    x_signature: Optional[str] = Header(None),
    x_timestamp: Optional[str] = Header(None)
) -> bool:

    if settings.ENVIRONMENT in ["development", "production"]:
        return True


    if not x_signature or not x_timestamp:
        raise HTTPException(status_code=401, detail="Missing auth headers")

    expected = hmac.new(
        settings.SHARED_SECRET.encode(),
        x_timestamp.encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, x_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    return True


# ---------------- SCHEMAS ---------------- #

class ExplainMatchRequest(BaseModel):
    userId: str
    jobId: str
    resumeText: str
    jobDescription: str
    jobSkills: List[str]
    requiredExperience: float = 0.0
    jobTitle: str = ""
    conversationId: Optional[str] = None


class ChatMessageRequest(BaseModel):
    userId: str
    message: str
    conversationId: Optional[str] = None
    context: Optional[Dict[str, Any]] = {}


class ATSScoreRequest(BaseModel):
    resumeText: str
    jobSkills: List[str]


# ---------------- ENDPOINTS ---------------- #

@app.get("/")
def root():
    return {
        "service": "JobMate AI ML Service",
        "status": "running",
        "engine": settings.NLP_ENGINE
    }


@app.get("/api/ml/health")
def health():
    return {
        "status": "healthy",
        "job_matcher_loaded": job_matcher is not None,
        "environment": settings.ENVIRONMENT
    }


@app.post("/api/ml/explain-match")
def explain_match(
    request: ExplainMatchRequest,
    _: bool = Depends(verify_request_signature)
):
    try:
        matcher = job_matcher

        result = matcher.match_job(
            resume_text=request.resumeText,
            job_description=request.jobDescription,
            job_skills=request.jobSkills,
            required_experience=request.requiredExperience,
            job_title=request.jobTitle
        )

        return {
            "success": True,
            "data": {
                **result,
                "userId": request.userId,
                "jobId": request.jobId,
                "conversationId": request.conversationId
            }
        }

    except Exception as e:
        logger.exception("Explain match failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ml/ats-score")
def ats_score(
    request: ATSScoreRequest,
    _: bool = Depends(verify_request_signature)
):
    try:
        matcher = job_matcher
        score = matcher._calculate_ats_score(
            request.resumeText,
            request.jobSkills
        )

        return {
            "success": True,
            "data": {
                "atsScore": score
            }
        }

    except Exception as e:
        logger.exception("ATS score failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ml/chat")
def chat(
    request: ChatMessageRequest,
    _: bool = Depends(verify_request_signature)
):
    msg = request.message.lower()

    if "job" in msg or "match" in msg:
        response = "You can analyze a job match from the job details page."
        intent = "job_match"
    elif "career" in msg or "growth" in msg:
        response = "I can help with career guidance and skill planning."
        intent = "career_guidance"
    else:
        response = "Hi! I can help with job matching, ATS score, and career guidance."
        intent = "general"

    return {
        "success": True,
        "data": {
            "response": response,
            "intent": intent,
            "conversationId": request.conversationId or f"conv_{request.userId}_{int(time.time())}"
        }
    }


# ---------------- ERROR HANDLERS ---------------- #

@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail}
    )


@app.exception_handler(Exception)
async def global_exception_handler(_, exc):
    logger.exception("Unhandled exception")
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"}
    )


# ---------------- ENTRY ---------------- #

if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.environ.get("PORT", 10000))

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        log_level=settings.LOG_LEVEL.lower()
    )

