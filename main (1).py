import os
import uuid
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
import random

# Load env variables
load_dotenv()

app = FastAPI(
    title="CreditPulse API",
    description="MSME Financial Health Score Platform Backend API",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Vercel domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", os.getenv("SUPABASE_ANON_KEY", ""))

supabase_client: Client = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"Supabase Client Init Error: {e}")

# Models
class OnboardRequest(BaseModel):
    user_id: str
    business_name: str
    sector: str
    city: str
    state: str
    ntc_flag: bool
    ntb_flag: bool
    employee_band: str

# Helpers to generate and insert synthetic data (GST, UPI, Banking, EPFO)
def generate_and_insert_synthetic_data(msme_id: str, sector: str, employee_band: str, client: Client):
    # Sector profiles
    profiles = {
        'retail': {'turnover': (50000, 250000), 'txns': (150, 1200), 'size': (15, 80), 'emp': (1, 10)},
        'manufacturing': {'turnover': (200000, 1500000), 'txns': (15, 80), 'size': (500, 5000), 'emp': (11, 50)},
        'services': {'turnover': (80000, 500000), 'txns': (30, 300), 'size': (100, 1500), 'emp': (5, 45)},
        'agriculture': {'turnover': (30000, 180000), 'txns': (10, 50), 'size': (200, 2000), 'emp': (1, 10)}
    }
    
    prof = profiles.get(sector, profiles['services'])
    health = random.uniform(0.45, 1.0)
    months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"]
    
    # 1. GST records
    gst_rows = []
    for m in months:
        turnover = random.uniform(prof['turnover'][0], prof['turnover'][1]) * health
        delay = random.randint(0, 15) if health < 0.7 else random.randint(0, 3)
        compliance = random.uniform(75.0, 100.0) if health > 0.6 else random.uniform(60.0, 85.0)
        gst_rows.append({
            "msme_id": msme_id,
            "filing_month": m,
            "turnover": round(turnover, 2),
            "filing_delay_days": delay,
            "compliance_pct": round(compliance, 2)
        })
    client.table("alt_data_gst").insert(gst_rows).execute()

    # 2. UPI records
    upi_rows = []
    for m in months:
        txns = int(random.randint(prof['txns'][0], prof['txns'][1]) * health)
        vol = txns * random.uniform(prof['size'][0], prof['size'][1])
        ratio = random.uniform(0.9, 1.15) if health > 0.6 else random.uniform(0.8, 1.0)
        upi_rows.append({
            "msme_id": msme_id,
            "month": m,
            "txn_count": txns,
            "txn_volume": round(vol, 2),
            "avg_txn_size": round(vol / max(1, txns), 2),
            "inflow_outflow_ratio": round(ratio, 2)
        })
    client.table("alt_data_upi").insert(upi_rows).execute()

    # 3. Banking records
    banking_rows = []
    for m in months:
        bal = random.uniform(prof['turnover'][0] * 0.1, prof['turnover'][1] * 0.2) * health
        bounces = random.randint(0, 3) if health < 0.6 else random.choice([0, 0, 1])
        emi = bal * random.uniform(0.05, 0.15) if random.random() > 0.4 else 0.00
        banking_rows.append({
            "msme_id": msme_id,
            "month": m,
            "bank_balance_avg": round(bal, 2),
            "bounce_count": bounces,
            "loan_emi_outflow": round(emi, 2)
        })
    client.table("alt_data_banking").insert(banking_rows).execute()

    # 4. EPFO records
    epfo_rows = []
    base_emp = random.randint(prof['emp'][0], prof['emp'][1])
    for m in months:
        reg = random.uniform(90.0, 100.0) if health > 0.6 else random.uniform(70.0, 92.0)
        epfo_rows.append({
            "msme_id": msme_id,
            "month": m,
            "employee_count": max(1, base_emp + random.randint(-1, 1)),
            "contribution_regularity_pct": round(reg, 2)
        })
    client.table("alt_data_epfo").insert(epfo_rows).execute()

# Score algorithm
def calculate_and_save_score(msme_id: str, client: Client):
    # Fetch alt data
    gst_res = client.table("alt_data_gst").select("*").eq("msme_id", msme_id).execute()
    upi_res = client.table("alt_data_upi").select("*").eq("msme_id", msme_id).execute()
    banking_res = client.table("alt_data_banking").select("*").eq("msme_id", msme_id).execute()
    epfo_res = client.table("alt_data_epfo").select("*").eq("msme_id", msme_id).execute()

    gst = gst_res.data
    upi = upi_res.data
    banking = banking_res.data
    epfo = epfo_res.data

    # GST Score calculation
    gst_scores = [float(r['compliance_pct']) - (r['filing_delay_days'] * 3.0) for r in gst]
    gst_avg = max(0.0, min(100.0, sum(gst_scores) / len(gst_scores))) if gst_scores else 65.0

    # UPI Score
    upi_scores = []
    for r in upi:
        ratio_score = max(0.0, min(100.0, (float(r['inflow_outflow_ratio']) - 0.7) * 200.0))
        count_score = min(100.0, float(r['txn_count']) / 3.0)
        upi_scores.append(0.6 * ratio_score + 0.4 * count_score)
    upi_avg = sum(upi_scores) / len(upi_scores) if upi_scores else 65.0

    # Banking Score
    banking_scores = []
    for r in banking:
        bounce_penalty = r['bounce_count'] * 25.0
        if float(r['loan_emi_outflow']) > 0:
            coverage = float(r['bank_balance_avg']) / float(r['loan_emi_outflow'])
            coverage_score = min(100.0, coverage * 20.0)
        else:
            coverage_score = 100.0
        banking_scores.append(max(0.0, min(100.0, coverage_score - bounce_penalty)))
    banking_avg = sum(banking_scores) / len(banking_scores) if banking_scores else 65.0

    # EPFO Score
    epfo_scores = []
    for r in epfo:
        reg_score = float(r['contribution_regularity_pct'])
        staff_score = min(100.0, float(r['employee_count']) * 4.0)
        epfo_scores.append(0.8 * reg_score + 0.2 * staff_score)
    epfo_avg = sum(epfo_scores) / len(epfo_scores) if epfo_scores else 65.0

    # Trend Score
    stability_score = 75.0
    if len(banking) >= 2:
        trend = float(banking[-1]['bank_balance_avg']) - float(banking[0]['bank_balance_avg'])
        stability_score = max(0.0, min(100.0, 70.0 + (10.0 if trend > 0 else -10.0)))

    # Weighted Overall Score
    overall_score = (0.30 * gst_avg) + (0.25 * upi_avg) + (0.25 * banking_avg) + (0.20 * epfo_avg)
    overall_score = round(overall_score, 2)

    # Label & risk band
    if overall_score >= 70:
        risk_band = "green"
        eligibility = "Likely eligible"
    elif overall_score >= 50:
        risk_band = "amber"
        eligibility = "Eligible with conditions"
    else:
        risk_band = "red"
        eligibility = "Needs improvement"

    # Save to db
    score_record = {
        "msme_id": msme_id,
        "overall_score": overall_score,
        "pillar_gst_score": round(gst_avg, 2),
        "pillar_upi_score": round(upi_avg, 2),
        "pillar_banking_score": round(banking_avg, 2),
        "pillar_epfo_score": round(epfo_avg, 2),
        "pillar_stability_score": round(stability_score, 2),
        "risk_band": risk_band,
        "loan_eligibility_label": eligibility
    }
    
    # Check if score already exists to update, else insert
    existing = client.table("financial_health_scores").select("id").eq("msme_id", msme_id).execute()
    if existing.data:
        client.table("financial_health_scores").update(score_record).eq("msme_id", msme_id).execute()
    else:
        client.table("financial_health_scores").insert(score_record).execute()

    return score_record

@app.get("/")
def read_root():
    return {"message": "Welcome to CreditPulse Financial Health API. Database connected: " + str(supabase_client is not None)}

@app.post("/api/msme/onboard")
def onboard_msme(data: OnboardRequest):
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase connection is not configured on the backend server.")
    
    try:
        # 1. Create Profile
        profile_data = {
            "user_id": data.user_id,
            "business_name": data.business_name,
            "sector": data.sector,
            "city": data.city,
            "state": data.state,
            "ntc_flag": data.ntc_flag,
            "ntb_flag": data.ntb_flag,
            "employee_band": data.employee_band
        }
        profile_res = supabase_client.table("msme_profiles").insert(profile_data).execute()
        if not profile_res.data:
            raise HTTPException(status_code=400, detail="Failed to create MSME profile.")
        
        msme_id = profile_res.data[0]["id"]
        
        # 2. Seed synthetic alternative data (GST, UPI, Banking, EPFO)
        generate_and_insert_synthetic_data(msme_id, data.sector, data.employee_band, supabase_client)
        
        # 3. Compute and save initial scores
        scores = calculate_and_save_score(msme_id, supabase_client)
        
        return {
            "status": "success",
            "msme_id": msme_id,
            "scores": scores
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Onboarding error: {str(e)}")

@app.get("/api/score/{msme_id}")
def get_msme_score(msme_id: str):
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase connection is not configured on the backend server.")
    
    try:
        # Check if score already exists
        score_res = supabase_client.table("financial_health_scores").select("*").eq("msme_id", msme_id).execute()
        if score_res.data:
            return score_res.data[0]
        
        # If not, try to compute it on the fly
        scores = calculate_and_save_score(msme_id, supabase_client)
        return scores
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching scores: {str(e)}")

@app.get("/api/bank/list")
def get_bank_list():
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase connection is not configured on the backend server.")
    
    try:
        # Fetch all profiles
        profiles_res = supabase_client.table("msme_profiles").select("*").execute()
        profiles = profiles_res.data or []
        
        # Fetch all scores
        scores_res = supabase_client.table("financial_health_scores").select("*").execute()
        scores_map = {s["msme_id"]: s for s in (scores_res.data or [])}
        
        output = []
        for p in profiles:
            msme_id = p["id"]
            score_data = scores_map.get(msme_id, {})
            output.append({
                "id": msme_id,
                "business_name": p["business_name"],
                "sector": p["sector"],
                "city": p["city"],
                "state": p["state"],
                "employee_band": p["employee_band"],
                "overall_score": score_data.get("overall_score", 0.0),
                "risk_band": score_data.get("risk_band", "amber"),
                "loan_eligibility_label": score_data.get("loan_eligibility_label", "Needs improvement")
            })
            
        # Sort by score descending by default
        output.sort(key=lambda x: x["overall_score"], reverse=True)
        return output
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing bank records: {str(e)}")
