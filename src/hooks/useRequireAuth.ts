import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

/**
 * Hook to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Akses Ditolak', {
        description: 'Silakan login terlebih dahulu untuk mengakses halaman ini.',
      });
      router.push(redirectTo);
    }
  }, [status, router, redirectTo]);

  return { isAuthenticated, isLoading, session };
}

/**
 * Hook to protect routes that require specific role
 * Redirects to home if user doesn't have required role
 */
export function useRequireRole(allowedRoles: Array<'admin' | 'staff' | 'user'>) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (!allowedRoles.includes(session.user.role)) {
        toast.error('Akses Ditolak', {
          description: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
        });
        router.push('/');
      }
    }
  }, [session, status, router, allowedRoles]);

  return { user: session?.user, isAuthenticated, isLoading };
}
