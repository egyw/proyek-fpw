import type { AppType } from 'next/app';
import type { Session } from 'next-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '../utils/trpc';
import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: '/api/trpc' })],
    })
  );

  return (
    <SessionProvider session={pageProps.session}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <div className={inter.className}>
            <Component {...pageProps} />
            <Toaster />
          </div>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
};

export default MyApp;