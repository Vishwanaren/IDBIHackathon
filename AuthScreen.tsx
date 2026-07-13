import React, { useState } from 'react';
import { Activity, ShieldCheck, Mail, Lock, LogIn, Sparkles, HelpCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured, setSandboxSession } from '../lib/supabase';

interface AuthScreenProps {
  onAuthSuccess: (session: { user: { id: string; email: string } }) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // --- REAL SUPABASE AUTHENTICATION ---
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          if (data?.user) {
            alert('Signup successful! Please check your email or proceed to sign in.');
            setIsSignUp(false);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          if (data?.user) {
            onAuthSuccess({
              user: {
                id: data.user.id,
                email: data.user.email || email
              }
            });
          }
        }
      } else {
        // --- LOCAL SANDBOX MODE AUTHENTICATION ---
        // Simulates auth via a local POST call to Express or purely client-side session handling
        const response = await fetch(`/api/auth/${isSignUp ? 'signup' : 'login'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }

        setSandboxSession({ id: data.user.id, email: data.user.email });
        onAuthSuccess({
          user: {
            id: data.user.id,
            email: data.user.email
          }
        });
      }
    } catch (err: any) {
      console.error('Auth submit error:', err);
      setErrorMsg(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const autofillSandbox = (role: 'msme' | 'bank') => {
    if (role === 'msme') {
      setEmail('founder@garments.co');
    } else {
      setEmail('underwriter@fintechbank.com');
    }
    setPassword('demopass123');
  };

  return (
    <div id="auth-screen-layout" className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Core Icon Branding */}
        <div className="mx-auto h-12 w-12 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/10">
          <Activity className="h-6 w-6 stroke-[2.5]" />
        </div>
        
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
          Vitt<span className="text-teal-400">score</span>
        </h2>
        <p className="mt-2 text-xs text-slate-400 font-mono tracking-wider uppercase">
          MSME Alternative Data Financial Health Scoring
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 border border-slate-800 shadow-xl sm:rounded-xl sm:px-10">
          {/* Info Banner on Sandbox vs Real */}
          {!isSupabaseConfigured && (
            <div className="mb-6 p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs flex items-start space-x-2.5">
              <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-400 block">Sandbox Active Mode</span>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  Supabase environment variables not found. We have auto-enabled the local simulation sandbox with mock databases to guarantee an instant walk-through.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleAuthSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase mb-1.5">
                Business Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-sans"
                  placeholder="name@business.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase mb-1.5">
                Secure Account Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-sans"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 transition-colors"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Scoping credentials...</span>
                </span>
              ) : isSignUp ? (
                'Create Vittscore Account'
              ) : (
                'Access Credit Dashboard'
              )}
            </button>
          </form>

          {/* Switch Tab */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-teal-400 hover:text-teal-300 underline font-medium cursor-pointer"
            >
              {isSignUp ? 'Already have a profile? Sign In' : "Don't have a profile yet? Register here"}
            </button>
          </div>

          {/* Sandbox Autofill Buttons */}
          {!isSupabaseConfigured && (
            <div className="mt-8 pt-6 border-t border-slate-800/60">
              <span className="block text-center text-3xs font-mono text-slate-500 tracking-widest uppercase mb-3">
                FAST SANDBOX AUTO-FILLS
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => autofillSandbox('msme')}
                  className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-3xs font-mono text-teal-400 transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Founder Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => autofillSandbox('bank')}
                  className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-3xs font-mono text-amber-400 transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Banker Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
