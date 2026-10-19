export type HiringStage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export const HIRING_STAGES: HiringStage[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected'
];

export interface IStageHistory {
  stage: HiringStage;
  timestamp: string | Date;
  notes?: string;
}

export interface ICandidate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  jobTitle: string;
  experience: number;
  skills: string[];
  resumeUrl?: string;
  stage: HiringStage;
  appliedAt: string | Date;
  notes?: string;
  stageHistory: IStageHistory[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CandidateFormData {
  name: string;
  email: string;
  phone?: string;
  jobTitle: string;
  experience: number;
  skills: string[];
  resumeUrl?: string;
  stage: HiringStage;
  appliedAt?: string;
  notes?: string;
}

export interface DashboardStats {
  totalCandidates: number;
  newApplicantsLast7Days: number;
  stageCounts: Record<HiringStage, number>;
  dailyApplicationsLast7Days: {
    date: string;
    label: string;
    count: number;
  }[];
  recentApplicants: ICandidate[];
}

export interface DatabaseStatus {
  connected: boolean;
  readyState: number;
  readyStateText: string;
  uriConfigured: boolean;
  error: string | null;
  activeEngine: string;
}
