import React from 'react';
import { Eye, Edit2, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { ICandidate } from '../../types/candidate.ts';
import { formatDate, getInitials, getStageBadgeStyle } from '../../utils/formatters.ts';

interface CandidateCardMobileProps {
  candidate: ICandidate;
  onView: (candidate: ICandidate) => void;
  onEdit: (candidate: ICandidate) => void;
  onDelete: (candidate: ICandidate) => void;
}

export const CandidateCardMobile: React.FC<CandidateCardMobileProps> = ({
  candidate,
  onView,
  onEdit,
  onDelete,
}) => {
  const badge = getStageBadgeStyle(candidate.stage);

  return (
    <div
      onClick={() => onView(candidate)}
      className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 cursor-pointer hover:border-slate-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm shrink-0">
            {getInitials(candidate.name)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{candidate.name}</h4>
            <p className="text-xs text-slate-600 font-medium">{candidate.jobTitle}</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
          {candidate.stage}
        </span>
      </div>

      <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{candidate.email}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="tabular-nums">
            {candidate.experience} {candidate.experience === 1 ? 'yr' : 'yrs'} exp
          </span>
          <span className="tabular-nums font-mono">
            Applied {formatDate(candidate.appliedAt)}
          </span>
        </div>
      </div>

      <div
        className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onView(candidate)}
          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
        >
          View
        </button>
        <button
          type="button"
          onClick={() => onEdit(candidate)}
          className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(candidate)}
          className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 rounded-md hover:bg-rose-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
