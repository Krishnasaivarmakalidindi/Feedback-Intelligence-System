from typing import Any, Dict, List
from src.api.schemas import FeedbackCreate


def fetch_external_reviews(platform: str = "app_store") -> List[FeedbackCreate]:
    """Simulates fetching feedback reviews from external app stores or review boards."""
    # Simulated review feeds
    mock_reviews = [
        {
            "customer_name": "API Reviewer 1",
            "email": "reviewer1@api-test.com",
            "message": f"[{platform}] Outstanding SaaS platform! Very fast workflows."
        },
        {
            "customer_name": "API Reviewer 2",
            "email": "reviewer2@api-test.com",
            "message": f"[{platform}] Encountered minor interface latency when loading metrics page dashboards."
        }
    ]
    
    return [
        FeedbackCreate(
            customer_name=r["customer_name"],
            email=r["email"],
            message=r["message"]
        ) for r in mock_reviews
    ]
