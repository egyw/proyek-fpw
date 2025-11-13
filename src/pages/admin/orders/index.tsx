import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  Send,
  Ban,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  unit: string;
  price: number;
  image: string;
}

interface UserInfo {
  _id: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface Order {
  _id: string;
  orderId: string;
  userId: UserInfo | null;
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
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount?: {
    amount: number;
    code: string;
  };
  total: number;
  orderStatus: "pending" | "awaiting_payment" | "paid" | "processing" | "shipped" | "delivered" | "completed" | "cancelled";
  paymentStatus: string;
  paymentMethod: string;
  paymentType?: string; // ✅ NEW - Specific payment type from Midtrans
  shippingInfo?: {
    courier: string;
    courierName: string;
    service: string;
    trackingNumber?: string;
    shippedDate?: string;
  };
  deliveredDate?: string;
  cancelReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-800", icon: Clock },
  awaiting_payment: { label: "Awaiting Payment", color: "bg-orange-100 text-orange-800", icon: Clock },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-800", icon: ShoppingCart },
  processing: { label: "Processing", color: "bg-yellow-100 text-yellow-800", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "awaiting_payment" | "paid" | "processing" | "shipped" | "delivered" | "completed" | "cancelled">("all");
  
  // Dialog states
  const [viewDetailDialog, setViewDetailDialog] = useState(false);
  const [processDialog, setProcessDialog] = useState(false);
  const [shipDialog, setShipDialog] = useState(false);
  const [deliveredDialog, setDeliveredDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Shipping form
  const [shippingCourier, setShippingCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippedDate, setShippedDate] = useState("");
  
  // Delivered form
  const [deliveredDate, setDeliveredDate] = useState("");
  
  // Cancel form
  const [cancelReason, setCancelReason] = useState("");

  // tRPC queries
  const { data: ordersData, isLoading } = trpc.orders.getAllOrders.useQuery({
    status: statusFilter as "all" | "pending" | "awaiting_payment" | "paid" | "processing" | "shipped" | "delivered" | "completed" | "cancelled" | undefined,
    search: searchQuery,
  });

  const { data: statsData } = trpc.orders.getOrderStatistics.useQuery();

  const orders = ordersData?.orders || [];
  const stats = statsData || { paid: 0, processing: 0, shipped: 0, completed: 0 };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setViewDetailDialog(true);
  };

  const handleProcess = (order: Order) => {
    setSelectedOrder(order);
    setProcessDialog(true);
  };

  const handleShip = (order: Order) => {
    setSelectedOrder(order);
    setShipDialog(true);
    setShippingCourier("");
    setTrackingNumber("");
    setShippedDate(new Date().toISOString().split("T")[0]);
  };

  const handleDelivered = (order: Order) => {
    setSelectedOrder(order);
    setDeliveredDialog(true);
    setDeliveredDate(new Date().toISOString().split("T")[0]);
  };

  const handleCancel = (order: Order) => {
    setSelectedOrder(order);
    setCancelDialog(true);
    setCancelReason("");
  };

  // tRPC mutations
  const utils = trpc.useContext();
  
  const processOrderMutation = trpc.orders.processOrder.useMutation({
    onSuccess: () => {
      utils.orders.getAllOrders.invalidate();
      utils.orders.getOrderStatistics.invalidate();
      toast.success('Pesanan Diproses', {
        description: 'Pesanan berhasil diproses.',
      });
      setProcessDialog(false);
      setViewDetailDialog(false); // Close view detail dialog to refresh data
      setSelectedOrder(null); // Clear selected order
    },
    onError: (error) => {
      toast.error('Gagal Memproses Pesanan', {
        description: error.message,
      });
    },
  });

  const shipOrderMutation = trpc.orders.shipOrder.useMutation({
    onSuccess: () => {
      utils.orders.getAllOrders.invalidate();
      utils.orders.getOrderStatistics.invalidate();
      toast.success('Pesanan Dikirim', {
        description: 'Pesanan berhasil dikirim.',
      });
      setShipDialog(false);
      setViewDetailDialog(false); // Close view detail dialog to refresh data
      setSelectedOrder(null); // Clear selected order
      setShippingCourier("");
      setTrackingNumber("");
      setShippedDate("");
    },
    onError: (error) => {
      toast.error('Gagal Mengirim Pesanan', {
        description: error.message,
      });
    },
  });

  const confirmDeliveredMutation = trpc.orders.confirmDelivered.useMutation({
    onSuccess: () => {
      utils.orders.getAllOrders.invalidate();
      utils.orders.getOrderStatistics.invalidate();
      toast.success('Pesanan Terkirim', {
        description: 'Pesanan berhasil dikonfirmasi terkirim.',
      });
      setDeliveredDialog(false);
      setViewDetailDialog(false);
      setSelectedOrder(null);
      setDeliveredDate("");
    },
    onError: (error) => {
      toast.error('Gagal Konfirmasi Pengiriman', {
        description: error.message,
      });
    },
  });

  const cancelOrderMutation = trpc.orders.cancelOrder.useMutation({
    onSuccess: () => {
      utils.orders.getAllOrders.invalidate();
      utils.orders.getOrderStatistics.invalidate();
      toast.success('Pesanan Dibatalkan', {
        description: 'Pesanan berhasil dibatalkan.',
      });
      setCancelDialog(false);
      setViewDetailDialog(false); // Close view detail dialog to refresh data
      setSelectedOrder(null); // Clear selected order
      setCancelReason("");
    },
    onError: (error) => {
      toast.error('Gagal Membatalkan Pesanan', {
        description: error.message,
      });
    },
  });

  const confirmProcess = () => {
    if (!selectedOrder) return;
    processOrderMutation.mutate({ orderId: selectedOrder.orderId });
  };

  const confirmShip = () => {
    if (!selectedOrder) return;

    if (!shippingCourier || !trackingNumber || !shippedDate) {
      toast.error('Data Tidak Lengkap', {
        description: 'Mohon lengkapi semua data pengiriman.',
      });
      return;
    }

    // Map courier code to name
    const courierMap: Record<string, { name: string; service: string }> = {
      jne: { name: 'JNE', service: 'REG' },
      jnt: { name: 'J&T Express', service: 'REG' },
      sicepat: { name: 'SiCepat', service: 'REG' },
      anteraja: { name: 'AnterAja', service: 'REG' },
      idexpress: { name: 'ID Express', service: 'REG' },
      ninja: { name: 'Ninja Xpress', service: 'REG' },
    };

    const courierInfo = courierMap[shippingCourier] || { name: shippingCourier.toUpperCase(), service: 'REG' };

    shipOrderMutation.mutate({
      orderId: selectedOrder.orderId,
      courier: shippingCourier,
      courierName: courierInfo.name,
      service: courierInfo.service,
      trackingNumber: trackingNumber,
      shippedDate: shippedDate,
    });
  };

  const confirmDelivered = () => {
    if (!selectedOrder) return;

    if (!deliveredDate) {
      toast.error('Tanggal Diperlukan', {
        description: 'Mohon pilih tanggal pengiriman.',
      });
      return;
    }

    confirmDeliveredMutation.mutate({
      orderId: selectedOrder.orderId,
      deliveredDate: deliveredDate,
    });
  };

  const confirmCancel = () => {
    if (!selectedOrder) return;

    if (!cancelReason.trim()) {
      toast.error('Alasan Diperlukan', {
        description: 'Mohon masukkan alasan pembatalan.',
      });
      return;
    }

    cancelOrderMutation.mutate({
      orderId: selectedOrder.orderId,
      cancelReason: cancelReason,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Pesanan</h1>
          <p className="text-gray-600 mt-2">
            Kelola semua pesanan yang sudah dikonfirmasi pembayarannya
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Perlu Diproses</p>
                <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.paid}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sedang Diproses</p>
                <h3 className="text-2xl font-bold text-yellow-600 mt-1">{stats.processing}</h3>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dalam Pengiriman</p>
                <h3 className="text-2xl font-bold text-purple-600 mt-1">{stats.shipped}</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selesai</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nomor order, nama, atau telepon customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(
                value:
                  | "all"
                  | "pending"
                  | "awaiting_payment"
                  | "paid"
                  | "processing"
                  | "shipped"
                  | "delivered"
                  | "completed"
                  | "cancelled"
              ) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Orders Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Tidak ada pesanan yang sesuai dengan filter
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((orderData) => {
                  const order = orderData as unknown as Order;
                  // Safe access to statusConfig with fallback
                  const statusKey = order.orderStatus as keyof typeof statusConfig;
                  const statusData = statusConfig[statusKey] || statusConfig.pending;
                  const StatusIcon = statusData.icon;
                  const customerName = order.userId?.fullName || order.userId?.name || order.shippingAddress.recipientName;
                  const customerPhone = order.userId?.phone || order.shippingAddress.phoneNumber;
                  
                  return (
                    <TableRow key={String(order._id)}>
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customerName}</p>
                          <p className="text-sm text-gray-500">{customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.items.length} item(s)</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusData.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusData.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.orderStatus === "paid" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleProcess(order)}
                            >
                              Proses
                            </Button>
                          )}
                          {order.orderStatus === "processing" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleShip(order)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Kirim
                            </Button>
                          )}
                          {order.orderStatus === "shipped" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleDelivered(order)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Konfirmasi Terkirim
                            </Button>
                          )}
                          {(order.orderStatus === "paid" || order.orderStatus === "processing") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancel(order)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* View Detail Dialog */}
        <Dialog open={viewDetailDialog} onOpenChange={setViewDetailDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pesanan {selectedOrder?.orderId}</DialogTitle>
              <DialogDescription>
                Informasi lengkap pesanan customer
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3">Informasi Customer</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Nama</p>
                      <p className="font-medium">{selectedOrder.userId?.fullName || selectedOrder.userId?.name || selectedOrder.shippingAddress.recipientName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Telepon</p>
                      <p className="font-medium">{selectedOrder.userId?.phone || selectedOrder.shippingAddress.phoneNumber}</p>
                    </div>
                    {selectedOrder.userId?.email && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium">{selectedOrder.userId.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-3">Alamat Pengiriman</h3>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress.fullAddress}<br />
                    {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}<br />
                    {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-3">Item Pesanan</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-600">
                            {item.quantity} {item.unit} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium">{formatCurrency(selectedOrder.subtotal)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Ongkir</p>
                    <p className="font-medium">{formatCurrency(selectedOrder.shippingCost)}</p>
                  </div>
                  {selectedOrder.discount && selectedOrder.discount.amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <p>Diskon ({selectedOrder.discount.code})</p>
                      <p>-{formatCurrency(selectedOrder.discount.amount)}</p>
                    </div>
                  )}
                  <div className="flex justify-between text-base border-t pt-2">
                    <p className="font-semibold">Total</p>
                    <p className="font-bold text-primary">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="font-semibold mb-3">Informasi Pembayaran</h3>
                  <p className="text-sm">
                    <span className="text-gray-600">Metode:</span>{" "}
                    <span className="font-medium">
                      {selectedOrder.paymentType ? (
                        <>
                          {/* Display user-friendly name */}
                          {selectedOrder.paymentType === 'credit_card' && 'Kartu Kredit'}
                          {selectedOrder.paymentType === 'gopay' && 'GoPay'}
                          {selectedOrder.paymentType === 'shopeepay' && 'ShopeePay'}
                          {selectedOrder.paymentType === 'qris' && 'QRIS'}
                          {selectedOrder.paymentType === 'bca_va' && 'BCA Virtual Account'}
                          {selectedOrder.paymentType === 'bni_va' && 'BNI Virtual Account'}
                          {selectedOrder.paymentType === 'bri_va' && 'BRI Virtual Account'}
                          {selectedOrder.paymentType === 'bank_transfer' && 'Transfer Bank'}
                          {selectedOrder.paymentType === 'echannel' && 'Mandiri Virtual Account'}
                          {selectedOrder.paymentType === 'permata_va' && 'Permata Virtual Account'}
                          {selectedOrder.paymentType === 'alfamart' && 'Alfamart'}
                          {selectedOrder.paymentType === 'indomaret' && 'Indomaret'}
                          {!['credit_card', 'gopay', 'shopeepay', 'qris', 'bca_va', 'bni_va', 'bri_va', 'bank_transfer', 'echannel', 'permata_va', 'alfamart', 'indomaret'].includes(selectedOrder.paymentType) && selectedOrder.paymentType}
                          {' '}
                          <span className="text-gray-500 text-xs">(via Midtrans)</span>
                        </>
                      ) : (
                        selectedOrder.paymentMethod === 'midtrans' ? 'Midtrans' : selectedOrder.paymentMethod
                      )}
                    </span>
                  </p>
                </div>

                {/* Shipping Info (if shipped) */}
                {selectedOrder.shippingInfo && (
                  <div>
                    <h3 className="font-semibold mb-3">Informasi Pengiriman</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Kurir:</span>{" "}
                        <span className="font-medium">{selectedOrder.shippingInfo.courierName} ({selectedOrder.shippingInfo.service})</span>
                      </p>
                      {selectedOrder.shippingInfo.trackingNumber && (
                        <p>
                          <span className="text-gray-600">No. Resi:</span>{" "}
                          <span className="font-medium">{selectedOrder.shippingInfo.trackingNumber}</span>
                        </p>
                      )}
                      {selectedOrder.shippingInfo.shippedDate && (
                        <p>
                          <span className="text-gray-600">Tanggal Kirim:</span>{" "}
                          <span className="font-medium">{formatDate(selectedOrder.shippingInfo.shippedDate)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Info (if delivered) */}
                {selectedOrder.deliveredDate && (
                  <div>
                    <h3 className="font-semibold mb-3">Informasi Penerimaan</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-gray-600">Pesanan telah diterima pada:</p>
                          <p className="font-medium text-green-900">{formatDate(selectedOrder.deliveredDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancel Reason (if cancelled) */}
                {selectedOrder.cancelReason && (
                  <div>
                    <h3 className="font-semibold mb-3">Alasan Pembatalan</h3>
                    <p className="text-sm text-red-600">{selectedOrder.cancelReason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Process Order Dialog */}
        <Dialog open={processDialog} onOpenChange={setProcessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Proses Pesanan</DialogTitle>
              <DialogDescription>
                Pesanan akan diubah statusnya menjadi &quot;Processing&quot;. Pastikan Anda siap untuk menyiapkan barang.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProcessDialog(false)}>
                Batal
              </Button>
              <Button onClick={confirmProcess}>
                Ya, Proses Pesanan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ship Order Dialog */}
        <Dialog open={shipDialog} onOpenChange={setShipDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Input Informasi Pengiriman</DialogTitle>
              <DialogDescription>
                Masukkan detail pengiriman untuk pesanan {selectedOrder?.orderId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courier">Ekspedisi</Label>
                <Select value={shippingCourier} onValueChange={setShippingCourier}>
                  <SelectTrigger id="courier">
                    <SelectValue placeholder="Pilih ekspedisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jne">JNE</SelectItem>
                    <SelectItem value="jnt">J&T Express</SelectItem>
                    <SelectItem value="sicepat">SiCepat</SelectItem>
                    <SelectItem value="anteraja">AnterAja</SelectItem>
                    <SelectItem value="idexpress">ID Express</SelectItem>
                    <SelectItem value="ninja">Ninja Xpress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tracking">Nomor Resi</Label>
                <Input
                  id="tracking"
                  placeholder="Contoh: JNE1234567890"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipped-date">Tanggal Kirim</Label>
                <Input
                  id="shipped-date"
                  type="date"
                  value={shippedDate}
                  onChange={(e) => setShippedDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShipDialog(false)}>
                Batal
              </Button>
              <Button
                onClick={confirmShip}
                disabled={!shippingCourier || !trackingNumber || !shippedDate}
              >
                <Send className="h-4 w-4 mr-2" />
                Simpan & Kirim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Delivered Dialog */}
        <Dialog open={deliveredDialog} onOpenChange={setDeliveredDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Pesanan Terkirim</DialogTitle>
              <DialogDescription>
                Pastikan pesanan {selectedOrder?.orderId} telah diterima oleh customer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Informasi Pengiriman:</p>
                    {selectedOrder?.shippingInfo && (
                      <>
                        <p>Kurir: {selectedOrder.shippingInfo.courierName} ({selectedOrder.shippingInfo.service})</p>
                        {selectedOrder.shippingInfo.trackingNumber && (
                          <p>No. Resi: {selectedOrder.shippingInfo.trackingNumber}</p>
                        )}
                        {selectedOrder.shippingInfo.shippedDate && (
                          <p>Tanggal Kirim: {formatDate(selectedOrder.shippingInfo.shippedDate)}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivered-date">Tanggal Terkirim</Label>
                <Input
                  id="delivered-date"
                  type="date"
                  value={deliveredDate}
                  onChange={(e) => setDeliveredDate(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Tanggal ketika pesanan diterima oleh customer
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeliveredDialog(false)}>
                Batal
              </Button>
              <Button
                onClick={confirmDelivered}
                disabled={!deliveredDate || confirmDeliveredMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {confirmDeliveredMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Konfirmasi Terkirim
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Order Dialog */}
        <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Batalkan Pesanan</DialogTitle>
              <DialogDescription>
                Masukkan alasan pembatalan untuk pesanan {selectedOrder?.orderId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Alasan Pembatalan</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Contoh: Stok habis, customer request refund, dll..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialog(false)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancel}
                disabled={!cancelReason.trim()}
              >
                <Ban className="h-4 w-4 mr-2" />
                Batalkan Pesanan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
