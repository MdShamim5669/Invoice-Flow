'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CompanyService from '@/services/company.service';
import { UpdateCompanySettingsInput } from '@/types/user';

export const COMPANY_SETTINGS_QUERY_KEY = ['company-settings'];

export function useCompanySettingsQuery() {
  return useQuery({
    queryKey: COMPANY_SETTINGS_QUERY_KEY,
    queryFn: () => CompanyService.getSettings(),
  });
}

export function useUpdateCompanySettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCompanySettingsInput) => CompanyService.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_SETTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
