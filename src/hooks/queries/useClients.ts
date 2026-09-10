'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import ClientService from '@/services/client.service';
import { CreateClientInput } from '@/types/client';

export const CLIENTS_QUERY_KEY = ['clients'];

export function useClientsQuery() {
  return useQuery({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: () => ClientService.getAll(),
    placeholderData: keepPreviousData,
  });
}

export function useClientQuery(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => ClientService.getById(id),
    enabled: !!id,
  });
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientInput) => ClientService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
  });
}

export function useDeleteClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ClientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
