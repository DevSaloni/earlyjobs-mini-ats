import React, { useState } from 'react';
import {
  Mail,
  Calendar,
  Briefcase,
  ChevronRight,
  Eye,
  ArrowRightLeft,
  Loader2,
  Clock,
} from 'lucide-react';
import { ICandidate, HiringStage, HIRING_STAGES } from '../../types/candidate.ts';
import { formatDate, getInitials, getStageBadgeStyle } from '../../utils/formatters.ts';

interface KanbanCardProps {
  candidate: ICandidate;
  onView: (candidate: ICandidate) => void;
  onStageChange: (candidateId: string, newStage: HiringStage) => Promise<void>;
  onDragStart: (e: React.DragEvent, candidateId: string) => void;
  isUpdating?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  candidate,
  onView,
  onStageChange,
  onDragStart,
  isUpdating = false,
}) => {
  const badge = getStageBadgeStyle(candidate.stage);
  const [internalLoading, setInternalLoading] = useState(false);

  const handleStageSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStage = e.target.value as HiringStage;
    if (newStage === candidate.stage) return;

    try {
      setInternalLoading(true);
      await onStageChange(candidate._id, newStage);
    } finally {
      setInternalLoading(false);
    }
  };

  const loading = isUpdating || internalLoading;

  return (
    <div
      draggable={!loading}
      onDragStart={(e) => onDragStart(e, candidate._id)}
      onClick={() => onView(candidate)}
      className={`bg-white border rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-3 group relative select-none ${
        loading
          ? 'opacity-60 pointer-events-none border-indigo-300 ring-2 ring-indigo-100'
          : 'border-slate-200/90 hover:border-indigo-300'
      }`}
    >
      {/* Top Header: Avatar + Name + View Profile Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 font-bold text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-2xs">
            {getInitials(candidate.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug break-words">
              {candidate.name}
            </h4>
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium tabular-nums">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Applied {formatDate(candidate.appliedAt)}</span>
            </span>
          </div>
        </div>

        {/* View Profile Action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView(candidate);
          }}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
          title="View full profile"
          aria-label={`View profile for ${candidate.name}`}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Applied Job Title Badge */}
      <div>
        <span className="inline-block px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100/90 rounded-md border border-slate-200/60 max-w-full truncate">
          {candidate.jobTitle}
        </span>
      </div>

      {/* Details Stack: Email & Experience */}
      <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="break-all text-[11px] leading-tight text-slate-600">
            {candidate.email}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-medium text-slate-700 tabular-nums">
            {candidate.experience === 0
              ? 'Fresher / Entry Level'
              : `${candidate.experience} ${candidate.experience === 1 ? 'yr' : 'yrs'} experience`}
          </span>
        </div>
      </div>

      {/* Skills Snippet if available */}
      {candidate.skills && candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {candidate.skills.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200/70 rounded-md"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom Footer: Stage Selector Dropdown */}
      <div
        className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <ArrowRightLeft className="w-3 h-3 text-slate-400" />
          <span>Stage:</span>
        </span>

        {/* Working Stage Selector */}
        <div className="relative">
          {loading ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-indigo-600 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            <select
              value={candidate.stage}
              onChange={handleStageSelect}
              className={`text-xs font-semibold py-1 pl-2.5 pr-6 rounded-lg border cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-600 appearance-none bg-no-repeat transition-colors ${badge.bg} ${badge.text} ${badge.border}`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.4rem center',
                backgroundSize: '1rem',
              }}
              title="Change candidate hiring stage"
            >
              {HIRING_STAGES.map((stg) => (
                <option key={stg} value={stg} className="bg-white text-slate-900 font-medium">
                  {stg}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};
