# Architecture Diagram & System Design

This document details the system design, components, and data pipelines of the **Feedback Intelligence System**.

---

## 1. System Topology

The platform is designed around a decoupled, 2-tier client-server architecture:

```mermaid
graph LR
    subgraph Frontend [React App - Client Layer]
        SPA[React SPA]
        AxiosClient[Axios API Client]
        SPA --> AxiosClient
    end

    subgraph Backend [FastAPI - Application Layer]
        API[Router & Controllers]
        Services[Service Layer]
        DB_ORM[SQLAlchemy ORM]
        
        API --> Services
        Services --> DB_ORM
    end

    subgraph External [External Services]
        Gemini[Google Gemini 1.5 Flash]
    end

    subgraph Storage [Persistence Layer]
        SQLITE[(SQLite DB)]
    end

    AxiosClient -->|HTTPS REST| API
    Services -->|API Calls| Gemini
    DB_ORM -->|SQL Queries| SQLITE
```

---

## 2. Ingestion & Analysis Data Pipeline

When a user submits a feedback item (either through the browser form or an external endpoint), it undergoes automatic parsing and enrichment:

```mermaid
sequenceDiagram
    participant User as React Client
    participant API as FastAPI Router
    participant Serv as Feedback Service
    participant TextBlob as TextBlob Engine
    participant DB as SQLite / PostgreSQL

    User->>API: POST /feedback {customer_name, email, message}
    API->>Serv: create_feedback()
    
    critical NLP Processing
        Serv->>TextBlob: analyze_sentiment(message)
        TextBlob-->>Serv: returns sentiment (positive/negative/neutral)
        
        Serv->>Serv: detect_category(message)
        Note over Serv: Matches bugs, praise, feature requests, general
        
        Serv->>Serv: calculate_priority(sentiment, category, message)
        Note over Serv: Assigns score 1-5 based on trigger keywords
    end
    
    Serv->>DB: INSERT INTO feedback
    DB-->>Serv: returns committed record
    Serv-->>API: returns enriched feedback response
    API-->>User: 201 Created {id, priority_score, sentiment, category, ...}
```

---

## 3. Analytics & Anomaly Detection Pipeline

Analytics are calculated dynamically to support dashboard KPIs and timeline reports:

```mermaid
graph TD
    DB[(Database)] -->|Fetch records in date range| Service[Analytics Service]
    Service -->|Calculate Distributions| Dist[Sentiment, Category, Priority]
    Service -->|Split & Tokenize text| Keywords[Top Keywords Extraction]
    Service -->|14-day Rolling Window| Anomaly[Anomaly Detection Engine]
    
    Anomaly -->|Spike > 2 * StdDev| Alert[High / Medium Alert]
    Anomaly -->|Normal variance| Safe[None / Safe Alert]
    
    Dist --> Response[Overview JSON Response]
    Keywords --> Response
    Alert --> Response
    Safe --> Response
```

---

## 4. Components Directory Structure

- **`frontend/`**: Single Page React Application initialized with Vite.
  - `src/api/`: API wrapper layer using Axios.
  - `src/components/`: Reusable widgets (Sidebar, Header, Details Modal).
  - `src/pages/`: Core views (Dashboard, Feedback Stream, Analytics, AI Insights, Settings).
  - `src/App.jsx`: Root router and light/dark theme provider.
- **`backend/`**: FastAPI REST backend.
  - `app/api/`: Routes definition.
  - `app/database/`: SQLAlchemy base, connection engine, and tables.
  - `app/schemas/`: Pydantic validation schemas.
  - `app/services/`: Core logic engines (analytics.py, dashboard.py, feedback.py, gemini.py).
