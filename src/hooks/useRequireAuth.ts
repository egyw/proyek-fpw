import { useEffect, useRef } from 'react';
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
  const hasShownToast = useRef(false);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        toast.error('Akses Ditolak', {
          description: 'Silakan login terlebih dahulu untuk mengakses halaman ini.',
        });
        router.push('/auth/login');
      }
      return;
    }

    // If authenticated but wrong role, redirect to home
    if (status === 'authenticated' && session?.user) {
      if (!allowedRoles.includes(session.user.role)) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error('Akses Ditolak', {
            description: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
          });
          router.push('/');
        }
      }
    }
    
    // Reset flag when user changes or leaves page
    return () => {
      hasShownToast.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.role, status]);

  return { user: session?.user, isAuthenticated, isLoading };
}
