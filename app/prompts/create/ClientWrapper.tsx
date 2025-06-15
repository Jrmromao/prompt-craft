'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientPromptCreate from './ClientPromptCreate';
import type { NavBarUser } from '@/components/layout/NavBar';

const queryClient = new QueryClient();

interface ClientWrapperProps {
  user?: NavBarUser;
}

export default function ClientWrapper({ user }: ClientWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ClientPromptCreate user={user} />
    </QueryClientProvider>
  );
} 