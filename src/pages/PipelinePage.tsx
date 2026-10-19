import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, RefreshCw, GitPullRequest } from 'lucide-react';
import { fetchCandidates, fetchJobs } from '../api/candidateApi.ts';
import { ICandidate, HiringStage } from '../types/candidate.ts';
import { KanbanBoard } from '../components/pipeline/KanbanBoard.tsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.tsx';
import { ErrorState } from '../components/common/ErrorState.tsx';

interface OutletContextType {
  refreshKey: number;
  triggerRefresh: () => void;
  openAddModal: () => void;
  openViewDrawer: (c: ICandidate) => void;
  handleStageChange: (candidateId: string, newStage: HiringStage) => Promise<void>;
}

export const PipelinePage: React.FC = () => {
  const {
    refreshKey,
    triggerRefresh,
    openAddModal,
    openViewDrawer,
    handleStageChange,
  } = useOutletContext<OutletContextType>();

  const [candidates, setCandidates] = useState<ICandidate[]>([]);
  const [availableJobs, setAvailableJobs] = useState<string[]>([]);
  const [filterJob, setFilterJob] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [candRes, jobsRes] = await Promise.all([
        fetchCandidates({ limit: 100, sortBy: 'appliedAt', sortOrder: 'desc' }),
        fetchJobs(),
      ]);
      setCandidates(candRes.data);
      setAvailableJobs(jobsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load pipeline candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Hiring Pipeline
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Visualize candidate progression across recruitment stages with drag-and-drop workflow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh pipeline board"
            aria-label="Refresh pipeline board"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {loading && candidates.length === 0 ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <KanbanBoard
          candidates={candidates}
          onViewCandidate={openViewDrawer}
          onStageChange={handleStageChange}
          filterJob={filterJob}
          onFilterJobChange={setFilterJob}
          availableJobs={availableJobs}
        />
      )}
    </div>
  );
};
