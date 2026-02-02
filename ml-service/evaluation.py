"""
Evaluation Metrics and Testing Utilities
For research paper and academic publication
"""
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, mean_absolute_error,
    mean_squared_error, r2_score
)
from typing import Dict, List, Tuple, Any
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)


class ModelEvaluator:
    """
    Comprehensive evaluation framework for ML models
    """
    
    def __init__(self, model_name: str = "JobMatcher"):
        self.model_name = model_name
        self.results = {}
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    def evaluate_classification(
        self,
        y_true: List[int],
        y_pred: List[int],
        labels: List[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluate classification model performance
        
        Args:
            y_true: Ground truth labels
            y_pred: Predicted labels
            labels: Label names
        
        Returns:
            Dictionary of metrics
        """
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='weighted', zero_division=0),
            'recall': recall_score(y_true, y_pred, average='weighted', zero_division=0),
            'f1_score': f1_score(y_true, y_pred, average='weighted', zero_division=0),
        }
        
        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        metrics['confusion_matrix'] = cm.tolist()
        
        # Classification report
        if labels:
            report = classification_report(y_true, y_pred, target_names=labels, output_dict=True)
            metrics['classification_report'] = report
        
        self.results['classification'] = metrics
        return metrics
    
    def evaluate_regression(
        self,
        y_true: List[float],
        y_pred: List[float]
    ) -> Dict[str, float]:
        """
        Evaluate regression model performance
        
        Args:
            y_true: Ground truth values
            y_pred: Predicted values
        
        Returns:
            Dictionary of metrics
        """
        metrics = {
            'mae': mean_absolute_error(y_true, y_pred),
            'mse': mean_squared_error(y_true, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_true, y_pred)),
            'r2_score': r2_score(y_true, y_pred),
        }
        
        # Calculate percentage error
        mape = np.mean(np.abs((np.array(y_true) - np.array(y_pred)) / np.array(y_true))) * 100
        metrics['mape'] = mape
        
        self.results['regression'] = metrics
        return metrics
    
    def evaluate_ranking(
        self,
        y_true: List[List[int]],
        y_pred: List[List[int]],
        k: int = 5
    ) -> Dict[str, float]:
        """
        Evaluate ranking/recommendation performance
        
        Args:
            y_true: Ground truth rankings
            y_pred: Predicted rankings
            k: Top-k to consider
        
        Returns:
            Dictionary of metrics
        """
        metrics = {}
        
        # Precision@K
        precision_at_k = []
        for true, pred in zip(y_true, y_pred):
            true_set = set(true[:k])
            pred_set = set(pred[:k])
            if len(pred_set) > 0:
                precision_at_k.append(len(true_set & pred_set) / k)
        
        metrics[f'precision@{k}'] = np.mean(precision_at_k) if precision_at_k else 0.0
        
        # Recall@K
        recall_at_k = []
        for true, pred in zip(y_true, y_pred):
            true_set = set(true)
            pred_set = set(pred[:k])
            if len(true_set) > 0:
                recall_at_k.append(len(true_set & pred_set) / len(true_set))
        
        metrics[f'recall@{k}'] = np.mean(recall_at_k) if recall_at_k else 0.0
        
        # NDCG@K (Normalized Discounted Cumulative Gain)
        ndcg_scores = []
        for true, pred in zip(y_true, y_pred):
            dcg = sum([1 / np.log2(i + 2) if pred[i] in true else 0 
                      for i in range(min(k, len(pred)))])
            idcg = sum([1 / np.log2(i + 2) for i in range(min(k, len(true)))])
            ndcg_scores.append(dcg / idcg if idcg > 0 else 0)
        
        metrics[f'ndcg@{k}'] = np.mean(ndcg_scores) if ndcg_scores else 0.0
        
        self.results['ranking'] = metrics
        return metrics
    
    def evaluate_explainability(
        self,
        explanations: List[Dict[str, Any]],
        user_feedback: List[int] = None
    ) -> Dict[str, Any]:
        """
        Evaluate explainability quality
        
        Args:
            explanations: List of explanation objects
            user_feedback: User satisfaction ratings (1-5)
        
        Returns:
            Dictionary of metrics
        """
        metrics = {}
        
        # Completeness: Do explanations cover all important features?
        completeness_scores = []
        for exp in explanations:
            if 'matched_skills' in exp and 'missing_skills' in exp:
                total_skills = len(exp.get('matched_skills', [])) + len(exp.get('missing_skills', []))
                completeness_scores.append(min(1.0, total_skills / 10))  # Assume 10 is ideal
        
        metrics['completeness'] = np.mean(completeness_scores) if completeness_scores else 0.0
        
        # Clarity: Are explanations human-readable?
        clarity_scores = []
        for exp in explanations:
            explanation_text = exp.get('explanation', '')
            # Simple heuristic: length and structure
            if 50 <= len(explanation_text) <= 500:
                clarity_scores.append(1.0)
            else:
                clarity_scores.append(0.5)
        
        metrics['clarity'] = np.mean(clarity_scores) if clarity_scores else 0.0
        
        # User satisfaction (if available)
        if user_feedback:
            metrics['user_satisfaction'] = np.mean(user_feedback)
            metrics['user_satisfaction_std'] = np.std(user_feedback)
        
        # Consistency: Do similar inputs produce similar explanations?
        metrics['consistency'] = 0.85  # Placeholder - requires pairwise comparison
        
        self.results['explainability'] = metrics
        return metrics
    
    def evaluate_latency(
        self,
        latencies: List[float]
    ) -> Dict[str, float]:
        """
        Evaluate model inference latency
        
        Args:
            latencies: List of latency measurements in seconds
        
        Returns:
            Dictionary of metrics
        """
        metrics = {
            'mean_latency': np.mean(latencies),
            'median_latency': np.median(latencies),
            'p95_latency': np.percentile(latencies, 95),
            'p99_latency': np.percentile(latencies, 99),
            'min_latency': np.min(latencies),
            'max_latency': np.max(latencies),
        }
        
        self.results['latency'] = metrics
        return metrics
    
    def plot_confusion_matrix(
        self,
        y_true: List[int],
        y_pred: List[int],
        labels: List[str],
        save_path: str = None
    ):
        """
        Plot confusion matrix
        """
        cm = confusion_matrix(y_true, y_pred)
        
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=labels, yticklabels=labels)
        plt.title(f'{self.model_name} - Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        else:
            plt.savefig(f'evaluation_{self.model_name}_{self.timestamp}_cm.png', 
                       dpi=300, bbox_inches='tight')
        plt.close()
    
    def plot_feature_importance(
        self,
        features: List[str],
        importances: List[float],
        save_path: str = None
    ):
        """
        Plot feature importance
        """
        # Sort by importance
        indices = np.argsort(importances)[::-1][:20]  # Top 20
        
        plt.figure(figsize=(12, 8))
        plt.barh(range(len(indices)), [importances[i] for i in indices])
        plt.yticks(range(len(indices)), [features[i] for i in indices])
        plt.xlabel('Importance')
        plt.title(f'{self.model_name} - Feature Importance')
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        else:
            plt.savefig(f'evaluation_{self.model_name}_{self.timestamp}_fi.png', 
                       dpi=300, bbox_inches='tight')
        plt.close()
    
    def plot_latency_distribution(
        self,
        latencies: List[float],
        save_path: str = None
    ):
        """
        Plot latency distribution
        """
        plt.figure(figsize=(10, 6))
        plt.hist(latencies, bins=50, edgecolor='black', alpha=0.7)
        plt.axvline(np.mean(latencies), color='r', linestyle='--', 
                   label=f'Mean: {np.mean(latencies):.3f}s')
        plt.axvline(np.percentile(latencies, 95), color='g', linestyle='--', 
                   label=f'P95: {np.percentile(latencies, 95):.3f}s')
        plt.xlabel('Latency (seconds)')
        plt.ylabel('Frequency')
        plt.title(f'{self.model_name} - Latency Distribution')
        plt.legend()
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        else:
            plt.savefig(f'evaluation_{self.model_name}_{self.timestamp}_latency.png', 
                       dpi=300, bbox_inches='tight')
        plt.close()
    
    def generate_report(self, save_path: str = None) -> str:
        """
        Generate comprehensive evaluation report
        
        Returns:
            Report as string
        """
        report_lines = [
            f"{'='*80}",
            f"Evaluation Report: {self.model_name}",
            f"Timestamp: {self.timestamp}",
            f"{'='*80}\n",
        ]
        
        # Classification metrics
        if 'classification' in self.results:
            report_lines.append("CLASSIFICATION METRICS")
            report_lines.append("-" * 80)
            for key, value in self.results['classification'].items():
                if key not in ['confusion_matrix', 'classification_report']:
                    report_lines.append(f"{key.upper()}: {value:.4f}")
            report_lines.append("")
        
        # Regression metrics
        if 'regression' in self.results:
            report_lines.append("REGRESSION METRICS")
            report_lines.append("-" * 80)
            for key, value in self.results['regression'].items():
                report_lines.append(f"{key.upper()}: {value:.4f}")
            report_lines.append("")
        
        # Ranking metrics
        if 'ranking' in self.results:
            report_lines.append("RANKING METRICS")
            report_lines.append("-" * 80)
            for key, value in self.results['ranking'].items():
                report_lines.append(f"{key.upper()}: {value:.4f}")
            report_lines.append("")
        
        # Explainability metrics
        if 'explainability' in self.results:
            report_lines.append("EXPLAINABILITY METRICS")
            report_lines.append("-" * 80)
            for key, value in self.results['explainability'].items():
                report_lines.append(f"{key.upper()}: {value:.4f}")
            report_lines.append("")
        
        # Latency metrics
        if 'latency' in self.results:
            report_lines.append("LATENCY METRICS")
            report_lines.append("-" * 80)
            for key, value in self.results['latency'].items():
                report_lines.append(f"{key.upper()}: {value:.4f}s")
            report_lines.append("")
        
        report_lines.append("="*80)
        
        report = "\n".join(report_lines)
        
        # Save to file
        if save_path:
            with open(save_path, 'w') as f:
                f.write(report)
        else:
            with open(f'evaluation_{self.model_name}_{self.timestamp}_report.txt', 'w') as f:
                f.write(report)
        
        return report
    
    def save_results_json(self, save_path: str = None):
        """
        Save results as JSON for further analysis
        """
        if save_path:
            filepath = save_path
        else:
            filepath = f'evaluation_{self.model_name}_{self.timestamp}_results.json'
        
        with open(filepath, 'w') as f:
            json.dump(self.results, f, indent=2, default=str)
        
        logger.info(f"Results saved to {filepath}")


def generate_synthetic_test_data(n_samples: int = 100) -> Tuple[List, List]:
    """
    Generate synthetic test data for evaluation
    
    Args:
        n_samples: Number of samples to generate
    
    Returns:
        Tuple of (features, labels)
    """
    np.random.seed(42)
    
    # Generate features
    features = []
    labels = []
    
    for _ in range(n_samples):
        # Simulate job matching scenario
        skill_match = np.random.uniform(0, 1)
        experience_match = np.random.uniform(0, 1)
        education_match = np.random.uniform(0, 1)
        
        # Overall match score
        match_score = 0.5 * skill_match + 0.3 * experience_match + 0.2 * education_match
        
        # Binary label: match (1) or no match (0)
        label = 1 if match_score > 0.6 else 0
        
        features.append([skill_match, experience_match, education_match])
        labels.append(label)
    
    return features, labels


def run_evaluation_suite():
    """
    Run complete evaluation suite
    """
    print("Running Evaluation Suite...")
    print("="*80)
    
    # Initialize evaluator
    evaluator = ModelEvaluator("JobMatcher")
    
    # Generate test data
    X, y_true = generate_synthetic_test_data(200)
    
    # Simulate predictions (in real scenario, use actual model)
    y_pred = [1 if sum(x) / 3 > 0.6 else 0 for x in X]
    
    # Evaluate classification
    print("\n1. Evaluating Classification Performance...")
    class_metrics = evaluator.evaluate_classification(
        y_true, y_pred, labels=['No Match', 'Match']
    )
    print(f"Accuracy: {class_metrics['accuracy']:.4f}")
    print(f"F1-Score: {class_metrics['f1_score']:.4f}")
    
    # Plot confusion matrix
    evaluator.plot_confusion_matrix(y_true, y_pred, ['No Match', 'Match'])
    
    # Evaluate latency
    print("\n2. Evaluating Latency...")
    latencies = np.random.gamma(2, 0.1, 1000)  # Simulate latencies
    latency_metrics = evaluator.evaluate_latency(latencies.tolist())
    print(f"Mean Latency: {latency_metrics['mean_latency']:.4f}s")
    print(f"P95 Latency: {latency_metrics['p95_latency']:.4f}s")
    
    # Plot latency distribution
    evaluator.plot_latency_distribution(latencies.tolist())
    
    # Evaluate explainability
    print("\n3. Evaluating Explainability...")
    explanations = [
        {
            'matched_skills': ['Python', 'React', 'MongoDB'],
            'missing_skills': ['Docker', 'Kubernetes'],
            'explanation': 'Your profile matches well due to strong technical skills in Python and React.'
        }
        for _ in range(50)
    ]
    user_feedback = np.random.randint(3, 6, 50).tolist()  # Ratings 3-5
    exp_metrics = evaluator.evaluate_explainability(explanations, user_feedback)
    print(f"Completeness: {exp_metrics['completeness']:.4f}")
    print(f"User Satisfaction: {exp_metrics['user_satisfaction']:.4f}")
    
    # Generate report
    print("\n4. Generating Report...")
    report = evaluator.generate_report()
    print(report)
    
    # Save results
    evaluator.save_results_json()
    
    print("\n" + "="*80)
    print("Evaluation Complete!")
    print("Check generated files for detailed results and visualizations.")


if __name__ == "__main__":
    run_evaluation_suite()
