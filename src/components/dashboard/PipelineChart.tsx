import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { HiringStage } from '../../types/candidate.ts';

interface PipelineChartProps {
  stageCounts: Record<HiringStage, number>;
}

export const PipelineChart: React.FC<PipelineChartProps> = ({ stageCounts }) => {
  const data = [
    { stage: 'Applied', count: stageCounts.Applied || 0, color: '#64748b' },
    { stage: 'Screening', count: stageCounts.Screening || 0, color: '#f59e0b' },
    { stage: 'Interview', count: stageCounts.Interview || 0, color: '#4f46e5' },
    { stage: 'Offer', count: stageCounts.Offer || 0, color: '#9333ea' },
    { stage: 'Hired', count: stageCounts.Hired || 0, color: '#059669' },
    { stage: 'Rejected', count: stageCounts.Rejected || 0, color: '#e11d48' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Hiring Pipeline Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Active candidate density across evaluation stages
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="stage"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
                      <p className="font-semibold">{item.stage}</p>
                      <p className="font-mono text-indigo-300 tabular-nums">
                        {item.count} {item.count === 1 ? 'candidate' : 'candidates'}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
