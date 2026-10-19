import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 animate-pulse">
      <div className="h-6 bg-slate-200 rounded-md w-1/4" />
      <div className="h-4 bg-slate-100 rounded-md w-1/2" />
      <div className="space-y-3 pt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded-md w-1/3" />
              <div className="h-3 bg-slate-100 rounded-md w-1/4" />
            </div>
            <div className="h-6 bg-slate-100 rounded-md w-24 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
