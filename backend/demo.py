#!/usr/bin/env python
"""
Comprehensive demo script for Feedback Intelligence System.
Showcases all major features end-to-end.

Run from backend directory:
    python demo.py
"""

from datetime import datetime, timedelta
from app.database.db import SessionLocal
from app.database.models import Feedback
from app.services.feedback import create_feedback, search_feedback, get_all_feedback
from app.services.analytics import get_analytics_overview
from app.services.dashboard import get_kpi_metrics, get_dashboard_data
from app.services.gemini import generate_insights


def print_section(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def demo_phase1_crud():
    """Demonstrate Phase 1: Feedback CRUD Operations"""
    print_section("PHASE 1: Feedback CRUD Operations")

    session = SessionLocal()

    # Clean up existing demo data
    demo_items = session.query(Feedback).filter(
        Feedback.customer_name.like("Demo User%")
    ).all()
    for item in demo_items:
        session.delete(item)
    session.commit()

    # Create demo feedback
    demo_feedback = [
        ("Demo User 1", "user1@demo.com", "The app crashes when I upload large images"),
        ("Demo User 2", "user2@demo.com", "Please add dark mode feature to the app"),
        ("Demo User 3", "user3@demo.com", "Great product! Works amazingly well!"),
        ("Demo User 4", "user4@demo.com", "Dashboard is very slow when loading reports"),
        ("Demo User 5", "user5@demo.com", "Bug: Settings don't save properly"),
    ]

    print("\n✓ Creating feedback records...")
    created_ids = []
    from pydantic import BaseModel
    
    class FeedbackData(BaseModel):
        customer_name: str
        email: str
        message: str
    
    for name, email_addr, message_text in demo_feedback:
        feedback_data = FeedbackData(
            customer_name=name,
            email=email_addr,
            message=message_text
        )
        feedback = create_feedback(session, feedback_data)
        created_ids.append(feedback.id)
        print(f"  - {name}: {message_text[:40]}... (Priority: {feedback.priority_score})")

    # Read feedback
    print("\n✓ Reading all feedback...")
    all_feedback = get_all_feedback(session)
    print(f"  Total records: {len(all_feedback)}")

    # Search feedback
    print("\n✓ Searching for 'crash' mentions...")
    results = search_feedback(session, search="crash")
    print(f"  Found: {len(results)} record(s)")
    for r in results:
        print(f"  - {r.message}")

    # Filter by category
    print("\n✓ Filtering by category 'feature_request'...")
    results = search_feedback(session, category="feature_request")
    print(f"  Found: {len(results)} record(s)")
    for r in results:
        print(f"  - {r.message}")

    session.close()


def demo_phase2_analytics():
    """Demonstrate Phase 2: Analytics & Insights"""
    print_section("PHASE 2: Analytics & Insights")

    session = SessionLocal()

    # Create demo data spanning multiple days
    print("\n✓ Creating analytics demo data...")
    base = datetime.utcnow() - timedelta(days=13)
    messages = [
        "App crashes when uploading images",
        "Dashboard is slow",
        "Please add dark mode",
        "UI is confusing",
        "Excellent product!",
    ]

    existing = session.query(Feedback).filter(
        Feedback.customer_name.like("Analytics Demo%")
    ).all()
    for item in existing:
        session.delete(item)
    session.commit()

    for day_offset in range(14):
        day = base + timedelta(days=day_offset)
        for item_index in range(2 if day_offset < 7 else 4):
            msg = messages[item_index % len(messages)]
            feedback = Feedback(
                customer_name=f"Analytics Demo {day_offset}",
                email="demo@example.com",
                message=msg,
                sentiment="negative" if "crash" in msg.lower() or "slow" in msg.lower() else "positive",
                category="bug" if "crash" in msg.lower() else "feature_request" if "add" in msg.lower() else "general",
                priority_score=4 if "crash" in msg.lower() else 2,
                created_at=day,
            )
            session.add(feedback)
    session.commit()

    # Get analytics overview
    print("\n✓ Generating analytics overview...")
    analytics = get_analytics_overview(session, days=14, keyword_limit=5)

    print(f"\n  Total Feedback: {analytics['total_feedback']}")
    print(f"\n  Sentiment Distribution:")
    for sentiment, count in analytics['sentiment_distribution'].items():
        print(f"    - {sentiment}: {count}")

    print(f"\n  Topic Distribution:")
    for topic, count in analytics['topic_distribution'].items():
        if count > 0:
            print(f"    - {topic}: {count}")

    print(f"\n  Top Keywords:")
    for kw in analytics['top_keywords'][:3]:
        print(f"    - {kw['word']}: {kw['count']} mentions")

    print(f"\n  Anomaly Detection: {analytics['anomaly_severity'].upper()}")
    print(f"    {analytics['anomaly_message']}")

    session.close()


def demo_phase4_dashboard():
    """Demonstrate Phase 4: Dashboard & KPIs"""
    print_section("PHASE 4: Dashboard & KPIs")

    session = SessionLocal()

    # Get KPI metrics
    print("\n✓ Calculating KPI metrics...")
    kpis = get_kpi_metrics(session, days=30)

    print(f"\n  Total Feedback: {kpis['total_feedback']}")
    print(f"  Avg Priority Score: {kpis['avg_priority_score']:.2f}")
    print(f"  Positive Sentiment: {kpis['sentiment_positive_pct']:.1f}%")
    print(f"  Negative Sentiment: {kpis['sentiment_negative_pct']:.1f}%")
    print(f"  Bug Reports: {kpis['bug_count']}")
    print(f"  Feature Requests: {kpis['feature_request_count']}")
    print(f"  Critical Feedback (Priority ≥ 4): {kpis['critical_feedback_count']}")
    print(f"  Avg Feedback/Day: {kpis['avg_feedback_per_day']:.2f}")

    session.close()


def demo_phase3_ai():
    """Demonstrate Phase 3: AI Insights (Optional - requires GEMINI_API_KEY)"""
    print_section("PHASE 3: AI-Powered Insights (Optional)")

    import os

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("\n⚠ GEMINI_API_KEY not set. Skipping AI features.")
        print("  To enable: Set GEMINI_API_KEY environment variable")
        return

    session = SessionLocal()

    print("\n✓ Generating AI insights from analytics...")
    analytics = get_analytics_overview(session, days=30)

    try:
        insights = generate_insights(session, analytics, api_key=api_key)
        print("\n  AI-Generated Insights:")
        print("  " + "\n  ".join(insights.split("\n")[:5]))
    except Exception as e:
        print(f"  Error: {str(e)}")

    session.close()


def demo_api_endpoints():
    """Show API endpoints available"""
    print_section("Available API Endpoints")

    endpoints = {
        "Feedback": [
            "POST /feedback - Create feedback",
            "GET /feedback - List feedback",
            "GET /feedback/{id} - Get specific feedback",
            "PUT /feedback/{id} - Update feedback",
            "DELETE /feedback/{id} - Delete feedback",
        ],
        "Analytics": [
            "GET /analytics/overview - Get analytics overview",
        ],
        "AI Insights": [
            "GET /insights/ai-analysis - AI analysis",
            "GET /insights/executive-summary - Executive summary",
            "GET /insights/action-items - Action items",
        ],
        "Dashboard": [
            "GET /dashboard/overview - Dashboard overview",
            "GET /dashboard/sentiment-timeline - Sentiment history",
            "GET /dashboard/priority-breakdown - Priority distribution",
        ],
        "System": [
            "GET /health - Health check",
            "GET /docs - Swagger documentation",
        ],
    }

    for category, eps in endpoints.items():
        print(f"\n{category}:")
        for ep in eps:
            print(f"  • {ep}")


def main():
    """Run all demos"""
    print("\n")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 58 + "║")
    print("║" + "  FEEDBACK INTELLIGENCE SYSTEM - COMPREHENSIVE DEMO  ".center(58) + "║")
    print("║" + " " * 58 + "║")
    print("╚" + "═" * 58 + "╝")

    try:
        # Run all demos
        demo_phase1_crud()
        demo_phase2_analytics()
        demo_phase4_dashboard()
        demo_phase3_ai()
        demo_api_endpoints()

        # Final summary
        print_section("Demo Complete ✓")
        print("\nStart the server to test API endpoints:")
        print("  uvicorn app.main:app --reload")
        print("\nAccess Swagger documentation at:")
        print("  http://localhost:8000/docs")

    except Exception as e:
        print(f"\n❌ Error during demo: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
