import React from 'react';
import { Eye, Edit2, Trash2, ArrowUpDown, ExternalLink } from 'lucide-react';
import { ICandidate } from '../../types/candidate.ts';
import { formatDate, getInitials, getStageBadgeStyle } from '../../utils/formatters.ts';

interface CandidateTableProps {
  candidates: ICandidate[];
  onView: (candidate: ICandidate) => void;
  onEdit: (candidate: ICandidate) => void;
  onDelete: (candidate: ICandidate) => void;
  sortOrder: 'asc' | 'desc';
  onToggleSort: () => void;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  onView,
  onEdit,
  onDelete,
  sortOrder,
  onToggleSort,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3.5 pl-6 pr-4">Candidate</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Job Title</th>
              <th className="py-3.5 px-4">Experience</th>
              <th className="py-3.5 px-4">Hiring Stage</th>
              <th className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={onToggleSort}
                  className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                >
                  <span>Application Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map((cand) => {
              const badge = getStageBadgeStyle(cand.stage);

              return (
                <tr
                  key={cand._id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => onView(cand)}
                >
                  {/* Candidate Name & Avatar */}
                  <td className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs shrink-0">
                        {getInitials(cand.name)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                          {cand.name}
                        </span>
                        {cand.phone && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {cand.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    <a
                      href={`mailto:${cand.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-indigo-600 hover:underline"
                    >
                      {cand.email}
                    </a>
                  </td>

                  {/* Job Title */}
                  <td className="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                    {cand.jobTitle}
                  </td>

                  {/* Experience */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap tabular-nums">
                    {cand.experience} {cand.experience === 1 ? 'yr' : 'yrs'}
                  </td>

                  {/* Hiring Stage */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {cand.stage}
                    </span>
                  </td>

                  {/* Application Date */}
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap tabular-nums font-mono text-xs">
                    {formatDate(cand.appliedAt)}
                  </td>

                  {/* Row Actions */}
                  <td
                    className="py-3.5 pr-6 pl-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(cand)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                        title="View candidate details"
                        aria-label={`View details for ${cand.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(cand)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                        title="Edit candidate profile"
                        aria-label={`Edit ${cand.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(cand)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                        title="Delete candidate"
                        aria-label={`Delete ${cand.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
