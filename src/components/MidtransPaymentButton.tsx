/**
 * Midtrans Payment Button Component
 * Opens Midtrans Snap payment popup when clicked
 */

import { useEffect } from 'react';
import { Button } from './ui/button';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';

// Window.snap and MidtransResult types declared in src/types/global.d.ts

interface MidtransPaymentButtonProps {
  snapToken: string;
  orderId: string;
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function MidtransPaymentButton({
  snapToken,
  orderId,
  onSuccess,
  onPending,
  onError,
  onClose,
  disabled = false,
  className = '',
}: MidtransPaymentButtonProps) {
  // Load Midtrans Snap script
  useEffect(() => {
    // Check if script already loaded
    if (window.snap) {
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    
    if (!clientKey) {
      console.error('[Midtrans] Client key not found');
      toast.error('Konfigurasi pembayaran tidak valid');
      return;
    }

    // Determine script URL based on environment
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    const snapUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    // Create and load script
    const script = document.createElement('script');
    script.src = snapUrl;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    script.onload = () => {
      console.log('[Midtrans] Snap script loaded successfully');
    };

    script.onerror = () => {
      console.error('[Midtrans] Failed to load Snap script');
      toast.error('Gagal memuat pembayaran');
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      // Remove script when component unmounts
      const existingScript = document.querySelector(
        `script[src="${snapUrl}"]`
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const handlePayment = () => {
    if (!window.snap) {
      toast.error('Sistem pembayaran belum siap', {
        description: 'Mohon tunggu beberapa detik dan coba lagi',
      });
      return;
    }

    if (!snapToken) {
      toast.error('Token pembayaran tidak valid');
      return;
    }

    // Open Midtrans Snap payment popup
    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        console.log('[Midtrans] Payment success:', result);
        toast.success('Pembayaran Berhasil!', {
          description: `Order ${orderId} telah dibayar`,
        });
        onSuccess?.();
      },
      onPending: (result) => {
        console.log('[Midtrans] Payment pending:', result);
        toast.info('Menunggu Pembayaran', {
          description: 'Silakan selesaikan pembayaran Anda',
        });
        onPending?.();
      },
      onError: (result) => {
        console.error('[Midtrans] Payment error:', result);
        toast.error('Pembayaran Gagal', {
          description: 'Terjadi kesalahan saat memproses pembayaran',
        });
        onError?.();
      },
      onClose: () => {
        console.log('[Midtrans] Payment popup closed');
        toast.info('Pembayaran dibatalkan', {
          description: 'Anda dapat melanjutkan pembayaran kapan saja',
        });
        onClose?.();
      },
    });
  };

  return (
    <Button
      size="lg"
      className={`w-full ${className}`}
      onClick={handlePayment}
      disabled={disabled || !snapToken}
    >
      <CreditCard className="h-5 w-5 mr-2" />
      Bayar Sekarang
    </Button>
  );
}
