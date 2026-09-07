'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import DashboardService from '@/services/dashboard.service';

export const DASHBOARD_QUERY_KEY = ['dashboard'];

export function useDashboardQuery() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => DashboardService.getStats(),
    placeholderData: keepPreviousData,
  });
}
