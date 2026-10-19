import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  Award,
  Plus,
  RefreshCw,
  GitPullRequest,
  ArrowRight,
} from 'lucide-react';
import { fetchDashboardStats } from '../api/dashboardApi.ts';
import { DashboardStats, ICandidate } from '../types/candidate.ts';
import { MetricCard } from '../components/dashboard/MetricCard.tsx';
import { PipelineChart } from '../components/dashboard/PipelineChart.tsx';
import { ActivityChart } from '../components/dashboard/ActivityChart.tsx';
import { RecentCandidatesTable } from '../components/dashboard/RecentCandidatesTable.tsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.tsx';
import { ErrorState } from '../components/common/ErrorState.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';

interface OutletContextType {
  refreshKey: number;
  triggerRefresh: () => void;
  openAddModal: () => void;
  openViewDrawer: (c: ICandidate) => void;
}

export const DashboardPage: React.FC = () => {
  const { refreshKey, triggerRefresh, openAddModal, openViewDrawer } =
    useOutletContext<OutletContextType>();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recruiting metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-14 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (error && !stats) {
    return <ErrorState message={error} onRetry={loadStats} />;
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, Recruiter
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Here's an overview of your hiring activity across active roles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadStats}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh analytics"
            aria-label="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/pipeline"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <GitPullRequest className="w-4 h-4 text-indigo-600" />
            <span>View Pipeline</span>
          </Link>

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

      {/* Metric Cards Grid (Derived from real candidate data) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pipeline Health Metrics
          </span>
          <span className="text-xs text-slate-500 tabular-nums">
            <span className="font-semibold text-indigo-600">{stats.newApplicantsLast7Days}</span> new applied in last 7 days
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <MetricCard
            title="Total Candidates"
            value={stats.totalCandidates}
            subtitle={`${stats.newApplicantsLast7Days} this week`}
            icon={Users}
            colorScheme="default"
          />
          <MetricCard
            title="Applied"
            value={stats.stageCounts.Applied || 0}
            subtitle="Initial submissions"
            icon={Clock}
            colorScheme="indigo"
          />
          <MetricCard
            title="In Interview"
            value={stats.stageCounts.Interview || 0}
            subtitle="Active evaluations"
            icon={Sparkles}
            colorScheme="purple"
          />
          <MetricCard
            title="Offers"
            value={stats.stageCounts.Offer || 0}
            subtitle="Decisions pending"
            icon={Award}
            colorScheme="amber"
          />
          <MetricCard
            title="Hired"
            value={stats.stageCounts.Hired || 0}
            subtitle="Accepted positions"
            icon={UserCheck}
            colorScheme="emerald"
          />
          <MetricCard
            title="Rejected"
            value={stats.stageCounts.Rejected || 0}
            subtitle="Archive / non-match"
            icon={UserX}
            colorScheme="rose"
          />
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineChart stageCounts={stats.stageCounts} />
        <ActivityChart data={stats.dailyApplicationsLast7Days} />
      </div>

      {/* Recent Candidates Table */}
      <div>
        <RecentCandidatesTable
          candidates={stats.recentApplicants}
          onViewCandidate={openViewDrawer}
        />
      </div>

      {/* Quick Nav Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/candidates"
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Candidate Database & Filters
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Search, filter by job or stage, inspect resumes, and manage applicant records.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
        </Link>

        <Link
          to="/pipeline"
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Interactive Kanban Pipeline
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Move candidates between Screening, Interview, Offer, and Hired stages with drag-and-drop.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
        </Link>
      </div>
    </div>
  );
};
