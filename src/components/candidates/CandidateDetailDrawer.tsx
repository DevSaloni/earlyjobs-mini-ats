import React from 'react';
import {
  X,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  FileText,
  Award,
} from 'lucide-react';
import { ICandidate, HiringStage } from '../../types/candidate.ts';
import { formatDate, formatDateTime, getInitials, getStageBadgeStyle } from '../../utils/formatters.ts';

interface CandidateDetailDrawerProps {
  candidate: ICandidate | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (candidate: ICandidate) => void;
  onDelete: (candidate: ICandidate) => void;
  onStageChange: (candidateId: string, newStage: HiringStage) => Promise<void>;
}

export const CandidateDetailDrawer: React.FC<CandidateDetailDrawerProps> = ({
  candidate,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStageChange,
}) => {
  if (!isOpen || !candidate) return null;

  const badgeStyle = getStageBadgeStyle(candidate.stage);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-candidate-name"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Candidate Profile
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(candidate)}
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Edit candidate"
              aria-label="Edit candidate"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(candidate)}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Delete candidate"
              aria-label="Delete candidate"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-1"
              aria-label="Close profile drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Card */}
          <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-lg shrink-0">
              {getInitials(candidate.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="drawer-candidate-name" className="text-lg font-bold text-slate-900 truncate">
                {candidate.name}
              </h2>
              <p className="text-xs md:text-sm font-medium text-slate-600 mt-0.5">
                {candidate.jobTitle}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                  {candidate.stage}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 tabular-nums">
                  {candidate.experience} {candidate.experience === 1 ? 'yr' : 'yrs'} experience
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stage Update */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Change Hiring Stage
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'] as HiringStage[]).map(
                (stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => onStageChange(candidate._id, stg)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all text-center ${
                      candidate.stage === stg
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {stg}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contact Information
            </h3>
            <div className="space-y-2 text-xs md:text-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${candidate.email}`}
                  className="text-indigo-600 hover:underline truncate"
                >
                  {candidate.email}
                </a>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="tabular-nums">{candidate.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Applied on {formatDate(candidate.appliedAt)}</span>
              </div>
              {candidate.resumeUrl && (
                <div className="flex items-center gap-3 text-slate-700 pt-1">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 font-medium hover:underline text-xs"
                  >
                    <span>View Submitted Resume / Portfolio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Skills & Tech Stack
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recruiter Notes */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recruiter Evaluation Notes
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {candidate.notes || 'No specific notes entered yet.'}
            </div>
          </div>

          {/* Stage History */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Hiring Stage Timeline</span>
            </h3>

            {candidate.stageHistory && candidate.stageHistory.length > 0 ? (
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                {candidate.stageHistory.map((item, index) => (
                  <div key={index} className="relative">
                    {/* Timeline Node */}
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200" />
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{item.stage}</span>
                        <span className="text-slate-400 text-[11px] tabular-nums">
                          {formatDateTime(item.timestamp)}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No stage history recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
