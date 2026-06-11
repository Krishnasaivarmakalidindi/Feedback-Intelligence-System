from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.api.schemas import (
    FeedbackCreate,
    FeedbackResponse,
    FeedbackUpdate,
    AnalyticsOverviewResponse,
    DashboardDataResponse,
    PriorityBreakdownResponse,
    AIInsightsResponse,
    ExecutiveSummaryResponse,
    ActionItemsResponse,
)
from src.ingestion.webhooks import (
    process_incoming_feedback,
    get_feedback_by_id,
    get_all_feedback,
    search_feedback,
    update_feedback,
    delete_feedback,
)
from src.intelligence.trend_detector import (
    get_analytics_overview,
    get_dashboard_data,
    get_sentiment_timeline,
    get_priority_breakdown,
)
from src.intelligence.ai_prompts import (
    generate_insights,
    generate_executive_summary,
    generate_action_items,
)
from src.actions.reports import parse_feedback_csv_data
from src.actions.integrations import generate_chat_response, analyze_single_feedback_ticket

router = APIRouter()


@router.get("/health")
def health():
    return {
        "status": "healthy"
    }


@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db)
):
    return process_incoming_feedback(db, feedback)


@router.get("/feedback", response_model=list[FeedbackResponse])
def list_feedback(
    search: str | None = Query(default=None, min_length=1),
    sentiment: str | None = Query(default=None),
    category: str | None = Query(default=None),
    min_priority: int | None = Query(default=None, ge=1, le=5),
    max_priority: int | None = Query(default=None, ge=1, le=5),
    db: Session = Depends(get_db)
):
    if any(value is not None for value in (search, sentiment, category, min_priority, max_priority)):
        return search_feedback(
            db,
            search=search,
            sentiment=sentiment,
            category=category,
            min_priority=min_priority,
            max_priority=max_priority,
        )

    return get_all_feedback(db)


@router.get("/feedback/{feedback_id}", response_model=FeedbackResponse)
def read_feedback(feedback_id: int, db: Session = Depends(get_db)):
    feedback = get_feedback_by_id(db, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback


@router.put("/feedback/{feedback_id}", response_model=FeedbackResponse)
def edit_feedback(
    feedback_id: int,
    feedback_update: FeedbackUpdate,
    db: Session = Depends(get_db),
):
    feedback = update_feedback(db, feedback_id, feedback_update)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback


@router.delete("/feedback/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_feedback(feedback_id: int, db: Session = Depends(get_db)):
    feedback = delete_feedback(db, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return None


@router.get("/analytics/overview", response_model=AnalyticsOverviewResponse)
def analytics_overview(
    days: int = Query(default=30, ge=7, le=365),
    keyword_limit: int = Query(default=10, ge=1, le=25),
    db: Session = Depends(get_db),
):
    return get_analytics_overview(db, days=days, keyword_limit=keyword_limit)


@router.get("/insights/ai-analysis", response_model=AIInsightsResponse)
def ai_analysis(
    days: int = Query(default=30, ge=7, le=365),
    api_key: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    analytics = get_analytics_overview(db, days=days)
    insights = generate_insights(analytics, api_key=api_key)
    return {
        "insights": insights,
        "generated_at": datetime.utcnow(),
    }


@router.get("/insights/executive-summary", response_model=ExecutiveSummaryResponse)
def executive_summary(
    days: int = Query(default=30, ge=7, le=365),
    api_key: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    analytics = get_analytics_overview(db, days=days)
    summary = generate_executive_summary(analytics, api_key=api_key)
    return {
        "summary": summary,
        "generated_at": datetime.utcnow(),
    }


@router.get("/insights/action-items", response_model=ActionItemsResponse)
def action_items(
    days: int = Query(default=30, ge=7, le=365),
    api_key: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    analytics = get_analytics_overview(db, days=days)
    items = generate_action_items(analytics, api_key=api_key)
    return {
        "items": items,
        "generated_at": datetime.utcnow(),
        "total_items": len(items),
    }


@router.get("/dashboard/overview", response_model=DashboardDataResponse)
def dashboard_overview(
    days: int = Query(default=30, ge=7, le=365),
    db: Session = Depends(get_db),
):
    data = get_dashboard_data(db, days=days)
    return data


@router.get("/dashboard/sentiment-timeline")
def sentiment_timeline(
    days: int = Query(default=30, ge=7, le=365),
    db: Session = Depends(get_db),
):
    timeline = get_sentiment_timeline(db, days=days)
    return {"timeline": timeline, "generated_at": datetime.utcnow().isoformat()}


@router.get("/dashboard/priority-breakdown", response_model=PriorityBreakdownResponse)
def priority_breakdown(
    days: int = Query(default=30, ge=7, le=365),
    db: Session = Depends(get_db),
):
    breakdown = get_priority_breakdown(db, days=days)
    return {
        "priority_1": breakdown["1"],
        "priority_2": breakdown["2"],
        "priority_3": breakdown["3"],
        "priority_4": breakdown["4"],
        "priority_5": breakdown["5"],
    }


from pydantic import BaseModel
class CSVUploadRequest(BaseModel):
    csv_data: str


@router.post("/feedback/upload", status_code=status.HTTP_201_CREATED)
def upload_feedback_csv(
    payload: CSVUploadRequest,
    db: Session = Depends(get_db)
):
    try:
        records = parse_feedback_csv_data(payload.csv_data)
        created_records = []
        for r in records:
            fb = process_incoming_feedback(db, r)
            created_records.append(fb)
        return {
            "message": f"Successfully ingested {len(created_records)} feedback records",
            "count": len(created_records)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV data: {str(e)}")


@router.post("/feedback/reset")
def reset_database(db: Session = Depends(get_db)):
    try:
        from src.models import Feedback
        db.query(Feedback).delete()
        db.commit()
        return {"status": "success", "message": "All feedback records deleted successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database wipe failed: {str(e)}")


@router.get("/insights/chat")
def chat_analyst(
    query: str = Query(..., min_length=1),
    days: int = Query(default=30, ge=7, le=365),
    db: Session = Depends(get_db)
):
    analytics = get_analytics_overview(db, days=days)
    recent_feedbacks = get_all_feedback(db)[:25]
    reply = generate_chat_response(query, days, db, analytics, recent_feedbacks)
    return {"response": reply}


@router.get("/feedback/{feedback_id}/analysis")
def analyze_single_feedback(feedback_id: int, db: Session = Depends(get_db)):
    feedback = get_feedback_by_id(db, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    res = analyze_single_feedback_ticket(feedback)
    return res
