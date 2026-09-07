import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { CompanySettings, UpdateCompanySettingsInput } from '@/types/user';

export const CompanyService = {
  async getSettings(): Promise<CompanySettings> {
    const res = await api.get<ApiResponse<CompanySettings>>('/settings');
    return res.data.data;
  },

  async updateSettings(payload: UpdateCompanySettingsInput): Promise<CompanySettings> {
    const res = await api.patch<ApiResponse<CompanySettings>>('/settings', payload);
    return res.data.data;
  },
};

export default CompanyService;
