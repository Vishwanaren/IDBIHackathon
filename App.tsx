/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import OnboardForm from './components/OnboardForm';
import ScoreDashboard from './components/ScoreDashboard';
import AICopilot from './components/AICopilot';
import BankPortal from './components/BankPortal';
import { MSMEProfile, FinancialHealthScore } from './types';
import { isSupabaseConfigured, getSandboxSession, setSandboxSession, supabase } from './lib/supabase';
import { AlertCircle, HelpCircle, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<{ user: { id: string; email: string } } | null>(null);
  const [profile, setProfile] = useState<MSMEProfile | null>(null);
  const [scoreData, setScoreData] = useState<FinancialHealthScore | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);

  // 1. Handle session detection on startup
  useEffect(() => {
    async function checkAuth() {
      setLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          // --- REAL SUPABASE SESSION CHECK ---
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const userObj = {
              id: data.session.user.id,
              email: data.session.user.email || ""
            };
            setSession({ user: userObj });
            await fetchMSMEProfile(userObj.id);
          }
        } else {
          // --- SANDBOX SESSION CHECK ---
          const sandboxUser = getSandboxSession();
          if (sandboxUser) {
            setSession({ user: sandboxUser });
            await fetchMSMEProfile(sandboxUser.id);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Fetch MSME profile and score on auth state change
  const fetchMSMEProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/msme/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setScoreData(data.score);
        setCurrentTab('dashboard');
      } else {
        // If 404 (No profile found), force redirect to onboarding
        setProfile(null);
        setScoreData(null);
        setCurrentTab('onboard');
      }
    } catch (err) {
      console.error('Profile fetching error:', err);
    }
  };

  // 3. Handle Auth Success Trigger
  const handleAuthSuccess = async (newSession: { user: { id: string; email: string } }) => {
    setSession(newSession);
    setLoading(true);
    await fetchMSMEProfile(newSession.user.id);
    setLoading(false);
  };

  // 4. Handle Logout Trigger
  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      setSandboxSession(null);
    }
    setSession(null);
    setProfile(null);
    setScoreData(null);
    setCurrentTab('dashboard');
  };

  // 5. Handle Onboarding Success Trigger
  const handleOnboardSuccess = (msmeId: string, newProfile: MSMEProfile, scores: FinancialHealthScore) => {
    setProfile(newProfile);
    setScoreData(scores);
    setCurrentTab('dashboard');
  };

  if (loading) {
    return (
      <div id="app-loading-screen" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <span className="h-10 w-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></span>
        <p className="mt-4 text-xs font-mono text-slate-400 tracking-wider uppercase">Loading Operational Ledger...</p>
      </div>
    );
  }

  // If no active session, render Auth Sign In / Sign Up Screen
  if (!session) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div id="app-viewport" className="min-h-screen bg-slate-950 flex flex-col text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Top sticky Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        userEmail={session.user.email}
        onLogout={handleLogout}
      />

      {/* Main Layout Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-4 px-4 sm:px-6 lg:px-8">
        
        {/* Helper Alert Banner for Non-Onboarded MSMEs */}
        {currentTab === 'dashboard' && !profile && (
          <div id="no-profile-warning" className="p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-lg mx-auto text-center space-y-4 my-8">
            <ShieldAlert className="h-12 w-12 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Onboarded Business Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You must first onboard your business profile and connect alternative ledger records to generate your Vittscore Financial Health Score.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('onboard')}
              className="inline-flex items-center space-x-2 py-2 px-4 rounded-lg bg-teal-400 text-slate-950 text-xs font-semibold hover:bg-teal-300 transition-colors cursor-pointer"
            >
              <span>Onboard Business Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Tab Routing Rendering Area with Framer Motion transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full"
          >
            {currentTab === 'dashboard' && profile && scoreData && (
              <ScoreDashboard profile={profile} scoreData={scoreData} />
            )}

            {currentTab === 'onboard' && (
              <OnboardForm userId={session.user.id} onOnboardSuccess={handleOnboardSuccess} />
            )}

            {currentTab === 'copilot' && (
              <AICopilot />
            )}

            {currentTab === 'bank' && (
              <BankPortal />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Humble Footer */}
      <footer id="app-footer" className="bg-slate-950 py-6 border-t border-slate-900 text-center text-4xs font-mono text-slate-600 tracking-widest uppercase">
        <span>© 2026 VITTSCORE FINTECH PLATFORM • ALL RIGHTS RESERVED</span>
      </footer>

    </div>
  );
}
