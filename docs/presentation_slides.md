# Project Presentation Slides

Use this outline to create presentation slides (e.g. on PowerPoint, Google Slides, or Marp markdown presentation packages).

---

## Slide 1: Title Slide
### **Feedback Intelligence System 🔮**
*AI-Powered Customer Feedback Aggregation and Analysis Platform*
- **Presenter**: [Your Name]
- **Role**: Lead Full-stack & AI Engineer
- **Tech Stack**: React, Vite, FastAPI, PostgreSQL, Gemini AI

---

## Slide 2: The Problem
### **The Pain of Customer Feedback at Scale**
- **Data Volume**: Text streams flow from multiple channels (app reviews, support tickets, emails).
- **Manual Overhead**: Classifying, prioritizing, and assigning tickets manually is slow and error-prone.
- **Lost Insights**: Product leaders lack real-time visibility into sentiment trends and systemic issues.

---

## Slide 3: The Solution
### **Feedback Intelligence Platform**
- **Automated Processing**: Instant sentiment analysis and categorization on ingestion.
- **Heuristic Priority**: Algorithmically ranks feedback based on severity keywords.
- **Executive Summarization**: Distills hundreds of tickets into an actionable executive summary using Gemini AI.
- **Operational Dashboard**: Intuitive, responsive Vercel-style metrics board.

---

## Slide 4: System Architecture
### **Decoupled Architecture & Processing Flow**
- **Client (React / Vite / Tailwind)**: Minimalist dashboard, interactive lists, and real-time status markers.
- **Server (FastAPI / Uvicorn / SQLAlchemy)**: High-performance API endpoints, background services.
- **NLP Layer (TextBlob)**: Lightweight local sentiment scorer.
- **Cognitive Layer (Google Gemini)**: Generates high-level summaries and action items.

---

## Slide 5: The Ingestion Pipeline
### **Ingest, Analyze, Enrich, Persist**
1. **POST request**: Customer details and message body arrive.
2. **Sentiment Check**: TextBlob scores polarity.
3. **Category Match**: RegEx rules detect category tags (e.g. bugs).
4. **Heuristic Priority**: Computes urgency index (1-5).
5. **Persistence**: Saves enriched record to database, enabling instant dashboard updates.

---

## Slide 6: Core Features Live Demo
- **KPI Metrics**: Real-time totals, positive/negative rates, and critical issues count.
- **Stream Filters**: Multi-variable filterable tables, search indexes, and detail card overrides.
- **Gemini Command Center**: Interactive checklist that saves checked states to local storage.
- **System Health Monitor**: Proactive health status dots checking server and AI connections.

---

## Slide 7: Production Readiness & Deployment
- **Docker Orchestration**: Containerized services with Docker Compose.
- **Multi-DB Bindings**: SQLite config for local testing, PostgreSQL integration for production.
- **CORS Config**: Active headers for secure web domain requests.
- **Hosting**:
  - Vercel (Frontend build caching)
  - Railway/Render (Dockerized FastAPI container)
