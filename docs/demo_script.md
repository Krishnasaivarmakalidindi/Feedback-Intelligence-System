# Live Demo Script

Use this script during team reviews, recruiter presentations, or project showcase videos.

---

### **0:00 - Introduction**
- **Action**: Share your browser window showing `http://localhost:5173`. Start on the **Dashboard** page (`/`).
- **Say**: *"Hello everyone! Today, I’ll show you the Feedback Intelligence System—a platform designed to automate feedback analysis at scale. It connects a React frontend with a FastAPI backend and Google Gemini AI to analyze customer inputs in real-time."*

---

### **0:30 - The Dashboard & KPIs**
- **Action**: Hover over the KPI cards (Total Feedback, Positive %, Negative %, Critical Tickets). Point to the **Sentiment Timeline** and **Category Breakdown** charts.
- **Say**: *"Here is our executive dashboard, styled with a clean dark mode theme. We have real-time KPI metrics displaying customer sentiment ratios, critical alerts, and charts tracking feedback volume and categorization over 7, 30, or 90 days. We also see a Gemini AI-generated summary right on the dashboard."*

---

### **1:00 - Feedback Stream & Ingestion**
- **Action**: Click **Feedback** in the sidebar. Type "crash" in the search box, click enter. Select **Bug** from the category dropdown.
- **Say**: *"Let’s look at the Feedback Stream. We can search comments, apply category/sentiment filters, and sort columns. Let's filter for Bug and search for 'crash'. Every record shows automatic sentiment and priority scoring. We can also click a row to open a details modal, modify its priority or category, and save it."*
- **Action**: Click **Ingest Feedback** at the top right. Enter name: *"John Doe"*, email: *"john@gmail.com"*, message: *"The app freezes when loading large images"*. Click **Ingest Message**.
- **Say**: *"Let's submit a live customer message. Upon ingestion, our backend NLP service parses it, detects the 'bug' category, scores the sentiment as negative, and marks it as Priority 4 because of the crash severity. Notice it updates the stream instantly."*

---

### **1:45 - AI Insights Center**
- **Action**: Click **AI Insights** in the sidebar. Scroll through the Executive Summary, Detailed Insights, and the Action Recommendations checklist.
- **Say**: *"Next, the AI Insights center. When the backend receives reviews, we run them through Google’s Gemini 1.5 Flash model to generate business summaries, root-cause analyses, and concrete actions. Product managers can check off recommendations here, and their completed progress is saved persistently in the browser local storage."*

---

### **2:15 - Settings & Health Monitoring**
- **Action**: Click **Settings** in the sidebar. Point to the three status cards. Click **Seed Demo Feedback** and close the prompt.
- **Say**: *"Finally, our Settings page. The system includes active health-monitoring trackers that poll backend routes to verify FastAPI server response, SQLite connections, and Gemini key configurations. If we need to spin up a quick test, we can use the Seed button to push fresh, pre-analyzed demo reviews directly through our APIs."*

---

### **2:45 - Conclusion**
- **Action**: Navigate back to the Dashboard to show updated metrics.
- **Say**: *"By uniting FastAPI, SQLAlchemy, local NLP processors, and Gemini LLMs under a responsive React client, this platform delivers an enterprise-grade feedback analysis tool. Thanks for watching!"*
