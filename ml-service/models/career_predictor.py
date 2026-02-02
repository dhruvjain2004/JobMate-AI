"""
Career Path Predictor with Skill Growth Guidance
Research Problem 2: AI-based Career Path and Skill Growth Guidance
"""
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from typing import Dict, List, Any, Tuple
import logging
from collections import Counter, defaultdict
import json

logger = logging.getLogger(__name__)


class CareerPathPredictor:
    """
    Predicts career progression and recommends skill development paths
    using clustering and classification algorithms.
    """
    
    def __init__(self):
        """Initialize the career path predictor"""
        self.kmeans = None
        self.classifier = None
        self.label_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        
        # Career progression data (in production, load from database)
        self.career_transitions = self._load_career_transitions()
        self.skill_database = self._load_skill_database()
        self.salary_data = self._load_salary_data()
        
        # Initialize models
        self._initialize_models()
    
    def _load_career_transitions(self) -> Dict[str, List[str]]:
        """
        Load typical career transition patterns
        In production, this would come from historical data
        """
        return {
            'junior developer': ['senior developer', 'full stack developer', 'backend developer'],
            'senior developer': ['tech lead', 'engineering manager', 'architect'],
            'full stack developer': ['senior full stack developer', 'tech lead', 'product engineer'],
            'backend developer': ['senior backend developer', 'backend architect', 'devops engineer'],
            'frontend developer': ['senior frontend developer', 'ui/ux engineer', 'full stack developer'],
            'data analyst': ['senior data analyst', 'data scientist', 'business intelligence analyst'],
            'data scientist': ['senior data scientist', 'ml engineer', 'data science manager'],
            'ml engineer': ['senior ml engineer', 'ml architect', 'ai researcher'],
            'devops engineer': ['senior devops engineer', 'cloud architect', 'sre'],
            'qa engineer': ['senior qa engineer', 'qa lead', 'sdet'],
            'intern': ['junior developer', 'associate engineer', 'trainee'],
            'fresher': ['junior developer', 'associate engineer', 'trainee']
        }
    
    def _load_skill_database(self) -> Dict[str, Dict[str, Any]]:
        """
        Load skill requirements for different roles
        """
        return {
            'senior developer': {
                'required_skills': ['system design', 'mentoring', 'code review', 'architecture'],
                'technical_skills': ['advanced algorithms', 'design patterns', 'performance optimization'],
                'soft_skills': ['leadership', 'communication', 'problem solving'],
                'experience_years': 5,
                'certifications': ['AWS Solutions Architect', 'Professional Scrum Master']
            },
            'tech lead': {
                'required_skills': ['team management', 'technical strategy', 'project planning'],
                'technical_skills': ['system architecture', 'scalability', 'security'],
                'soft_skills': ['leadership', 'decision making', 'stakeholder management'],
                'experience_years': 7,
                'certifications': ['PMP', 'AWS Solutions Architect Professional']
            },
            'full stack developer': {
                'required_skills': ['frontend', 'backend', 'database', 'deployment'],
                'technical_skills': ['react', 'node.js', 'mongodb', 'docker'],
                'soft_skills': ['versatility', 'quick learning', 'problem solving'],
                'experience_years': 3,
                'certifications': ['Full Stack Web Development', 'Cloud Practitioner']
            },
            'data scientist': {
                'required_skills': ['machine learning', 'statistics', 'data analysis', 'python'],
                'technical_skills': ['scikit-learn', 'tensorflow', 'pandas', 'sql'],
                'soft_skills': ['analytical thinking', 'communication', 'business acumen'],
                'experience_years': 3,
                'certifications': ['Google Data Analytics', 'AWS ML Specialty']
            },
            'ml engineer': {
                'required_skills': ['deep learning', 'mlops', 'model deployment', 'python'],
                'technical_skills': ['pytorch', 'tensorflow', 'kubernetes', 'docker'],
                'soft_skills': ['research', 'experimentation', 'collaboration'],
                'experience_years': 4,
                'certifications': ['TensorFlow Developer', 'AWS ML Specialty']
            },
            'devops engineer': {
                'required_skills': ['ci/cd', 'cloud platforms', 'automation', 'monitoring'],
                'technical_skills': ['docker', 'kubernetes', 'terraform', 'jenkins'],
                'soft_skills': ['problem solving', 'collaboration', 'reliability focus'],
                'experience_years': 3,
                'certifications': ['AWS DevOps Professional', 'CKA']
            },
            'engineering manager': {
                'required_skills': ['people management', 'strategic planning', 'budgeting'],
                'technical_skills': ['technical oversight', 'architecture review'],
                'soft_skills': ['leadership', 'communication', 'conflict resolution'],
                'experience_years': 8,
                'certifications': ['PMP', 'Leadership Training']
            }
        }
    
    def _load_salary_data(self) -> Dict[str, Dict[str, float]]:
        """
        Load salary progression data (in INR lakhs per annum)
        """
        return {
            'junior developer': {'min': 3.5, 'max': 6.0, 'avg': 4.5},
            'senior developer': {'min': 8.0, 'max': 15.0, 'avg': 11.0},
            'tech lead': {'min': 15.0, 'max': 25.0, 'avg': 20.0},
            'full stack developer': {'min': 6.0, 'max': 12.0, 'avg': 8.5},
            'data scientist': {'min': 8.0, 'max': 18.0, 'avg': 12.0},
            'ml engineer': {'min': 10.0, 'max': 20.0, 'avg': 14.0},
            'devops engineer': {'min': 7.0, 'max': 15.0, 'avg': 10.0},
            'engineering manager': {'min': 20.0, 'max': 40.0, 'avg': 28.0},
            'intern': {'min': 0.15, 'max': 0.5, 'avg': 0.3},
            'fresher': {'min': 2.5, 'max': 5.0, 'avg': 3.5}
        }
    
    def _initialize_models(self):
        """
        Initialize ML models for career prediction
        """
        # Create synthetic training data for demonstration
        training_data = self._create_synthetic_training_data()
        
        if len(training_data) > 0:
            X, y = training_data
            
            # Train classifier for role prediction
            self.classifier = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            # Encode labels
            y_encoded = self.label_encoder.fit_transform(y)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.classifier.fit(X_scaled, y_encoded)
            
            logger.info("Career prediction models initialized successfully")
    
    def _create_synthetic_training_data(self) -> Tuple[np.ndarray, List[str]]:
        """
        Create synthetic training data for model initialization
        In production, this would come from real historical data
        """
        X = []
        y = []
        
        # Generate synthetic career progression examples
        roles = list(self.skill_database.keys())
        
        for _ in range(200):
            # Random current role features
            experience = np.random.uniform(0, 15)
            num_skills = np.random.randint(3, 15)
            has_degree = np.random.choice([0, 1], p=[0.2, 0.8])
            has_cert = np.random.choice([0, 1], p=[0.6, 0.4])
            
            # Feature vector
            features = [experience, num_skills, has_degree, has_cert]
            
            # Determine next role based on experience
            if experience < 2:
                next_role = np.random.choice(['junior developer', 'full stack developer'])
            elif experience < 5:
                next_role = np.random.choice(['senior developer', 'full stack developer', 'data scientist'])
            elif experience < 8:
                next_role = np.random.choice(['tech lead', 'senior developer', 'ml engineer'])
            else:
                next_role = np.random.choice(['engineering manager', 'tech lead', 'architect'])
            
            X.append(features)
            y.append(next_role)
        
        return np.array(X), y
    
    def predict_career_path(
        self,
        current_role: str,
        skills: List[str],
        experience_years: float,
        education: str = "",
        certifications: List[str] = None
    ) -> Dict[str, Any]:
        """
        Predict next career moves and provide guidance
        
        Args:
            current_role: Current job title
            skills: List of current skills
            experience_years: Years of experience
            education: Education level
            certifications: List of certifications
        
        Returns:
            Career path predictions with recommendations
        """
        current_role_lower = current_role.lower()
        certifications = certifications or []
        
        # Get possible transitions
        possible_roles = self._get_possible_transitions(current_role_lower, experience_years)
        
        # Predict using ML model
        ml_predictions = self._predict_with_ml(
            experience_years,
            len(skills),
            1 if education else 0,
            1 if certifications else 0
        )
        
        # Combine rule-based and ML predictions
        predicted_roles = self._combine_predictions(possible_roles, ml_predictions)
        
        # Analyze each predicted role
        role_analyses = []
        for role_info in predicted_roles[:5]:  # Top 5 predictions
            role = role_info['role']
            analysis = self._analyze_role_fit(
                role, skills, experience_years, certifications
            )
            role_analyses.append({
                **role_info,
                **analysis
            })
        
        # Generate learning path
        learning_path = self._generate_learning_path(
            current_role_lower,
            predicted_roles[0]['role'] if predicted_roles else current_role_lower,
            skills
        )
        
        # Calculate salary growth
        salary_growth = self._calculate_salary_growth(
            current_role_lower,
            predicted_roles[0]['role'] if predicted_roles else current_role_lower
        )
        
        return {
            'current_role': current_role,
            'predicted_roles': role_analyses,
            'learning_path': learning_path,
            'salary_growth': salary_growth,
            'timeline': self._estimate_timeline(experience_years, predicted_roles[0]['role'] if predicted_roles else ''),
            'recommendations': self._generate_career_recommendations(
                current_role_lower, predicted_roles, skills, experience_years
            )
        }
    
    def _get_possible_transitions(
        self,
        current_role: str,
        experience_years: float
    ) -> List[Dict[str, Any]]:
        """
        Get possible career transitions based on current role
        """
        transitions = []
        
        # Direct transitions from career map
        if current_role in self.career_transitions:
            for next_role in self.career_transitions[current_role]:
                transitions.append({
                    'role': next_role,
                    'probability': 0.7,
                    'source': 'career_map'
                })
        
        # Experience-based suggestions
        if experience_years >= 5:
            senior_roles = ['senior developer', 'tech lead', 'senior data scientist']
            for role in senior_roles:
                if not any(t['role'] == role for t in transitions):
                    transitions.append({
                        'role': role,
                        'probability': 0.5,
                        'source': 'experience'
                    })
        
        return transitions
    
    def _predict_with_ml(
        self,
        experience: float,
        num_skills: int,
        has_degree: int,
        has_cert: int
    ) -> List[Dict[str, Any]]:
        """
        Use ML model to predict next roles
        """
        if self.classifier is None:
            return []
        
        try:
            # Prepare features
            features = np.array([[experience, num_skills, has_degree, has_cert]])
            features_scaled = self.scaler.transform(features)
            
            # Get prediction probabilities
            probabilities = self.classifier.predict_proba(features_scaled)[0]
            
            # Get top predictions
            top_indices = np.argsort(probabilities)[-5:][::-1]
            
            predictions = []
            for idx in top_indices:
                role = self.label_encoder.inverse_transform([idx])[0]
                prob = probabilities[idx]
                predictions.append({
                    'role': role,
                    'probability': float(prob),
                    'source': 'ml_model'
                })
            
            return predictions
        except Exception as e:
            logger.error(f"ML prediction error: {e}")
            return []
    
    def _combine_predictions(
        self,
        rule_based: List[Dict[str, Any]],
        ml_based: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Combine rule-based and ML predictions
        """
        combined = {}
        
        # Add rule-based predictions
        for pred in rule_based:
            role = pred['role']
            combined[role] = {
                'role': role,
                'probability': pred['probability'],
                'confidence': 'high' if pred['probability'] > 0.6 else 'medium'
            }
        
        # Merge ML predictions
        for pred in ml_based:
            role = pred['role']
            if role in combined:
                # Average probabilities
                combined[role]['probability'] = (
                    combined[role]['probability'] + pred['probability']
                ) / 2
            else:
                combined[role] = {
                    'role': role,
                    'probability': pred['probability'] * 0.8,  # Slightly lower weight
                    'confidence': 'medium'
                }
        
        # Sort by probability
        sorted_predictions = sorted(
            combined.values(),
            key=lambda x: x['probability'],
            reverse=True
        )
        
        return sorted_predictions
    
    def _analyze_role_fit(
        self,
        target_role: str,
        current_skills: List[str],
        experience_years: float,
        certifications: List[str]
    ) -> Dict[str, Any]:
        """
        Analyze how well candidate fits target role
        """
        if target_role not in self.skill_database:
            return {
                'skill_gaps': [],
                'matched_skills': [],
                'readiness_score': 0.5,
                'required_certifications': []
            }
        
        role_data = self.skill_database[target_role]
        required_skills = (
            role_data['required_skills'] +
            role_data['technical_skills']
        )
        
        # Calculate skill match
        current_skills_lower = [s.lower() for s in current_skills]
        matched_skills = [
            skill for skill in required_skills
            if skill.lower() in current_skills_lower
        ]
        
        skill_gaps = [
            skill for skill in required_skills
            if skill.lower() not in current_skills_lower
        ]
        
        # Calculate readiness score
        skill_score = len(matched_skills) / max(len(required_skills), 1)
        experience_score = min(1.0, experience_years / role_data['experience_years'])
        cert_score = 0.5 if certifications else 0.0
        
        readiness_score = (
            0.5 * skill_score +
            0.3 * experience_score +
            0.2 * cert_score
        )
        
        return {
            'skill_gaps': skill_gaps[:10],
            'matched_skills': matched_skills,
            'readiness_score': round(readiness_score * 100, 2),
            'required_certifications': role_data['certifications'],
            'required_experience': role_data['experience_years']
        }
    
    def _generate_learning_path(
        self,
        current_role: str,
        target_role: str,
        current_skills: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Generate step-by-step learning path
        """
        if target_role not in self.skill_database:
            return []
        
        role_data = self.skill_database[target_role]
        required_skills = role_data['required_skills'] + role_data['technical_skills']
        
        current_skills_lower = [s.lower() for s in current_skills]
        skill_gaps = [
            skill for skill in required_skills
            if skill.lower() not in current_skills_lower
        ]
        
        # Prioritize skills
        learning_path = []
        for i, skill in enumerate(skill_gaps[:8]):
            learning_path.append({
                'step': i + 1,
                'skill': skill,
                'priority': 'High' if i < 3 else 'Medium' if i < 6 else 'Low',
                'estimated_time': f"{np.random.randint(1, 4)} months",
                'resources': self._get_learning_resources(skill),
                'reason': self._get_skill_importance(skill, target_role)
            })
        
        return learning_path
    
    def _get_learning_resources(self, skill: str) -> List[str]:
        """
        Get learning resources for a skill
        """
        resource_map = {
            'system design': ['System Design Primer', 'Designing Data-Intensive Applications'],
            'docker': ['Docker Mastery Course', 'Official Docker Documentation'],
            'kubernetes': ['Kubernetes in Action', 'CKA Certification Course'],
            'machine learning': ['Coursera ML Specialization', 'Fast.ai Course'],
            'react': ['React Official Tutorial', 'Epic React by Kent C. Dodds'],
            'python': ['Python Crash Course', 'Automate the Boring Stuff'],
            'aws': ['AWS Solutions Architect Course', 'AWS Documentation'],
            'mentoring': ['The Manager\'s Path', 'Leadership Training'],
            'code review': ['Code Review Best Practices', 'Google Engineering Practices']
        }
        
        skill_lower = skill.lower()
        for key in resource_map:
            if key in skill_lower:
                return resource_map[key]
        
        return [f"{skill} Online Course", f"{skill} Documentation", f"{skill} Tutorial"]
    
    def _get_skill_importance(self, skill: str, role: str) -> str:
        """
        Explain why a skill is important for the role
        """
        importance_map = {
            'system design': f"Critical for {role} to architect scalable solutions",
            'docker': f"Essential for modern {role} deployment workflows",
            'kubernetes': f"Required for {role} to manage containerized applications",
            'mentoring': f"Key leadership skill for {role} position",
            'machine learning': f"Core competency for {role} in AI/ML projects"
        }
        
        skill_lower = skill.lower()
        for key in importance_map:
            if key in skill_lower:
                return importance_map[key]
        
        return f"Important skill for {role} role"
    
    def _calculate_salary_growth(
        self,
        current_role: str,
        target_role: str
    ) -> Dict[str, Any]:
        """
        Calculate expected salary growth
        """
        current_salary = self.salary_data.get(
            current_role,
            {'min': 5.0, 'max': 10.0, 'avg': 7.5}
        )
        
        target_salary = self.salary_data.get(
            target_role,
            {'min': 8.0, 'max': 15.0, 'avg': 11.0}
        )
        
        growth_percentage = (
            (target_salary['avg'] - current_salary['avg']) / current_salary['avg']
        ) * 100
        
        return {
            'current_salary_range': f"₹{current_salary['min']}-{current_salary['max']} LPA",
            'target_salary_range': f"₹{target_salary['min']}-{target_salary['max']} LPA",
            'expected_growth': f"+{round(growth_percentage, 1)}%",
            'absolute_increase': f"₹{round(target_salary['avg'] - current_salary['avg'], 1)} LPA"
        }
    
    def _estimate_timeline(self, current_experience: float, target_role: str) -> str:
        """
        Estimate timeline to reach target role
        """
        if target_role not in self.skill_database:
            return "2-3 years"
        
        required_experience = self.skill_database[target_role]['experience_years']
        gap = max(0, required_experience - current_experience)
        
        if gap <= 1:
            return "6-12 months"
        elif gap <= 2:
            return "1-2 years"
        elif gap <= 4:
            return "2-3 years"
        else:
            return "3-5 years"
    
    def _generate_career_recommendations(
        self,
        current_role: str,
        predicted_roles: List[Dict[str, Any]],
        skills: List[str],
        experience: float
    ) -> List[str]:
        """
        Generate actionable career recommendations
        """
        recommendations = []
        
        if predicted_roles:
            top_role = predicted_roles[0]['role']
            recommendations.append(
                f"Focus on transitioning to {top_role} - highest probability match"
            )
        
        if experience < 3:
            recommendations.append(
                "Build strong foundational skills in your current role"
            )
            recommendations.append(
                "Work on 2-3 significant projects to demonstrate expertise"
            )
        elif experience < 6:
            recommendations.append(
                "Start taking on leadership responsibilities"
            )
            recommendations.append(
                "Mentor junior team members to build leadership skills"
            )
        else:
            recommendations.append(
                "Consider management or senior technical tracks"
            )
            recommendations.append(
                "Build strategic thinking and business acumen"
            )
        
        if len(skills) < 8:
            recommendations.append(
                "Expand your skill set - aim for 10-15 relevant skills"
            )
        
        recommendations.append(
            "Network with professionals in your target role"
        )
        
        recommendations.append(
            "Keep your resume and LinkedIn profile updated"
        )
        
        return recommendations
