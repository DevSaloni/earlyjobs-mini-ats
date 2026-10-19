import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ICandidate } from '../../types/candidate.ts';

interface DeleteConfirmModalProps {
  candidate: ICandidate | null;
  onClose: () => void;
  onConfirm: (candidateId: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  candidate,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!candidate) return null;

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      await onConfirm(candidate._id);
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-rose-600 shrink-0 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900">
                Delete Candidate Record
              </h3>
              <p className="mt-2 text-xs md:text-sm text-slate-600 leading-relaxed">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-slate-900">{candidate.name}</span> ({candidate.jobTitle})? This action will permanently remove their application history.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 text-xs md:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={deleting}
              className="px-4 py-2 text-xs md:text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 active:bg-rose-800 transition-colors shadow-xs flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                'Delete Candidate'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
