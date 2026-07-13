# CreditPulse — MSME Financial Health Score Platform

CreditPulse is a next-generation full-stack fintech platform designed to measure the creditworthiness of Micro, Small, and Medium Enterprises (MSMEs) using alternative transactional registries. Rather than relying purely on traditional (often non-existent) credit bureaus, CreditPulse securely aggregates GST filing metadata, UPI transactional momentum, banking ledger stability, and EPFO payroll regularities to compute a robust **Financial Health Score** out of 100.

## 🌟 Core Features

1. **Alternative Data Seeding & Onboarding**: Fast onboarding of business categories (Manufacturing, Retail, Services, Agriculture) with automated generation of highly realistic 6-month synthetic alt-data registries.
2. **Dynamic 5-Axis Score Dashboard**: Radial radar chart visualizer displaying scoring pillars (GST Compliance, UPI Velocity, Banking Stability, Employee payroll regularity, and Cashflow trend) with a high-contrast circular score gauge.
3. **Rule-Based Underwriting Engine**: A deterministic credit eligibility predictor labeling businesses as *Likely Eligible*, *Eligible with conditions*, or *Needs Improvement*, listing exact lending quotes and rate bands.
4. **AI Copilot (Conversational Advisor Stub)**: Interactive chat advisor designed to help founders dissect and audit their credit scores and outline exact action items to boost ratings.
5. **Banker / Underwriter Portal**: Gated access board with multi-column sorting, filter presets (Sector, Risk Levels), and searchable query systems to let financial underwriters audit applicant businesses instantly.

---

## 📐 System Architecture

CreditPulse uses a secure, modern full-stack decoupled architecture:

```
┌────────────────────────────────────────────────────────┐
│                   REACT FRONTEND                       │
│  - React 19 + Vite (Port 3000 Ingress Routing)        │
│  - Tailwind CSS + Lucide Icons (Teal Accent Fintech)  │
│  - Recharts Radar + SVG Circular Gauge                 │
└───────────────────────────┬────────────────────────────┘
                            │ (JSON / HTTPS & Supabase JWT)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND                      │
│  - Python 3 + FastAPI Web Services                     │
│  - Weighted Alternative Scoring Algorithms             │
│  - Onboard & synthetic backdata generators             │
└───────────────────────────┬────────────────────────────┘
                            │ (Postgres SQL Connections)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                    │
│  - PostgreSQL + Supabase Auth Tables                   │
│  - Row-Level Security (RLS) policies                   │
│  - Structured alt-data GST, UPI, Banking, EPFO tables  │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Data Model & Database Schema

The platform implements six tightly structured PostgreSQL tables:

*   **`msme_profiles`**: Business categorization, sector, scale, and New-to-Credit (NTC/NTB) parameters.
*   **`alt_data_gst`**: Historic monthly turnover and GST tax filing delay statistics.
*   **`alt_data_upi`**: UPI merchant transactions frequency, inflows, and balance ratios.
*   **`alt_data_banking`**: Average ledger balances, EMI outflows, and bounce counts.
*   **`alt_data_epfo`**: Staff rosters and regulatory payroll contribution regularities.
*   **`financial_health_scores`**: Calculated aggregate ratings, risk bands, and underwriting eligibility.

---

## 🚀 Scoring Formula (Weighted Algorithm)

Overall score calculation uses a weighted average of individual normalized indicators, ensuring zero cold-starts for new-to-credit profiles:

$$\text{Overall Score} = 0.30 \times \text{GST} + 0.25 \times \text{UPI} + 0.25 \times \text{Banking} + 0.20 \times \text{EPFO}$$

*   **GST Score**: $\text{Compliance Percentage} - (\text{Delay Days} \times 3)$
*   **UPI Score**: $0.60 \times (\text{Inflow/Outflow ratio normalized}) + 0.40 \times (\text{Monthly count density})$
*   **Banking Score**: $\text{EMI Coverage ratio} - (\text{Bounces} \times 25.0)$
*   **EPFO Score**: $0.80 \times \text{Contribution Regularity} + 0.20 \times \text{Staff Stability}$

---

## 📦 Local Setup Instructions

### Frontend & API Sandbox (Node.js)
1. Run `npm install` in the workspace root to compile the web app.
2. Spin up the Express server with local mock persistence:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:3000` to interact with the platform.

### Python Backend (FastAPI)
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment, then install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

---

## ☁️ Cloud Deployments

*   **Frontend**: Deploys automatically to **Vercel** reading from the repository main branch. Configured via `vercel.json` routing.
*   **Backend**: Deploys as an active web service on **Render**, reading configurations from `render.yaml`.
*   **Database**: Set up on **Supabase** using the provided `schema.sql` migration queries.

---

## 🗺️ Extended Feature Roadmap

*   **AI Copilot Integration**: Replacing the conversational stub with a live server route `POST /api/copilot/chat` targeting **Groq's Llama 3** or **Gemini API** models, injecting their live dashboard JSON context into prompts for context-aware counseling.
*   **What-If Simulator**: Interactive slider dashboards allowing MSMEs to play out scenarios (e.g., *"What happens to my score if I reduce GST filing delay from 6 days to 0?"* or *"If I increase active staff by 5"*).
*   **SHAP/LIME Explainability Matrix**: Mathematical visual plots explaining feature importances for underwriters to eliminate bias and increase credit transparency.
*   **Real Account Aggregator (AA) Integrations**: Linking actual GSTN, Sahamati Account Aggregator, and EPFO APIs for real live business scoring.

---

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).
