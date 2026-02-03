"""
Job Matching Engine with Explainability
Research Problem 1: Explainable AI for Job Matching
(Render-safe, no spaCy)
"""

import re
import logging
from typing import Dict, List, Tuple, Any

import numpy as np
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Download NLTK data safely (only first run)
nltk.download("punkt", quiet=True)
nltk.download("stopwords", quiet=True)


class JobMatcher:
    """
    Intelligent job matching system with explainability.
    Uses TF-IDF + rules (Render-safe).
    """

    def __init__(self):
        self.stop_words = set(stopwords.words("english"))

        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=500,
            ngram_range=(1, 2),
            stop_words="english"
        )

        self.tech_skills = {
            "python", "java", "javascript", "react", "angular", "vue",
            "node", "express", "django", "flask", "fastapi",
            "mongodb", "postgresql", "mysql",
            "docker", "kubernetes", "aws", "azure", "gcp",
            "git", "ci/cd", "machine learning", "deep learning",
            "html", "css", "typescript", "c++", "c#", "go"
        }

    # ---------------- TEXT UTILITIES ---------------- #

    def extract_text_from_resume(self, text: str) -> str:
        text = re.sub(r"\s+", " ", text)
        text = re.sub(r"[^\w\s\.\,\-\+\#]", "", text)
        return text.strip()

    def tokenize(self, text: str) -> List[str]:
        return [
            w.lower()
            for w in word_tokenize(text)
            if w.isalpha() and w.lower() not in self.stop_words
        ]

    # ---------------- SKILL EXTRACTION ---------------- #

    def extract_skills(self, text: str) -> List[str]:
        tokens = set(self.tokenize(text))
        extracted = set()

        for skill in self.tech_skills:
            if skill in text.lower():
                extracted.add(skill)

        extracted.update(tokens.intersection(self.tech_skills))
        return list(extracted)

    # ---------------- EXPERIENCE ---------------- #

    def extract_experience_years(self, text: str) -> float:
        patterns = [
            r"(\d+)\+?\s*years?\s+experience",
            r"experience[:\s]+(\d+)\+?\s*years",
            r"(\d+)\+?\s*yrs?\s+experience",
        ]
        for p in patterns:
            m = re.search(p, text.lower())
            if m:
                return float(m.group(1))
        return 0.0

    # ---------------- MATCHING LOGIC ---------------- #

    def calculate_skill_match(
        self,
        resume_skills: List[str],
        job_skills: List[str]
    ) -> Tuple[float, List[str], List[str]]:

        resume_set = set(s.lower() for s in resume_skills)
        job_set = set(s.lower() for s in job_skills)

        matched = list(resume_set.intersection(job_set))
        missing = list(job_set - resume_set)

        score = len(matched) / max(len(job_set), 1)
        return score, matched, missing

    def calculate_experience_score(self, candidate: float, required: float) -> float:
        if required == 0:
            return 1.0
        return min(candidate / required, 1.0)

    def calculate_tfidf_similarity(self, resume: str, job: str) -> float:
        tfidf = self.tfidf_vectorizer.fit_transform([resume, job])
        return float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])

    # ---------------- MAIN MATCH ---------------- #

    def match_job(
        self,
        resume_text: str,
        job_description: str,
        job_skills: List[str],
        required_experience: float = 0.0,
        job_title: str = ""
    ) -> Dict[str, Any]:

        resume_clean = self.extract_text_from_resume(resume_text)

        resume_skills = self.extract_skills(resume_clean)
        experience = self.extract_experience_years(resume_clean)

        skill_score, matched, missing = self.calculate_skill_match(
            resume_skills, job_skills
        )
        exp_score = self.calculate_experience_score(experience, required_experience)
        tfidf_score = self.calculate_tfidf_similarity(resume_clean, job_description)

        weights = {"skills": 0.5, "experience": 0.25, "tfidf": 0.25}

        overall = (
            weights["skills"] * skill_score +
            weights["experience"] * exp_score +
            weights["tfidf"] * tfidf_score
        )

        return {
            "overall_match_score": round(overall * 100, 2),
            "skill_match_score": round(skill_score * 100, 2),
            "experience_match_score": round(exp_score * 100, 2),
            "tfidf_similarity_score": round(tfidf_score * 100, 2),
            "matched_skills": matched,
            "missing_skills": missing,
            "candidate_experience_years": experience,
            "required_experience_years": required_experience,
            "explanation": self.generate_explanation(
                overall, matched, missing, experience, required_experience, job_title
            )
        }

    # ---------------- EXPLAINABILITY ---------------- #

    def generate_explanation(
        self,
        score: float,
        matched: List[str],
        missing: List[str],
        candidate_exp: float,
        required_exp: float,
        job_title: str
    ) -> str:

        lines = []

        if score >= 0.75:
            lines.append(f"🎯 Strong match for {job_title}.")
        elif score >= 0.5:
            lines.append("✅ Moderate match with some gaps.")
        else:
            lines.append("❌ Low match. Significant improvements needed.")

        if matched:
            lines.append(f"Matched skills: {', '.join(matched[:10])}")

        if missing:
            lines.append(f"Missing skills: {', '.join(missing[:10])}")

        if candidate_exp < required_exp:
            lines.append(
                f"Experience gap: {required_exp - candidate_exp} year(s)."
            )

        return "\n".join(lines)
