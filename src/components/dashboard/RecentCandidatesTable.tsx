import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye } from 'lucide-react';
import { ICandidate } from '../../types/candidate.ts';
import { formatDate, getInitials, getStageBadgeStyle } from '../../utils/formatters.ts';

interface RecentCandidatesTableProps {
  candidates: ICandidate[];
  onViewCandidate: (candidate: ICandidate) => void;
}

export const RecentCandidatesTable: React.FC<RecentCandidatesTableProps> = ({
  candidates,
  onViewCandidate,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Recent Applicants
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest candidate submissions waiting for recruiter review
          </p>
        </div>
        <Link
          to="/candidates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span>View all candidates</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 pl-6 pr-4">Candidate</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Applied</th>
              <th className="py-3 pr-6 pl-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.length > 0 ? (
              candidates.map((cand) => {
                const badge = getStageBadgeStyle(cand.stage);
                return (
                  <tr
                    key={cand._id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onViewCandidate(cand)}
                  >
                    <td className="py-3 pl-6 pr-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs shrink-0">
                          {getInitials(cand.name)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {cand.name}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {cand.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {cand.jobTitle}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {cand.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-xs tabular-nums">
                      {formatDate(cand.appliedAt)}
                    </td>
                    <td className="py-3 pr-6 pl-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewCandidate(cand);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                        title="View candidate details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                  No applicants registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
