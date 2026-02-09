from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import time, hmac, hashlib, os, sys
from loguru import logger

from config import settings
from models.job_matcher import JobMatcher
from models.career_predictor import CareerPathPredictor

# ---------------- APP INIT ---------------- #

app = FastAPI(
    title="JobMate AI - ML Microservice",
    version="1.0.0"
)

@app.get("/health")
def health():
    return {"status": "ok"}

# ---------------- LOAD MODELS ONCE ---------------- #

job_matcher: Optional[JobMatcher] = None
career_predictor: Optional[CareerPathPredictor] = None

@app.on_event("startup")
def load_models():
    global job_matcher, career_predictor
    logger.info("Loading ML models...")
    job_matcher = JobMatcher()
    career_predictor = CareerPathPredictor()
    logger.info("Models loaded")

# ---------------- SECURITY ---------------- #

def verify_request_signature(
    x_signature: Optional[str] = Header(None),
    x_timestamp: Optional[str] = Header(None)
):
    if settings.ENVIRONMENT == "development":
        return True

    if not x_signature or not x_timestamp:
        raise HTTPException(401, "Missing signature headers")

    expected = hmac.new(
        settings.SHARED_SECRET.encode(),
        x_timestamp.encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, x_signature):
        raise HTTPException(401, "Invalid signature")

    return True

# ---------------- SCHEMAS ---------------- #

class ChatMessageRequest(BaseModel):
    userId: str
    message: str
    conversationId: Optional[str]
    context: Optional[Dict[str, Any]] = {}
    resumeText: Optional[str]
    jobDescription: Optional[str]
    jobSkills: Optional[List[str]]
    jobTitle: Optional[str]

# ---------------- ENDPOINT ---------------- #

@app.post("/api/ml/chat")
def chat(
    request: ChatMessageRequest,
    _: bool = Depends(verify_request_signature)
):
    msg = request.message.lower()

    if request.resumeText and request.jobDescription and request.jobSkills:
        result = job_matcher.match_job(
            resume_text=request.resumeText,
            job_description=request.jobDescription,
            job_skills=request.jobSkills,
            job_title=request.jobTitle or ""
        )

        return {
            "success": True,
            "data": {
                "response": result.get("explanation", "Here is your analysis"),
                "details": result
            }
        }

    return {
        "success": True,
        "data": {
            "response": "Hi! I can explain job matches, ATS score, and career paths."
        }
    }

# ---------------- ERROR HANDLER ---------------- #

@app.exception_handler(Exception)
async def error_handler(_, exc):
    logger.exception("Unhandled error")
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"}
    )
