import { apiClient } from './client.ts';
import { DashboardStats } from '../types/candidate.ts';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
  return data.data;
}
