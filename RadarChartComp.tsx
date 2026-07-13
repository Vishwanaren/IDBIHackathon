import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';

interface RadarChartCompProps {
  gst: number;
  upi: number;
  banking: number;
  epfo: number;
  stability: number;
}

export default function RadarChartComp({ gst, upi, banking, epfo, stability }: RadarChartCompProps) {
  // Map our pillars to clean labels for Recharts
  const data = [
    { subject: 'GST Compliance', value: gst },
    { subject: 'UPI Transaction Health', value: upi },
    { subject: 'Banking Stability', value: banking },
    { subject: 'EPFO & Payroll', value: epfo },
    { subject: 'Cashflow Trend', value: stability }
  ];

  return (
    <div id="radar-chart-container" className="w-full h-[280px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#475569', fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#14b8a6"
            fill="#14b8a6"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
