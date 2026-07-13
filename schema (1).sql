-- CreditPulse Database Schema
-- Supabase PostgreSQL tables for MSME Financial Health Scoring

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. MSME PROFILES
create table if not exists public.msme_profiles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    business_name text not null,
    sector text not null check (sector in ('retail', 'manufacturing', 'services', 'agriculture')),
    city text not null,
    state text not null,
    ntc_flag boolean not null default false, -- New-to-Credit
    ntb_flag boolean not null default false, -- New-to-Bank
    employee_band text not null, -- e.g., '1-10', '11-50', '51-200', '200+'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.msme_profiles enable row level security;

-- Policy: Users can read/write their own profile
create policy "Users can view their own MSME profiles" 
    on public.msme_profiles for select 
    using (auth.uid() = user_id);

create policy "Users can insert their own MSME profiles" 
    on public.msme_profiles for insert 
    with check (auth.uid() = user_id);

create policy "Users can update their own MSME profiles" 
    on public.msme_profiles for update 
    using (auth.uid() = user_id);


-- 2. ALT DATA: GST COMPLIANCE
create table if not exists public.alt_data_gst (
    id uuid default gen_random_uuid() primary key,
    msme_id uuid not null references public.msme_profiles(id) on delete cascade,
    filing_month text not null, -- e.g., '2026-06'
    turnover numeric(15,2) not null,
    filing_delay_days integer not null default 0,
    compliance_pct numeric(5,2) not null, -- e.g., 95.50 for 95.5%
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.alt_data_gst enable row level security;
create policy "Users can view their own GST data" 
    on public.alt_data_gst for select 
    using (exists (select 1 from public.msme_profiles where id = alt_data_gst.msme_id and user_id = auth.uid()));


-- 3. ALT DATA: UPI TRANSACTION HEALTH
create table if not exists public.alt_data_upi (
    id uuid default gen_random_uuid() primary key,
    msme_id uuid not null references public.msme_profiles(id) on delete cascade,
    month text not null, -- e.g., '2026-06'
    txn_count integer not null,
    txn_volume numeric(15,2) not null,
    avg_txn_size numeric(15,2) not null,
    inflow_outflow_ratio numeric(5,2) not null, -- e.g., 1.15
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.alt_data_upi enable row level security;
create policy "Users can view their own UPI data" 
    on public.alt_data_upi for select 
    using (exists (select 1 from public.msme_profiles where id = alt_data_upi.msme_id and user_id = auth.uid()));


-- 4. ALT DATA: BANKING STABILITY
create table if not exists public.alt_data_banking (
    id uuid default gen_random_uuid() primary key,
    msme_id uuid not null references public.msme_profiles(id) on delete cascade,
    month text not null, -- e.g., '2026-06'
    bank_balance_avg numeric(15,2) not null,
    bounce_count integer not null default 0,
    loan_emi_outflow numeric(15,2) not null default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.alt_data_banking enable row level security;
create policy "Users can view their own Banking data" 
    on public.alt_data_banking for select 
    using (exists (select 1 from public.msme_profiles where id = alt_data_banking.msme_id and user_id = auth.uid()));


-- 5. ALT DATA: EPFO / WORKFORCE STABILITY
create table if not exists public.alt_data_epfo (
    id uuid default gen_random_uuid() primary key,
    msme_id uuid not null references public.msme_profiles(id) on delete cascade,
    month text not null, -- e.g., '2026-06'
    employee_count integer not null,
    contribution_regularity_pct numeric(5,2) not null, -- e.g., 100.00
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.alt_data_epfo enable row level security;
create policy "Users can view their own EPFO data" 
    on public.alt_data_epfo for select 
    using (exists (select 1 from public.msme_profiles where id = alt_data_epfo.msme_id and user_id = auth.uid()));


-- 6. FINANCIAL HEALTH SCORES
create table if not exists public.financial_health_scores (
    id uuid default gen_random_uuid() primary key,
    msme_id uuid not null references public.msme_profiles(id) on delete cascade,
    computed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    overall_score numeric(5,2) not null,
    pillar_gst_score numeric(5,2) not null,
    pillar_upi_score numeric(5,2) not null,
    pillar_banking_score numeric(5,2) not null,
    pillar_epfo_score numeric(5,2) not null,
    pillar_stability_score numeric(5,2) not null,
    risk_band text not null check (risk_band in ('green', 'amber', 'red')),
    loan_eligibility_label text not null, -- 'Likely eligible', 'Eligible with conditions', 'Needs improvement'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.financial_health_scores enable row level security;
create policy "Users can view their own health scores" 
    on public.financial_health_scores for select 
    using (exists (select 1 from public.msme_profiles where id = financial_health_scores.msme_id and user_id = auth.uid()));

-- Bank read-only select access (can be enabled if role check is bypassed for the bank view)
create policy "Bankers can view all scores"
    on public.financial_health_scores for select
    to authenticated
    using (true); -- Gated in the API route later for better security

create policy "Bankers can view all profiles"
    on public.msme_profiles for select
    to authenticated
    using (true);
