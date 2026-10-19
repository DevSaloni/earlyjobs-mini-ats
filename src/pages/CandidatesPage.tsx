import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Plus, RefreshCw, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { fetchCandidates, fetchJobs } from '../api/candidateApi.ts';
import { ICandidate } from '../types/candidate.ts';
import { CandidateFilterBar } from '../components/candidates/CandidateFilterBar.tsx';
import { CandidateTable } from '../components/candidates/CandidateTable.tsx';
import { CandidateCardMobile } from '../components/candidates/CandidateCardMobile.tsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { ErrorState } from '../components/common/ErrorState.tsx';

interface OutletContextType {
  refreshKey: number;
  triggerRefresh: () => void;
  openAddModal: () => void;
  openEditModal: (c: ICandidate) => void;
  openDeleteModal: (c: ICandidate) => void;
  openViewDrawer: (c: ICandidate) => void;
}

export const CandidatesPage: React.FC = () => {
  const {
    refreshKey,
    triggerRefresh,
    openAddModal,
    openEditModal,
    openDeleteModal,
    openViewDrawer,
  } = useOutletContext<OutletContextType>();

  const [searchParams, setSearchParams] = useSearchParams();

  // Filters & Pagination State
  const initialSearch = searchParams.get('search') || '';
  const initialStage = searchParams.get('stage') || 'All';
  const initialJob = searchParams.get('job') || 'All';

  const [search, setSearch] = useState(initialSearch);
  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [selectedJob, setSelectedJob] = useState(initialJob);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [candidates, setCandidates] = useState<ICandidate[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [availableJobs, setAvailableJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync with searchParams if user clicked a link
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== search) {
      setSearch(q);
    }
  }, [searchParams]);

  // Load jobs list
  useEffect(() => {
    fetchJobs()
      .then((jobs) => setAvailableJobs(jobs))
      .catch((err) => console.error('Failed to load jobs list:', err));
  }, []);

  // Fetch candidates on filter/pagination changes
  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchCandidates({
        search: search.trim() || undefined,
        stage: selectedStage !== 'All' ? selectedStage : undefined,
        jobTitle: selectedJob !== 'All' ? selectedJob : undefined,
        sortBy: 'appliedAt',
        sortOrder,
        page,
        limit,
      });

      setCandidates(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidates list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [search, selectedStage, selectedJob, sortOrder, page, refreshKey]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStage('All');
    setSelectedJob('All');
    setPage(1);
    setSearchParams({});
  };

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Candidate Directory
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Manage, evaluate, and track candidate profiles across all recruitment pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadCandidates}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh candidate table"
            aria-label="Refresh candidate table"
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

      {/* Filter Bar */}
      <CandidateFilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        selectedStage={selectedStage}
        onStageChange={(val) => {
          setSelectedStage(val);
          setPage(1);
        }}
        selectedJob={selectedJob}
        onJobChange={(val) => {
          setSelectedJob(val);
          setPage(1);
        }}
        sortOrder={sortOrder}
        onToggleSortOrder={handleToggleSort}
        availableJobs={availableJobs}
        onClearFilters={handleClearFilters}
        totalResults={total}
      />

      {/* Content States */}
      {loading && candidates.length === 0 ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadCandidates} />
      ) : candidates.length === 0 ? (
        <EmptyState
          title="No candidates match your filters"
          description={
            search || selectedStage !== 'All' || selectedJob !== 'All'
              ? 'Try modifying your search keywords or clearing active stage/role filters.'
              : 'Your candidate directory is empty. Add your first candidate to start tracking!'
          }
          actionText="Add New Candidate"
          onAction={openAddModal}
          secondaryActionText={
            search || selectedStage !== 'All' || selectedJob !== 'All'
              ? 'Clear Filters'
              : undefined
          }
          onSecondaryAction={
            search || selectedStage !== 'All' || selectedJob !== 'All'
              ? handleClearFilters
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop & Tablet Table */}
          <div className="hidden md:block">
            <CandidateTable
              candidates={candidates}
              onView={openViewDrawer}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              sortOrder={sortOrder}
              onToggleSort={handleToggleSort}
            />
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {candidates.map((cand) => (
              <CandidateCardMobile
                key={cand._id}
                candidate={cand}
                onView={openViewDrawer}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-xs text-slate-500 tabular-nums">
                Showing page <span className="font-semibold text-slate-900">{page}</span> of{' '}
                <span className="font-semibold text-slate-900">{totalPages}</span> ({total} candidates)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
