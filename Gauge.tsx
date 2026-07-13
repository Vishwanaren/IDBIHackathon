import React from 'react';

interface GaugeProps {
  score: number;
  riskBand: 'green' | 'amber' | 'red';
  size?: number;
}

export default function Gauge({ score, riskBand, size = 200 }: GaugeProps) {
  const radius = 80;
  const strokeWidth = 14;
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Circumference of our circle
  const circumference = 2 * Math.PI * radius;
  
  // We want a semi-circle or 3/4 circle. Let's make it a 3/4 gauge (270 degrees).
  // Total gauge path length is 270 degrees (3/4 of circumference)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (normalizedScore / 100) * arcLength;

  // Visual styling color map
  const colors = {
    green: {
      text: 'text-emerald-400',
      stroke: 'stroke-emerald-400',
      bg: 'stroke-emerald-950/40',
      glow: 'shadow-emerald-950/20',
      label: 'Low Risk',
      badge: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
    },
    amber: {
      text: 'text-amber-400',
      stroke: 'stroke-amber-400',
      bg: 'stroke-amber-950/40',
      glow: 'shadow-amber-950/20',
      label: 'Medium Risk',
      badge: 'bg-amber-950/40 text-amber-400 border-amber-500/20'
    },
    red: {
      text: 'text-rose-400',
      stroke: 'stroke-rose-400',
      bg: 'stroke-rose-950/40',
      glow: 'shadow-rose-950/20',
      label: 'High Risk',
      badge: 'bg-rose-950/40 text-rose-400 border-rose-500/20'
    }
  };

  const style = colors[riskBand] || colors.amber;

  return (
    <div id="gauge-container" className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Arc Circle Gauge */}
        <svg
          className="transform -rotate-225"
          width={size}
          height={size}
          viewBox="0 0 200 200"
        >
          {/* Background Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className={`${style.bg} fill-none`}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          {/* Foreground Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className={`${style.stroke} fill-none transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset + (circumference - arcLength)}
            strokeLinecap="round"
          />
        </svg>

        {/* Floating Core Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
          <span className="text-sm font-mono tracking-wider text-slate-400">HEALTH INDEX</span>
          <span className={`text-5xl font-bold tracking-tight font-sans ${style.text}`}>
            {score.toFixed(0)}
          </span>
          <span className="text-xs text-slate-500 mt-0.5">out of 100</span>
          
          <div className={`mt-2 px-2.5 py-0.5 rounded text-2xs font-semibold uppercase tracking-wider border ${style.badge}`}>
            {style.label}
          </div>
        </div>
      </div>
    </div>
  );
}
