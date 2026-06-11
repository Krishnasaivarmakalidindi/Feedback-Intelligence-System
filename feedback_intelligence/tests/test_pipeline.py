import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.main import app
from src.database import Base, get_db
from src.models import Feedback
from src.processing.cleaner import clean_text
from src.processing.analyzer import calculate_priority_score
from src.processing.categorizer import categorize_feedback
from src.intelligence.ml_models import analyze_sentiment
from src.actions.integrations import get_simulated_ticket_analysis

# Use a temporary file SQLite database for testing the endpoints to avoid :memory: isolation
import os
SQLALCHEMY_DATABASE_URL = "sqlite:///test_feedback.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        if os.path.exists("test_feedback.db"):
            try:
                os.remove("test_feedback.db")
            except Exception:
                pass

@pytest.fixture(scope="module")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_clean_text():
    assert clean_text("  Hello \n World!  ") == "Hello World!"
    assert clean_text(None) == ""


def test_categorize_feedback():
    assert categorize_feedback("Our login button freezes on iPad screens") == "bug"
    assert categorize_feedback("This is a crash error broken issue") == "bug"
    assert categorize_feedback("I would love to have a new option added") == "feature_request"
    assert categorize_feedback("Excellent application, love it") == "praise"
    assert categorize_feedback("The website is extremely slow and bad") == "complaint"
    assert categorize_feedback("Just some random message") == "general"


def test_analyze_sentiment():
    assert analyze_sentiment("Wow, this is absolutely amazing and great!") == "positive"
    assert analyze_sentiment("Our login button freezes on iPad screens") == "negative"
    assert analyze_sentiment("The website is slow and frustrating") == "negative"
    assert analyze_sentiment("This is a neutral statement about the weather.") == "neutral"


def test_calculate_priority_score():
    # Bug (2) + negative sentiment (1) = score 4
    assert calculate_priority_score("This is a simple bug issue", "negative", "bug") == 4
    # Praise (0) + positive sentiment (-1) = score 1 (min boundary)
    assert calculate_priority_score("Amazing tool!", "positive", "praise") == 1
    # Bug (2) + negative sentiment (1) + urgent keyword "freeze" (1) = score 5
    assert calculate_priority_score("Critical freezes crash down error", "negative", "bug") == 5


def test_simulated_ticket_analysis():
    class MockFeedback:
        def __init__(self, customer_name, email, category, message):
            self.customer_name = customer_name
            self.email = email
            self.category = category
            self.message = message

    fb_ipad = MockFeedback("Jane Doe", "jane@example.com", "bug", "Our login button freezes on iPad screens")
    res = get_simulated_ticket_analysis(fb_ipad)
    assert "iPad" in res["suggested_response"]
    assert "login" in res["suggested_response"]

    fb_other = MockFeedback("John Doe", "john@example.com", "bug", "Some other crash")
    res_other = get_simulated_ticket_analysis(fb_other)
    assert "Thank you for reaching out." in res_other["suggested_response"]


def test_api_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_api_submit_and_retrieve_feedback(client):
    # Post feedback
    payload = {
        "customer_name": "Clara Chen",
        "email": "clara@stripe.com",
        "message": "Our login button freezes on iPad screens"
    }
    response = client.post("/feedback", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["customer_name"] == "Clara Chen"
    assert data["email"] == "clara@stripe.com"
    assert data["sentiment"] == "negative"
    assert data["category"] == "bug"
    assert data["priority_score"] >= 4
    ticket_id = data["id"]

    # Get feedback by id
    get_response = client.get(f"/feedback/{ticket_id}")
    assert get_response.status_code == 200
    assert get_response.json()["message"] == payload["message"]

    # Get feedback analysis
    analysis_response = client.get(f"/feedback/{ticket_id}/analysis")
    assert analysis_response.status_code == 200
    analysis_data = analysis_response.json()
    assert "analysis" in analysis_data
    assert "suggested_response" in analysis_data
