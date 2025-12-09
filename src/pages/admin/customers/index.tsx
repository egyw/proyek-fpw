import { useState } from "react";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, UserCheck, UserX, ShoppingBag, Calendar, Ban, CheckCircle, MessageCircle } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

// Customer interface for type safety
interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  suspendedAt?: string;
  suspensionReason?: string;
  totalOrders: number;
  totalSpent: number; 
  addresses: Array<{
    id: string;
    label: string;
    recipientName: string;
    phoneNumber: string;
    fullAddress: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
    notes?: string;
    isDefault: boolean;
  }>;
}

export default function CustomersPage() {
  // Role check
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [reactivateDialog, setReactivateDialog] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");

  const utils = trpc.useContext();

  // Fetch customers from database
  const { data: customersData, isLoading } = trpc.users.getAllCustomers.useQuery({
    search: searchQuery || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  // Fetch statistics
  const { data: statsData } = trpc.users.getCustomerStats.useQuery();

  // Fetch customer order stats (only when customer is selected)
  const { data: orderStatsData } = trpc.users.getCustomerOrderStats.useQuery(
    { userId: selectedCustomer?._id || "" },
    { enabled: !!selectedCustomer?._id }
  );

  // Suspend customer mutation
  const suspendMutation = trpc.users.suspendCustomer.useMutation({
    onSuccess: () => {
      toast.success("Customer Berhasil Dinonaktifkan!", {
        description: "Customer tidak dapat login ke sistem.",
      });
      utils.users.getAllCustomers.invalidate();
      utils.users.getCustomerStats.invalidate();
      setSuspendDialog(false);
      setDetailDialog(false);
      setSuspensionReason("");
    },
    onError: (error) => {
      toast.error("Gagal Menonaktifkan Customer", {
        description: error.message,
      });
    },
  });

  // Reactivate customer mutation
  const reactivateMutation = trpc.users.reactivateCustomer.useMutation({
    onSuccess: () => {
      toast.success("Customer Berhasil Diaktifkan!", {
        description: "Customer dapat login kembali ke sistem.",
      });
      utils.users.getAllCustomers.invalidate();
      utils.users.getCustomerStats.invalidate();
      setReactivateDialog(false);
      setDetailDialog(false);
    },
    onError: (error) => {
      toast.error("Gagal Mengaktifkan Customer", {
        description: error.message,
      });
    },
  });



  // Use real data from database
  const customers = (customersData?.customers || []) as Customer[];

  // Calculate stats from database
  const totalCustomers = statsData?.totalCustomers || 0;
  const activeCustomers = statsData?.activeCustomers || 0;
  const inactiveCustomers = statsData?.inactiveCustomers || 0;

  const handleSuspend = () => {
    if (!selectedCustomer || !suspensionReason.trim()) return;
    suspendMutation.mutate({
      userId: selectedCustomer._id,
      reason: suspensionReason,
    });
  };

  const handleReactivate = () => {
    if (!selectedCustomer) return;
    reactivateMutation.mutate({ userId: selectedCustomer._id });
  };

  const handleWhatsApp = (phone: string) => {
    // Remove leading 0 and add +62
    const formattedPhone = phone.startsWith("0") ? `62${phone.slice(1)}` : `62${phone}`;
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailDialog(true);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pelanggan</h1>
        <p className="text-gray-600 mt-1">
          Kelola data dan informasi pelanggan Anda
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pelanggan</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalCustomers}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pelanggan Aktif</p>
              <h3 className="text-2xl font-bold text-green-600">{activeCustomers}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pelanggan Tidak Aktif</p>
              <h3 className="text-2xl font-bold text-gray-600">{inactiveCustomers}</h3>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <UserX className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama, email, atau nomor telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Tgl Registrasi</TableHead>
              <TableHead>Total Pesanan</TableHead>
              <TableHead>Total Belanja</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
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
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Tidak ada data pelanggan yang ditemukan
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{customer.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {customer.addresses[0]?.city || "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">{customer.email}</p>
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(customer.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{customer.totalOrders}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>
                  <TableCell>
                    {customer.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(customer)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* View Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Detail Pelanggan</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang pelanggan
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">
                  Informasi Pelanggan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
                    <p className="font-medium text-gray-900">{selectedCustomer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    {selectedCustomer.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-gray-900">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nomor Telepon</p>
                    <p className="text-gray-900">{selectedCustomer.phone}</p>
                  </div>
                </div>
              </div>

              {/* Suspension Info (if suspended) */}
              {!selectedCustomer.isActive && selectedCustomer.suspensionReason && (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-2">
                    <Ban className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Alasan Penonaktifan:</p>
                      <p className="text-sm text-gray-700">{selectedCustomer.suspensionReason}</p>
                      {selectedCustomer.suspendedAt && (
                        <p className="text-xs text-gray-600 mt-2">
                          Dinonaktifkan pada: {formatDate(selectedCustomer.suspendedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">
                  Alamat Pengiriman
                </h3>
                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                  <div>
                    <p className="text-gray-900">{selectedCustomer.addresses[0].fullAddress}</p>
                    <p className="text-gray-900">
                      {selectedCustomer.addresses[0].district}, {selectedCustomer.addresses[0].city}
                    </p>
                    <p className="text-gray-900">
                      {selectedCustomer.addresses[0].province} - {selectedCustomer.addresses[0].postalCode}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Belum ada alamat terdaftar</p>
                )}
              </div>

              {/* Order Statistics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">
                  Statistik Pesanan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-5 w-5 text-gray-600" />
                      <p className="text-sm text-gray-600 font-medium">Total Pesanan</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {orderStatsData?.totalOrders || 0}
                    </p>
                  </div>
                  <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-5 w-5 text-gray-600" />
                      <p className="text-sm text-gray-600 font-medium">Total Belanja</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(orderStatsData?.totalSpent || 0)}
                    </p>
                  </div>
                  <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <p className="text-sm text-gray-600 font-medium">Tgl Registrasi</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(selectedCustomer.createdAt)}
                    </p>
                  </div>
                  <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <p className="text-sm text-gray-600 font-medium">Pesanan Terakhir</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {orderStatsData?.lastOrderDate 
                        ? formatDate(orderStatsData.lastOrderDate)
                        : "Belum ada pesanan"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              {/* WhatsApp Button */}
              {selectedCustomer && (
                <Button
                  variant="outline"
                  onClick={() => handleWhatsApp(selectedCustomer.phone)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              )}
              
              {/* Suspend/Reactivate Button - Admin Only */}
              {selectedCustomer && isAdmin && (
                <>
                  {selectedCustomer.isActive ? (
                    <Button
                      variant="outline"
                      onClick={() => setSuspendDialog(true)}
                      className="text-red-700 hover:bg-red-50"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Nonaktifkan
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setReactivateDialog(true)}
                      className="text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aktifkan Kembali
                    </Button>
                  )}
                </>
              )}
              
              {/* Staff Info Message */}
              {selectedCustomer && !isAdmin && (
                <Button
                  variant="outline"
                  disabled
                  className="cursor-not-allowed opacity-60"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Hanya Admin
                </Button>
              )}
            </div>
            
            <Button variant="outline" onClick={() => setDetailDialog(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend Customer Dialog */}
      <Dialog open={suspendDialog} onOpenChange={setSuspendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-700">Nonaktifkan Customer</DialogTitle>
            <DialogDescription>
              Customer tidak akan dapat login ke sistem setelah dinonaktifkan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="suspension-reason">Alasan Penonaktifan *</Label>
              <Textarea
                id="suspension-reason"
                rows={4}
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Masukkan alasan penonaktifan customer... (minimal 10 karakter)"
                className="resize-none"
              />
            </div>

            {selectedCustomer && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Customer:</strong> {selectedCustomer.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedCustomer.email}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSuspendDialog(false);
                setSuspensionReason("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={suspensionReason.trim().length < 10 || suspendMutation.isPending}
            >
              {suspendMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menonaktifkan...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Nonaktifkan Customer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Customer Dialog */}
      <Dialog open={reactivateDialog} onOpenChange={setReactivateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-green-700">Aktifkan Kembali Customer</DialogTitle>
            <DialogDescription>
              Customer akan dapat login kembali ke sistem setelah diaktifkan.
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Customer:</strong> {selectedCustomer.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedCustomer.email}
                </p>
              </div>

              {selectedCustomer.suspensionReason && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Alasan Penonaktifan:</p>
                  <p className="text-sm text-red-700">{selectedCustomer.suspensionReason}</p>
                </div>
              )}

              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin mengaktifkan kembali customer ini?
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReactivateDialog(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleReactivate}
              disabled={reactivateMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {reactivateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengaktifkan...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aktifkan Kembali
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
