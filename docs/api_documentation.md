# API Documentation

The Feedback Intelligence System backend exposes RESTful endpoints built with FastAPI. Complete interactive swagger documentation is available at `http://localhost:8000/docs` or `http://localhost:8000/redoc` when the server is active.

---

## 1. System Health
### `GET /health`
Verifies server health and database connectivity.
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy"
  }
  ```

---

## 2. Feedback Management

### `POST /feedback`
Ingests a customer feedback review, analyzes sentiment, categorizes it, and calculates priority.
- **Request Body**:
  ```json
  {
    "customer_name": "Clara Chen",
    "email": "clara@stripe.com",
    "message": "Please add a dark mode option to the payment success screen."
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": 97,
    "customer_name": "Clara Chen",
    "email": "clara@stripe.com",
    "message": "Please add a dark mode option to the payment success screen.",
    "sentiment": "positive",
    "category": "feature_request",
    "priority_score": 2,
    "created_at": "2026-06-10T17:32:00Z"
  }
  ```

### `GET /feedback`
Lists and queries feedback records.
- **Query Parameters**:
  - `search` (string, optional): Text query to search in message body, name, or email.
  - `sentiment` (string, optional): Filter by `positive`, `negative`, or `neutral`.
  - `category` (string, optional): Filter by `bug`, `feature_request`, `complaint`, `praise`, or `general`.
  - `min_priority` (integer, optional): Min score (1-5).
  - `max_priority` (integer, optional): Max score (1-5).
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 97,
      "customer_name": "Clara Chen",
      "email": "clara@stripe.com",
      "message": "Please add a dark mode option to the payment success screen.",
      "sentiment": "positive",
      "category": "feature_request",
      "priority_score": 2,
      "created_at": "2026-06-10T17:32:00Z"
    }
  ]
  ```

### `GET /feedback/{id}`
Inspects a specific feedback record.
- **Response `200 OK`**: (Same schema as feedback object).
- **Response `404 Not Found`**:
  ```json
  {
    "detail": "Feedback not found"
  }
  ```

### `PUT /feedback/{id}`
Modifies an existing feedback's category, priority, customer info, or message.
- **Request Body**:
  ```json
  {
    "category": "complaint",
    "priority_score": 4
  }
  ```
- **Response `200 OK`**: Updated feedback schema.

### `DELETE /feedback/{id}`
Deletes a feedback record from the database.
- **Response `204 No Content`**

---

## 3. Dashboard Services

### `GET /dashboard/overview`
Retrieves aggregated KPI metrics.
- **Query Parameters**:
  - `days` (integer, default: 30): Range for overview data.
- **Response `200 OK`**:
  ```json
  {
    "kpis": {
      "total_feedback": 34,
      "avg_priority_score": 2.85,
      "sentiment_positive_pct": 52.4,
      "sentiment_negative_pct": 28.2,
      "sentiment_neutral_pct": 19.4,
      "bug_count": 8,
      "feature_request_count": 12,
      "avg_feedback_per_day": 1.13,
      "critical_feedback_count": 5
    },
    "analytics": {
      "sentiment_distribution": { "positive": 18, "negative": 10, "neutral": 6 },
      "category_distribution": { "bug": 8, "feature_request": 12, "complaint": 6, "praise": 5, "general": 3 }
    },
    "generated_at": "2026-06-10T17:32:00Z"
  }
  ```

### `GET /dashboard/sentiment-timeline`
Retrieves daily sentiment trend lists.
- **Response `200 OK`**:
  ```json
  {
    "timeline": [
      { "date": "2026-06-09", "positive": 2, "negative": 1, "neutral": 0, "total": 3 }
    ],
    "generated_at": "2026-06-10T17:32:00"
  }
  ```

---

## 4. Analytics Services

### `GET /analytics/overview`
Retrieves in-depth NLP parsing models.
- **Query Parameters**:
  - `days` (integer, default: 30)
  - `keyword_limit` (integer, default: 10)
- **Response `200 OK`**:
  ```json
  {
    "total_feedback": 34,
    "sentiment_distribution": { "positive": 18, "negative": 10, "neutral": 6 },
    "category_distribution": { "bug": 8, "feature_request": 12 },
    "priority_distribution": { "1": 3, "2": 12, "3": 14, "4": 4, "5": 1 },
    "daily_trend": [ { "date": "2026-06-09", "count": 3 } ],
    "top_keywords": [ { "word": "crash", "count": 5 } ],
    "topic_distribution": { "UI/UX": 14, "Bugs": 8 },
    "anomaly_severity": "none",
    "anomaly_message": "No volume anomalies detected in this range.",
    "generated_at": "2026-06-10T17:32:00Z"
  }
  ```

---

## 5. Gemini AI Services (Requires GEMINI_API_KEY)

### `GET /insights/executive-summary`
- **Response `200 OK`**:
  ```json
  {
    "summary": "This summary covers operations over the last 30 days. Top feedback trends center around request for dark mode...",
    "generated_at": "2026-06-10T17:32:00Z",
    "model": "gemini-1.5-flash"
  }
  ```

### `GET /insights/ai-analysis`
- **Response `200 OK`**:
  ```json
  {
    "insights": "Detailed analysis of customer pain points including root causes of UI/UX friction and slow dashboard load rates.",
    "generated_at": "2026-06-10T17:32:00Z",
    "model": "gemini-1.5-flash"
  }
  ```

### `GET /insights/action-items`
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "action": "Address rendering delays in the charts on Vercel regions.",
        "priority": "high",
        "impact": "high",
        "status": "pending",
        "created_at": "2026-06-10T17:32:00Z"
      }
    ],
    "total_items": 1,
    "model": "gemini-1.5-flash"
  }
  ```
