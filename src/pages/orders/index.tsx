import { useState } from "react";
import Image from "next/image";
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
import { Package, Truck, CheckCircle, XCircle, Star } from "lucide-react";

// TODO: Replace with tRPC query
// Expected API: trpc.orders.getAll.useQuery({ status?: string })
// Input: { status?: 'processing' | 'shipping' | 'delivered' | 'completed' }
// Output: Order[]

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "processing" | "shipping" | "delivered" | "completed";
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  shippingAddress: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  rating?: number;
}

const dummyOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2025-001",
    date: "2025-10-05",
    status: "completed",
    total: 1500000,
    items: [
      {
        id: "1",
        name: "Semen Gresik 50kg",
        quantity: 20,
        price: 65000,
        image: "/images/dummy_image.jpg",
      },
      {
        id: "2",
        name: "Besi Beton 10mm",
        quantity: 10,
        price: 85000,
        image: "/images/dummy_image.jpg",
      },
    ],
    shippingAddress: "Jl. Merdeka No. 123, Jakarta Pusat",
    rating: 5,
  },
  {
    id: "2",
    orderNumber: "ORD-2025-002",
    date: "2025-10-08",
    status: "shipping",
    total: 2800000,
    items: [
      {
        id: "3",
        name: "Keramik Roman 30x30",
        quantity: 100,
        price: 28000,
        image: "/images/dummy_image.jpg",
      },
    ],
    shippingAddress: "Jl. Sudirman No. 456, Jakarta Selatan",
    estimatedDelivery: "2025-10-12",
    trackingNumber: "JNE123456789",
  },
  {
    id: "3",
    orderNumber: "ORD-2025-003",
    date: "2025-10-10",
    status: "processing",
    total: 750000,
    items: [
      {
        id: "4",
        name: "Cat Tembok Dulux 5L",
        quantity: 10,
        price: 75000,
        image: "/images/dummy_image.jpg",
      },
    ],
    shippingAddress: "Jl. Gatot Subroto No. 789, Tangerang",
  },
  {
    id: "4",
    orderNumber: "ORD-2025-004",
    date: "2025-10-09",
    status: "delivered",
    total: 3200000,
    items: [
      {
        id: "5",
        name: "Tangki Air Plastik 1000L",
        quantity: 2,
        price: 1600000,
        image: "/images/dummy_image.jpg",
      },
    ],
    shippingAddress: "Jl. Thamrin No. 321, Jakarta Pusat",
    estimatedDelivery: "2025-10-10",
  },
];

export default function OrdersPage() {
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

  // Filter orders based on status
  const filteredOrders =
    statusFilter === "all"
      ? dummyOrders
      : dummyOrders.filter((order) => order.status === statusFilter);

  const getStatusBadge = (status: Order["status"]) => {
    const variants: Record<
      Order["status"],
      { label: string; className: string; icon: React.ReactNode }
    > = {
      processing: {
        label: "Sedang Diproses",
        className: "bg-blue-100 text-blue-800",
        icon: <Package className="h-3 w-3 mr-1" />,
      },
      shipping: {
        label: "Dalam Perjalanan",
        className: "bg-yellow-100 text-yellow-800",
        icon: <Truck className="h-3 w-3 mr-1" />,
      },
      delivered: {
        label: "Sudah Sampai",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      completed: {
        label: "Selesai",
        className: "bg-gray-100 text-gray-800",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
    };

    const variant = variants[status];
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
    // Expected: returnMutation.mutate({ orderId: order.id, reason: returnReason })
    console.log("Return request for order:", order.orderNumber);
    console.log("Return reason:", returnReason);
    setReturnDialogOpen(false);
    setReturnReason("");
  };

  const handleSubmitRating = (order: Order) => {
    // TODO: Implement with tRPC
    // Expected: ratingMutation.mutate({ orderId: order.id, rating: selectedRating, review?: string })
    console.log("Rating submitted:", selectedRating, "for order:", order.orderNumber);
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
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="processing">Sedang Diproses</SelectItem>
                    <SelectItem value="shipping">Dalam Perjalanan</SelectItem>
                    <SelectItem value="delivered">Sudah Sampai</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
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
                <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Tanggal Pemesanan: {formatDate(order.date)}
                      </p>
                      {order.estimatedDelivery && (
                        <p className="text-sm text-gray-600">
                          Estimasi Sampai: {formatDate(order.estimatedDelivery)}
                        </p>
                      )}
                      {order.trackingNumber && (
                        <p className="text-sm text-gray-600">
                          No. Resi: <span className="font-mono">{order.trackingNumber}</span>
                        </p>
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
                      const isExpanded = expandedOrders.has(order.id);
                      const displayItems = isExpanded ? order.items : order.items.slice(0, 1);
                      const remainingCount = order.items.length - 1;

                      return (
                        <>
                          {displayItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
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
                                  {item.quantity} x {formatPrice(item.price)}
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
                              onClick={() => toggleExpandOrder(order.id)}
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
                    <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      Lihat Detail
                    </Button>

                    {/* Return Button - Show for shipping/delivered status */}
                    {(order.status === "shipping" || order.status === "delivered") && (
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
                              <span className="font-semibold">{selectedOrder?.orderNumber}</span>
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

                    {/* Rating Button - Show for completed orders without rating */}
                    {order.status === "completed" && !order.rating && (
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

                    {/* Show rating if already rated */}
                    {order.status === "completed" && order.rating && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">
                          Rating Anda: {order.rating}/5
                        </span>
                      </div>
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
