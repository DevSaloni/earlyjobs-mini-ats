import React, { useState } from 'react';
import {
  Search,
  X,
  Filter,
  Users,
  Briefcase,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ICandidate, HiringStage, HIRING_STAGES } from '../../types/candidate.ts';
import { KanbanCard } from './KanbanCard.tsx';
import { getStageBadgeStyle } from '../../utils/formatters.ts';

interface KanbanBoardProps {
  candidates: ICandidate[];
  onViewCandidate: (candidate: ICandidate) => void;
  onStageChange: (candidateId: string, newStage: HiringStage) => Promise<void>;
  filterJob: string;
  onFilterJobChange: (job: string) => void;
  availableJobs: string[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  candidates,
  onViewCandidate,
  onStageChange,
  filterJob,
  onFilterJobChange,
  availableJobs,
}) => {
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<HiringStage | null>(null);
  const [updatingCandidateId, setUpdatingCandidateId] = useState<string | null>(null);
  const [pipelineSearch, setPipelineSearch] = useState('');
  const [mobileActiveStage, setMobileActiveStage] = useState<'All' | HiringStage>('All');

  // Filter candidates by role & search
  const filteredCandidates = candidates.filter((c) => {
    const matchesJob =
      filterJob === 'All' || c.jobTitle.toLowerCase() === filterJob.toLowerCase();
    const query = pipelineSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.jobTitle.toLowerCase().includes(query);
    return matchesJob && matchesSearch;
  });

  // Group by stage
  const stageGroups: Record<HiringStage, ICandidate[]> = {
    Applied: [],
    Screening: [],
    Interview: [],
    Offer: [],
    Hired: [],
    Rejected: [],
  };

  filteredCandidates.forEach((c) => {
    if (stageGroups[c.stage]) {
      stageGroups[c.stage].push(c);
    }
  });

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    setDraggedCandidateId(candidateId);
    e.dataTransfer.setData('text/plain', candidateId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: HiringStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== stage) {
      setActiveDropColumn(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column element itself
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
      setActiveDropColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, stage: HiringStage) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('text/plain') || draggedCandidateId;
    setActiveDropColumn(null);
    setDraggedCandidateId(null);

    if (candidateId) {
      const candidate = candidates.find((c) => c._id === candidateId);
      if (candidate && candidate.stage !== stage) {
        try {
          setUpdatingCandidateId(candidateId);
          await onStageChange(candidateId, stage);
        } finally {
          setUpdatingCandidateId(null);
        }
      }
    }
  };

  const handleSafeStageChange = async (candidateId: string, newStage: HiringStage) => {
    try {
      setUpdatingCandidateId(candidateId);
      await onStageChange(candidateId, newStage);
    } finally {
      setUpdatingCandidateId(null);
    }
  };

  const clearPipelineFilters = () => {
    setPipelineSearch('');
    onFilterJobChange('All');
  };

  const hasFilters = pipelineSearch.trim() !== '' || filterJob !== 'All';

  // Stages to show in view (all or single filtered on mobile)
  const visibleStages =
    mobileActiveStage === 'All'
      ? HIRING_STAGES
      : HIRING_STAGES.filter((s) => s === mobileActiveStage);

  return (
    <div className="space-y-4">
      {/* Board Controls Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search within pipeline */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={pipelineSearch}
              onChange={(e) => setPipelineSearch(e.target.value)}
              placeholder="Search by name, role, or email..."
              className="w-full pl-9 pr-8 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
            />
            {pipelineSearch && (
              <button
                type="button"
                onClick={() => setPipelineSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Role:
              </span>
              <select
                value={filterJob}
                onChange={(e) => onFilterJobChange(e.target.value)}
                className="px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 max-w-[200px] truncate"
              >
                <option value="All">All Open Roles ({candidates.length})</option>
                {availableJobs.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearPipelineFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 ml-auto tabular-nums">
              <span>Showing</span>
              <span className="font-bold text-slate-900">{filteredCandidates.length}</span>
              <span>of</span>
              <span className="font-bold text-slate-900">{candidates.length}</span>
              <span>candidates</span>
            </div>
          </div>
        </div>

        {/* Mobile Stage Selector Tabs (visible on small screens) */}
        <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            View:
          </span>
          <button
            type="button"
            onClick={() => setMobileActiveStage('All')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
              mobileActiveStage === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            All Stages ({candidates.length})
          </button>
          {HIRING_STAGES.map((stg) => {
            const count = stageGroups[stg]?.length || 0;
            return (
              <button
                key={stg}
                type="button"
                onClick={() => setMobileActiveStage(stg)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
                  mobileActiveStage === stg
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {stg} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacious Horizontal Kanban Board */}
      <div className="flex gap-5 overflow-x-auto pb-6 pt-1 px-1 scroll-smooth">
        {visibleStages.map((stage) => {
          const items = stageGroups[stage] || [];
          const isOver = activeDropColumn === stage;
          const badge = getStageBadgeStyle(stage);

          return (
            <div
              key={stage}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
              className={`flex flex-col bg-slate-100/80 border rounded-2xl p-3.5 transition-all
                w-[310px] min-w-[310px] sm:w-[325px] sm:min-w-[325px] shrink-0
                min-h-[580px]
                ${
                  isOver
                    ? 'border-indigo-400 bg-indigo-50/70 ring-4 ring-indigo-200/60 shadow-md'
                    : 'border-slate-200/80 shadow-2xs'
                }
              `}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 mb-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`} />
                  <span className="text-sm font-bold text-slate-900 tracking-tight">
                    {stage}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border tabular-nums ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {items.length}
                </span>
              </div>

              {/* Column Drop Notice when dragging */}
              {isOver && (
                <div className="mb-3 py-2 px-3 bg-indigo-100/80 border border-dashed border-indigo-400 rounded-xl text-center text-xs font-semibold text-indigo-700 animate-pulse">
                  Drop candidate here to move to {stage}
                </div>
              )}

              {/* Column Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
                {items.length > 0 ? (
                  items.map((cand) => (
                    <KanbanCard
                      key={cand._id}
                      candidate={cand}
                      onView={onViewCandidate}
                      onStageChange={handleSafeStageChange}
                      onDragStart={handleDragStart}
                      isUpdating={updatingCandidateId === cand._id}
                    />
                  ))
                ) : (
                  <div className="h-44 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center space-y-1.5">
                    <Users className="w-5 h-5 text-slate-300" />
                    <span className="font-medium text-slate-500">No candidates in {stage}</span>
                    <span className="text-[11px] text-slate-400">
                      Drag a card or use the stage selector
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
