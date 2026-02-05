from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_explain_match_requires_fields():
    resp = client.post('/api/ml/chat', json={"userId": "u1", "message": "Why wasn't I shortlisted?"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "To explain why" in data["data"]["response"]


def test_explain_match_with_data():
    resume = "Experienced Python developer with 3 years experience. Familiar with Docker and AWS."
    job_desc = "Senior Python developer required with Docker, Kubernetes, AWS. 5 years experience."
    resp = client.post('/api/ml/chat', json={
        "userId": "u1",
        "message": "Why was I rejected?",
        "resumeText": resume,
        "jobDescription": job_desc,
        "jobSkills": ["python", "docker", "kubernetes", "aws"],
        "requiredExperience": 5,
        "jobTitle": "Senior Python Developer"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["intent"] == "explain_match"
    assert "Resume score" in data["data"]["response"]
    assert "Missing skills" in data["data"]["details"] or "missing_skills" in data["data"]["details"]


def test_career_guidance_with_role():
    resp = client.post('/api/ml/chat', json={
        "userId": "u1",
        "message": "What should I do after Java Developer?",
        "currentRole": "Java Developer",
        "skills": ["java"],
        "experienceYears": 3
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["intent"] == "career_guidance"
    assert "Suggested next roles" in data["data"]["response"]
    assert "learning_path" in data["data"]["details"]
