"""
Career Path Predictor with Skill Growth Guidance (Render-safe)
Research Problem 2: AI-based Career Path and Skill Growth Guidance
"""

from typing import Dict, List, Any, Tuple
import numpy as np
import logging
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler

logger = logging.getLogger(__name__)


class CareerPathPredictor:
    """
    Predicts career progression and recommends skill development paths
    using lightweight ML + rule-based intelligence.
    """

    def __init__(self):
        self.classifier = None
        self.label_encoder = LabelEncoder()
        self.scaler = StandardScaler()

        self.career_transitions = self._load_career_transitions()
        self.skill_database = self._load_skill_database()
        self.salary_data = self._load_salary_data()

        self._initialize_models()

    # ------------------------------------------------------------------
    # Static knowledge bases
    # ------------------------------------------------------------------

    def _load_career_transitions(self) -> Dict[str, List[str]]:
        return {
            "junior developer": ["senior developer", "full stack developer", "backend developer"],
            "senior developer": ["tech lead", "engineering manager", "architect"],
            "full stack developer": ["senior full stack developer", "tech lead"],
            "backend developer": ["senior backend developer", "devops engineer"],
            "frontend developer": ["senior frontend developer", "full stack developer"],
            "data analyst": ["data scientist", "business intelligence analyst"],
            "data scientist": ["senior data scientist", "ml engineer"],
            "ml engineer": ["senior ml engineer", "ai architect"],
            "devops engineer": ["senior devops engineer", "cloud architect"],
            "intern": ["junior developer", "trainee"],
            "fresher": ["junior developer", "associate engineer"],
        }

    def _load_skill_database(self) -> Dict[str, Dict[str, Any]]:
        return {
            "senior developer": {
                "required_skills": ["system design", "mentoring", "code review"],
                "technical_skills": ["design patterns", "performance optimization"],
                "experience_years": 5,
                "certifications": ["AWS Solutions Architect"],
            },
            "tech lead": {
                "required_skills": ["technical strategy", "team leadership"],
                "technical_skills": ["scalability", "security"],
                "experience_years": 7,
                "certifications": ["PMP"],
            },
            "full stack developer": {
                "required_skills": ["frontend", "backend", "database"],
                "technical_skills": ["react", "node.js", "mongodb"],
                "experience_years": 3,
                "certifications": [],
            },
            "data scientist": {
                "required_skills": ["machine learning", "statistics"],
                "technical_skills": ["scikit-learn", "sql"],
                "experience_years": 3,
                "certifications": ["Google Data Analytics"],
            },
            "ml engineer": {
                "required_skills": ["mlops", "model deployment"],
                "technical_skills": ["docker", "tensorflow"],
                "experience_years": 4,
                "certifications": ["AWS ML Specialty"],
            },
        }

    def _load_salary_data(self) -> Dict[str, Dict[str, float]]:
        return {
            "junior developer": {"avg": 4.5},
            "senior developer": {"avg": 11.0},
            "tech lead": {"avg": 20.0},
            "full stack developer": {"avg": 8.5},
            "data scientist": {"avg": 12.0},
            "ml engineer": {"avg": 14.0},
        }

    # ------------------------------------------------------------------
    # ML setup (lightweight + optional)
    # ------------------------------------------------------------------

    def _initialize_models(self):
        X, y = self._create_synthetic_training_data()

        if not X:
            return

        X = np.array(X)
        y_encoded = self.label_encoder.fit_transform(y)
        X_scaled = self.scaler.fit_transform(X)

        self.classifier = RandomForestClassifier(
            n_estimators=50,
            max_depth=8,
            random_state=42,
        )
        self.classifier.fit(X_scaled, y_encoded)

        logger.info("CareerPathPredictor initialized")

    def _create_synthetic_training_data(self) -> Tuple[List[List[float]], List[str]]:
        X, y = [], []

        for _ in range(200):
            experience = np.random.uniform(0, 15)
            skills = np.random.randint(3, 15)
            degree = np.random.choice([0, 1])
            cert = np.random.choice([0, 1])

            X.append([experience, skills, degree, cert])

            if experience < 2:
                y.append("junior developer")
            elif experience < 5:
                y.append("full stack developer")
            elif experience < 8:
                y.append("senior developer")
            else:
                y.append("tech lead")

        return X, y

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict_career_path(
        self,
        current_role: str,
        skills: List[str],
        experience_years: float,
        education: str = "",
        certifications: List[str] | None = None,
    ) -> Dict[str, Any]:

        certifications = certifications or []
        current_role = current_role.lower()

        rule_roles = self.career_transitions.get(current_role, [])
        ml_roles = self._predict_with_ml(experience_years, len(skills), int(bool(education)), int(bool(certifications)))

        combined = self._merge_predictions(rule_roles, ml_roles)

        target_role = combined[0]["role"] if combined else current_role

        return {
            "current_role": current_role,
            "predicted_roles": combined,
            "learning_path": self._generate_learning_path(target_role, skills),
            "salary_growth": self._calculate_salary_growth(current_role, target_role),
            "timeline": self._estimate_timeline(experience_years, target_role),
            "recommendations": self._generate_recommendations(experience_years, skills),
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _predict_with_ml(self, exp, skills, degree, cert):
        if not self.classifier:
            return []

        features = self.scaler.transform([[exp, skills, degree, cert]])
        probs = self.classifier.predict_proba(features)[0]
        indices = np.argsort(probs)[-3:][::-1]

        return [
            {"role": self.label_encoder.inverse_transform([i])[0], "probability": float(probs[i])}
            for i in indices
        ]

    def _merge_predictions(self, rule_roles, ml_roles):
        merged = {}

        for r in rule_roles:
            merged[r] = {"role": r, "probability": 0.6}

        for r in ml_roles:
            role = r["role"]
            merged[role] = {
                "role": role,
                "probability": max(merged.get(role, {}).get("probability", 0), r["probability"]),
            }

        return sorted(merged.values(), key=lambda x: x["probability"], reverse=True)

    def _generate_learning_path(self, role, skills):
        if role not in self.skill_database:
            return []

        required = self.skill_database[role]["required_skills"]
        gaps = [s for s in required if s.lower() not in map(str.lower, skills)]

        return [{"skill": s, "priority": "High"} for s in gaps[:5]]

    def _calculate_salary_growth(self, current, target):
        cur = self.salary_data.get(current, {"avg": 6})
        tgt = self.salary_data.get(target, {"avg": 10})

        growth = ((tgt["avg"] - cur["avg"]) / cur["avg"]) * 100

        return {
            "current_avg_lpa": cur["avg"],
            "target_avg_lpa": tgt["avg"],
            "growth_percent": round(growth, 1),
        }

    def _estimate_timeline(self, exp, target):
        req = self.skill_database.get(target, {}).get("experience_years", 3)
        gap = max(0, req - exp)

        if gap <= 1:
            return "6–12 months"
        if gap <= 3:
            return "1–2 years"
        return "2–3 years"

    def _generate_recommendations(self, exp, skills):
        recs = []

        if exp < 3:
            recs.append("Build strong fundamentals and project experience")
        elif exp < 6:
            recs.append("Take ownership and mentor juniors")
        else:
            recs.append("Move toward leadership or architecture roles")

        if len(skills) < 8:
            recs.append("Expand skill stack to 10–15 core skills")

        return recs
