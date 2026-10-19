import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { Header } from './Header.tsx';
import { AddEditCandidateModal } from '../candidates/AddEditCandidateModal.tsx';
import { DeleteConfirmModal } from '../candidates/DeleteConfirmModal.tsx';
import { CandidateDetailDrawer } from '../candidates/CandidateDetailDrawer.tsx';
import { ICandidate, CandidateFormData, HiringStage } from '../../types/candidate.ts';
import {
  createCandidate,
  updateCandidate,
  updateCandidateStage,
  deleteCandidate,
} from '../../api/candidateApi.ts';
import toast, { Toaster } from 'react-hot-toast';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global candidate modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState<ICandidate | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<ICandidate | null>(null);
  const [candidateToView, setCandidateToView] = useState<ICandidate | null>(null);

  // Refresh trigger counter passed down via outlet context
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCreateOrUpdate = async (formData: CandidateFormData) => {
    try {
      if (candidateToEdit) {
        const updated = await updateCandidate(candidateToEdit._id, formData);
        toast.success(`Updated ${updated.name}'s profile.`);
        if (candidateToView && candidateToView._id === updated._id) {
          setCandidateToView(updated);
        }
      } else {
        const created = await createCandidate(formData);
        toast.success(`Candidate ${created.name} added to pipeline.`);
      }
      setIsAddModalOpen(false);
      setCandidateToEdit(null);
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
      throw err;
    }
  };

  const handleDelete = async (candidateId: string) => {
    try {
      await deleteCandidate(candidateId);
      toast.success('Candidate record removed.');
      setCandidateToDelete(null);
      if (candidateToView && candidateToView._id === candidateId) {
        setCandidateToView(null);
      }
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete candidate');
      throw err;
    }
  };

  const handleStageChange = async (candidateId: string, newStage: HiringStage) => {
    try {
      const updated = await updateCandidateStage(candidateId, newStage);
      toast.success(`${updated.name} moved to ${newStage}`);
      if (candidateToView && candidateToView._id === candidateId) {
        setCandidateToView(updated);
      }
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stage');
      throw err;
    }
  };

  const openAddModal = () => {
    setCandidateToEdit(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (candidate: ICandidate) => {
    setCandidateToEdit(candidate);
    setIsAddModalOpen(true);
  };

  const openDeleteModal = (candidate: ICandidate) => {
    setCandidateToDelete(candidate);
  };

  const openViewDrawer = (candidate: ICandidate) => {
    setCandidateToView(candidate);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '13px',
            borderRadius: '8px',
            padding: '10px 16px',
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Column */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onOpenAddModal={openAddModal}
          onSelectCandidate={openViewDrawer}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet
            context={{
              refreshKey,
              triggerRefresh,
              openAddModal,
              openEditModal,
              openDeleteModal,
              openViewDrawer,
              handleStageChange,
            }}
          />
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AddEditCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setCandidateToEdit(null);
        }}
        onSubmit={handleCreateOrUpdate}
        candidateToEdit={candidateToEdit}
      />

      <DeleteConfirmModal
        candidate={candidateToDelete}
        onClose={() => setCandidateToDelete(null)}
        onConfirm={handleDelete}
      />

      <CandidateDetailDrawer
        candidate={candidateToView}
        isOpen={Boolean(candidateToView)}
        onClose={() => setCandidateToView(null)}
        onEdit={(cand) => {
          setCandidateToView(null);
          openEditModal(cand);
        }}
        onDelete={(cand) => {
          setCandidateToView(null);
          openDeleteModal(cand);
        }}
        onStageChange={handleStageChange}
      />
    </div>
  );
};
