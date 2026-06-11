# Production Deployment Guide

This guide outlines instructions to build, configure, and deploy the **Feedback Intelligence System** to cloud environments.

---

## 1. Hosting Overview
- **Frontend**: Vercel (Optimized for SPA builds).
- **Backend**: Railway, Render, or Fly.io (Container ready via Dockerfile).
- **Database**: PostgreSQL (production tier).

---

## 2. Backend Deployment

### Option A: Railway (Recommended)
1. Log in to [Railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo** and select the repository.
3. Railway will auto-detect the root `docker-compose.yml` or the `backend/Dockerfile`. To deploy only the backend, set the **Source Directory** configuration to `backend`.
4. In the service settings, add a PostgreSQL database plugin. Railway will provision a server and expose a database URL.
5. Set the following **Environment Variables**:
   - `DATABASE_URL`: Set to the provisioned PostgreSQL connection string (e.g. `postgresql://user:pass@host:port/db`).
   - `GEMINI_API_KEY`: Your Gemini API Key from Google AI Studio.
   - `ENVIRONMENT`: `production`
   - `DEBUG`: `False`
6. Click deploy. Railway will compile the Docker container and expose a public domain (e.g. `https://feedback-backend-production.up.railway.app`).

### Option B: Render.com
1. Log in to [Render.com](https://render.com).
2. Click **New** -> **Web Service** and connect your repo.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
4. Create a Render PostgreSQL database and copy the internal Database URL.
5. Under Environment variables, configure `DATABASE_URL`, `GEMINI_API_KEY`, `ENVIRONMENT=production`, and `DEBUG=False`.
6. Deploy the service.

---

## 3. Frontend Deployment (Vercel)

1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project** and select your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, modify `frontend/src/api/client.js` or define:
   - If using variables, configure the client base URL: `VITE_API_BASE_URL` pointing to your deployed Backend URL (e.g. `https://feedback-backend-production.up.railway.app`).
5. Click **Deploy**. Vercel will build your static files and deploy them to an edge network.

---

## 4. Production Database Migration (SQLite to PostgreSQL)

The backend ORM is built on SQLAlchemy and automatically creates the table schemas when it binds to a new database.
1. When configuring `DATABASE_URL` to point to a empty PostgreSQL database, the server will call `Base.metadata.create_all(bind=engine)` on startup.
2. The schema will be initialized.
3. To migrate historical data from `backend/feedback.db` (SQLite) to your cloud PostgreSQL database, you can run a migration script using python's `sqlite3` and `psycopg2` libraries to dump records and insert them into the Postgres instance.
