import type { AppType } from 'next/app';
import type { Session } from 'next-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '../utils/trpc';
import { useState, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import Head from 'next/head';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: '/api/trpc' })],
    })
  );

  // Load Midtrans Snap script globally
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Head>
            <title>Toko Bangunan</title>
          </Head>
          <div className={inter.className}>
            <Component {...pageProps} />
            <Toaster />
            <TawkToWidget />
          </div>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
};

// Tawk.to Widget Component with Role-based Protection
function TawkToWidget() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const userRole = session?.user?.role;

  useEffect(() => {
    // Only load Tawk.to for authenticated users with 'user' role
    if (isAuthenticated && userRole === 'user') {
      // Initialize Tawk.to API
      if (typeof window !== 'undefined') {
        (window as any).Tawk_API = (window as any).Tawk_API || {};
        (window as any).Tawk_LoadStart = new Date();

        const tawkScript = document.createElement('script');
        tawkScript.async = true;
        tawkScript.src = 'https://embed.tawk.to/691b2a485f04601958b69cd7/1ja91qbmd';
        tawkScript.charset = 'UTF-8';
        tawkScript.setAttribute('crossorigin', '*');

        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(tawkScript, firstScript);
        }

        return () => {
          // Cleanup Tawk.to widget on unmount
          if (tawkScript.parentNode) {
            tawkScript.parentNode.removeChild(tawkScript);
          }
          // Hide widget if exists
          if ((window as any).Tawk_API?.hideWidget) {
            (window as any).Tawk_API.hideWidget();
          }
        };
      }
    } else {
      // Hide widget for admin, staff, or guest users
      if (typeof window !== 'undefined' && (window as any).Tawk_API?.hideWidget) {
        (window as any).Tawk_API.hideWidget();
      }
    }
  }, [isAuthenticated, userRole]);

  return null; // This component doesn't render anything
}

export default MyApp;