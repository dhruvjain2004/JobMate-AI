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


def get_job_matcher() -> JobMatcher:
    global job_matcher
    if job_matcher is None:
        logger.info("Initializing JobMatcher (NLTK-based)")
        job_matcher = JobMatcher()   # ✅ NO ARGUMENTS
    return job_matcher


def get_career_predictor() -> CareerPathPredictor:
    global career_predictor
    if career_predictor is None:
        logger.info("Initializing CareerPathPredictor")
        career_predictor = CareerPathPredictor()
    return career_predictor


# ---------------- SECURITY ---------------- #


def _is_shared_secret_placeholder() -> bool:
    s = (settings.SHARED_SECRET or "").lower()
    return s.startswith("your") or "shared-secret" in s or len(s) < 16


def verify_request_signature(
    x_signature: Optional[str] = Header(None),
    x_timestamp: Optional[str] = Header(None)
) -> bool:

    logger.debug("verify_request_signature called - X-Signature present: %s, X-Timestamp: %s", bool(x_signature), x_timestamp)

    # Only skip verification in development to avoid bypassing production checks
    if settings.ENVIRONMENT == "development":
        logger.debug("verify_request_signature - development environment; skipping verification")
        return True

    if not x_signature or not x_timestamp:
        logger.warning("verify_request_signature - missing headers. X-Signature: %s, X-Timestamp: %s", x_signature, x_timestamp)
        raise HTTPException(status_code=401, detail="Missing auth headers (X-Signature / X-Timestamp)")

    expected = hmac.new(
        settings.SHARED_SECRET.encode(),
        x_timestamp.encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, x_signature):
        logger.warning(
            "verify_request_signature - signature mismatch. received_prefix=%s expected_prefix=%s timestamp=%s",
            (x_signature[:8] if x_signature else None), expected[:8], x_timestamp
        )
        # Expose a clear but non-sensitive message
        raise HTTPException(status_code=401, detail="Invalid signature. Check SHARED_SECRET configuration on both services.")

    logger.debug("verify_request_signature - signature valid")
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

    # Optional structured fields to support explainability & career guidance
    resumeText: Optional[str] = None
    jobDescription: Optional[str] = None
    jobSkills: Optional[List[str]] = None
    requiredExperience: Optional[float] = None
    jobTitle: Optional[str] = None

    currentRole: Optional[str] = None
    skills: Optional[List[str]] = None
    experienceYears: Optional[float] = None
    education: Optional[str] = None
    certifications: Optional[List[str]] = None


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
        "environment": settings.ENVIRONMENT,
        "signature_required": settings.ENVIRONMENT != "development",
        "shared_secret_configured": not _is_shared_secret_placeholder()
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
    """Conversational entrypoint. Supports:
    - Explainable job match when resume+job details are provided and user asks why rejected.
    - Career guidance when user asks about next roles ("What should I do after Java Developer?")
    - Fallback conversational responses.

    Returns both a human-friendly `response` string and a structured `details` object when available.
    """
    msg = (request.message or "").lower()

    # 1) Explainable AI for job matching
    explain_triggers = ["why", "rejected", "not shortlisted", "not shortlisted", "shortlist", "shortlisted", "why wasn't i shortlisted", "why was i rejected"]

    if any(t in msg for t in explain_triggers):
        # Check for required structured inputs
        if request.resumeText and request.jobDescription and request.jobSkills:
            try:
                matcher = get_job_matcher()
                result = matcher.match_job(
                    resume_text=request.resumeText,
                    job_description=request.jobDescription,
                    job_skills=request.jobSkills or [],
                    required_experience=request.requiredExperience or 0.0,
                    job_title=request.jobTitle or ""
                )

                # Construct a conversational summary
                lines = []
                lines.append(result.get("explanation", "Here is a quick analysis:"))
                lines.append(f"Resume score: {result.get('overall_match_score')}%")
                if result.get("missing_skills"):
                    lines.append(f"Skill gap: {', '.join(result.get('missing_skills'))}")
                if result.get("candidate_experience_years", 0) < result.get("required_experience_years", 0):
                    exp_gap = round(result.get("required_experience_years") - result.get("candidate_experience_years"), 1)
                    lines.append(f"Experience gap: Required {result.get('required_experience_years')}y, you have {result.get('candidate_experience_years')}y (gap {exp_gap}y)")

                suggested_actions = []
                if result.get("missing_skills"):
                    suggested_actions.append(f"Add projects/courses or obtain certifications for: {', '.join(result.get('missing_skills')[:5])}")
                if result.get("candidate_experience_years", 0) < result.get("required_experience_years", 0):
                    suggested_actions.append("Gain practical experience through projects or internships to reach required experience.")

                if suggested_actions:
                    lines.append("Suggested actions: " + "; ".join(suggested_actions))

                response = "\n".join(lines)

                return {
                    "success": True,
                    "data": {
                        "response": response,
                        "intent": "explain_match",
                        "details": result,
                        "conversationId": request.conversationId or f"conv_{request.userId}_{int(time.time())}"
                    }
                }
            except Exception as e:
                logger.exception("Explain match failed in chat")
                raise HTTPException(status_code=500, detail=str(e))
        else:
            return {
                "success": True,
                "data": {
                    "response": "To explain why you weren't shortlisted I need your resume text and the job description (or job skills / required experience). Please provide them and try again.",
                    "intent": "explain_match",
                    "conversationId": request.conversationId or f"conv_{request.userId}_{int(time.time())}"
                }
            }

    # 2) Career Path guidance
    career_triggers = ["what should i do after", "what next after", "what should i do next", "career guidance", "what should i do"]
    if any(t in msg for t in career_triggers) or "after" in msg:
        # try to parse role from message
        import re
        match = re.search(r"after ([\w\s]+)\??", msg)
        role_candidate = None
        if match:
            role_candidate = match.group(1).strip()

        current_role = (request.currentRole or role_candidate or "").strip()
        skills = request.skills or request.context.get("skills") if request.context else request.skills or []
        experience = request.experienceYears or request.context.get("experienceYears") if request.context else request.experienceYears or 0.0

        if current_role:
            try:
                try:
                    predictor = get_career_predictor()
                except NameError:
                    # Fallback: if the helper isn't available (deployment edge case), instantiate directly
                    logger.warning("get_career_predictor not available; instantiating CareerPathPredictor directly")
                    from models.career_predictor import CareerPathPredictor
                    predictor = CareerPathPredictor()
                    # ensure global cache is populated for subsequent requests
                    global career_predictor
                    career_predictor = predictor

                result = predictor.predict_career_path(
                    current_role=current_role,
                    skills=skills or [],
                    experience_years=experience,
                    education=request.education or "",
                    certifications=request.certifications or []
                )

                # build conversational response
                top_roles = ", ".join([r["role"] for r in result.get("predicted_roles", [])[:3]]) or "Similar senior roles"
                top_skills = ", ".join([s["skill"] for s in result.get("learning_path", [])[:5]]) or "Expand technical skills like AWS, Docker"
                salary = result.get("salary_growth", {})
                salary_line = f"Salary growth: +{salary.get('growth_percent')}% (from {salary.get('current_avg_lpa')} LPA to {salary.get('target_avg_lpa')} LPA)"

                response_lines = [
                    f"Suggested next roles: {top_roles}",
                    f"Skills to work on: {top_skills}",
                    salary_line,
                    f"Timeline: {result.get('timeline')}",
                ]
                if result.get("recommendations"):
                    response_lines.append("Recommendations: " + "; ".join(result.get("recommendations")))

                response = "\n".join(response_lines)

                return {
                    "success": True,
                    "data": {
                        "response": response,
                        "intent": "career_guidance",
                        "details": result,
                        "conversationId": request.conversationId or f"conv_{request.userId}_{int(time.time())}"
                    }
                }
            except Exception as e:
                logger.exception("Career guidance failed in chat")
                raise HTTPException(status_code=500, detail=str(e))
        else:
            return {
                "success": True,
                "data": {
                    "response": "Tell me your current role (e.g., 'Java Developer') and a few of your skills or years of experience, and I can suggest next roles and a learning path.",
                    "intent": "career_guidance",
                    "conversationId": request.conversationId or f"conv_{request.userId}_{int(time.time())}"
                }
            }

    # 3) Default/fallback
    return {
        "success": True,
        "data": {
            "response": "Hi! I can help with job matching (send resume and job details to get a detailed explanation), ATS score, and career guidance (tell me your current role).",
            "intent": "general",
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

