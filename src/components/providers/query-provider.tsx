'use client';

import React, { useEffect } from 'react';
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes so switching tabs is instant without refetch delay
        staleTime: 5 * 60 * 1000,
        // Keep unused cache in memory for 30 minutes
        gcTime: 30 * 60 * 1000,
        // Stop automatic refetches when switching browser tabs or windows
        refetchOnWindowFocus: false,
        // Don't refetch on component remount if data is still fresh
        refetchOnMount: false,
        // Don't trigger cascade requests on reconnect
        refetchOnReconnect: false,
        // Limit retries so failures don't hang the UI in a loading state
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  // Background keep-alive to prevent Render.com free tier backend from spinning down
  useEffect(() => {
    const pingBackend = () => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://ai-invoicing-and-billing-app-server.onrender.com/api';
      fetch(`${apiUrl}/health`, { method: 'GET', mode: 'no-cors' }).catch(() => {});
    };

    // Ping immediately on mount
    pingBackend();

    // Ping every 10 minutes to keep backend warm while app is open
    const interval = setInterval(pingBackend, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {children}
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
}

export default QueryProvider;
