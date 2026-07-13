import { 
  AltDataGst, 
  AltDataUpi, 
  AltDataBanking, 
  AltDataEpfo, 
  FinancialHealthScore,
  SectorType 
} from '../types';

export const SECTOR_PROFILES = {
  retail: {
    avg_turnover_min: 50000,
    avg_turnover_max: 250000,
    txn_count_min: 150,
    txn_count_max: 1200,
    avg_txn_size_min: 15,
    avg_txn_size_max: 80,
    emp_count_min: 2,
    emp_count_max: 15,
    inflow_outflow_std: 1.05
  },
  manufacturing: {
    avg_turnover_min: 200000,
    avg_turnover_max: 1500000,
    txn_count_min: 15,
    txn_count_max: 80,
    avg_txn_size_min: 500,
    avg_txn_size_max: 5000,
    emp_count_min: 15,
    emp_count_max: 150,
    inflow_outflow_std: 1.10
  },
  services: {
    avg_turnover_min: 80000,
    avg_turnover_max: 500000,
    txn_count_min: 30,
    txn_count_max: 300,
    avg_txn_size_min: 100,
    avg_txn_size_max: 1500,
    emp_count_min: 5,
    emp_count_max: 45,
    inflow_outflow_std: 1.15
  },
  agriculture: {
    avg_turnover_min: 30000,
    avg_turnover_max: 180000,
    txn_count_min: 10,
    txn_count_max: 50,
    avg_txn_size_min: 200,
    avg_txn_size_max: 2000,
    emp_count_min: 3,
    emp_count_max: 30,
    inflow_outflow_std: 1.03
  }
};

export function generateSyntheticData(msmeId: string, sector: SectorType, employeeBand: string) {
  const profile = SECTOR_PROFILES[sector] || SECTOR_PROFILES.services;
  
  // Base health factor (0.45 to 1.0)
  const healthMultiplier = 0.45 + Math.random() * 0.55;
  const months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
  
  // 1. GST records
  const gst: AltDataGst[] = months.map(m => {
    const turnover = (profile.avg_turnover_min + Math.random() * (profile.avg_turnover_max - profile.avg_turnover_min)) * healthMultiplier;
    const delay = Math.random() < (healthMultiplier > 0.75 ? 0.2 : 0.5) ? Math.floor(Math.random() * 8) : 0;
    const compliance = healthMultiplier > 0.6 
      ? 88 + Math.random() * 12 
      : 70 + Math.random() * 20;
    return {
      id: Math.random().toString(36).substring(2, 9),
      msme_id: msmeId,
      filing_month: m,
      turnover: parseFloat(turnover.toFixed(2)),
      filing_delay_days: delay,
      compliance_pct: parseFloat(compliance.toFixed(2))
    };
  });

  // 2. UPI records
  const upi: AltDataUpi[] = months.map(m => {
    const txns = Math.floor((profile.txn_count_min + Math.random() * (profile.txn_count_max - profile.txn_count_min)) * healthMultiplier);
    const vol = txns * (profile.avg_txn_size_min + Math.random() * (profile.avg_txn_size_max - profile.avg_txn_size_min));
    const ratio = healthMultiplier > 0.6
      ? 0.95 + Math.random() * 0.2
      : 0.8 + Math.random() * 0.18;
    return {
      id: Math.random().toString(36).substring(2, 9),
      msme_id: msmeId,
      month: m,
      txn_count: txns,
      txn_volume: parseFloat(vol.toFixed(2)),
      avg_txn_size: parseFloat((vol / Math.max(1, txns)).toFixed(2)),
      inflow_outflow_ratio: parseFloat(ratio.toFixed(2))
    };
  });

  // 3. Banking records
  const banking: AltDataBanking[] = months.map(m => {
    const bal = (gst[0].turnover * (0.08 + Math.random() * 0.17)) * healthMultiplier;
    const bounces = Math.random() < (healthMultiplier > 0.75 ? 0.05 : 0.4) ? Math.floor(Math.random() * 3) : 0;
    const emi = Math.random() > 0.4 ? bal * (0.05 + Math.random() * 0.1) : 0.00;
    return {
      id: Math.random().toString(36).substring(2, 9),
      msme_id: msmeId,
      month: m,
      bank_balance_avg: parseFloat(bal.toFixed(2)),
      bounce_count: bounces,
      loan_emi_outflow: parseFloat(emi.toFixed(2))
    };
  });

  // 4. EPFO records
  const empRanges: { [key: string]: [number, number] } = {
    '1-10': [1, 10],
    '11-50': [11, 50],
    '51-200': [51, 200],
    '200+': [201, 500]
  };
  const [minEmp, maxEmp] = empRanges[employeeBand] || [5, 25];
  const baseEmp = Math.floor(minEmp + Math.random() * (maxEmp - minEmp));
  
  const epfo: AltDataEpfo[] = months.map(m => {
    const reg = healthMultiplier > 0.6 
      ? 92 + Math.random() * 8 
      : 72 + Math.random() * 20;
    return {
      id: Math.random().toString(36).substring(2, 9),
      msme_id: msmeId,
      month: m,
      employee_count: Math.max(1, baseEmp + Math.floor(Math.random() * 3) - 1),
      contribution_regularity_pct: parseFloat(reg.toFixed(2))
    };
  });

  const scores = calculateScores(msmeId, gst, upi, banking, epfo);

  return { gst, upi, banking, epfo, scores };
}

export function calculateScores(
  msmeId: string, 
  gst: AltDataGst[], 
  upi: AltDataUpi[], 
  banking: AltDataBanking[], 
  epfo: AltDataEpfo[]
): FinancialHealthScore {
  // GST score: compliance - delay_days * 3
  const gstScores = gst.map(r => r.compliance_pct - r.filing_delay_days * 3.0);
  const gstAvg = gstScores.length ? Math.max(0, Math.min(100, gstScores.reduce((a, b) => a + b, 0) / gstScores.length)) : 65.0;

  // UPI score
  const upiScores = upi.map(r => {
    const ratioScore = Math.max(0, Math.min(100, (r.inflow_outflow_ratio - 0.7) * 200.0));
    const countScore = Math.min(100, r.txn_count / 3.0);
    return 0.6 * ratioScore + 0.4 * countScore;
  });
  const upiAvg = upiScores.length ? Math.max(0, Math.min(100, upiScores.reduce((a, b) => a + b, 0) / upiScores.length)) : 65.0;

  // Banking stability
  const bankingScores = banking.map(r => {
    const bouncePenalty = r.bounce_count * 25.0;
    let coverageScore = 100.0;
    if (r.loan_emi_outflow > 0) {
      const coverage = r.bank_balance_avg / r.loan_emi_outflow;
      coverageScore = Math.min(100, coverage * 20.0);
    }
    return Math.max(0, Math.min(100, coverageScore - bouncePenalty));
  });
  const bankingAvg = bankingScores.length ? Math.max(0, Math.min(100, bankingScores.reduce((a, b) => a + b, 0) / bankingScores.length)) : 65.0;

  // EPFO score
  const epfoScores = epfo.map(r => {
    const regScore = r.contribution_regularity_pct;
    const staffScore = Math.min(100, r.employee_count * 4.0);
    return 0.8 * regScore + 0.2 * staffScore;
  });
  const epfoAvg = epfoScores.length ? Math.max(0, Math.min(100, epfoScores.reduce((a, b) => a + b, 0) / epfoScores.length)) : 65.0;

  // Stability score (average balance trend)
  let stabilityScore = 75.0;
  if (banking.length >= 2) {
    const trend = banking[banking.length - 1].bank_balance_avg - banking[0].bank_balance_avg;
    stabilityScore = Math.max(0, Math.min(100, 70.0 + (trend > 0 ? 10.0 : -10.0)));
  }

  // Overall score
  let overallScore = 0.30 * gstAvg + 0.25 * upiAvg + 0.25 * bankingAvg + 0.20 * epfoAvg;
  overallScore = parseFloat(overallScore.toFixed(2));

  let riskBand: 'green' | 'amber' | 'red' = 'amber';
  let eligibility: 'Likely eligible' | 'Eligible with conditions' | 'Needs improvement' = 'Eligible with conditions';

  if (overallScore >= 70) {
    riskBand = 'green';
    eligibility = 'Likely eligible';
  } else if (overallScore >= 50) {
    riskBand = 'amber';
    eligibility = 'Eligible with conditions';
  } else {
    riskBand = 'red';
    eligibility = 'Needs improvement';
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    msme_id: msmeId,
    computed_at: new Date().toISOString(),
    overall_score: overallScore,
    pillar_gst_score: parseFloat(gstAvg.toFixed(2)),
    pillar_upi_score: parseFloat(upiAvg.toFixed(2)),
    pillar_banking_score: parseFloat(bankingAvg.toFixed(2)),
    pillar_epfo_score: parseFloat(epfoAvg.toFixed(2)),
    pillar_stability_score: parseFloat(stabilityScore.toFixed(2)),
    risk_band: riskBand,
    loan_eligibility_label: eligibility
  };
}
