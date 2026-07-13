import React, { useState } from 'react';
import { MSMEProfile, SectorType } from '../types';
import { UserCheck, Sparkles, Building, Landmark, Globe, HelpCircle } from 'lucide-react';

interface OnboardFormProps {
  userId: string;
  onOnboardSuccess: (msmeId: string, profile: MSMEProfile, scoreData: any) => void;
}

export default function OnboardForm({ userId, onOnboardSuccess }: OnboardFormProps) {
  const [businessName, setBusinessName] = useState('');
  const [sector, setSector] = useState<SectorType>('services');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [ntcFlag, setNtcFlag] = useState(false); // New-to-credit
  const [ntbFlag, setNtbFlag] = useState(false); // New-to-bank
  const [employeeBand, setEmployeeBand] = useState('11-50');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !city || !state || !employeeBand) {
      setErrorMsg('Please populate all fields in the form.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/msme/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          business_name: businessName,
          sector,
          city,
          state,
          ntc_flag: ntcFlag,
          ntb_flag: ntbFlag,
          employee_band: employeeBand
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to onboard business profile.');
      }

      // Handle successful onboarding
      const createdProfile: MSMEProfile = {
        id: data.msme_id,
        user_id: userId,
        business_name: businessName,
        sector,
        city,
        state,
        ntc_flag: ntcFlag,
        ntb_flag: ntbFlag,
        employee_band: employeeBand
      };

      onOnboardSuccess(data.msme_id, createdProfile, data.scores);
    } catch (err: any) {
      console.error('Onboard error:', err);
      setErrorMsg(err.message || 'An error occurred during onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoMSME = () => {
    const demoProfiles = [
      { name: 'Mahalakshmi Textiles & Weavers', sector: 'manufacturing' as SectorType, city: 'Erode', state: 'Tamil Nadu', ntc: false, ntb: false, band: '11-50' },
      { name: 'Karnataka Spice Farms & Exports', sector: 'agriculture' as SectorType, city: 'Coorg', state: 'Karnataka', ntc: true, ntb: false, band: '1-10' },
      { name: 'Himalayan Herbal Wellness Ltd', sector: 'manufacturing' as SectorType, city: 'Dehradun', state: 'Uttarakhand', ntc: false, ntb: false, band: '51-200' },
      { name: 'Saraswati Technical Consultants', sector: 'services' as SectorType, city: 'Pune', state: 'Maharashtra', ntc: false, ntb: true, band: '11-50' },
      { name: 'Rajputana Heritage Craft Mart', sector: 'retail' as SectorType, city: 'Jodhpur', state: 'Rajasthan', ntc: true, ntb: true, band: '1-10' },
      { name: 'Coastal Delights Aquaculture', sector: 'agriculture' as SectorType, city: 'Kochi', state: 'Kerala', ntc: false, ntb: false, band: '11-50' },
      { name: 'Gaurav Auto Components', sector: 'manufacturing' as SectorType, city: 'Gurugram', state: 'Haryana', ntc: false, ntb: false, band: '51-200' }
    ];

    const randomProfile = demoProfiles[Math.floor(Math.random() * demoProfiles.length)];
    
    setBusinessName(randomProfile.name);
    setSector(randomProfile.sector);
    setCity(randomProfile.city);
    setState(randomProfile.state);
    setNtcFlag(randomProfile.ntc);
    setNtbFlag(randomProfile.ntb);
    setEmployeeBand(randomProfile.band);
  };

  return (
    <div id="onboard-form-layout" className="max-w-xl mx-auto my-8 p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-xl text-slate-100 font-sans">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-teal-500/10 p-2.5 rounded-lg text-teal-400">
          <UserCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Onboard Your Business</h2>
          <p className="text-xs text-slate-400 mt-0.5">Setup alternative data integrations to calculate your Health Score</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
          {errorMsg}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Business Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase mb-1.5">
            Registered Business Name
          </label>
          <input
            id="onboard-business-name"
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="e.g. Mahalakshmi Weaving Enterprise"
          />
        </div>

        {/* Sector and Scale */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase mb-1.5">
              Industry Sector
            </label>
            <select
              id="onboard-sector-select"
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorType)}
              className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="retail">Retail Trade</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="services">Services Industry</option>
              <option value="agriculture">Agribusiness & Farming</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase mb-1.5">
              Workforce Size
            </label>
            <select
              id="onboard-workforce-select"
              value={employeeBand}
              onChange={(e) => setEmployeeBand(e.target.value)}
              className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="1-10">Micro (1 - 10 staff)</option>
              <option value="11-50">Small (11 - 50 staff)</option>
              <option value="51-200">Medium (51 - 200 staff)</option>
              <option value="200+">Large (200+ staff)</option>
            </select>
          </div>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase mb-1.5">
              City
            </label>
            <input
              id="onboard-city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-teal-500"
              placeholder="e.g. Coimbatore"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase mb-1.5">
              State
            </label>
            <input
              id="onboard-state"
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-teal-500"
              placeholder="e.g. Tamil Nadu"
            />
          </div>
        </div>

        {/* Credit History Flag togglers */}
        <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-lg space-y-4">
          <span className="block text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase">
            Alternative Credit Profile Indicators
          </span>

          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-medium text-white">New-to-Credit (NTC)</span>
              <span className="block text-3xs text-slate-500 max-w-[320px]">Check this if your business has never had a commercial loan or traditional bank credit score before.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="onboard-ntc-checkbox"
                type="checkbox"
                checked={ntcFlag}
                onChange={(e) => setNtcFlag(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 peer-checked:after:bg-slate-950"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-slate-850 pt-3">
            <div>
              <span className="block text-sm font-medium text-white">New-to-Bank (NTB)</span>
              <span className="block text-3xs text-slate-500 max-w-[320px]">Check this if your business was recently founded or lacks long-term banking relationships.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="onboard-ntb-checkbox"
                type="checkbox"
                checked={ntbFlag}
                onChange={(e) => setNtbFlag(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 peer-checked:after:bg-slate-950"></div>
            </label>
          </div>
        </div>

        {/* Integration Notification */}
        <div className="text-3xs text-slate-500 flex items-start space-x-2 bg-slate-950/20 p-3 border border-slate-800/40 rounded-lg leading-relaxed">
          <Sparkles className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
          <p>
            By onboarding, Vittscore will authorize read-only secure APIs with regulatory networks: **GSTN filing systems**, **NPCI UPI banking gateways**, and the **EPFO employees registry** to aggregate alternative transactional footprints.
          </p>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            id="onboard-demo-btn"
            type="button"
            onClick={loadDemoMSME}
            className="flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer text-center"
          >
            Autofill Demo Info
          </button>

          <button
            id="onboard-submit-btn"
            type="submit"
            disabled={loading}
            className="flex-[2] py-2.5 px-4 rounded-lg text-sm font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 disabled:bg-slate-800 disabled:text-slate-500 transition-colors cursor-pointer text-center"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Generating alt records...</span>
              </span>
            ) : (
              'Connect Records & Score'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
