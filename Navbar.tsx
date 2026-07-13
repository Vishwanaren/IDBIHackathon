import React from 'react';
import { Activity, LayoutDashboard, UserCheck, MessageSquare, Landmark, LogOut } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userEmail?: string;
  onLogout: () => void;
}

export default function Navbar({ currentTab, onTabChange, userEmail, onLogout }: NavbarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Vittscore', icon: LayoutDashboard },
    { id: 'onboard', label: 'Onboard Business', icon: UserCheck },
    { id: 'copilot', label: 'AI Copilot', icon: MessageSquare },
    { id: 'bank', label: 'Bank Portal', icon: Landmark }
  ];

  return (
    <header id="app-navbar" className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center w-full">
          {/* Logo & Platform Name (Left) */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => onTabChange('dashboard')}>
            <div className="bg-teal-500/10 p-2 rounded-lg flex items-center justify-center text-teal-400 border border-teal-500/20 shadow-md">
              <Activity className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Vitt<span className="text-teal-400">score</span>
              </span>
              <span className="block text-3xs text-slate-400 -mt-0.5 tracking-wider uppercase font-sans">MSME HEALTH platform</span>
            </div>
          </div>

          {/* Spacer to push everything to the right */}
          <div className="flex-1 hidden md:block"></div>

          {/* Navigation Links and Icons closely grouped on the Right */}
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-800 text-teal-400 font-semibold border border-slate-700/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Auth & Environment Badge */}
            {isSupabaseConfigured ? (
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-teal-950/45 text-teal-400 text-2xs font-medium border border-teal-500/20" title="Fully integrated with Supabase Database & Auth services">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                <span className="text-3xs uppercase font-sans">Supabase Live</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-2xs font-medium border border-slate-700" title="Running in Local Sandbox mode.">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-3xs uppercase font-sans">Local Sandbox</span>
              </span>
            )}

            {/* Profile & Logout */}
            {userEmail && (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <span className="block text-3xs text-slate-500 uppercase font-sans">LOGGED IN</span>
                  <span className="block text-xs font-semibold text-slate-300 max-w-[130px] truncate">{userEmail}</span>
                </div>
                <button
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Rail */}
      <div className="md:hidden bg-slate-950 border-t border-slate-800 flex justify-around py-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-md text-3xs transition-colors ${
                isActive
                  ? 'text-teal-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
