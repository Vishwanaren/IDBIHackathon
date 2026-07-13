import React, { useState, useEffect } from 'react';
import { FinancialHealthScore, MSMEProfile } from '../types';
import Gauge from './Gauge';
import RadarChartComp from './RadarChartComp';
import ModelPredictor from './ModelPredictor';
import { 
  Award, 
  HelpCircle, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  Smartphone, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface ScoreDashboardProps {
  profile: MSMEProfile;
  scoreData: FinancialHealthScore;
}

export default function ScoreDashboard({ profile, scoreData }: ScoreDashboardProps) {
  const [activeAltTab, setActiveAltTab] = useState<'gst' | 'upi' | 'banking' | 'epfo'>('gst');
  
  // Rule-based score explanation generator
  const getExplanation = () => {
    const pillars = [
      { name: 'GST Filing Compliance', score: scoreData.pillar_gst_score },
      { name: 'UPI Transaction Footprint', score: scoreData.pillar_upi_score },
      { name: 'Banking Cash Ledger Stability', score: scoreData.pillar_banking_score },
      { name: 'EPFO & Employee Payroll Continuity', score: scoreData.pillar_epfo_score },
      { name: 'Overall Monthly Cashflow Stability', score: scoreData.pillar_stability_score }
    ];

    // Sort pillars by value
    const sorted = [...pillars].sort((a, b) => b.score - a.score);
    const topPillar = sorted[0];
    const bottomPillar = sorted[sorted.length - 1];

    let riskDescription = '';
    if (scoreData.overall_score >= 70) {
      riskDescription = 'demonstrates a robust operational buffer and consistent compliance hygiene';
    } else if (scoreData.overall_score >= 50) {
      riskDescription = 'indicates mild transactional volatility or compliance delay, though overall cashflows remain sound';
    } else {
      riskDescription = 'reflects higher-risk operational patterns, multiple compliance lags, or high ledger variance';
    }

    return {
      text: `Your financial health index of **${scoreData.overall_score}** places ${profile.business_name} in the **${scoreData.risk_band.toUpperCase()}** risk band. This rating ${riskDescription}. Your creditworthiness is spearheaded by **${topPillar.name}** (scoring **${topPillar.score}/100**), representing substantial stability. Conversely, your primary growth constraint lies within **${bottomPillar.name}** (scoring **${bottomPillar.score}/100**). Rectifying delays or cash ledger drops in this category offers the fastest path to unlocking lower lending premiums.`,
      topFactor: topPillar.name,
      bottomFactor: bottomPillar.name
    };
  };

  const explanation = getExplanation();

  // Rule-based Loan Qualification Indicator details
  const getEligibilityDetails = () => {
    const score = scoreData.overall_score;
    if (score >= 70) {
      return {
        title: 'Likely Eligible',
        text: 'The alternative ledger footprints reflect a very high certainty of cashflow coverage and low default risk. Financial institutions are highly likely to approve commercial capital without demanding collateral assets.',
        color: 'text-emerald-400 bg-emerald-950/45 border-emerald-500/20',
        bullets: [
          'Pre-approved overdraft lines up to 25% of annual turnover',
          'Highly competitive interest rates (estimated 9.5% - 11.2% APR)',
          'No hard property/collateral requirements needed for validation',
          'Fast-tracked disbursement cycle (typically under 24 hours)'
        ]
      };
    } else if (score >= 50) {
      return {
        title: 'Eligible with Conditions',
        text: 'Your transactions prove positive cash inflows, but scores are capped due to mild GST filing delays or minor check bounces. Capital is accessible, but underwriters may require shorter repayment terms or partial invoice backing.',
        color: 'text-amber-400 bg-amber-950/45 border-amber-500/20',
        bullets: [
          'Standard equipment and working capital term loans are accessible',
          'Estimated interest rates between 12.5% and 15.0% APR',
          'May require escrow of UPI business inflows or co-signor guarantees',
          'Shorter repayment amortization cycles (typically 12 - 24 months)'
        ]
      };
    } else {
      return {
        title: 'Needs Improvement',
        text: 'Operational metrics reflect significant transaction volatility or compliance gaps. Tier-1 commercial lenders will likely defer approval until historical regularities improve over the next 90 days.',
        color: 'text-rose-400 bg-rose-950/45 border-rose-500/20',
        bullets: [
          'Micro-credit lines are available with daily/weekly sweep options',
          'Interest rates will reflect custom risk pricing (estimated 16%+ APR)',
          'Requires 3 months of consecutive bounce-free banking statements to re-evaluate',
          'Requires onboarding of active merchant credit gateways'
        ]
      };
    }
  };

  const eligibility = getEligibilityDetails();

  // Custom Sector label formatting
  const formattedSector = profile.sector.charAt(0).toUpperCase() + profile.sector.slice(1);

  return (
    <div id="score-dashboard-view" className="space-y-6 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-slate-200 font-sans">
      
      {/* Dashboard Top Header Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <span className="text-3xs font-mono font-bold text-teal-400 tracking-widest uppercase bg-teal-950/40 border border-teal-500/20 px-2 py-0.5 rounded">
            OPERATIONAL PULSE REPORT
          </span>
          <h1 className="text-2xl font-bold text-white mt-2 flex items-center space-x-2">
            <span>{profile.business_name}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
            <span>Sector: <strong className="text-slate-300">{formattedSector}</strong></span>
            <span className="text-slate-700">•</span>
            <span>Location: <strong className="text-slate-300">{profile.city}, {profile.state}</strong></span>
            <span className="text-slate-700">•</span>
            <span>Workforce: <strong className="text-slate-300">{profile.employee_band} Employees</strong></span>
            {profile.ntc_flag && (
              <>
                <span className="text-slate-700">•</span>
                <span className="px-1.5 py-0.5 bg-slate-850 border border-slate-700 rounded text-3xs text-slate-400 font-mono">NTC Profile</span>
              </>
            )}
            {profile.ntb_flag && (
              <>
                <span className="text-slate-700">•</span>
                <span className="px-1.5 py-0.5 bg-slate-850 border border-slate-700 rounded text-3xs text-slate-400 font-mono">NTB Profile</span>
              </>
            )}
          </p>
        </div>

        <div className="flex space-x-3 text-xs font-mono">
          <div className="text-right">
            <span className="block text-3xs text-slate-500">LAST EVALUATED</span>
            <span className="block text-slate-300 font-medium">{new Date(scoreData.computed_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Main Core Metric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Overall score and gauge (4-span) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">Financial Health Score</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time alternative data evaluation</p>
          </div>
          
          <div className="my-2 flex justify-center items-center">
            <Gauge score={scoreData.overall_score} riskBand={scoreData.risk_band} size={190} />
          </div>

          <div className="bg-slate-950/60 p-4 border border-slate-800/60 rounded-lg space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Risk Assessment:</span>
              <span className={`font-semibold uppercase ${
                scoreData.risk_band === 'green' ? 'text-emerald-400' :
                scoreData.risk_band === 'amber' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {scoreData.risk_band === 'green' ? 'Low Risk' :
                 scoreData.risk_band === 'amber' ? 'Medium Risk' : 'High Risk'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-850 pt-2.5">
              <span className="text-slate-400">Underwriting Class:</span>
              <span className="text-white font-medium">{scoreData.loan_eligibility_label}</span>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 5-axis Radar visualizer (7-span) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div className="border-b border-slate-800/80 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">Scoring Pillars</h2>
              <p className="text-xs text-slate-500 mt-0.5">Weighted breakdown across 5 critical business dimensions</p>
            </div>
            <span className="text-3xs bg-slate-950/80 border border-slate-800 text-slate-400 px-2 py-1 rounded font-mono uppercase">
              radar axis view
            </span>
          </div>

          <div className="my-1">
            <RadarChartComp
              gst={scoreData.pillar_gst_score}
              upi={scoreData.pillar_upi_score}
              banking={scoreData.pillar_banking_score}
              epfo={scoreData.pillar_epfo_score}
              stability={scoreData.pillar_stability_score}
            />
          </div>

          {/* Miniature pill metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-800/80">
            <div className="text-center bg-slate-950/35 p-2 rounded border border-slate-850">
              <span className="block text-3xs font-mono text-slate-500 uppercase">GST</span>
              <span className="block text-sm font-bold text-slate-200 mt-0.5">{scoreData.pillar_gst_score}</span>
            </div>
            <div className="text-center bg-slate-950/35 p-2 rounded border border-slate-850">
              <span className="block text-3xs font-mono text-slate-500 uppercase">UPI</span>
              <span className="block text-sm font-bold text-slate-200 mt-0.5">{scoreData.pillar_upi_score}</span>
            </div>
            <div className="text-center bg-slate-950/35 p-2 rounded border border-slate-850">
              <span className="block text-3xs font-mono text-slate-500 uppercase">BANKING</span>
              <span className="block text-sm font-bold text-slate-200 mt-0.5">{scoreData.pillar_banking_score}</span>
            </div>
            <div className="text-center bg-slate-950/35 p-2 rounded border border-slate-850">
              <span className="block text-3xs font-mono text-slate-500 uppercase">EPFO</span>
              <span className="block text-sm font-bold text-slate-200 mt-0.5">{scoreData.pillar_epfo_score}</span>
            </div>
            <div className="text-center bg-slate-950/35 p-2 rounded border border-slate-850 col-span-2 sm:col-span-1">
              <span className="block text-3xs font-mono text-slate-500 uppercase">TREND</span>
              <span className="block text-sm font-bold text-slate-200 mt-0.5">{scoreData.pillar_stability_score}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Narrative Auto-generated Score Explanation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center space-x-2.5 mb-3">
          <FileText className="h-4.5 w-4.5 text-teal-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">Automated Score Breakdown Narrative</h3>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/45 p-4 border border-slate-850 rounded-lg">
          {/* We format the bold sections in the generated string dynamically */}
          <p dangerouslySetInnerHTML={{ __html: explanation.text }}></p>
        </div>
      </div>

      {/* Rule-Based Credit Lending Decision Matrix Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Loan eligibility rules card (7-span) */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800/80 pb-3 mb-4 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">Loan Approval Predictor</h3>
              <span className="text-3xs text-slate-500 font-mono uppercase">underwriting rule-engine</span>
            </div>

            <div className="flex items-start space-x-4">
              {scoreData.overall_score >= 70 ? (
                <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-400">
                  <CheckCircle className="h-6 w-6" />
                </div>
              ) : scoreData.overall_score >= 50 ? (
                <div className="bg-amber-950/60 p-2.5 rounded-lg border border-amber-500/20 text-amber-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
              ) : (
                <div className="bg-rose-950/60 p-2.5 rounded-lg border border-rose-500/20 text-rose-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
              )}
              
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-mono uppercase">DECISION STATUS</span>
                <h4 className={`text-lg font-bold ${
                  scoreData.overall_score >= 70 ? 'text-emerald-400' :
                  scoreData.overall_score >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {eligibility.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  {eligibility.text}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-850">
            <span className="block text-3xs font-mono text-slate-500 uppercase tracking-widest mb-2">
              LENDING CONDITIONS & QUOTES
            </span>
            <ul className="space-y-1.5">
              {eligibility.bullets.map((bullet, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-center space-x-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    scoreData.overall_score >= 70 ? 'bg-emerald-400' :
                    scoreData.overall_score >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                  }`}></span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations Action Items (5-span) */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800/80 pb-3 mb-4 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">Action Items</h3>
              <span className="text-3xs text-slate-500 font-mono uppercase">score optimizer</span>
            </div>

            <span className="text-3xs font-mono text-slate-500 uppercase block mb-1">STRATEGY TARGETING</span>
            <h4 className="text-sm font-bold text-teal-400 mb-3">Improve {explanation.bottomFactor}</h4>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Our automated audits show that your {explanation.bottomFactor} has the highest negative coefficient on your aggregate index. Addressing this element directly yields the fastest credit upgrades:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex items-start space-x-2.5">
                <span className="font-mono text-teal-400 font-bold">1.</span>
                <span className="text-slate-300">File returns 3 days ahead of schedule to build strong regulatory consistency.</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex items-start space-x-2.5">
                <span className="font-mono text-teal-400 font-bold">2.</span>
                <span className="text-slate-300">Maintain an average balance reserve ratio equal to 1.5x your EMI outflows.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850/60 mt-4 flex items-center justify-between text-xs text-teal-400 font-medium">
            <span>Ask AI Copilot for a daily guide</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

      </div>

      {/* Alternative Ledger Records Details Tab */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="border-b border-slate-800/80 pb-3 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-2">
              <Award className="h-4 w-4 text-teal-400" />
              <span>Simulated Registry Records</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Read-only real-time feed backing the scoring pillars</p>
          </div>

          {/* Tab Selector buttons */}
          <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-lg space-x-1">
            <button
              onClick={() => setActiveAltTab('gst')}
              className={`px-3 py-1 text-2xs font-medium rounded-md transition-all cursor-pointer ${
                activeAltTab === 'gst' ? 'bg-slate-800 text-teal-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              GST Returns
            </button>
            <button
              onClick={() => setActiveAltTab('upi')}
              className={`px-3 py-1 text-2xs font-medium rounded-md transition-all cursor-pointer ${
                activeAltTab === 'upi' ? 'bg-slate-800 text-teal-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              UPI Transactions
            </button>
            <button
              onClick={() => setActiveAltTab('banking')}
              className={`px-3 py-1 text-2xs font-medium rounded-md transition-all cursor-pointer ${
                activeAltTab === 'banking' ? 'bg-slate-800 text-teal-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Bank Balances
            </button>
            <button
              onClick={() => setActiveAltTab('epfo')}
              className={`px-3 py-1 text-2xs font-medium rounded-md transition-all cursor-pointer ${
                activeAltTab === 'epfo' ? 'bg-slate-800 text-teal-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              EPFO Payroll
            </button>
          </div>
        </div>

        {/* Tab display contents */}
        <div className="overflow-x-auto bg-slate-950/40 border border-slate-850 rounded-lg">
          {activeAltTab === 'gst' && (
            <table className="min-w-full divide-y divide-slate-850 text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-3xs font-mono tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Filing Month</th>
                  <th className="px-4 py-3">Turnover Amount</th>
                  <th className="px-4 py-3">Filing Delay (Days)</th>
                  <th className="px-4 py-3 text-right">Compliance Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 font-mono">
                <tr>
                  <td className="px-4 py-3">2026-06</td>
                  <td className="px-4 py-3">${(gstScoreBase() * 1.05).toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-emerald-400">0 days</td>
                  <td className="px-4 py-3 text-right text-emerald-400">100.00%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2026-05</td>
                  <td className="px-4 py-3">${(gstScoreBase() * 0.98).toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-amber-400">2 days</td>
                  <td className="px-4 py-3 text-right text-teal-400">96.40%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2026-04</td>
                  <td className="px-4 py-3">${(gstScoreBase() * 1.12).toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-rose-400">6 days</td>
                  <td className="px-4 py-3 text-right text-amber-400">89.50%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2026-03</td>
                  <td className="px-4 py-3">${(gstScoreBase() * 0.85).toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-emerald-400">0 days</td>
                  <td className="px-4 py-3 text-right text-emerald-400">100.00%</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeAltTab === 'upi' && (
            <table className="min-w-full divide-y divide-slate-850 text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-3xs font-mono tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Transaction Count</th>
                  <th className="px-4 py-3">Transaction Volume</th>
                  <th className="px-4 py-3">Avg Transaction Size</th>
                  <th className="px-4 py-3 text-right">Inflow/Outflow Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 font-mono">
                <tr>
                  <td className="px-4 py-3">2026-06</td>
                  <td className="px-4 py-3">1,480 txns</td>
                  <td className="px-4 py-3">$112,450.00</td>
                  <td className="px-4 py-3">$75.98</td>
                  <td className="px-4 py-3 text-right text-emerald-400">1.12x</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2026-05</td>
                  <td className="px-4 py-3">1,210 txns</td>
                  <td className="px-4 py-3">$91,200.00</td>
                  <td className="px-4 py-3">$75.37</td>
                  <td className="px-4 py-3 text-right text-teal-400">1.04x</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2026-04</td>
                  <td className="px-4 py-3">1,390 txns</td>
                  <td className="px-4 py-3">$104,300.00</td>
                  <td className="px-4 py-3">$75.04</td>
                  <td className="px-4 py-3 text-right text-rose-400">0.97x</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeAltTab === 'banking' && (
            <table className="min-w-full divide-y divide-slate-850 text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-3xs font-mono tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Average Bank Balance</th>
                  <th className="px-4 py-3">Cheque/Debit Bounces</th>
                  <th className="px-4 py-3 text-right">EMI Debt Outflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 font-mono">
                <tr>
                  <td className="px-4 py-3">2026-06</td>
                  <td className="px-4 py-3">${(gstScoreBase() * 0.18).toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-emerald-400">0 bounces</td>
                  <td className="px-4 py-3 text-right text-slate-400">$3,500.00</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2026-05</td>
                  <td className="px-4 py-3">${(gstScoreBase() * 0.16).toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-amber-400">1 bounce</td>
                  <td className="px-4 py-3 text-right text-slate-400">$3,500.00</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2026-04</td>
                  <td className="px-4 py-3">${(gstScoreBase() * 0.21).toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-emerald-400">0 bounces</td>
                  <td className="px-4 py-3 text-right text-slate-400">$3,500.00</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeAltTab === 'epfo' && (
            <table className="min-w-full divide-y divide-slate-850 text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-3xs font-mono tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Active Employee Count</th>
                  <th className="px-4 py-3 text-right">EPFO Payment Regularity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 font-mono">
                <tr>
                  <td className="px-4 py-3">2026-06</td>
                  <td className="px-4 py-3">{profile.employee_band === '1-10' ? '8 staff' : profile.employee_band === '11-50' ? '32 staff' : '110 staff'}</td>
                  <td className="px-4 py-3 text-right text-emerald-400">100.00% (On-Time)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2026-05</td>
                  <td className="px-4 py-3">{profile.employee_band === '1-10' ? '8 staff' : profile.employee_band === '11-50' ? '31 staff' : '108 staff'}</td>
                  <td className="px-4 py-3 text-right text-teal-400">98.50%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2026-04</td>
                  <td className="px-4 py-3">{profile.employee_band === '1-10' ? '7 staff' : profile.employee_band === '11-50' ? '32 staff' : '105 staff'}</td>
                  <td className="px-4 py-3 text-right text-emerald-400">100.00% (On-Time)</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Model Predictor Segment */}
      <ModelPredictor />

    </div>
  );

  // Quick mock baseline balance based on sector profile
  function gstScoreBase() {
    if (profile.sector === 'manufacturing') return 450000;
    if (profile.sector === 'services') return 120000;
    if (profile.sector === 'agriculture') return 60000;
    return 80000; // retail
  }
}
