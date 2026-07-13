import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { generateSyntheticData, calculateScores } from './src/lib/synthetic';
import { MSMEProfile, FinancialHealthScore, SectorType } from './src/types';

// Load environmental variables
dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());

// Initialize Supabase if variables are configured
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);

let supabaseClient: any = null;
if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('⚡ Connected full-stack Express server to real Supabase database!');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client on backend:', error);
  }
}

// ----------------------------------------------------
// IN-MEMORY SANDBOX DATABASE
// ----------------------------------------------------
interface SandboxDB {
  profiles: MSMEProfile[];
  gst: any[];
  upi: any[];
  banking: any[];
  epfo: any[];
  scores: FinancialHealthScore[];
}

const sandboxDB: SandboxDB = {
  profiles: [],
  gst: [],
  upi: [],
  banking: [],
  epfo: [],
  scores: []
};

// Seed Sandbox Database with 5 highly polished MSMEs representing different sectors, scales and health
function seedSandboxDatabase() {
  const seedMSMEs = [
    { id: 'msme-seed-1', user_id: 'user-seed-1', business_name: 'Apex Garments Ltd', sector: 'manufacturing' as SectorType, city: 'Coimbatore', state: 'Tamil Nadu', ntc_flag: false, ntb_flag: false, employee_band: '51-200' },
    { id: 'msme-seed-2', user_id: 'user-seed-2', business_name: 'GreenGrow Organic Farms', sector: 'agriculture' as SectorType, city: 'Nashik', state: 'Maharashtra', ntc_flag: true, ntb_flag: false, employee_band: '11-50' },
    { id: 'msme-seed-3', user_id: 'user-seed-3', business_name: 'ByteCraft Technical Solutions', sector: 'services' as SectorType, city: 'Bengaluru', state: 'Karnataka', ntc_flag: false, ntb_flag: false, employee_band: '11-50' },
    { id: 'msme-seed-4', user_id: 'user-seed-4', business_name: 'Saffron Retail Mart', sector: 'retail' as SectorType, city: 'Jaipur', state: 'Rajasthan', ntc_flag: false, ntb_flag: true, employee_band: '1-10' },
    { id: 'msme-seed-5', user_id: 'user-seed-5', business_name: 'Vedic Agro Exports', sector: 'agriculture' as SectorType, city: 'Guntur', state: 'Andhra Pradesh', ntc_flag: false, ntb_flag: false, employee_band: '1-10' }
  ];

  seedMSMEs.forEach((prof, idx) => {
    // Generate predictable/semi-random indices to simulate different tiers of credit health
    // msme-seed-1 (Mfg) -> High Health (Score ~84)
    // msme-seed-2 (Agri NTC) -> Low-mid Health (Score ~48)
    // msme-seed-3 (Serv) -> Medium-high Health (Score ~74)
    // msme-seed-4 (Retail NTB) -> Medium Health (Score ~62)
    // msme-seed-5 (Agri) -> Low Health (Score ~38)
    
    const { gst, upi, banking, epfo, scores } = generateSyntheticData(prof.id, prof.sector, prof.employee_band);
    
    // Customize overall score dynamically for beautiful demo distribution
    if (idx === 0) { // Apex Garments - Green
      scores.overall_score = 86.40;
      scores.pillar_gst_score = 88.50;
      scores.pillar_upi_score = 92.10;
      scores.pillar_banking_score = 84.30;
      scores.pillar_epfo_score = 82.00;
      scores.risk_band = 'green';
      scores.loan_eligibility_label = 'Likely eligible';
    } else if (idx === 1) { // GreenGrow - Amber
      scores.overall_score = 56.10;
      scores.pillar_gst_score = 54.20;
      scores.pillar_upi_score = 62.00;
      scores.pillar_banking_score = 48.00;
      scores.pillar_epfo_score = 64.10;
      scores.risk_band = 'amber';
      scores.loan_eligibility_label = 'Eligible with conditions';
    } else if (idx === 2) { // ByteCraft - Green
      scores.overall_score = 75.80;
      scores.pillar_gst_score = 78.40;
      scores.pillar_upi_score = 70.20;
      scores.pillar_banking_score = 81.50;
      scores.pillar_epfo_score = 74.30;
      scores.risk_band = 'green';
      scores.loan_eligibility_label = 'Likely eligible';
    } else if (idx === 3) { // Saffron - Amber
      scores.overall_score = 64.20;
      scores.pillar_gst_score = 61.50;
      scores.pillar_upi_score = 69.80;
      scores.pillar_banking_score = 58.00;
      scores.pillar_epfo_score = 72.00;
      scores.risk_band = 'amber';
      scores.loan_eligibility_label = 'Eligible with conditions';
    } else if (idx === 4) { // Vedic Agro - Red
      scores.overall_score = 39.50;
      scores.pillar_gst_score = 35.00;
      scores.pillar_upi_score = 41.20;
      scores.pillar_banking_score = 32.50;
      scores.pillar_epfo_score = 54.00;
      scores.risk_band = 'red';
      scores.loan_eligibility_label = 'Needs improvement';
    }

    sandboxDB.profiles.push({ ...prof, created_at: new Date().toISOString() });
    sandboxDB.gst.push(...gst);
    sandboxDB.upi.push(...upi);
    sandboxDB.banking.push(...banking);
    sandboxDB.epfo.push(...epfo);
    sandboxDB.scores.push(scores);
  });
}

// Invoke pre-seeding
seedSandboxDatabase();

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Server connection status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    isSupabaseConfigured,
    supabaseUrl: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 15)}...` : null
  });
});

// GET /api/msme/profile/:user_id - Retrieve a user's MSME profile & health score
app.get('/api/msme/profile/:user_id', async (req, res) => {
  const { user_id } = req.params;
  
  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { data: profile, error } = await supabaseClient
        .from('msme_profiles')
        .select('*')
        .eq('user_id', user_id)
        .single();
        
      if (error || !profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      const { data: score } = await supabaseClient
        .from('financial_health_scores')
        .select('*')
        .eq('msme_id', profile.id)
        .single();
        
      return res.json({ profile, score });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  
  // Sandbox Database scan
  const profile = sandboxDB.profiles.find(p => p.user_id === user_id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  
  const score = sandboxDB.scores.find(s => s.msme_id === profile.id);
  return res.json({ profile, score });
});

// 1. POST /api/msme/onboard
app.post('/api/msme/onboard', async (req, res) => {
  const { 
    user_id, 
    business_name, 
    sector, 
    city, 
    state, 
    ntc_flag, 
    ntb_flag, 
    employee_band 
  } = req.body;

  if (!user_id || !business_name || !sector || !city || !state || !employee_band) {
    return res.status(400).json({ error: 'Missing required profile fields' });
  }

  // --- Real Supabase Path ---
  if (isSupabaseConfigured && supabaseClient) {
    try {
      // 1. Insert Profile
      const { data: profileData, error: profileError } = await supabaseClient
        .from('msme_profiles')
        .insert({
          user_id,
          business_name,
          sector,
          city,
          state,
          ntc_flag: !!ntc_flag,
          ntb_flag: !!ntb_flag,
          employee_band
        })
        .select();

      if (profileError || !profileData || profileData.length === 0) {
        throw new Error(profileError?.message || 'Profile insertion yielded no rows');
      }

      const newMsmeId = profileData[0].id;

      // 2. Generate and Insert Synthetic Data (GST, UPI, Banking, EPFO)
      const synthetic = generateSyntheticData(newMsmeId, sector as SectorType, employee_band);

      await Promise.all([
        supabaseClient.from('alt_data_gst').insert(synthetic.gst),
        supabaseClient.from('alt_data_upi').insert(synthetic.upi),
        supabaseClient.from('alt_data_banking').insert(synthetic.banking),
        supabaseClient.from('alt_data_epfo').insert(synthetic.epfo)
      ]);

      // 3. Save calculated score record
      const { data: scoreData, error: scoreError } = await supabaseClient
        .from('financial_health_scores')
        .insert(synthetic.scores)
        .select();

      if (scoreError) {
        console.error('Score saving error:', scoreError);
      }

      return res.json({
        status: 'success',
        msme_id: newMsmeId,
        scores: scoreData ? scoreData[0] : synthetic.scores
      });

    } catch (err: any) {
      console.error('Supabase Onboarding Failure:', err);
      return res.status(500).json({ error: `Supabase Onboarding failed: ${err.message}` });
    }
  }

  // --- Sandbox Simulation Path ---
  const newMsmeId = `msme-local-${Math.random().toString(36).substring(2, 9)}`;
  const newProfile: MSMEProfile = {
    id: newMsmeId,
    user_id,
    business_name,
    sector: sector as SectorType,
    city,
    state,
    ntc_flag: !!ntc_flag,
    ntb_flag: !!ntb_flag,
    employee_band,
    created_at: new Date().toISOString()
  };

  const synthetic = generateSyntheticData(newMsmeId, sector as SectorType, employee_band);
  
  sandboxDB.profiles.push(newProfile);
  sandboxDB.gst.push(...synthetic.gst);
  sandboxDB.upi.push(...synthetic.upi);
  sandboxDB.banking.push(...synthetic.banking);
  sandboxDB.epfo.push(...synthetic.epfo);
  sandboxDB.scores.push(synthetic.scores);

  return res.json({
    status: 'success',
    msme_id: newMsmeId,
    scores: synthetic.scores
  });
});

// 2. GET /api/score/{msme_id}
app.get('/api/score/:msme_id', async (req, res) => {
  const { msme_id } = req.params;

  if (!msme_id) {
    return res.status(400).json({ error: 'MSME ID is required' });
  }

  // --- Real Supabase Path ---
  if (isSupabaseConfigured && supabaseClient) {
    try {
      // Fetch score
      const { data: scoreData, error: scoreError } = await supabaseClient
        .from('financial_health_scores')
        .select('*')
        .eq('msme_id', msme_id)
        .single();

      if (scoreData) {
        return res.json(scoreData);
      }

      // If score not cached, fetch all alt-data and calculate on the fly
      const [gstRes, upiRes, bankingRes, epfoRes] = await Promise.all([
        supabaseClient.from('alt_data_gst').select('*').eq('msme_id', msme_id),
        supabaseClient.from('alt_data_upi').select('*').eq('msme_id', msme_id),
        supabaseClient.from('alt_data_banking').select('*').eq('msme_id', msme_id),
        supabaseClient.from('alt_data_epfo').select('*').eq('msme_id', msme_id)
      ]);

      const calculated = calculateScores(
        msme_id,
        gstRes.data || [],
        upiRes.data || [],
        bankingRes.data || [],
        epfoRes.data || []
      );

      // Save it
      await supabaseClient.from('financial_health_scores').insert(calculated);

      return res.json(calculated);

    } catch (err: any) {
      console.error('Supabase Score Query Error:', err);
      return res.status(500).json({ error: `Failed to query scores from Supabase: ${err.message}` });
    }
  }

  // --- Sandbox Simulation Path ---
  const cachedScore = sandboxDB.scores.find(s => s.msme_id === msme_id);
  if (cachedScore) {
    return res.json(cachedScore);
  }

  // Generate on the fly if profile exists
  const profile = sandboxDB.profiles.find(p => p.id === msme_id);
  if (profile) {
    const synthetic = generateSyntheticData(msme_id, profile.sector, profile.employee_band);
    sandboxDB.gst.push(...synthetic.gst);
    sandboxDB.upi.push(...synthetic.upi);
    sandboxDB.banking.push(...synthetic.banking);
    sandboxDB.epfo.push(...synthetic.epfo);
    sandboxDB.scores.push(synthetic.scores);
    return res.json(synthetic.scores);
  }

  return res.status(404).json({ error: 'MSME profile not found' });
});

// 3. GET /api/bank/list
app.get('/api/bank/list', async (req, res) => {
  // --- Real Supabase Path ---
  if (isSupabaseConfigured && supabaseClient) {
    try {
      const [profilesRes, scoresRes] = await Promise.all([
        supabaseClient.from('msme_profiles').select('*'),
        supabaseClient.from('financial_health_scores').select('*')
      ]);

      const profiles = profilesRes.data || [];
      const scoresMap = new Map<string, any>( (scoresRes.data || []).map((s: any) => [s.msme_id, s]) );

      const result = profiles.map((p: any) => {
        const score = (scoresMap.get(p.id) || {}) as any;
        return {
          id: p.id,
          business_name: p.business_name,
          sector: p.sector,
          city: p.city,
          state: p.state,
          employee_band: p.employee_band,
          overall_score: score.overall_score || 0,
          risk_band: score.risk_band || 'amber',
          loan_eligibility_label: score.loan_eligibility_label || 'Needs improvement'
        };
      });

      result.sort((a, b) => b.overall_score - a.overall_score);
      return res.json(result);

    } catch (err: any) {
      console.error('Supabase Bank List Error:', err);
      return res.status(500).json({ error: `Supabase database error: ${err.message}` });
    }
  }

  // --- Sandbox Simulation Path ---
  const result = sandboxDB.profiles.map(p => {
    const score = sandboxDB.scores.find(s => s.msme_id === p.id) || {
      overall_score: 0,
      risk_band: 'amber' as const,
      loan_eligibility_label: 'Needs improvement' as const
    };
    return {
      id: p.id,
      business_name: p.business_name,
      sector: p.sector,
      city: p.city,
      state: p.state,
      employee_band: p.employee_band,
      overall_score: score.overall_score,
      risk_band: score.risk_band,
      loan_eligibility_label: score.loan_eligibility_label
    };
  });

  result.sort((a, b) => b.overall_score - a.overall_score);
  return res.json(result);
});

// Mock Auth endpoints for sandbox/iframe testing
app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const mockUserId = `user-local-${Math.random().toString(36).substring(2, 9)}`;
  return res.json({
    user: { id: mockUserId, email },
    session: { access_token: `token-${mockUserId}` }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const mockUserId = `user-local-${Math.random().toString(36).substring(2, 9)}`;
  return res.json({
    user: { id: mockUserId, email },
    session: { access_token: `token-${mockUserId}` }
  });
});

// ----------------------------------------------------
// VITE / STATIC SERVING INTEGRATION
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CreditPulse full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
