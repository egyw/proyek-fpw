import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

interface RequireAuthProps {
  children: (props: { onClick: () => void; disabled?: boolean }) => ReactNode;
  onAuthenticated: () => void;
  message?: string;
}

/**
 * Component wrapper for actions that require authentication
 * Usage:
 * <RequireAuth onAuthenticated={handleAddToCart}>
 *   {({ onClick }) => <Button onClick={onClick}>Add to Cart</Button>}
 * </RequireAuth>
 */
export function RequireAuth({ children, onAuthenticated, message }: RequireAuthProps) {
  const { status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error('Login Diperlukan', {
        description: message || 'Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.',
        action: {
          label: 'Login',
          onClick: () => router.push('/auth/login'),
        },
      });
      return;
    }

    onAuthenticated();
  };

  return <>{children({ onClick: handleClick })}</>;
}
