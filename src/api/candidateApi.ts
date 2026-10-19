import { apiClient } from './client.ts';
import { ICandidate, CandidateFormData, HiringStage, DatabaseStatus } from '../types/candidate.ts';

export interface CandidatesQueryParams {
  search?: string;
  stage?: string;
  jobTitle?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CandidatesResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: ICandidate[];
}

export async function fetchCandidates(params?: CandidatesQueryParams): Promise<CandidatesResponse> {
  const { data } = await apiClient.get<CandidatesResponse>('/candidates', { params });
  return data;
}

export async function fetchCandidateById(id: string): Promise<ICandidate> {
  const { data } = await apiClient.get<{ success: boolean; data: ICandidate }>(`/candidates/${id}`);
  return data.data;
}

export async function createCandidate(candidateData: CandidateFormData): Promise<ICandidate> {
  const { data } = await apiClient.post<{ success: boolean; message: string; data: ICandidate }>(
    '/candidates',
    candidateData
  );
  return data.data;
}

export async function updateCandidate(id: string, candidateData: Partial<CandidateFormData>): Promise<ICandidate> {
  const { data } = await apiClient.put<{ success: boolean; message: string; data: ICandidate }>(
    `/candidates/${id}`,
    candidateData
  );
  return data.data;
}

export async function updateCandidateStage(id: string, stage: HiringStage, notes?: string): Promise<ICandidate> {
  const { data } = await apiClient.patch<{ success: boolean; message: string; data: ICandidate }>(
    `/candidates/${id}/stage`,
    { stage, notes }
  );
  return data.data;
}

export async function deleteCandidate(id: string): Promise<void> {
  await apiClient.delete(`/candidates/${id}`);
}

export async function fetchJobs(): Promise<string[]> {
  const { data } = await apiClient.get<{ success: boolean; data: string[] }>('/jobs');
  return data.data;
}

export async function seedDatabase(reset = false): Promise<{ count: number; message: string }> {
  const { data } = await apiClient.post<{ success: boolean; count: number; message: string }>(
    `/seed?reset=${reset}`
  );
  return data;
}

export async function fetchHealth(): Promise<{
  status: string;
  database: DatabaseStatus;
  uptime: string;
}> {
  const { data } = await apiClient.get('/health');
  return data;
}
