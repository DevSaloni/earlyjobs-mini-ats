import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Plus, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchCandidates } from '../../api/candidateApi.ts';
import { ICandidate } from '../../types/candidate.ts';

// Recruiter portrait generated via generate_image tool
const RECRUITER_AVATAR_SRC = '/src/assets/images/recruiter_avatar_1792383379330.jpg';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenAddModal: () => void;
  onSelectCandidate?: (candidate: ICandidate) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenAddModal,
  onSelectCandidate,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ICandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Global search autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsOpenDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetchCandidates({ search: searchQuery.trim(), limit: 5 });
        setSearchResults(res.data);
        setIsOpenDropdown(true);
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpenDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCandidate = (cand: ICandidate) => {
    setIsOpenDropdown(false);
    setSearchQuery('');
    if (onSelectCandidate) {
      onSelectCandidate(cand);
    } else {
      navigate('/candidates');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/candidates?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpenDropdown(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-slate-200">
      {/* Left Zone: Mobile toggle & Breadcrumb/Identity */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 text-slate-600 rounded-lg lg:hidden hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center text-xs font-medium text-slate-500">
          <span>EarlyJobs ATS</span>
          <span className="mx-2 text-slate-300" aria-hidden="true">/</span>
          <span className="text-slate-900 font-semibold">Recruiting Portal</span>
        </div>
      </div>

      {/* Center Zone: Global Candidate Search */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setIsOpenDropdown(true)}
              placeholder="Search candidate by name, email, or role..."
              className="w-full pl-9 pr-4 py-1.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </form>

        {/* Search Results Dropdown */}
        {isOpenDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
            {searchResults.length > 0 ? (
              <div className="py-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  Matching Candidates ({searchResults.length})
                </div>
                {searchResults.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => handleSelectCandidate(c)}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50/60 transition-colors flex items-center justify-between gap-3 border-b border-slate-50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                      <p className="text-xs text-slate-500 truncate">{c.jobTitle} · {c.email}</p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 shrink-0">
                      {c.stage}
                    </span>
                  </button>
                ))}
                <div className="p-2 text-center bg-slate-50 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/candidates?search=${encodeURIComponent(searchQuery.trim())}`);
                      setIsOpenDropdown(false);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View all results in Candidates table →
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No candidates found matching "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Zone: Primary CTA & Recruiter Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>

        {/* Recruiter Profile Lockup */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
            <img
              src={RECRUITER_AVATAR_SRC}
              alt="Demo Recruiter Portrait"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initial avatar if image fails
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold text-xs -z-10">
              EA
            </div>
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              Elena Adams
            </span>
            <span className="text-[11px] text-slate-500 leading-tight">
              Lead Recruiter
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
