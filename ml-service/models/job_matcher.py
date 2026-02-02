"""
Job Matching Engine with Explainability
Research Problem 1: Explainable AI for Job Matching
"""
import spacy
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestClassifier
import shap
from lime.lime_text import LimeTextExplainer
from typing import Dict, List, Tuple, Any
import re
from collections import Counter
import logging

logger = logging.getLogger(__name__)


class JobMatcher:
    """
    Intelligent job matching system with explainability features.
    Uses NLP, TF-IDF, and ML to match candidates with jobs.
    """
    
    def __init__(self, spacy_model: str = "en_core_web_md"):
        """Initialize the job matcher with NLP models"""
        try:
            self.nlp = spacy.load(spacy_model)
            logger.info(f"Loaded spaCy model: {spacy_model}")
        except OSError:
            logger.warning(f"Model {spacy_model} not found. Downloading...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", spacy_model])
            self.nlp = spacy.load(spacy_model)
        
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=500,
            ngram_range=(1, 2),
            stop_words='english'
        )
        
        # For explainability
        self.classifier = None
        self.lime_explainer = LimeTextExplainer(class_names=['Not Match', 'Match'])
        
        # Common tech skills for better extraction
        self.tech_skills = {
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
            'express', 'django', 'flask', 'fastapi', 'mongodb', 'postgresql',
            'mysql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
            'git', 'ci/cd', 'agile', 'scrum', 'machine learning', 'deep learning',
            'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
            'html', 'css', 'typescript', 'c++', 'c#', 'go', 'rust', 'swift',
            'kotlin', 'spring boot', 'microservices', 'rest api', 'graphql'
        }
    
    def extract_text_from_resume(self, resume_text: str) -> str:
        """Clean and preprocess resume text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', resume_text)
        # Remove special characters but keep important ones
        text = re.sub(r'[^\w\s\.\,\-\+\#]', '', text)
        return text.strip()
    
    def extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from text using NLP and pattern matching
        """
        text_lower = text.lower()
        doc = self.nlp(text_lower)
        
        extracted_skills = set()
        
        # Method 1: Direct matching with known skills
        for skill in self.tech_skills:
            if skill in text_lower:
                extracted_skills.add(skill)
        
        # Method 2: NER for organizations and products (often skills)
        for ent in doc.ents:
            if ent.label_ in ['ORG', 'PRODUCT', 'GPE']:
                skill_candidate = ent.text.lower()
                if len(skill_candidate) > 2:
                    extracted_skills.add(skill_candidate)
        
        # Method 3: Noun chunks that might be skills
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.lower()
            # Check if it's a potential technical term
            if any(tech in chunk_text for tech in ['development', 'programming', 
                                                     'framework', 'database', 'tool']):
                extracted_skills.add(chunk_text)
        
        return list(extracted_skills)
    
    def extract_experience_years(self, text: str) -> float:
        """
        Extract years of experience from resume text
        """
        patterns = [
            r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
            r'experience[:\s]+(\d+)\+?\s*years?',
            r'(\d+)\+?\s*yrs?\s+(?:of\s+)?experience',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return float(match.group(1))
        
        return 0.0
    
    def calculate_skill_match(
        self, 
        resume_skills: List[str], 
        job_skills: List[str]
    ) -> Tuple[float, List[str], List[str]]:
        """
        Calculate skill match percentage and identify matched/missing skills
        
        Returns:
            - match_score: 0-1 score
            - matched_skills: list of matched skills
            - missing_skills: list of missing skills
        """
        resume_skills_set = set(skill.lower() for skill in resume_skills)
        job_skills_set = set(skill.lower() for skill in job_skills)
        
        # Exact matches
        matched_skills = list(resume_skills_set.intersection(job_skills_set))
        missing_skills = list(job_skills_set - resume_skills_set)
        
        # Semantic similarity for partial matches
        if len(missing_skills) > 0 and len(resume_skills) > 0:
            semantic_matches = []
            remaining_missing = []
            
            for missing_skill in missing_skills:
                missing_doc = self.nlp(missing_skill)
                max_similarity = 0.0
                
                for resume_skill in resume_skills:
                    resume_doc = self.nlp(resume_skill)
                    similarity = missing_doc.similarity(resume_doc)
                    max_similarity = max(max_similarity, similarity)
                
                # If semantic similarity is high, consider it a partial match
                if max_similarity > 0.7:
                    semantic_matches.append(missing_skill)
                else:
                    remaining_missing.append(missing_skill)
            
            matched_skills.extend(semantic_matches)
            missing_skills = remaining_missing
        
        # Calculate score
        if len(job_skills_set) == 0:
            match_score = 1.0
        else:
            match_score = len(matched_skills) / len(job_skills_set)
        
        return match_score, matched_skills, missing_skills
    
    def calculate_experience_score(
        self, 
        candidate_experience: float, 
        required_experience: float
    ) -> float:
        """
        Calculate experience match score
        """
        if required_experience == 0:
            return 1.0
        
        if candidate_experience >= required_experience:
            return 1.0
        else:
            # Partial credit for partial experience
            return candidate_experience / required_experience
    
    def calculate_tfidf_similarity(
        self, 
        resume_text: str, 
        job_description: str
    ) -> float:
        """
        Calculate TF-IDF based cosine similarity
        """
        try:
            documents = [resume_text, job_description]
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(documents)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except Exception as e:
            logger.error(f"TF-IDF similarity calculation error: {e}")
            return 0.0
    
    def match_job(
        self,
        resume_text: str,
        job_description: str,
        job_skills: List[str],
        required_experience: float = 0.0,
        job_title: str = ""
    ) -> Dict[str, Any]:
        """
        Main matching function that combines all scoring methods
        
        Returns comprehensive match analysis with explainability
        """
        # Preprocess texts
        resume_clean = self.extract_text_from_resume(resume_text)
        
        # Extract features
        resume_skills = self.extract_skills(resume_clean)
        candidate_experience = self.extract_experience_years(resume_clean)
        
        # Calculate individual scores
        skill_score, matched_skills, missing_skills = self.calculate_skill_match(
            resume_skills, job_skills
        )
        
        experience_score = self.calculate_experience_score(
            candidate_experience, required_experience
        )
        
        tfidf_score = self.calculate_tfidf_similarity(resume_clean, job_description)
        
        # Weighted overall score
        weights = {
            'skills': 0.50,
            'experience': 0.25,
            'tfidf': 0.25
        }
        
        overall_score = (
            weights['skills'] * skill_score +
            weights['experience'] * experience_score +
            weights['tfidf'] * tfidf_score
        )
        
        # Generate human-readable explanation
        explanation = self._generate_explanation(
            overall_score=overall_score,
            skill_score=skill_score,
            experience_score=experience_score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            candidate_experience=candidate_experience,
            required_experience=required_experience,
            job_title=job_title
        )
        
        # Calculate ATS score
        ats_score = self._calculate_ats_score(resume_clean, job_skills)
        
        return {
            'overall_match_score': round(overall_score * 100, 2),
            'skill_match_score': round(skill_score * 100, 2),
            'experience_match_score': round(experience_score * 100, 2),
            'tfidf_similarity_score': round(tfidf_score * 100, 2),
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'candidate_experience_years': candidate_experience,
            'required_experience_years': required_experience,
            'experience_gap': max(0, required_experience - candidate_experience),
            'ats_score': ats_score,
            'explanation': explanation,
            'recommendation': self._generate_recommendation(
                overall_score, missing_skills, candidate_experience, required_experience
            ),
            'feature_weights': weights
        }
    
    def _calculate_ats_score(self, resume_text: str, job_skills: List[str]) -> float:
        """
        Calculate ATS (Applicant Tracking System) score
        Based on keyword density, formatting, and completeness
        """
        score = 0.0
        
        # 1. Keyword density (40 points)
        keyword_count = sum(1 for skill in job_skills if skill.lower() in resume_text.lower())
        keyword_score = min(40, (keyword_count / max(len(job_skills), 1)) * 40)
        score += keyword_score
        
        # 2. Resume sections (30 points)
        sections = ['experience', 'education', 'skills', 'projects']
        section_score = sum(10 for section in sections if section in resume_text.lower())
        score += min(30, section_score)
        
        # 3. Length appropriateness (15 points)
        word_count = len(resume_text.split())
        if 300 <= word_count <= 1000:
            score += 15
        elif 200 <= word_count < 300 or 1000 < word_count <= 1500:
            score += 10
        else:
            score += 5
        
        # 4. Formatting indicators (15 points)
        has_bullets = '•' in resume_text or '-' in resume_text
        has_dates = bool(re.search(r'\d{4}', resume_text))
        has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', resume_text))
        
        if has_bullets:
            score += 5
        if has_dates:
            score += 5
        if has_email:
            score += 5
        
        return round(score, 2)
    
    def _generate_explanation(
        self,
        overall_score: float,
        skill_score: float,
        experience_score: float,
        matched_skills: List[str],
        missing_skills: List[str],
        candidate_experience: float,
        required_experience: float,
        job_title: str
    ) -> str:
        """
        Generate human-readable explanation of the match
        """
        explanation_parts = []
        
        # Overall assessment
        if overall_score >= 0.8:
            explanation_parts.append(
                f"🎯 Excellent match! Your profile strongly aligns with the {job_title} position."
            )
        elif overall_score >= 0.6:
            explanation_parts.append(
                f"✅ Good match! You meet most requirements for the {job_title} position."
            )
        elif overall_score >= 0.4:
            explanation_parts.append(
                f"⚠️ Moderate match. You have some relevant qualifications but may need to strengthen your profile."
            )
        else:
            explanation_parts.append(
                f"❌ Limited match. Significant gaps exist between your profile and the requirements."
            )
        
        # Skills analysis
        if matched_skills:
            explanation_parts.append(
                f"\n✨ Matched Skills ({len(matched_skills)}): {', '.join(matched_skills[:10])}"
            )
        
        if missing_skills:
            explanation_parts.append(
                f"\n📚 Skills to Develop ({len(missing_skills)}): {', '.join(missing_skills[:10])}"
            )
        
        # Experience analysis
        if candidate_experience >= required_experience:
            explanation_parts.append(
                f"\n💼 Experience: You have {candidate_experience} years, meeting the {required_experience} years requirement."
            )
        else:
            gap = required_experience - candidate_experience
            explanation_parts.append(
                f"\n⏰ Experience Gap: You have {candidate_experience} years but {required_experience} years are required ({gap} years short)."
            )
        
        return "\n".join(explanation_parts)
    
    def _generate_recommendation(
        self,
        overall_score: float,
        missing_skills: List[str],
        candidate_experience: float,
        required_experience: float
    ) -> List[str]:
        """
        Generate actionable recommendations
        """
        recommendations = []
        
        if overall_score >= 0.7:
            recommendations.append("Apply now! Your profile is a strong match.")
            recommendations.append("Highlight your matching skills prominently in your application.")
        else:
            if missing_skills:
                recommendations.append(
                    f"Consider learning: {', '.join(missing_skills[:5])}"
                )
                recommendations.append(
                    "Take online courses or work on projects to build these skills."
                )
            
            if candidate_experience < required_experience:
                gap = required_experience - candidate_experience
                recommendations.append(
                    f"Gain {gap} more years of relevant experience or highlight transferable skills."
                )
            
            recommendations.append(
                "Tailor your resume to emphasize relevant experience and skills."
            )
        
        return recommendations
    
    def explain_with_shap(
        self,
        resume_text: str,
        job_description: str,
        training_data: List[Tuple[str, str, int]] = None
    ) -> Dict[str, Any]:
        """
        Generate SHAP-based explanations (requires trained model)
        
        Args:
            resume_text: Candidate resume
            job_description: Job description
            training_data: List of (resume, job_desc, label) tuples for training
        
        Returns:
            SHAP values and explanations
        """
        # This is a simplified version - in production, you'd have pre-trained models
        # For research purposes, we'll create a simple demonstration
        
        if training_data and len(training_data) > 10:
            # Train a simple classifier
            X_texts = [f"{resume} {job}" for resume, job, _ in training_data]
            y = [label for _, _, label in training_data]
            
            X_tfidf = self.tfidf_vectorizer.fit_transform(X_texts)
            
            self.classifier = RandomForestClassifier(n_estimators=50, random_state=42)
            self.classifier.fit(X_tfidf.toarray(), y)
            
            # Generate SHAP values
            explainer = shap.TreeExplainer(self.classifier)
            test_text = f"{resume_text} {job_description}"
            test_tfidf = self.tfidf_vectorizer.transform([test_text])
            
            shap_values = explainer.shap_values(test_tfidf.toarray())
            
            # Get feature names and their importance
            feature_names = self.tfidf_vectorizer.get_feature_names_out()
            
            # Get top features
            if len(shap_values.shape) > 2:
                shap_vals = shap_values[0][0]  # For binary classification
            else:
                shap_vals = shap_values[0]
            
            top_indices = np.argsort(np.abs(shap_vals))[-10:]
            top_features = [
                {
                    'feature': feature_names[i],
                    'importance': float(shap_vals[i])
                }
                for i in top_indices
            ]
            
            return {
                'shap_available': True,
                'top_features': top_features,
                'explanation': 'SHAP analysis shows the most influential terms in the matching decision.'
            }
        
        return {
            'shap_available': False,
            'explanation': 'SHAP analysis requires training data. Using rule-based explanations instead.'
        }
    
    def explain_with_lime(
        self,
        resume_text: str,
        job_description: str
    ) -> Dict[str, Any]:
        """
        Generate LIME-based explanations
        """
        if self.classifier is None:
            return {
                'lime_available': False,
                'explanation': 'LIME requires a trained classifier. Using rule-based explanations.'
            }
        
        # Prediction function for LIME
        def predict_proba(texts):
            tfidf = self.tfidf_vectorizer.transform(texts)
            return self.classifier.predict_proba(tfidf.toarray())
        
        # Generate explanation
        combined_text = f"{resume_text} {job_description}"
        exp = self.lime_explainer.explain_instance(
            combined_text,
            predict_proba,
            num_features=10
        )
        
        return {
            'lime_available': True,
            'explanation': exp.as_list(),
            'interpretation': 'LIME shows which words most influenced the matching decision.'
        }
