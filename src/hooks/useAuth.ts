'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, isPending, error, refetch } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return {
    user: session?.user || null,
    session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error,
    signOut: handleSignOut,
    refetch,
  };
}
