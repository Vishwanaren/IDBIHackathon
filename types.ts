// CreditPulse Frontend TypeScript Definitions

export type SectorType = 'retail' | 'manufacturing' | 'services' | 'agriculture';

export interface MSMEProfile {
  id: string;
  user_id: string;
  business_name: string;
  sector: SectorType;
  city: string;
  state: string;
  ntc_flag: boolean;
  ntb_flag: boolean;
  employee_band: string;
  created_at?: string;
}

export interface AltDataGst {
  id: string;
  msme_id: string;
  filing_month: string;
  turnover: number;
  filing_delay_days: number;
  compliance_pct: number;
}

export interface AltDataUpi {
  id: string;
  msme_id: string;
  month: string;
  txn_count: number;
  txn_volume: number;
  avg_txn_size: number;
  inflow_outflow_ratio: number;
}

export interface AltDataBanking {
  id: string;
  msme_id: string;
  month: string;
  bank_balance_avg: number;
  bounce_count: number;
  loan_emi_outflow: number;
}

export interface AltDataEpfo {
  id: string;
  msme_id: string;
  month: string;
  employee_count: number;
  contribution_regularity_pct: number;
}

export interface FinancialHealthScore {
  id: string;
  msme_id: string;
  computed_at: string;
  overall_score: number;
  pillar_gst_score: number;
  pillar_upi_score: number;
  pillar_banking_score: number;
  pillar_epfo_score: number;
  pillar_stability_score: number;
  risk_band: 'green' | 'amber' | 'red';
  loan_eligibility_label: 'Likely eligible' | 'Eligible with conditions' | 'Needs improvement';
}

export interface BankMSMERecord {
  id: string;
  business_name: string;
  sector: SectorType;
  city: string;
  state: string;
  employee_band: string;
  overall_score: number;
  risk_band: 'green' | 'amber' | 'red';
  loan_eligibility_label: 'Likely eligible' | 'Eligible with conditions' | 'Needs improvement';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
