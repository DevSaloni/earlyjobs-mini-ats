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
  timestamp: Date;
  notes?: string;
}

export interface ICandidate {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  jobTitle: string;
  experience: number;
  skills: string[];
  resumeUrl?: string;
  stage: HiringStage;
  appliedAt: Date;
  notes?: string;
  stageHistory: IStageHistory[];
  createdAt?: Date;
  updatedAt?: Date;
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
