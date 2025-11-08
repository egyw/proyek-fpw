import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Package,
  Truck,
  MapPin,
  CreditCard,
  ChevronLeft,
  Download,
} from "lucide-react";

export default function OrderDetailPage() {
  const router = useRouter();
  const { orderId, status: queryStatus } = router.query;
  
  // Protect page
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  // Get order detail
  const { data: orderData, isLoading: orderLoading } = trpc.orders.getOrderById.useQuery(
    { orderId: orderId as string },
    { enabled: !!orderId && isAuthenticated }
  );

  // Extract order from data (tRPC returns { order: ... })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = orderData?.order as any; // TODO: Add proper Order interface type

  const [hasShownStatusToast, setHasShownStatusToast] = useState(false);

  // Show toast based on payment status from query params
  useEffect(() => {
    if (!hasShownStatusToast && queryStatus && order) {
      if (queryStatus === 'success') {
        toast.success('Pembayaran Berhasil!', {
          description: `Order ${order.orderId} telah dibayar.`,
        });
      } else if (queryStatus === 'pending') {
        toast.info('Pembayaran Tertunda', {
          description: 'Menunggu konfirmasi pembayaran.',
        });
      } else if (queryStatus === 'failed') {
        toast.error('Pembayaran Gagal', {
          description: 'Pembayaran tidak berhasil diproses.',
        });
      }
      setHasShownStatusToast(true);
    }
  }, [queryStatus, order, hasShownStatusToast]);

  // Loading state
  if (authLoading || orderLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat detail pesanan...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Mengalihkan ke login...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Order not found
  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Pesanan Tidak Ditemukan
            </h1>
            <p className="text-gray-600 mb-8">
              Order ID tidak valid atau Anda tidak memiliki akses ke pesanan ini.
            </p>
            <Button onClick={() => router.push('/orders')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar Pesanan
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Status configuration
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      label: 'Menunggu Pembayaran',
    },
    paid: {
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-50 border-green-200',
      label: 'Dibayar',
    },
    processing: {
      icon: Package,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      label: 'Diproses',
    },
    shipped: {
      icon: Truck,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      label: 'Dikirim',
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-50 border-green-200',
      label: 'Selesai',
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600 bg-red-50 border-red-200',
      label: 'Dibatalkan',
    },
  };

  const currentStatus = statusConfig[order.paymentStatus as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/orders')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Kembali ke Pesanan
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detail Pesanan</h1>
              <p className="text-gray-600 mt-2">Order ID: {order.orderId}</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className={`p-6 mb-8 border-2 ${currentStatus.color}`}>
          <div className="flex items-center gap-4">
            <div className="rounded-full p-3 bg-white">
              <StatusIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentStatus.label}</h2>
              <p className="text-sm mt-1">
                Tanggal Pesanan: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Produk Pesanan ({order.items.length} item)
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <Badge variant="outline" className="mb-2 text-xs">
                        {item.category}
                      </Badge>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.unit} × {formatCurrency(item.price)}
                        </p>
                        <p className="font-bold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Alamat Pengiriman
              </h2>
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-gray-900">{order.shippingAddress.recipientName}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.phoneNumber}</p>
                </div>
                <p className="text-sm text-gray-700">
                  {order.shippingAddress.fullAddress}
                  <br />
                  {order.shippingAddress.district}, {order.shippingAddress.city}
                  <br />
                  {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </p>
                {order.shippingAddress.notes && (
                  <p className="text-xs text-gray-500 italic">Catatan: {order.shippingAddress.notes}</p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Pembayaran</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Biaya Pengiriman</span>
                  <span>{formatCurrency(order.shippingCost)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>

              {/* Payment Method */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Metode Pembayaran</p>
                    <p className="text-xs text-gray-600">
                      {order.paymentMethod === 'midtrans' ? 'Midtrans Payment Gateway' : order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {order.paymentStatus === 'pending' && order.snapToken && (
                <Button className="w-full mb-3" onClick={() => {
                  // TODO: Reopen Midtrans payment popup
                  toast.info('Fitur pembayaran ulang segera hadir');
                }}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Bayar Sekarang
                </Button>
              )}

              {order.paymentStatus === 'paid' && (
                <Button className="w-full mb-3" variant="outline" onClick={() => {
                  toast.info('Fitur lacak pesanan segera hadir');
                }}>
                  <Truck className="h-4 w-4 mr-2" />
                  Lacak Pesanan
                </Button>
              )}

              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push('/products')}
              >
                Belanja Lagi
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
