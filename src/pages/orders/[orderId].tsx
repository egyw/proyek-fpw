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

// Order item interface
interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { orderId, status: queryStatus, auto_pay } = router.query;
  
  // Protect page
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  // tRPC utils for invalidating queries
  const utils = trpc.useContext();

  // Get order detail
  const { data: orderData, isLoading: orderLoading } = trpc.orders.getOrderById.useQuery(
    { orderId: orderId as string },
    { enabled: !!orderId && isAuthenticated }
  );

  // Mutation to simulate payment success (for Sandbox)
  const simulatePaymentMutation = trpc.orders.simulatePaymentSuccess.useMutation();

  // Extract order from data (tRPC returns { order: ... })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = orderData?.order as any; // TODO: Add proper Order interface type

  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Check order expiry status
  const { data: expiryData } = trpc.orders.checkOrderExpiry.useQuery(
    { orderId: orderId as string },
    { 
      enabled: !!orderId && !!order && order.paymentStatus === 'pending',
      refetchInterval: 5000, // Check every 5 seconds
    }
  );

  // Update countdown timer
  useEffect(() => {
    if (expiryData) {
      setRemainingTime(expiryData.remainingSeconds);
      setIsExpired(expiryData.isExpired);

      if (expiryData.isExpired && order?.paymentStatus === 'pending') {
        // Order expired, refresh page to show updated status
        router.replace(`/orders/${orderId}`);
      }
    }
  }, [expiryData, order, orderId, router]);

  // Countdown timer (update every second)
  useEffect(() => {
    if (remainingTime > 0 && !isExpired) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [remainingTime, isExpired]);

  // ⭐ Auto-open Midtrans popup if auto_pay=true from checkout
  useEffect(() => {
    if (
      !hasAutoOpened &&
      auto_pay === 'true' &&
      order &&
      order.snapToken &&
      order.paymentStatus === 'pending'
    ) {
      setHasAutoOpened(true);

      console.log('[AUTO_PAY] Triggering auto-payment...');
      console.log('[AUTO_PAY] Order:', order.orderId);
      console.log('[AUTO_PAY] Snap Token:', order.snapToken);

      // Wait for Midtrans script to load with retry mechanism
      const tryOpenPayment = (retries = 0) => {
        if (window.snap && order.snapToken) {
          console.log('[AUTO_PAY] Midtrans script loaded, opening popup...');
          window.snap.pay(order.snapToken, {
            onSuccess: async () => {
              console.log('[AUTO_PAY] Payment success');
              
              try {
                // ⭐ Update payment status in backend (for Sandbox)
                await simulatePaymentMutation.mutateAsync({ 
                  orderId: order.orderId 
                });
                
                // Invalidate and refetch order data
                await utils.orders.getOrderById.invalidate();
                
                toast.success('Pembayaran Berhasil!', {
                  description: `Order ${order.orderId} telah dibayar.`,
                });
                
                // Reload page to show updated status
                setTimeout(() => {
                  router.reload();
                }, 1000);
              } catch (error) {
                console.error('[AUTO_PAY] Failed to update status:', error);
                toast.error('Pembayaran Berhasil, Silakan Refresh Halaman', {
                  description: 'Status akan diperbarui otomatis.',
                });
              }
            },
            onPending: () => {
              console.log('[AUTO_PAY] Payment pending');
              // No toast notification for pending - user chose async payment method
              router.replace(`/orders/${orderId}`, undefined, { shallow: true });
            },
            onError: () => {
              console.log('[AUTO_PAY] Payment error');
              toast.error('Pembayaran Gagal', {
                description: 'Terjadi kesalahan saat memproses pembayaran.',
              });
              router.replace(`/orders/${orderId}?status=failed`);
            },
            onClose: () => {
              console.log('[AUTO_PAY] Popup closed');
              router.replace(`/orders/${orderId}`, undefined, { shallow: true });
            },
          });
        } else if (retries < 10) {
          // Retry every 500ms, max 10 times (5 seconds total)
          console.log(`[AUTO_PAY] Midtrans not ready, retry ${retries + 1}/10...`);
          setTimeout(() => tryOpenPayment(retries + 1), 500);
        } else {
          console.error('[AUTO_PAY] Failed to load Midtrans script after 5 seconds');
          toast.error('Gagal Memuat Pembayaran', {
            description: 'Silakan klik tombol "Bayar Sekarang" untuk membayar.',
          });
          // Clear auto_pay parameter so user can manually click
          router.replace(`/orders/${orderId}`, undefined, { shallow: true });
        }
      };

      // Start trying to open payment after 500ms
      setTimeout(() => tryOpenPayment(), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto_pay, order, hasAutoOpened, orderId, router]);

  // Clean up status query param after redirect (no toast needed, already shown in callback)
  useEffect(() => {
    if (queryStatus && order) {
      // Just clean up the URL, toast already shown by payment callback
      const timer = setTimeout(() => {
        router.replace(`/orders/${orderId}`, undefined, { shallow: true });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [queryStatus, order, orderId, router]);

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
        <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
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

  // Order Status configuration (shows order progress, not payment)
  const orderStatusConfig = {
    awaiting_payment: {
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      label: 'Menunggu Pembayaran',
      description: 'Silakan selesaikan pembayaran untuk melanjutkan pesanan',
    },
    processing: {
      icon: Package,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      label: 'Sedang Diproses',
      description: 'Pesanan Anda sedang dikemas oleh tim kami',
    },
    shipped: {
      icon: Truck,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      label: 'Dalam Pengiriman',
      description: 'Pesanan sedang dalam perjalanan ke alamat Anda',
    },
    delivered: {
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-50 border-green-200',
      label: 'Pesanan Sampai',
      description: 'Pesanan telah sampai di alamat tujuan',
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-50 border-green-200',
      label: 'Selesai',
      description: 'Pesanan telah selesai dan dikonfirmasi',
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600 bg-red-50 border-red-200',
      label: 'Dibatalkan',
      description: 'Pesanan telah dibatalkan',
    },
  };

  const currentStatus = orderStatusConfig[order.orderStatus as keyof typeof orderStatusConfig] || orderStatusConfig.awaiting_payment;
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

  // Format countdown timer (MM:SS)
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate and download PDF invoice
  const generateInvoicePDF = async () => {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Company Info
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Toko Pelita Bangunan', 105, 30, { align: 'center' });
    doc.text('Jl. Raya Bangunan No. 123, Makassar', 105, 35, { align: 'center' });
    doc.text('Telp: (0411) 123-4567 | Email: info@pelitabangunan.com', 105, 40, { align: 'center' });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    // Order Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Informasi Pesanan', 20, 55);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Order ID: ${order.orderId}`, 20, 62);
    doc.text(`Tanggal: ${formatDate(order.createdAt)}`, 20, 68);
    doc.text(`Status: ${currentStatus.label}`, 20, 74);
    doc.text(`Status Pembayaran: ${order.paymentStatus === 'paid' ? 'LUNAS' : 'PENDING'}`, 20, 80);

    // Customer Info
    doc.setFont('helvetica', 'bold');
    doc.text('Informasi Penerima', 110, 55);

    doc.setFont('helvetica', 'normal');
    doc.text(order.shippingAddress.recipientName, 110, 62);
    doc.text(order.shippingAddress.phoneNumber, 110, 68);
    
    // Split address into multiple lines if too long
    const addressLines = doc.splitTextToSize(order.shippingAddress.fullAddress, 80);
    let currentY = 74;
    addressLines.forEach((line: string) => {
      doc.text(line, 110, currentY);
      currentY += 6;
    });
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.province}`, 110, currentY);
    currentY += 6;
    doc.text(order.shippingAddress.postalCode, 110, currentY);

    // Items Table
    const tableStartY = Math.max(90, currentY + 10);
    doc.setLineWidth(0.5);
    doc.line(20, tableStartY, 190, tableStartY);

    // Table Header
    doc.setFont('helvetica', 'bold');
    doc.text('Produk', 20, tableStartY + 8);
    doc.text('Qty', 110, tableStartY + 8);
    doc.text('Harga Satuan', 135, tableStartY + 8);
    doc.text('Subtotal', 170, tableStartY + 8);

    doc.line(20, tableStartY + 12, 190, tableStartY + 12);

    // Table Rows
    doc.setFont('helvetica', 'normal');
    let itemY = tableStartY + 20;

    order.items.forEach((item: OrderItem) => {
      // Handle long product names
      const productNameLines = doc.splitTextToSize(item.name, 85);
      
      productNameLines.forEach((line: string, index: number) => {
        doc.text(line, 20, itemY + (index * 6));
      });

      const maxLines = productNameLines.length;
      const baseY = itemY + ((maxLines - 1) * 6);

      doc.text(`${item.quantity} ${item.unit}`, 110, baseY);
      doc.text(formatCurrency(item.price), 135, baseY);
      doc.text(formatCurrency(item.price * item.quantity), 170, baseY);

      itemY = baseY + 10;
    });

    // Line before totals
    doc.line(20, itemY, 190, itemY);

    // Totals
    itemY += 8;
    doc.text('Subtotal:', 135, itemY);
    doc.text(formatCurrency(order.subtotal), 170, itemY);

    itemY += 6;
    doc.text('Ongkir:', 135, itemY);
    doc.text(formatCurrency(order.shippingCost), 170, itemY);

    if (order.discount?.amount) {
      itemY += 6;
      doc.text(`Diskon (${order.discount.code}):`, 135, itemY);
      doc.text(`-${formatCurrency(order.discount.amount)}`, 170, itemY);
    }

    // Total
    itemY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 135, itemY);
    doc.text(formatCurrency(order.total), 170, itemY);

    // Footer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const footerY = 280;
    doc.text('Terima kasih atas pembelian Anda!', 105, footerY, { align: 'center' });
    doc.text('Untuk pertanyaan, hubungi customer service kami.', 105, footerY + 5, { align: 'center' });

    // Save PDF
    doc.save(`Invoice-${order.orderId}.pdf`);
    
    toast.success('Invoice Berhasil Diunduh!', {
      description: `Invoice ${order.orderId} telah diunduh.`,
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
            {/* Show invoice button only if order is paid */}
            {order.paymentStatus === 'paid' && (
              <Button variant="outline" onClick={generateInvoicePDF}>
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            )}
          </div>
        </div>

        {/* Status Card */}
        <Card className={`p-6 mb-8 border-2 ${currentStatus.color}`}>
          <div className="flex items-start gap-4">
            <div className="rounded-full p-3 bg-white shrink-0">
              <StatusIcon className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold">{currentStatus.label}</h2>
              <p className="text-sm mt-1 text-gray-600">
                {currentStatus.description}
              </p>
              
              <div className="mt-3 text-xs text-gray-500">
                <span>Tanggal Pesanan: {formatDate(order.createdAt)}</span>
                {order.paymentStatus === 'paid' && order.paidAt && (
                  <span> • Dibayar: {formatDate(order.paidAt)}</span>
                )}
              </div>
              
              {/* Show cancel reason if cancelled */}
              {order.orderStatus === 'cancelled' && order.cancelReason && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Alasan Pembatalan:</p>
                  <p className="text-sm text-gray-900 leading-relaxed">{order.cancelReason}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Pesanan dibatalkan oleh admin/staff</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Payment Countdown Timer (only show if pending) */}
        {order.paymentStatus === 'pending' && !isExpired && remainingTime > 0 && (
          <Card className="p-6 mb-8 bg-linear-to-r from-orange-50 to-red-50 border-2 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-white shadow-sm">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Batas Waktu Pembayaran
                </h3>
                <p className="text-sm text-gray-600">
                  Selesaikan pembayaran sebelum waktu habis
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-orange-600 font-mono">
                  {formatCountdown(remainingTime)}
                </div>
                <p className="text-xs text-gray-600 mt-1">Menit:Detik</p>
              </div>
            </div>
          </Card>
        )}

        {/* Expired Warning */}
        {(isExpired || order.paymentStatus === 'expired') && (
          <Card className="p-6 mb-8 bg-red-50 border-2 border-red-200">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-white">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-1">
                  Pembayaran Kadaluarsa
                </h3>
                <p className="text-sm text-red-700">
                  Batas waktu pembayaran 30 menit telah habis. Silakan buat pesanan baru.
                </p>
              </div>
            </div>
          </Card>
        )}

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
                {order.items.map((item: OrderItem) => (
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

            {/* Shipping Info (if shipped) */}
            {order.shippingInfo && (order.orderStatus === 'shipped' || order.orderStatus === 'delivered' || order.orderStatus === 'completed') && (
              <Card className="p-6 bg-purple-50 border-purple-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-purple-600" />
                  Informasi Pengiriman
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Kurir</span>
                    <span className="font-semibold text-gray-900">{order.shippingInfo.courier.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">No. Resi</span>
                    <span className="font-mono font-semibold text-gray-900">{order.shippingInfo.trackingNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tanggal Kirim</span>
                    <span className="text-sm text-gray-900">{formatDate(order.shippingInfo.shippedDate)}</span>
                  </div>
                  <Separator className="my-2" />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // TODO: Integrate with courier tracking API
                      toast.info('Fitur lacak paket akan segera tersedia');
                    }}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Lacak Paket
                  </Button>
                </div>
              </Card>
            )}
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

              {/* Action Buttons */}
              {/* Show payment button if payment is still pending and not expired */}
              {order.paymentStatus === 'pending' && order.snapToken && !isExpired && remainingTime > 0 && (
                <Button className="w-full mb-3" onClick={() => {
                  if (window.snap && order.snapToken) {
                    console.log('[MANUAL_PAY] Opening Midtrans popup...');
                    window.snap.pay(order.snapToken, {
                      onSuccess: async () => {
                        console.log('[MANUAL_PAY] Payment success');
                        
                        try {
                          // ⭐ Update payment status in backend (for Sandbox)
                          await simulatePaymentMutation.mutateAsync({ 
                            orderId: order.orderId 
                          });
                          
                          // Invalidate and refetch order data
                          await utils.orders.getOrderById.invalidate();
                          
                          toast.success('Pembayaran Berhasil!', {
                            description: `Order ${order.orderId} telah dibayar.`,
                          });
                          
                          // Reload page to show updated status
                          setTimeout(() => {
                            router.reload();
                          }, 1000);
                        } catch (error) {
                          console.error('[MANUAL_PAY] Failed to update status:', error);
                          toast.error('Pembayaran Berhasil, Silakan Refresh Halaman', {
                            description: 'Status akan diperbarui otomatis.',
                          });
                        }
                      },
                      onPending: () => {
                        console.log('[MANUAL_PAY] Payment pending');
                        // No toast notification for pending - user chose async payment method
                        // Don't change URL, stay on same page
                      },
                      onError: () => {
                        console.log('[MANUAL_PAY] Payment error');
                        toast.error('Pembayaran Gagal', {
                          description: 'Terjadi kesalahan saat memproses pembayaran.',
                        });
                        router.replace(`/orders/${orderId}?status=failed`);
                      },
                      onClose: () => {
                        console.log('[MANUAL_PAY] Popup closed');
                        // Don't change URL on manual close
                      },
                    });
                  } else {
                    console.error('[MANUAL_PAY] Midtrans script not loaded');
                    toast.error('Gagal Memuat Pembayaran', {
                      description: 'Silakan refresh halaman dan coba lagi.',
                    });
                  }
                }}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Bayar Sekarang
                </Button>
              )}

              {/* Show tracking button if shipped/delivered */}
              {(order.orderStatus === 'shipped' || order.orderStatus === 'delivered') && order.shippingInfo && (
                <Button className="w-full mb-3" variant="outline" onClick={() => {
                  // TODO: Integrate with courier tracking API
                  toast.info('Fitur lacak paket akan segera tersedia');
                }}>
                  <Truck className="h-4 w-4 mr-2" />
                  Lacak Paket
                </Button>
              )}

              {/* Show confirm button if delivered (not yet completed) */}
              {order.orderStatus === 'delivered' && (
                <Button className="w-full mb-3" onClick={() => {
                  // TODO: Add confirm order mutation
                  toast.info('Fitur konfirmasi pesanan akan segera tersedia');
                }}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Konfirmasi Pesanan Diterima
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
