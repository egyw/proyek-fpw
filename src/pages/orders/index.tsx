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
import { Package, Truck, CheckCircle, XCircle, Star, Clock } from "lucide-react";
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
  paymentStatus: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
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
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  
  // Protect page - require authentication
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  // Get user's orders from database
  const { data: ordersData, isLoading: ordersLoading } = trpc.orders.getUserOrders.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [returnReason, setReturnReason] = useState("");

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

  // Filter orders based on payment status
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.paymentStatus === statusFilter);

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

  const getStatusBadge = (status: Order["paymentStatus"]) => {
    const variants: Record<
      Order["paymentStatus"],
      { label: string; className: string; icon: React.ReactNode }
    > = {
      pending: {
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
    };

    const variant = variants[status] || variants.pending;
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

  const handleReturnRequest = (order: Order) => {
    // TODO: Implement with tRPC
    // Expected: trpc.orders.requestReturn.useMutation()
    toast.info("Fitur pengembalian barang segera hadir");
    console.log("Return request for order:", order.orderId);
    console.log("Return reason:", returnReason);
    setReturnDialogOpen(false);
    setReturnReason("");
  };

  const handleSubmitRating = (order: Order) => {
    // TODO: Implement with tRPC
    // Expected: trpc.orders.submitRating.useMutation()
    toast.success("Rating berhasil dikirim!");
    console.log("Rating submitted:", selectedRating, "for order:", order.orderId);
    setRatingDialogOpen(false);
    setSelectedRating(0);
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
                    <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
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
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.orderId}
                        </h3>
                        {getStatusBadge(order.paymentStatus)}
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

                    {/* Pay Now Button - Show for pending status with snapToken */}
                    {order.paymentStatus === "pending" && order.snapToken && (
                      <Button 
                        className="flex-1 sm:flex-none"
                        onClick={() => router.push(`/orders/${order.orderId}`)}
                      >
                        Bayar Sekarang
                      </Button>
                    )}

                    {/* Return Button - Show for shipped/delivered status */}
                    {(order.paymentStatus === "shipped" || order.paymentStatus === "delivered") && (
                      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setSelectedOrder(order)}
                          >
                            Ajukan Pengembalian
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ajukan Pengembalian</DialogTitle>
                            <DialogDescription>
                              Anda akan mengajukan pengembalian untuk pesanan{" "}
                              <span className="font-semibold">{selectedOrder?.orderId}</span>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="return-reason">
                                Alasan Pengembalian <span className="text-red-500">*</span>
                              </Label>
                              <Textarea
                                id="return-reason"
                                placeholder="Jelaskan alasan Anda mengajukan pengembalian barang..."
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                className="min-h-[120px]"
                              />
                              <p className="text-xs text-gray-500">
                                Berikan penjelasan detail agar kami dapat memproses pengembalian dengan cepat.
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setReturnDialogOpen(false);
                                setReturnReason("");
                              }}
                            >
                              Batal
                            </Button>
                            <Button
                              onClick={() => selectedOrder && handleReturnRequest(selectedOrder)}
                              disabled={!returnReason.trim()}
                            >
                              Kirim Pengajuan
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Rating Button - Show for completed orders (TODO: Add rating field to Order model) */}
                    {order.paymentStatus === "completed" && (
                      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            className="flex-1 sm:flex-none"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Beri Rating
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Beri Rating & Ulasan</DialogTitle>
                            <DialogDescription>
                              Bagaimana pengalaman Anda dengan pesanan ini?
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
                            {/* TODO: Add review textarea */}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setRatingDialogOpen(false);
                                setSelectedRating(0);
                              }}
                            >
                              Batal
                            </Button>
                            <Button
                              onClick={() => selectedOrder && handleSubmitRating(selectedOrder)}
                              disabled={selectedRating === 0}
                            >
                              Kirim Rating
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
