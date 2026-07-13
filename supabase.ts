import { createClient } from '@supabase/supabase-js';

// Retrieve keys from Vite's public client environment
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Create actual client if keys are available
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Mock database keys for sandbox mode
const STORAGE_PREFIX = "creditpulse_sandbox_";

// Interface for Mock Auth Session
export interface SandboxUser {
  id: string;
  email: string;
}

export const getSandboxSession = (): SandboxUser | null => {
  const data = localStorage.getItem(`${STORAGE_PREFIX}session`);
  return data ? JSON.parse(data) : null;
};

export const setSandboxSession = (user: SandboxUser | null) => {
  if (user) {
    localStorage.setItem(`${STORAGE_PREFIX}session`, JSON.stringify(user));
  } else {
    localStorage.removeItem(`${STORAGE_PREFIX}session`);
  }
};
