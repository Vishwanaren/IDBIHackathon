import React, { useState, useEffect } from 'react';
import { BankMSMERecord, SectorType } from '../types';
import { Landmark, Search, ArrowUpDown, Filter, ChevronRight, Activity, MapPin, Users } from 'lucide-react';

export default function BankPortal() {
  const [records, setRecords] = useState<BankMSMERecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortAsc, setSortAsc] = useState(false);

  // Load records from Express API list endpoint
  useEffect(() => {
    fetchBankRecords();
  }, []);

  const fetchBankRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bank/list');
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Error fetching bank list:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sort function
  const toggleSort = () => {
    const sorted = [...records].sort((a, b) => {
      return sortAsc 
        ? a.overall_score - b.overall_score 
        : b.overall_score - a.overall_score;
    });
    setRecords(sorted);
    setSortAsc(!sortAsc);
  };

  // Filtering records dynamically
  const filteredRecords = records.filter(rec => {
    const matchesSearch = rec.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'all' || rec.sector === sectorFilter;
    const matchesRisk = riskFilter === 'all' || rec.risk_band === riskFilter;

    return matchesSearch && matchesSector && matchesRisk;
  });

  return (
    <div id="bank-portal-panel" className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-slate-200 font-sans space-y-6">
      
      {/* Portal Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500/10 p-2.5 rounded-lg text-amber-400">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <span className="text-3xs font-mono font-bold text-amber-400 tracking-widest uppercase bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded">
              GATED UNDERWRITER ACCESS
            </span>
            <h1 className="text-xl font-bold text-white mt-1">Institutional Credit Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">Evaluate and triage MSME credit applications using real-time alternative transactional data</p>
          </div>
        </div>
        
        <div className="hidden sm:block text-right">
          <span className="block text-2xs text-slate-500 font-mono">ACTIVE UNDERWRITERS</span>
          <span className="block text-xs font-semibold text-slate-300">Fast-Track Approvals v1.2</span>
        </div>
      </div>

      {/* Filtering Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        
        {/* Search */}
        <div className="md:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            id="bank-search-input"
            type="text"
            placeholder="Search by business name, city, state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Sector Filter */}
        <div className="md:col-span-3">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <select
              id="bank-sector-filter"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full bg-transparent border-0 text-xs text-slate-300 focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="all">All Sectors</option>
              <option value="retail">Retail Trade</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="services">Services</option>
              <option value="agriculture">Agriculture</option>
            </select>
          </div>
        </div>

        {/* Risk Band Filter */}
        <div className="md:col-span-3">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <select
              id="bank-risk-filter"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-transparent border-0 text-xs text-slate-300 focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="all">All Risk Bands</option>
              <option value="green">Low Risk (Green)</option>
              <option value="amber">Medium Risk (Amber)</option>
              <option value="red">High Risk (Red)</option>
            </select>
          </div>
        </div>

        {/* Refresh button */}
        <div className="md:col-span-1 flex justify-end">
          <button
            id="bank-refresh-btn"
            onClick={fetchBankRecords}
            className="w-full text-center py-2 bg-slate-800 hover:bg-slate-700 text-3xs font-mono font-semibold uppercase rounded-lg border border-slate-700 cursor-pointer text-slate-300 transition-colors"
          >
            sync
          </button>
        </div>

      </div>

      {/* Main Records Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <span className="inline-block h-8 w-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin"></span>
            <p className="mt-3 text-xs font-mono">Syncing alternative registry records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            No MSME records found matching search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
              <thead className="bg-slate-950 text-3xs font-mono tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Business Profile</th>
                  <th className="px-6 py-4">Industry Sector</th>
                  <th className="px-6 py-4">Credit Score Axis</th>
                  <th className="px-6 py-4">Risk Rating</th>
                  <th className="px-6 py-4">Eligible Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-850/30 transition-colors">
                    {/* Name and location */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-sm">{rec.business_name}</div>
                      <div className="text-3xs text-slate-500 flex items-center mt-1 space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{rec.city}, {rec.state}</span>
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="px-6 py-4">
                      <span className="capitalize text-slate-300 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-3xs font-mono">
                        {rec.sector}
                      </span>
                      <span className="block text-4xs text-slate-500 mt-1 font-mono">
                        {rec.employee_band} Employees
                      </span>
                    </td>

                    {/* Score column with sortable visualizer */}
                    <td className="px-6 py-4 font-mono">
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-bold ${
                          rec.risk_band === 'green' ? 'text-emerald-400' :
                          rec.risk_band === 'amber' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {rec.overall_score.toFixed(1)}
                        </span>
                        
                        {/* Miniature progress bar */}
                        <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full rounded-full ${
                              rec.risk_band === 'green' ? 'bg-emerald-400' :
                              rec.risk_band === 'amber' ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${rec.overall_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="px-6 py-4 uppercase text-2xs font-bold tracking-wider">
                      {rec.risk_band === 'green' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/10">
                          Low Risk
                        </span>
                      ) : rec.risk_band === 'amber' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400 border border-amber-500/10">
                          Medium
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-950/40 text-rose-400 border border-rose-500/10">
                          High Risk
                        </span>
                      )}
                    </td>

                    {/* Eligibility Label */}
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {rec.loan_eligibility_label}
                    </td>

                    {/* Sort or view profile trigger */}
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all cursor-pointer">
                        <ChevronRight className="h-4.5 w-4.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
export { BankPortal };
