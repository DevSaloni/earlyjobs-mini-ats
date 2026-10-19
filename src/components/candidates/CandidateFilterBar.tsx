import React from 'react';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';
import { HiringStage, HIRING_STAGES } from '../../types/candidate.ts';

interface CandidateFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedStage: string;
  onStageChange: (val: string) => void;
  selectedJob: string;
  onJobChange: (val: string) => void;
  sortOrder: 'desc' | 'asc';
  onToggleSortOrder: () => void;
  availableJobs: string[];
  onClearFilters: () => void;
  totalResults: number;
}

export const CandidateFilterBar: React.FC<CandidateFilterBarProps> = ({
  search,
  onSearchChange,
  selectedStage,
  onStageChange,
  selectedJob,
  onJobChange,
  sortOrder,
  onToggleSortOrder,
  availableJobs,
  onClearFilters,
  totalResults,
}) => {
  const hasActiveFilters =
    search.trim() !== '' || selectedStage !== 'All' || selectedJob !== 'All';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      {/* Search and Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidate name or email..."
            className="w-full pl-9 pr-8 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Stage Filter */}
        <div className="lg:col-span-3">
          <select
            value={selectedStage}
            onChange={(e) => onStageChange(e.target.value)}
            className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
          >
            <option value="All">All Stages</option>
            {HIRING_STAGES.map((stg) => (
              <option key={stg} value={stg}>
                {stg}
              </option>
            ))}
          </select>
        </div>

        {/* Job Title Filter */}
        <div className="lg:col-span-3">
          <select
            value={selectedJob}
            onChange={(e) => onJobChange(e.target.value)}
            className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all truncate"
          >
            <option value="All">All Job Positions</option>
            {availableJobs.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>

        {/* Sort & Actions */}
        <div className="lg:col-span-2 flex items-center justify-between sm:justify-end gap-2">
          <button
            type="button"
            onClick={onToggleSortOrder}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            title="Sort by applied date"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Stage Fast Filters (Segmented Bar) */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
          Stage:
        </span>
        <button
          type="button"
          onClick={() => onStageChange('All')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            selectedStage === 'All'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All
        </button>
        {HIRING_STAGES.map((stg) => (
          <button
            key={stg}
            type="button"
            onClick={() => onStageChange(stg)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              selectedStage === stg
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {stg}
          </button>
        ))}

        <div className="ml-auto text-xs text-slate-500 shrink-0 tabular-nums">
          <span className="font-semibold text-slate-900">{totalResults}</span> candidates found
        </div>
      </div>
    </div>
  );
};
