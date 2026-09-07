import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { DashboardStats } from '@/types/dashboard';

export const DashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await api.get<ApiResponse<DashboardStats>>('/dashboard');
    return res.data.data;
  },
};

export default DashboardService;
