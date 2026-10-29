'use client';

import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ApiError } from '@/lib/api-client';

function createQueryClient() {
  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      // The API clears the session cookie on a 401, so a full reload to /login lands on the login page.
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          queryClient.clear();
          // A full reload (not router.push) so no in-memory state from the old session survives.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign('/login');
        }
      },
    }),
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  });
  return queryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
