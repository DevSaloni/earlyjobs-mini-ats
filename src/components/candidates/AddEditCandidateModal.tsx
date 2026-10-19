import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ICandidate, CandidateFormData, HiringStage, HIRING_STAGES } from '../../types/candidate.ts';
import { fetchJobs } from '../../api/candidateApi.ts';

interface AddEditCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CandidateFormData) => Promise<void>;
  candidateToEdit?: ICandidate | null;
}

export const AddEditCandidateModal: React.FC<AddEditCandidateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  candidateToEdit,
}) => {
  const isEditing = Boolean(candidateToEdit);

  const [formData, setFormData] = useState<CandidateFormData>({
    name: '',
    email: '',
    phone: '',
    jobTitle: 'Full Stack Developer Intern',
    experience: 0,
    skills: [],
    resumeUrl: '',
    stage: 'Applied',
    appliedAt: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [availableJobs, setAvailableJobs] = useState<string[]>([]);
  const [customJobMode, setCustomJobMode] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs()
      .then((jobs) => setAvailableJobs(jobs))
      .catch((err) => console.error('Failed to load jobs list:', err));
  }, []);

  useEffect(() => {
    if (candidateToEdit) {
      setFormData({
        name: candidateToEdit.name || '',
        email: candidateToEdit.email || '',
        phone: candidateToEdit.phone || '',
        jobTitle: candidateToEdit.jobTitle || 'Full Stack Developer Intern',
        experience: candidateToEdit.experience || 0,
        skills: candidateToEdit.skills || [],
        resumeUrl: candidateToEdit.resumeUrl || '',
        stage: candidateToEdit.stage || 'Applied',
        appliedAt: candidateToEdit.appliedAt
          ? new Date(candidateToEdit.appliedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        notes: candidateToEdit.notes || '',
      });
      setSkillsInput((candidateToEdit.skills || []).join(', '));
      setCustomJobMode(false);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        jobTitle: 'Full Stack Developer Intern',
        experience: 0,
        skills: [],
        resumeUrl: '',
        stage: 'Applied',
        appliedAt: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setSkillsInput('');
      setCustomJobMode(false);
    }
    setErrors({});
  }, [candidateToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    const effectiveJob = customJobMode ? customJobTitle.trim() : formData.jobTitle;
    if (!effectiveJob) {
      newErrors.jobTitle = 'Job title is required.';
    }

    if (formData.experience < 0 || isNaN(formData.experience)) {
      newErrors.experience = 'Experience cannot be negative.';
    }

    if (formData.resumeUrl && formData.resumeUrl.trim()) {
      if (!/^https?:\/\/.+/i.test(formData.resumeUrl.trim())) {
        newErrors.resumeUrl = 'Resume URL must start with http:// or https://';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const parsedSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: CandidateFormData = {
        ...formData,
        jobTitle: customJobMode ? customJobTitle.trim() : formData.jobTitle,
        skills: parsedSkills,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        form: err.message || 'Failed to save candidate. Please check errors.',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 id="candidate-modal-title" className="text-base font-bold text-slate-900">
              {isEditing ? 'Edit Candidate Profile' : 'Add New Candidate'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update candidate information and recruitment progress'
                : 'Enter candidate details to track in the ATS pipeline'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {errors.form && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className={`w-full px-3 py-2 text-xs md:text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 ${
                  errors.name ? 'border-rose-300 ring-rose-200' : 'border-slate-300'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. candidate@example.test"
                className={`w-full px-3 py-2 text-xs md:text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 ${
                  errors.email ? 'border-rose-300 ring-rose-200' : 'border-slate-300'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Job Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCustomJobMode(!customJobMode)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {customJobMode ? 'Select from list' : '+ Custom role'}
                </button>
              </div>

              {customJobMode ? (
                <input
                  type="text"
                  value={customJobTitle}
                  onChange={(e) => setCustomJobTitle(e.target.value)}
                  placeholder="Enter custom position..."
                  className={`w-full px-3 py-2 text-xs md:text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 ${
                    errors.jobTitle ? 'border-rose-300' : 'border-slate-300'
                  }`}
                />
              ) : (
                <select
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                >
                  {availableJobs.map((job) => (
                    <option key={job} value={job}>
                      {job}
                    </option>
                  ))}
                </select>
              )}
              {errors.jobTitle && <p className="text-[11px] text-rose-600 mt-1">{errors.jobTitle}</p>}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience (in years)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                step="0.5"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 tabular-nums"
              />
              {errors.experience && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.experience}</p>
              )}
            </div>

            {/* Hiring Stage */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hiring Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as HiringStage })}
                className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
              >
                {HIRING_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>

            {/* Application Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Date
              </label>
              <input
                type="date"
                value={formData.appliedAt}
                onChange={(e) => setFormData({ ...formData, appliedAt: e.target.value })}
                className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 tabular-nums"
              />
            </div>

            {/* Resume URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resume Link / Portfolio URL (optional)
              </label>
              <input
                type="url"
                value={formData.resumeUrl}
                onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                placeholder="https://example.test/resume.pdf"
                className={`w-full px-3 py-2 text-xs md:text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 ${
                  errors.resumeUrl ? 'border-rose-300' : 'border-slate-300'
                }`}
              />
              {errors.resumeUrl && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.resumeUrl}</p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Skills (comma separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. React, Node.js, TypeScript, Tailwind CSS"
              className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Recruiter Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recruiter Notes & Evaluation
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Assessment notes, interview feedback, schedule availability, or salary expectations..."
              className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs md:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs md:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                'Update Candidate'
              ) : (
                'Save Candidate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
