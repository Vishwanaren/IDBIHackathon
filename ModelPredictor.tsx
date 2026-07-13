import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Table, Check, Play, UserPlus, FileBarChart, RefreshCw, AlertCircle } from 'lucide-react';

// Math calculation for the trained points scoring model from PDF:
export function predictCredibility(
  creditScore: number,
  monthlyIncome: number,
  emi: number,
  employmentYears: number,
  hasDefaults: boolean
) {
  // 1. Credit Score Points
  let creditScorePts = 15;
  if (creditScore >= 800) creditScorePts = 50;
  else if (creditScore >= 750) creditScorePts = 45;
  else if (creditScore >= 700) creditScorePts = 40;
  else if (creditScore >= 650) creditScorePts = 30;
  else creditScorePts = 15;

  // 2. Monthly Income Points
  let incomePts = 10;
  if (monthlyIncome >= 200000) incomePts = 20;
  else if (monthlyIncome >= 80000) incomePts = 15;
  else incomePts = 10;

  // 3. DTI % and Points
  const dtiRatio = monthlyIncome > 0 ? (emi / monthlyIncome) * 100 : 0;
  let dtiPts = 0;
  if (dtiRatio < 25) dtiPts = 15;
  else if (dtiRatio < 40) dtiPts = 10;
  else if (dtiRatio <= 50) dtiPts = 5;
  else dtiPts = 0;

  // 4. Employment Stability Points
  let employmentPts = 2;
  if (employmentYears >= 5) employmentPts = 10;
  else if (employmentYears >= 1) employmentPts = 5;
  else employmentPts = 2;

  // 5. Default History Points
  const defaultPts = hasDefaults ? 0 : 5;

  // Total
  const credibilityScore = creditScorePts + incomePts + dtiPts + employmentPts + defaultPts;

  // Decision
  let riskLevel = 'Very High Risk';
  let loanDecision = 'Reject';
  let color = 'text-rose-400';
  let bg = 'bg-rose-950/25 border-rose-500/20';
  let badgeColor = 'bg-rose-950/40 text-rose-400 border-rose-500/20';

  if (credibilityScore >= 80) {
    riskLevel = 'Low Risk';
    loanDecision = 'Approve';
    color = 'text-emerald-400';
    bg = 'bg-emerald-950/25 border-emerald-500/20';
    badgeColor = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20';
  } else if (credibilityScore >= 60) {
    riskLevel = 'Medium Risk';
    loanDecision = 'Approve with Conditions';
    color = 'text-amber-400';
    bg = 'bg-amber-950/25 border-amber-500/20';
    badgeColor = 'bg-amber-950/40 text-amber-400 border-amber-500/20';
  } else if (credibilityScore >= 40) {
    riskLevel = 'High Risk';
    loanDecision = 'Manual Review';
    color = 'text-orange-400';
    bg = 'bg-orange-950/25 border-orange-500/20';
    badgeColor = 'bg-orange-950/40 text-orange-400 border-orange-500/20';
  }

  return {
    creditScorePts,
    incomePts,
    dtiRatio,
    dtiPts,
    employmentPts,
    defaultPts,
    credibilityScore,
    riskLevel,
    loanDecision,
    color,
    bg,
    badgeColor
  };
}

// Actual rows from the PDF dataset for user lookup and quick prefill:
const trainingDataset = [
  { id: 'CUST001', score: 620, income: 161682, emi: 74374, dti: 46, years: 12, defaults: 0, credibility: 50, risk: 'High Risk', decision: 'Manual Review' },
  { id: 'CUST002', score: 827, income: 90780, emi: 55376, dti: 61, years: 3, defaults: 1, credibility: 70, risk: 'Medium Risk', decision: 'Approve with Conditions' },
  { id: 'CUST003', score: 616, income: 70602, emi: 45185, dti: 64, years: 15, defaults: 0, credibility: 40, risk: 'High Risk', decision: 'Manual Review' },
  { id: 'CUST004', score: 739, income: 115081, emi: 74803, dti: 65, years: 5, defaults: 0, credibility: 70, risk: 'Medium Risk', decision: 'Approve with Conditions' },
  { id: 'CUST005', score: 722, income: 71813, emi: 16517, dti: 23, years: 11, defaults: 1, credibility: 75, risk: 'Medium Risk', decision: 'Approve with Conditions' },
  { id: 'CUST006', score: 798, income: 222450, emi: 126797, dti: 57, years: 15, defaults: 0, credibility: 80, risk: 'Low Risk', decision: 'Approve' },
  { id: 'CUST007', score: 532, income: 49798, emi: 8964, dti: 18, years: 7, defaults: 0, credibility: 55, risk: 'High Risk', decision: 'Manual Review' },
  { id: 'CUST008', score: 585, income: 228147, emi: 31941, dti: 14, years: 7, defaults: 0, credibility: 65, risk: 'Medium Risk', decision: 'Approve with Conditions' },
  { id: 'CUST009', score: 704, income: 130893, emi: 44504, dti: 34, years: 10, defaults: 0, credibility: 80, risk: 'Low Risk', decision: 'Approve' },
  { id: 'CUST010', score: 579, income: 158087, emi: 17390, dti: 11, years: 12, defaults: 1, credibility: 55, risk: 'High Risk', decision: 'Manual Review' },
  { id: 'CUST011', score: 840, income: 53102, emi: 35578, dti: 67, years: 5, defaults: 1, credibility: 70, risk: 'Medium Risk', decision: 'Approve with Conditions' },
  { id: 'CUST012', score: 832, income: 69176, emi: 30437, dti: 44, years: 2, defaults: 0, credibility: 75, risk: 'Medium Risk', decision: 'Approve with Conditions' },
  { id: 'CUST013', score: 767, income: 165764, emi: 29837, dti: 18, years: 6, defaults: 1, credibility: 85, risk: 'Low Risk', decision: 'Approve' },
  { id: 'CUST014', score: 730, income: 249849, emi: 27483, dti: 11, years: 7, defaults: 1, credibility: 85, risk: 'Low Risk', decision: 'Approve' },
  { id: 'CUST015', score: 552, income: 208870, emi: 22976, dti: 11, years: 10, defaults: 0, credibility: 65, risk: 'Medium Risk', decision: 'Approve with Conditions' }
];

export default function ModelPredictor() {
  const [creditScore, setCreditScore] = useState<number>(720);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(125000);
  const [emi, setEmi] = useState<number>(25000);
  const [employmentYears, setEmploymentYears] = useState<number>(6);
  const [hasDefaults, setHasDefaults] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const prediction = predictCredibility(
    creditScore,
    monthlyIncome,
    emi,
    employmentYears,
    hasDefaults
  );

  const handleSelectCustomer = (cust: typeof trainingDataset[0]) => {
    setCreditScore(cust.score);
    setMonthlyIncome(cust.income);
    setEmi(cust.emi);
    setEmploymentYears(cust.years);
    setHasDefaults(cust.defaults === 1);
  };

  const filteredDataset = trainingDataset.filter(cust =>
    cust.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.decision.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="ml-predictor-card" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/80 pb-5 gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="bg-indigo-500/10 p-2.5 rounded-lg text-indigo-400">
            <BrainCircuit className="h-6 w-6 stroke-[1.8]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Trained Underwriting Model</span>
            </h2>
            <p className="text-xs text-slate-400">Simulate and evaluate credit eligibility based on the 300-row customer credibility dataset</p>
          </div>
        </div>

        <span className="flex items-center space-x-1.5 px-3 py-1 rounded bg-indigo-950/45 text-indigo-400 text-xs font-semibold border border-indigo-500/25">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Vittscore ML v1.0</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Interactive Form Side (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <h3 className="text-sm font-semibold text-slate-300">Adjust Scoring Parameters</h3>
          
          <div className="space-y-4 bg-slate-950/40 p-5 border border-slate-800/60 rounded-xl">
            {/* Credit Score Bureau Input */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-400">Bureau Credit Score</span>
                <span className="font-semibold text-white">{creditScore} Pts</span>
              </div>
              <input 
                type="range"
                min="300"
                max="900"
                value={creditScore}
                onChange={(e) => setCreditScore(parseInt(e.target.value))}
                className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-3xs text-slate-500 mt-1">
                <span>300 (Poor)</span>
                <span>650 (Fair)</span>
                <span>750 (Very Good)</span>
                <span>900 (Excellent)</span>
              </div>
            </div>

            {/* Monthly Income and EMI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Monthly Income (₹)</label>
                <input 
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="block w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Monthly EMI Obligations (₹)</label>
                <input 
                  type="number"
                  value={emi}
                  onChange={(e) => setEmi(Math.max(0, parseInt(e.target.value) || 0))}
                  className="block w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Employment Years and Defaults */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-center">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-400">Employment Continuity</span>
                  <span className="font-semibold text-white">{employmentYears} Years</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="20"
                  value={employmentYears}
                  onChange={(e) => setEmploymentYears(parseInt(e.target.value))}
                  className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-4xs text-slate-500 mt-0.5">
                  <span>&lt;1 Yr (Risky)</span>
                  <span>1-4 Yrs (Good)</span>
                  <span>5+ Yrs (Excellent)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/40 mt-1">
                <div>
                  <span className="block text-xs font-medium text-white">Prior Loan Defaults</span>
                  <span className="block text-4xs text-slate-500">History of late/missed repayments</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDefaults}
                    onChange={(e) => setHasDefaults(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500 peer-checked:after:bg-slate-950"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Point Breakdown Explanation */}
          <div className="bg-slate-950/20 p-4 border border-slate-800/40 rounded-xl space-y-3">
            <span className="block text-xs font-semibold text-slate-400">Model Point Conversion breakdown:</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
              
              <div className="bg-slate-950 p-2.5 border border-slate-800/60 rounded-lg">
                <span className="block text-4xs text-slate-500 uppercase tracking-wider">Credit Score</span>
                <span className="block text-sm font-bold text-white mt-1">{prediction.creditScorePts} <span className="text-3xs font-normal text-slate-500">/ 50</span></span>
              </div>

              <div className="bg-slate-950 p-2.5 border border-slate-800/60 rounded-lg">
                <span className="block text-4xs text-slate-500 uppercase tracking-wider">Income Level</span>
                <span className="block text-sm font-bold text-white mt-1">{prediction.incomePts} <span className="text-3xs font-normal text-slate-500">/ 20</span></span>
              </div>

              <div className="bg-slate-950 p-2.5 border border-slate-800/60 rounded-lg">
                <span className="block text-4xs text-slate-500 uppercase tracking-wider">DTI Factor</span>
                <span className="block text-sm font-bold text-white mt-1">{prediction.dtiPts} <span className="text-3xs font-normal text-slate-500">/ 15</span></span>
                <span className="block text-4xs text-slate-400 mt-0.5">DTI: {prediction.dtiRatio.toFixed(0)}%</span>
              </div>

              <div className="bg-slate-950 p-2.5 border border-slate-800/60 rounded-lg">
                <span className="block text-4xs text-slate-500 uppercase tracking-wider">Employment</span>
                <span className="block text-sm font-bold text-white mt-1">{prediction.employmentPts} <span className="text-3xs font-normal text-slate-500">/ 10</span></span>
              </div>

              <div className="bg-slate-950 p-2.5 border border-slate-800/60 rounded-lg col-span-2 sm:col-span-1">
                <span className="block text-4xs text-slate-500 uppercase tracking-wider">No-Defaults</span>
                <span className="block text-sm font-bold text-white mt-1">{prediction.defaultPts} <span className="text-3xs font-normal text-slate-500">/ 5</span></span>
              </div>

            </div>
          </div>
        </div>

        {/* Right Output Score Side (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Model Prediction Results</h3>

            <div className={`p-6 border rounded-xl flex flex-col items-center text-center space-y-4 ${prediction.bg} transition-all`}>
              <span className="text-4xs font-mono uppercase tracking-widest text-slate-400">CREDIBILITY RATING</span>
              
              {/* Circular score display */}
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    className="stroke-teal-400 transition-all duration-500 ease-out" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - prediction.credibilityScore / 100)}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white">{prediction.credibilityScore}</span>
                  <span className="block text-5xs text-slate-500 font-mono">/ 100 PTS</span>
                </div>
              </div>

              <div>
                <span className={`block text-lg font-bold ${prediction.color}`}>{prediction.loanDecision}</span>
                <span className="block text-xs text-slate-400 mt-1">Classification: <strong>{prediction.riskLevel}</strong></span>
              </div>

              <div className="text-4xs text-slate-500 leading-relaxed max-w-[280px]">
                {prediction.credibilityScore >= 80 
                  ? "Meets elite liquidity standards. Approved automatically for premium terms and zero collateral."
                  : prediction.credibilityScore >= 60
                  ? "Approved with conditions. Credit terms require manual review or escrow of payment transactions."
                  : "Manual review necessary due to high debt-to-income liabilities or low historical score index."
                }
              </div>
            </div>
          </div>

          {/* Quick dataset selector */}
          <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300">Select Training Row to Prefill</span>
              <span className="text-4xs text-slate-500 uppercase">15 representative profiles</span>
            </div>
            
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-3xs">
              {trainingDataset.map((cust) => (
                <button
                  key={cust.id}
                  onClick={() => handleSelectCustomer(cust)}
                  className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-850 border border-slate-850 flex justify-between items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-slate-300">{cust.id}</span>
                  <span>Score: {cust.score}</span>
                  <span>DTI: {cust.dti}%</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-5xs ${
                    cust.credibility >= 80 ? 'bg-emerald-950 text-emerald-400' :
                    cust.credibility >= 60 ? 'bg-amber-950 text-amber-400' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {cust.credibility} Pts
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
