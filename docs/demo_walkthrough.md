# Product Demo Walkthrough

Follow these steps to demonstrate the full capabilities of the **Feedback Intelligence System** during a live review or video walkthrough.

---

## Step 1: Environment Readiness
1. Verify that the FastAPI backend server is running on `http://localhost:8000`.
2. Verify that the React Vite development server is running on `http://localhost:5173`.
3. Ensure that your browser is in **Dark Mode** (the default style) or toggle the Light Mode in the sidebar to showcase the responsive layouts.

---

## Step 2: Ingestion & Live Analytics Seeding
1. Navigate to the **Settings** page from the sidebar menu.
2. Observe the three **Health Cards**:
   - **Backend API**: Should display green **Active** (polling check of `/health`).
   - **SQLite Database**: Displays connected status and shows the current count of ingested records.
   - **Gemini AI Service**: Confirms whether the API Key is active in your backend `.env` variables.
3. Click the **Seed Demo Feedback** button.
4. Confirm the prompt. The dashboard seeds 8 high-quality SaaS feedbacks (e.g. issues with payment widgets, page canvas lags, praises).
5. Watch the Database record count update in real-time.

---

## Step 3: Executive KPIs & Charts
1. Navigate back to the **Dashboard** page (`/`).
2. Observe the KPI indicators showing total counts, Positive % and Negative % sentiment ratios, and critical tickets requiring engineering review.
3. Review the **Trend Charts**:
   - **Volume/Sentiment Line Chart**: Maps daily ingestion rates.
   - **Sentiment Doughnut Chart**: Shows negative vs positive percentages.
   - **Category Bar Chart**: Highlights feature requests, complaints, and bugs.
4. Change the time range filter dropdown from "Last 30 days" to "Last 7 days" and check the update.

---

## Step 4: Stream Filtering & Details Modals
1. Navigate to the **Feedback** stream page (`/feedback`).
2. Test the filtering:
   - Select **Bug** from the category dropdown to see only technical issues.
   - Select **Negative** from the sentiment dropdown.
3. Search for a keyword like "clash" in the search input and press Enter.
4. Click on any feedback row in the table to open the **Feedback Details Modal**.
5. Change its Category (e.g. from General to Complaint) and update its Priority score.
6. Click **Save Changes** and notice the stream table updates instantly.
7. Click the **Ingest Feedback** button at the top right, fill in name, email, and a message like: *"The mobile app crashed during checkout"*, and submit. Note that it is analyzed instantly.

---

## Step 5: AI Insights Command Center
1. Navigate to the **AI Insights** page (`/insights`).
2. Read the **Gemini AI Executive Summary** and the **Root Causes** analysis.
3. Go to the **Action Recommendations** checklist on the right.
4. Read through the AI-prioritized items (e.g. "Optimize database region latency").
5. Click on the checkmarks to check off completed items. The progress bar at the bottom will track your task completion dynamically (persisted in local storage).
