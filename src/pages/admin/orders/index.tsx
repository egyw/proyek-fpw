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
  Search,
  Eye,
  Send,
  Ban,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

// TODO: Replace with tRPC query
// Expected API: trpc.orders.getAll.useQuery()
// Input: { status?: string, search?: string }
// Output: Order[]

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: "paid" | "processing" | "shipped" | "delivered" | "completed" | "cancelled";
  paymentMethod: string;
  paymentProof?: string;
  shippingInfo?: {
    courier: string;
    trackingNumber: string;
    shippedAt: string;
  };
  cancelReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const dummyOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2025-001",
    customerId: "customer-1",
    customerName: "Budi Santoso",
    customerPhone: "081234567890",
    customerEmail: "budi@email.com",
    shippingAddress: {
      street: "Jl. Merdeka No. 123",
      city: "Jakarta Pusat",
      province: "DKI Jakarta",
      postalCode: "10110",
    },
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Semen Gresik 50kg",
        quantity: 10,
        unit: "SAK",
        price: 65000,
        subtotal: 650000,
      },
      {
        id: "item-2",
        productId: "prod-2",
        productName: "Cat Avian 5kg",
        quantity: 5,
        unit: "KALENG",
        price: 120000,
        subtotal: 600000,
      },
    ],
    subtotal: 1250000,
    shippingCost: 50000,
    total: 1300000,
    status: "paid",
    paymentMethod: "Transfer Bank BCA",
    createdAt: "2025-10-11T08:30:00Z",
    updatedAt: "2025-10-11T08:30:00Z",
  },
  {
    id: "2",
    orderNumber: "ORD-2025-002",
    customerId: "customer-2",
    customerName: "Siti Aminah",
    customerPhone: "082345678901",
    customerEmail: "siti@email.com",
    shippingAddress: {
      street: "Jl. Sudirman No. 456",
      city: "Bandung",
      province: "Jawa Barat",
      postalCode: "40123",
    },
    items: [
      {
        id: "item-3",
        productId: "prod-3",
        productName: "Besi Beton 10mm",
        quantity: 20,
        unit: "BATANG",
        price: 85000,
        subtotal: 1700000,
      },
    ],
    subtotal: 1700000,
    shippingCost: 100000,
    total: 1800000,
    status: "processing",
    paymentMethod: "Transfer Bank Mandiri",
    createdAt: "2025-10-10T14:20:00Z",
    updatedAt: "2025-10-11T09:15:00Z",
  },
  {
    id: "3",
    orderNumber: "ORD-2025-003",
    customerId: "customer-3",
    customerName: "Ahmad Hidayat",
    customerPhone: "083456789012",
    customerEmail: "ahmad@email.com",
    shippingAddress: {
      street: "Jl. Ahmad Yani No. 789",
      city: "Surabaya",
      province: "Jawa Timur",
      postalCode: "60234",
    },
    items: [
      {
        id: "item-4",
        productId: "prod-4",
        productName: "Pipa PVC 4 inch",
        quantity: 15,
        unit: "BATANG",
        price: 45000,
        subtotal: 675000,
      },
      {
        id: "item-5",
        productId: "prod-5",
        productName: "Keramik 40x40",
        quantity: 50,
        unit: "PCS",
        price: 35000,
        subtotal: 1750000,
      },
    ],
    subtotal: 2425000,
    shippingCost: 150000,
    total: 2575000,
    status: "shipped",
    paymentMethod: "Transfer Bank BNI",
    shippingInfo: {
      courier: "JNE",
      trackingNumber: "JNE1234567890",
      shippedAt: "2025-10-09T10:00:00Z",
    },
    createdAt: "2025-10-08T16:45:00Z",
    updatedAt: "2025-10-09T10:00:00Z",
  },
  {
    id: "4",
    orderNumber: "ORD-2025-004",
    customerId: "customer-4",
    customerName: "Dewi Lestari",
    customerPhone: "084567890123",
    customerEmail: "dewi@email.com",
    shippingAddress: {
      street: "Jl. Gatot Subroto No. 321",
      city: "Semarang",
      province: "Jawa Tengah",
      postalCode: "50145",
    },
    items: [
      {
        id: "item-6",
        productId: "prod-6",
        productName: "Genteng Metal",
        quantity: 100,
        unit: "LEMBAR",
        price: 25000,
        subtotal: 2500000,
      },
    ],
    subtotal: 2500000,
    shippingCost: 200000,
    total: 2700000,
    status: "delivered",
    paymentMethod: "Transfer Bank BRI",
    shippingInfo: {
      courier: "J&T",
      trackingNumber: "JT9876543210",
      shippedAt: "2025-10-05T11:30:00Z",
    },
    createdAt: "2025-10-04T13:20:00Z",
    updatedAt: "2025-10-10T15:45:00Z",
  },
  {
    id: "5",
    orderNumber: "ORD-2025-005",
    customerId: "customer-5",
    customerName: "Eko Prasetyo",
    customerPhone: "085678901234",
    customerEmail: "eko@email.com",
    shippingAddress: {
      street: "Jl. Diponegoro No. 654",
      city: "Yogyakarta",
      province: "DI Yogyakarta",
      postalCode: "55223",
    },
    items: [
      {
        id: "item-7",
        productId: "prod-7",
        productName: "Pasir Cor",
        quantity: 5,
        unit: "M3",
        price: 350000,
        subtotal: 1750000,
      },
    ],
    subtotal: 1750000,
    shippingCost: 300000,
    total: 2050000,
    status: "completed",
    paymentMethod: "Transfer Bank BCA",
    shippingInfo: {
      courier: "SiCepat",
      trackingNumber: "SICEPAT123456",
      shippedAt: "2025-09-28T09:00:00Z",
    },
    createdAt: "2025-09-27T10:15:00Z",
    updatedAt: "2025-10-02T14:30:00Z",
  },
  {
    id: "6",
    orderNumber: "ORD-2025-006",
    customerId: "customer-6",
    customerName: "Rina Melati",
    customerPhone: "086789012345",
    customerEmail: "rina@email.com",
    shippingAddress: {
      street: "Jl. Pahlawan No. 987",
      city: "Malang",
      province: "Jawa Timur",
      postalCode: "65117",
    },
    items: [
      {
        id: "item-8",
        productId: "prod-8",
        productName: "Cat Dulux 20L",
        quantity: 3,
        unit: "GALON",
        price: 450000,
        subtotal: 1350000,
      },
    ],
    subtotal: 1350000,
    shippingCost: 75000,
    total: 1425000,
    status: "cancelled",
    paymentMethod: "Transfer Bank Mandiri",
    cancelReason: "Stok habis, customer minta refund",
    createdAt: "2025-10-07T11:45:00Z",
    updatedAt: "2025-10-08T08:30:00Z",
  },
];

const statusConfig = {
  paid: { label: "Paid", color: "bg-blue-100 text-blue-800", icon: ShoppingCart },
  processing: { label: "Processing", color: "bg-yellow-100 text-yellow-800", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Dialog states
  const [viewDetailDialog, setViewDetailDialog] = useState(false);
  const [processDialog, setProcessDialog] = useState(false);
  const [shipDialog, setShipDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Shipping form
  const [shippingCourier, setShippingCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippedDate, setShippedDate] = useState("");
  
  // Cancel form
  const [cancelReason, setCancelReason] = useState("");

  // Filter orders
  const filteredOrders = dummyOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    paid: dummyOrders.filter((o) => o.status === "paid").length,
    processing: dummyOrders.filter((o) => o.status === "processing").length,
    shipped: dummyOrders.filter((o) => o.status === "shipped").length,
    completed: dummyOrders.filter((o) => o.status === "completed").length,
  };

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

  const handleCancel = (order: Order) => {
    setSelectedOrder(order);
    setCancelDialog(true);
    setCancelReason("");
  };

  // tRPC mutations
  const utils = trpc.useContext();
  const updateOrderStatusMutation = trpc.orders.updateOrderStatus.useMutation({
    onSuccess: () => {
      // Refetch orders data
      utils.orders.invalidate();
    },
  });

  const confirmProcess = async () => {
    if (!selectedOrder) return;

    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId: selectedOrder.orderNumber,
        orderStatus: 'processing',
      });

      toast.success('Pesanan Diproses', {
        description: `Order ${selectedOrder.orderNumber} sedang diproses.`,
      });

      setProcessDialog(false);
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Gagal Memproses Pesanan', {
        description: 'Terjadi kesalahan saat memproses pesanan.',
      });
    }
  };

  const confirmShip = async () => {
    if (!selectedOrder) return;

    if (!shippingCourier || !trackingNumber || !shippedDate) {
      toast.error('Data Tidak Lengkap', {
        description: 'Mohon lengkapi semua data pengiriman.',
      });
      return;
    }

    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId: selectedOrder.orderNumber,
        orderStatus: 'shipped',
        shippingInfo: {
          courier: shippingCourier,
          trackingNumber: trackingNumber,
          shippedDate: shippedDate,
        },
      });

      toast.success('Pesanan Dikirim', {
        description: `Order ${selectedOrder.orderNumber} telah dikirim.`,
      });

      setShipDialog(false);
    } catch (error) {
      console.error('Error shipping order:', error);
      toast.error('Gagal Mengirim Pesanan', {
        description: 'Terjadi kesalahan saat mengirim pesanan.',
      });
    }
  };

  const confirmCancel = async () => {
    if (!selectedOrder) return;

    if (!cancelReason.trim()) {
      toast.error('Alasan Diperlukan', {
        description: 'Mohon masukkan alasan pembatalan.',
      });
      return;
    }

    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId: selectedOrder.orderNumber,
        orderStatus: 'cancelled',
        cancelReason: cancelReason,
      });

      toast.success('Pesanan Dibatalkan', {
        description: `Order ${selectedOrder.orderNumber} telah dibatalkan.`,
      });

      setCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Gagal Membatalkan Pesanan', {
        description: 'Terjadi kesalahan saat membatalkan pesanan.',
      });
    }
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
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
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Tidak ada pesanan yang sesuai dengan filter
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.items.length} item(s)</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[order.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[order.status].label}
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
                          {order.status === "paid" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleProcess(order)}
                            >
                              Proses
                            </Button>
                          )}
                          {order.status === "processing" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleShip(order)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Kirim
                            </Button>
                          )}
                          {(order.status === "paid" || order.status === "processing") && (
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
              <DialogTitle>Detail Pesanan {selectedOrder?.orderNumber}</DialogTitle>
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
                      <p className="font-medium">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Telepon</p>
                      <p className="font-medium">{selectedOrder.customerPhone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{selectedOrder.customerEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-3">Alamat Pengiriman</h3>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress.street}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}<br />
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-3">Item Pesanan</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-gray-600">
                            {item.quantity} {item.unit} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.subtotal)}</p>
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
                    <span className="font-medium">{selectedOrder.paymentMethod}</span>
                  </p>
                </div>

                {/* Shipping Info (if shipped) */}
                {selectedOrder.shippingInfo && (
                  <div>
                    <h3 className="font-semibold mb-3">Informasi Pengiriman</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Kurir:</span>{" "}
                        <span className="font-medium">{selectedOrder.shippingInfo.courier}</span>
                      </p>
                      <p>
                        <span className="text-gray-600">No. Resi:</span>{" "}
                        <span className="font-medium">{selectedOrder.shippingInfo.trackingNumber}</span>
                      </p>
                      <p>
                        <span className="text-gray-600">Tanggal Kirim:</span>{" "}
                        <span className="font-medium">{formatDate(selectedOrder.shippingInfo.shippedAt)}</span>
                      </p>
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
                Masukkan detail pengiriman untuk pesanan {selectedOrder?.orderNumber}
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
                    <SelectItem value="JNE">JNE</SelectItem>
                    <SelectItem value="J&T">J&T Express</SelectItem>
                    <SelectItem value="SiCepat">SiCepat</SelectItem>
                    <SelectItem value="Anteraja">Anteraja</SelectItem>
                    <SelectItem value="IDExpress">ID Express</SelectItem>
                    <SelectItem value="Ninja">Ninja Express</SelectItem>
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

        {/* Cancel Order Dialog */}
        <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Batalkan Pesanan</DialogTitle>
              <DialogDescription>
                Masukkan alasan pembatalan untuk pesanan {selectedOrder?.orderNumber}
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
