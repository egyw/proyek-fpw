/**
 * Example Checkout Page with Midtrans Integration
 * This is a template - integrate with your existing checkout page
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MidtransPaymentButton from '@/components/MidtransPaymentButton';
import { trpc } from '@/utils/trpc';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function CheckoutExample() {
  const router = useRouter();
  const { data: session } = useSession();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [selectedAddress, setSelectedAddress] = useState<any>(null); // Replace with actual address type
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'midtrans' | 'cod'>('midtrans');
  const [orderCreated, setOrderCreated] = useState(false);
  const [snapToken, setSnapToken] = useState('');
  const [orderId, setOrderId] = useState('');

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;

  // Create order mutation
  const createOrderMutation = trpc.orders.createOrder.useMutation();

  const handleCreateOrder = async () => {
    if (!selectedAddress) {
      toast.error('Pilih alamat pengiriman terlebih dahulu');
      return;
    }

    if (shippingCost === 0) {
      toast.error('Pilih metode pengiriman terlebih dahulu');
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
        })),
        shippingAddress: selectedAddress,
        subtotal,
        shippingCost,
        total,
        paymentMethod,
      });

      if (paymentMethod === 'midtrans' && result.snapToken) {
        // Midtrans payment
        setSnapToken(result.snapToken);
        setOrderId(result.orderId);
        setOrderCreated(true);
        toast.success('Pesanan berhasil dibuat!');
      } else {
        // COD or other payment methods
        clearCart();
        router.push(`/orders/${result.orderId}?status=pending`);
        toast.success('Pesanan berhasil dibuat!');
      }
    } catch (error) {
      console.error('[Checkout] Error:', error);
      toast.error('Gagal membuat pesanan');
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    router.push(`/orders/${orderId}?status=success`);
  };

  const handlePaymentPending = () => {
    clearCart();
    router.push(`/orders/${orderId}?status=pending`);
  };

  const handlePaymentError = () => {
    router.push(`/orders/${orderId}?status=failed`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address & Shipping */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Selection */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Alamat Pengiriman</h2>
              {/* Add address selection component here */}
            </Card>

            {/* Shipping Method */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Metode Pengiriman</h2>
              {/* Add shipping calculator component here */}
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Metode Pembayaran</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="midtrans"
                    checked={paymentMethod === 'midtrans'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'midtrans')}
                    className="w-4 h-4"
                  />
                  <span>
                    Midtrans (Credit Card, E-Wallet, VA, dll)
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                    className="w-4 h-4"
                  />
                  <span>
                    COD (Bayar di Tempat)
                  </span>
                </label>
              </div>
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.unit}`} className="flex justify-between text-sm">
                    <span>{item.name} ({item.quantity} {item.unit})</span>
                    <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkir</span>
                  <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Payment Button */}
              <div className="mt-6">
                {!orderCreated ? (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleCreateOrder}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending
                      ? 'Memproses...'
                      : paymentMethod === 'midtrans'
                      ? 'Lanjut ke Pembayaran'
                      : 'Buat Pesanan'}
                  </Button>
                ) : (
                  <MidtransPaymentButton
                    snapToken={snapToken}
                    orderId={orderId}
                    onSuccess={handlePaymentSuccess}
                    onPending={handlePaymentPending}
                    onError={handlePaymentError}
                  />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
