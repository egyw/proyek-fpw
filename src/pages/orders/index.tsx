import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Package, Truck, CheckCircle, XCircle, Star, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

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

// Order interface from database
interface Order {
  _id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: {
    recipientName: string;
    phoneNumber: string;
    fullAddress: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
    notes?: string;
  };
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired';
  orderStatus: 'awaiting_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned';
  returnStatus?: 'none' | 'requested' | 'approved' | 'rejected' | 'completed';
  shippingDetails?: {
    courierCode: string;
    courierName: string;
    service: string;
    cost: number;
    estimatedDays: string;
  };
  snapToken?: string;
  snapRedirectUrl?: string;
  transactionId?: string;
  rating?: {
    score: number;
    review?: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  
  // Protect page - require authentication
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  // Get tRPC context for cache invalidation
  const utils = trpc.useContext();

  // Get user's orders from database
  const { data: ordersData, isLoading: ordersLoading } = trpc.orders.getUserOrders.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  // All hooks MUST be declared before any conditional returns
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [orderForRating, setOrderForRating] = useState<Order | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [returnReason, setReturnReason] = useState("");
  const [returnCondition, setReturnCondition] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<Order | null>(null);

  // tRPC mutation for submitting rating (MUST be before early returns)
  const submitRatingMutation = trpc.orders.submitRating.useMutation({
    onSuccess: () => {
      toast.success("Rating Berhasil Dikirim!", {
        description: "Terima kasih atas rating Anda",
      });
      setOrderForRating(null);
      setSelectedRating(0);
      setReviewText("");
      // Invalidate queries to force refetch fresh data
      utils.orders.getUserOrders.invalidate();
    },
    onError: (error) => {
      toast.error("Gagal Mengirim Rating", {
        description: error.message,
      });
    },
  });

  // tRPC mutation for confirming order received
  const confirmOrderMutation = trpc.orders.confirmOrderReceived.useMutation({
    onSuccess: () => {
      toast.success("Pesanan Dikonfirmasi!", {
        description: "Terima kasih telah berbelanja",
      });
      setConfirmDialogOpen(false);
      setOrderToConfirm(null);
      // Invalidate queries to force refetch fresh data
      utils.orders.getUserOrders.invalidate();
    },
    onError: (error) => {
      toast.error("Gagal Konfirmasi Pesanan", {
        description: error.message,
      });
    },
  });

  // tRPC mutation for creating return request
  const createReturnMutation = trpc.returns.createReturnRequest.useMutation({
    onSuccess: (data) => {
      toast.success("Return Request Berhasil!", {
        description: `Nomor return: ${data.returnNumber}`,
      });
      
      setReturnDialogOpen(false);
      setSelectedOrder(null);
      setReturnReason("");
      setReturnCondition("");
      // Invalidate queries to force refetch fresh data
      utils.orders.getUserOrders.invalidate();
    },
    onError: (error) => {
      toast.error("Gagal Ajukan Return", {
        description: error.message,
      });
    },
  });

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Extract orders from tRPC response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders: Order[] = (ordersData?.orders as any) || [];

  // Filter orders based on order status
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.orderStatus === statusFilter);

  // Loading state
  if (authLoading || ordersLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat pesanan...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Not authenticated (redirect handled by useRequireAuth)
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

  const getStatusBadge = (status: Order["orderStatus"]) => {
    const variants: Record<
      Order["orderStatus"],
      { label: string; className: string; icon: React.ReactNode }
    > = {
      awaiting_payment: {
        label: "Menunggu Pembayaran",
        className: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
      paid: {
        label: "Dibayar",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      processing: {
        label: "Sedang Diproses",
        className: "bg-blue-100 text-blue-800",
        icon: <Package className="h-3 w-3 mr-1" />,
      },
      shipped: {
        label: "Dikirim",
        className: "bg-purple-100 text-purple-800",
        icon: <Truck className="h-3 w-3 mr-1" />,
      },
      delivered: {
        label: "Sudah Sampai",
        className: "bg-indigo-100 text-indigo-800",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      completed: {
        label: "Selesai",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      cancelled: {
        label: "Dibatalkan",
        className: "bg-red-100 text-red-800",
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
      returned: {
        label: "Dikembalikan",
        className: "bg-orange-100 text-orange-800",
        icon: <RotateCcw className="h-3 w-3 mr-1" />,
      },
    };

    const variant = variants[status] || variants.awaiting_payment;
    return (
      <Badge className={`${variant.className} flex items-center w-fit`}>
        {variant.icon}
        {variant.label}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleReturnRequest = () => {
    if (!selectedOrder) return;

    // Validate condition
    if (!returnCondition) {
      toast.error("Pilih Kondisi", {
        description: "Pilih kondisi produk yang dikembalikan",
      });
      return;
    }

    // Validate reason
    if (returnReason.trim().length < 10) {
      toast.error("Alasan Terlalu Pendek", {
        description: "Alasan pengembalian minimal 10 karakter",
      });
      return;
    }

    // Create return request with ALL items (no selection needed)
    createReturnMutation.mutate({
      orderId: selectedOrder.orderId,
      items: selectedOrder.items.map((item) => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        reason: returnReason,
        condition: returnCondition as "damaged" | "defective" | "wrong_item" | "not_as_described" | "other",
      })),
      reason: returnReason,
    });
  };

  const handleConfirmOrder = () => {
    if (orderToConfirm) {
      confirmOrderMutation.mutate({
        orderId: orderToConfirm.orderId,
      });
      setConfirmDialogOpen(false);
      setOrderToConfirm(null);
    }
  };

  const handleSubmitRating = (order: Order) => {
    if (selectedRating === 0) {
      toast.error("Pilih Rating", {
        description: "Silakan pilih rating terlebih dahulu",
      });
      return;
    }

    console.log('[handleSubmitRating] Submitting rating for:', {
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      hasRating: !!order.rating,
      score: selectedRating,
    });

    submitRatingMutation.mutate({
      orderId: order.orderId,
      score: selectedRating,
      review: reviewText.trim() || undefined,
    });
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesanan Saya</h1>
            <p className="text-gray-600">
              Kelola dan pantau status pesanan Anda di sini
            </p>
          </div>

          {/* Filter */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="awaiting_payment">Menunggu Pembayaran</SelectItem>
                    <SelectItem value="paid">Dibayar</SelectItem>
                    <SelectItem value="processing">Sedang Diproses</SelectItem>
                    <SelectItem value="shipped">Dikirim</SelectItem>
                    <SelectItem value="delivered">Sudah Sampai</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold">{filteredOrders.length}</span>{" "}
                pesanan
              </p>
            </div>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tidak ada pesanan
                </h3>
                <p className="text-gray-600 mb-6">
                  Anda belum memiliki pesanan dengan status ini
                </p>
                <Button onClick={() => (window.location.href = "/products")}>
                  Mulai Belanja
                </Button>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order._id} className="p-6 hover:shadow-lg transition-shadow">
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.orderId}
                        </h3>
                        {getStatusBadge(order.orderStatus)}
                        {/* Return Status Badge */}
                        {order.returnStatus && order.returnStatus !== "none" && (
                          <Badge
                            className={
                              order.returnStatus === "requested"
                                ? "bg-orange-100 text-orange-800"
                                : order.returnStatus === "approved"
                                ? "bg-blue-100 text-blue-800"
                                : order.returnStatus === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            {order.returnStatus === "requested"
                              ? "Pengembalian Diajukan"
                              : order.returnStatus === "approved"
                              ? "Pengembalian Disetujui"
                              : order.returnStatus === "rejected"
                              ? "Pengembalian Ditolak"
                              : "Pengembalian Selesai"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Tanggal Pemesanan: {formatDate(order.createdAt)}
                      </p>
                      {order.shippingDetails && (
                        <>
                          <p className="text-sm text-gray-600">
                            Kurir: {order.shippingDetails.courierName} - {order.shippingDetails.service}
                          </p>
                          <p className="text-sm text-gray-600">
                            Estimasi: {order.shippingDetails.estimatedDays} hari
                          </p>
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Order Items - Show first 1 item by default */}
                  <div className="space-y-3 mb-4">
                    {(() => {
                      const isExpanded = expandedOrders.has(order._id);
                      const displayItems = isExpanded ? order.items : order.items.slice(0, 1);
                      const remainingCount = order.items.length - 1;

                      return (
                        <>
                          {displayItems.map((item: OrderItem) => (
                            <div key={item.productId} className="flex items-center gap-4">
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="w-16 h-16 object-cover rounded-md border"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {item.quantity} {item.unit} × {formatPrice(item.price)}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900">
                                {formatPrice(item.quantity * item.price)}
                              </p>
                            </div>
                          ))}

                          {/* Show expand/collapse button if more than 1 item */}
                          {order.items.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandOrder(order._id)}
                              className="text-primary hover:text-primary/80 hover:bg-transparent p-0 h-auto font-medium"
                            >
                              {isExpanded ? (
                                <>Tampilkan Lebih Sedikit</>
                              ) : (
                                <>+{remainingCount} produk lainnya</>
                              )}
                            </Button>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Alamat Pengiriman
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.shippingAddress.recipientName} - {order.shippingAddress.phoneNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.fullAddress}, {order.shippingAddress.district}, {order.shippingAddress.city}
                      <br />
                      {order.shippingAddress.province} {order.shippingAddress.postalCode}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none"
                      onClick={() => router.push(`/orders/${order.orderId}`)}
                    >
                      Lihat Detail
                    </Button>

                    {/* Pay Now Button - Show for awaiting_payment status with snapToken */}
                    {order.orderStatus === "awaiting_payment" && order.snapToken && (
                      <Button 
                        className="flex-1 sm:flex-none"
                        onClick={() => router.push(`/orders/${order.orderId}`)}
                      >
                        Bayar Sekarang
                      </Button>
                    )}

                    {/* Confirm Order Received Button - Show for delivered status and no return request */}
                    {order.orderStatus === "delivered" && (!order.returnStatus || order.returnStatus === "none" || order.returnStatus === "rejected") && (
                      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => setOrderToConfirm(order)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Konfirmasi Pesanan Diterima
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-xl text-green-700">Konfirmasi Pesanan Diterima</DialogTitle>
                            <DialogDescription>
                              Apakah Anda sudah menerima pesanan{" "}
                              <span className="font-semibold">{orderToConfirm?.orderId}</span>?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm text-green-800">
                                ✓ Pesanan akan ditandai sebagai <strong>selesai</strong>
                              </p>
                              <p className="text-sm text-green-800 mt-2">
                                ✓ Anda dapat memberikan rating setelah konfirmasi
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setConfirmDialogOpen(false);
                                setOrderToConfirm(null);
                              }}
                            >
                              Batal
                            </Button>
                            <Button
                              onClick={handleConfirmOrder}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Ya, Sudah Diterima
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Return Button - Show for delivered status only and no existing return request */}
                    {order.orderStatus === "delivered" && (!order.returnStatus || order.returnStatus === "none" || order.returnStatus === "rejected") && (
                      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedOrder(order);
                              setReturnCondition("");
                              setReturnReason("");
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Ajukan Pengembalian
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Ajukan Pengembalian</DialogTitle>
                            <DialogDescription>
                              Semua produk dalam pesanan{" "}
                              <span className="font-semibold">{selectedOrder?.orderId}</span> akan dikembalikan
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            {/* Product List (Read-only) */}
                            <div className="space-y-3">
                              <Label className="text-base font-semibold">
                                Produk yang Dikembalikan
                              </Label>
                              <div className="space-y-3">
                                {selectedOrder?.items.map((item) => (
                                  <div
                                    key={item.productId}
                                    className="flex items-start gap-3 border rounded-lg p-4 bg-gray-50"
                                  >
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      width={64}
                                      height={64}
                                      className="w-16 h-16 object-cover rounded-md"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{item.name}</p>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {item.quantity} {item.unit} × {formatPrice(item.price)}
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900 mt-1">
                                        Total: {formatPrice(item.quantity * item.price)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Condition Select */}
                            <div className="space-y-2">
                              <Label htmlFor="return-condition">
                                Kondisi Produk <span className="text-red-500">*</span>
                              </Label>
                              <Select value={returnCondition} onValueChange={setReturnCondition}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih kondisi produk" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="damaged">Rusak/Cacat</SelectItem>
                                  <SelectItem value="defective">Tidak Berfungsi</SelectItem>
                                  <SelectItem value="wrong_item">Salah Kirim</SelectItem>
                                  <SelectItem value="not_as_described">
                                    Tidak Sesuai Deskripsi
                                  </SelectItem>
                                  <SelectItem value="other">Lainnya</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Reason */}
                            <div className="space-y-2">
                              <Label htmlFor="return-reason">
                                Alasan Pengembalian <span className="text-red-500">*</span>
                              </Label>
                              <Textarea
                                id="return-reason"
                                placeholder="Jelaskan detail alasan pengembalian... (minimal 10 karakter)"
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                className="min-h-[120px] resize-none"
                              />
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm text-blue-800">
                                <strong>ℹ️ Kebijakan Pengembalian:</strong>
                              </p>
                              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                                <li>Pengajuan return maksimal 7 hari setelah pesanan diterima</li>
                                <li>Produk harus dalam kondisi lengkap dengan kemasan asli</li>
                                <li>Proses return membutuhkan waktu 3-7 hari kerja</li>
                              </ul>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setReturnDialogOpen(false);
                                setReturnCondition("");
                                setReturnReason("");
                              }}
                            >
                              Batal
                            </Button>
                            <Button
                              onClick={handleReturnRequest}
                              disabled={
                                createReturnMutation.isPending ||
                                !returnCondition ||
                                returnReason.trim().length < 10
                              }
                            >
                              {createReturnMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Memproses...
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Kirim Pengajuan
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Rating Badge - Show if already rated */}
                    {order.orderStatus === "completed" && order.rating && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < order.rating!.score
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Rating diberikan
                        </span>
                      </div>
                    )}

                    {/* Rating Button - Show for completed orders without rating */}
                    {order.orderStatus === "completed" && !order.rating && (
                      <Button
                        className="flex-1 sm:flex-none"
                        onClick={() => {
                          setOrderForRating(order);
                          setSelectedRating(0);
                          setReviewText("");
                        }}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Beri Rating
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Rating Dialog - Single instance outside loop */}
      <Dialog open={!!orderForRating} onOpenChange={(open) => !open && setOrderForRating(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beri Rating & Ulasan</DialogTitle>
            <DialogDescription>
              Bagaimana pengalaman Anda dengan pesanan {orderForRating?.orderId}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Star Rating */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-gray-700">Pilih Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedRating(star)}
                    className="transition-transform hover:scale-110 hover:bg-transparent"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= selectedRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </Button>
                ))}
              </div>
              {selectedRating > 0 && (
                <p className="text-sm text-gray-600">
                  Anda memberi rating: <span className="font-semibold">{selectedRating} bintang</span>
                </p>
              )}
            </div>
            
            {/* Review Text */}
            <div className="space-y-2">
              <Label htmlFor="review-text">
                Ulasan (Opsional)
              </Label>
              <Textarea
                id="review-text"
                placeholder="Tulis ulasan Anda tentang produk dan layanan kami..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-gray-500">
                Bagikan pengalaman Anda untuk membantu pembeli lain.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOrderForRating(null);
                setSelectedRating(0);
                setReviewText("");
              }}
            >
              Batal
            </Button>
            <Button
              onClick={() => orderForRating && handleSubmitRating(orderForRating)}
              disabled={selectedRating === 0 || submitRatingMutation.isPending}
            >
              {submitRatingMutation.isPending ? "Mengirim..." : "Kirim Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
