import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Ticket, Power } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { z } from "zod";

// Voucher interface from backend
interface IVoucher {
  _id: string;
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

// Voucher form validation schema
const voucherSchema = z.object({
  code: z.string().min(3, "Kode minimal 3 karakter").max(20, "Kode maksimal 20 karakter").toUpperCase(),
  name: z.string().min(3, "Nama minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive("Nilai harus lebih dari 0"),
  minPurchase: z.number().min(0, "Minimal pembelian tidak boleh negatif"),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().min(1, "Batas penggunaan minimal 1"),
  startDate: z.string().min(1, "Tanggal mulai harus diisi"),
  endDate: z.string().min(1, "Tanggal akhir harus diisi"),
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

export default function VouchersPage() {
  // Role check
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [filterType, setFilterType] = useState<"all" | "percentage" | "fixed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<VoucherFormValues>>({
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: 0,
    minPurchase: 0,
    maxDiscount: undefined,
    usageLimit: 100,
    startDate: "",
    endDate: "",
  });

  // tRPC queries
  const utils = trpc.useContext();
  
  const { data: vouchersData, isLoading: isLoadingVouchers } = trpc.vouchers.getAll.useQuery({
    search: searchQuery || undefined,
    status: filterStatus === "all" ? undefined : filterStatus,
    type: filterType === "all" ? undefined : filterType,
    page: currentPage,
    limit: 10,
  });

  const { data: statsData } = trpc.vouchers.getStats.useQuery();

  // Mutations
  const createVoucherMutation = trpc.vouchers.create.useMutation({
    onSuccess: () => {
      utils.vouchers.getAll.invalidate();
      utils.vouchers.getStats.invalidate();
      toast.success("Voucher Ditambahkan!", {
        description: "Voucher baru berhasil dibuat.",
      });
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Gagal Menambahkan Voucher", {
        description: error.message,
      });
    },
  });

  const updateVoucherMutation = trpc.vouchers.update.useMutation({
    onSuccess: () => {
      utils.vouchers.getAll.invalidate();
      utils.vouchers.getStats.invalidate();
      toast.success("Voucher Diperbarui!", {
        description: "Perubahan voucher berhasil disimpan.",
      });
      setShowEditDialog(false);
      setSelectedVoucher(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("Gagal Memperbarui Voucher", {
        description: error.message,
      });
    },
  });

  const toggleStatusMutation = trpc.vouchers.toggleStatus.useMutation({
    onSuccess: (data) => {
      utils.vouchers.getAll.invalidate();
      utils.vouchers.getStats.invalidate();
      toast.success("Status Diubah!", {
        description: `Voucher ${data.voucher.isActive ? "diaktifkan" : "dinonaktifkan"}.`,
      });
    },
    onError: (error) => {
      toast.error("Gagal Mengubah Status", {
        description: error.message,
      });
    },
  });



  const pagination = vouchersData?.pagination;

  // Helper functions
  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      minPurchase: 0,
      maxDiscount: undefined,
      usageLimit: 100,
      startDate: "",
      endDate: "",
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
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: "active" | "inactive" | "expired") => {
    const variants = {
      active: { label: "Aktif", className: "bg-green-100 text-green-800" },
      inactive: { label: "Tidak Aktif", className: "bg-gray-100 text-gray-800" },
      expired: { label: "Kadaluarsa", className: "bg-red-100 text-red-800" },
    };
    const variant = variants[status];
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  // Handle actions
  const handleEdit = (voucher: IVoucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || "",
      type: voucher.type,
      value: voucher.value,
      minPurchase: voucher.minPurchase,
      maxDiscount: voucher.maxDiscount,
      usageLimit: voucher.usageLimit,
      startDate: voucher.startDate.split("T")[0], // Convert ISO to YYYY-MM-DD
      endDate: voucher.endDate.split("T")[0],
    });
    setShowEditDialog(true);
  };

  const handleSubmitAdd = () => {
    try {
      const validated = voucherSchema.parse(formData);
      createVoucherMutation.mutate(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error("Validasi Gagal", {
          description: firstError ? firstError.message : "Data tidak valid",
        });
      }
    }
  };

  const handleSubmitEdit = () => {
    if (!selectedVoucher) return;
    
    try {
      const validated = voucherSchema.parse(formData);
      updateVoucherMutation.mutate({
        id: selectedVoucher._id,
        ...validated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error("Validasi Gagal", {
          description: firstError ? firstError.message : "Data tidak valid",
        });
      }
    }
  };

  const handleToggleStatus = (voucher: IVoucher) => {
    toggleStatusMutation.mutate({ id: voucher._id });
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Ticket className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Kelola Voucher</h1>
        </div>
        <p className="text-gray-600">
          Atur voucher diskon dan promo untuk pelanggan
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Total Voucher</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {statsData?.totalVouchers || 0}
          </h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Voucher Aktif</p>
          <h3 className="text-2xl font-bold text-green-600">
            {statsData?.activeVouchers || 0}
          </h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Tidak Aktif</p>
          <h3 className="text-2xl font-bold text-gray-600">
            {statsData?.inactiveVouchers || 0}
          </h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Kadaluarsa</p>
          <h3 className="text-2xl font-bold text-red-600">
            {statsData?.expiredVouchers || 0}
          </h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Total Terpakai</p>
          <h3 className="text-2xl font-bold text-blue-600">
            {statsData?.totalUsage || 0}
          </h3>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari kode atau nama voucher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={(value: string) => setFilterStatus(value as typeof filterStatus)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
              <SelectItem value="expired">Kadaluarsa</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={filterType} onValueChange={(value: string) => setFilterType(value as typeof filterType)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="percentage">Persentase</SelectItem>
              <SelectItem value="fixed">Nominal</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Button - Admin Only */}
          {isAdmin && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Voucher
            </Button>
          )}
        </div>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Voucher</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead>Min. Pembelian</TableHead>
              <TableHead>Penggunaan</TableHead>
              <TableHead>Berlaku</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingVouchers ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="ml-3 text-gray-600">Memuat data voucher...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : vouchersData?.vouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-gray-500">
                    <Ticket className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada voucher ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              (vouchersData?.vouchers as IVoucher[] | undefined)?.map((voucher) => {
                const status = (() => {
                  if (!voucher.isActive) return "inactive";
                  const now = new Date().toISOString();
                  if (voucher.endDate < now) return "expired";
                  if (voucher.startDate > now) return "inactive";
                  return "active";
                })() as "active" | "inactive" | "expired";
                
                return (
                <TableRow key={voucher._id}>
                  <TableCell>
                    <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono">
                      {voucher.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">
                        {voucher.name}
                      </p>
                      {voucher.description && (
                        <p className="text-xs text-gray-500">
                          {voucher.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {voucher.type === "percentage" ? "Persentase" : "Nominal"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {voucher.type === "percentage" ? (
                      <span className="font-semibold text-green-600">
                        {voucher.value}%
                      </span>
                    ) : (
                      <span className="font-semibold text-green-600">
                        {formatCurrency(voucher.value)}
                      </span>
                    )}
                    {voucher.maxDiscount && (
                      <p className="text-xs text-gray-500">
                        Max: {formatCurrency(voucher.maxDiscount)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCurrency(voucher.minPurchase)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {voucher.usedCount}/{voucher.usageLimit}
                      </p>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              (voucher.usedCount / voucher.usageLimit) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>{formatDate(voucher.startDate)}</p>
                      <p className="text-gray-500">
                        s/d {formatDate(voucher.endDate)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(voucher)}
                            disabled={toggleStatusMutation.isPending}
                            title={voucher.isActive ? "Nonaktifkan voucher" : "Aktifkan voucher"}
                          >
                            <Power
                              className={`h-4 w-4 ${
                                voucher.isActive ? "text-green-600" : "text-gray-400"
                              }`}
                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(voucher)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Hanya Admin</span>
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, pagination.total)} dari {pagination.total} voucher
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-600">
              Halaman {currentPage} dari {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Add Voucher Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tambah Voucher Baru</DialogTitle>
            <DialogDescription>
              Buat voucher diskon baru untuk pelanggan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Kode Voucher */}
            <div className="space-y-2">
              <Label>Kode Voucher *</Label>
              <Input
                placeholder="Contoh: WELCOME50"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
              <p className="text-xs text-gray-500">
                Gunakan huruf kapital, tanpa spasi
              </p>
            </div>

            {/* Nama Voucher */}
            <div className="space-y-2">
              <Label>Nama Voucher *</Label>
              <Input
                placeholder="Contoh: Voucher Selamat Datang"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Tipe & Nilai */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipe Diskon *</Label>
                <Select value={formData.type} onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                    <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nilai Diskon *</Label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.value || ""}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Min Purchase & Max Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min. Pembelian (Rp) *</Label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={formData.minPurchase || ""}
                  onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max. Diskon (Rp)</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.maxDiscount || ""}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                  disabled={formData.type === "fixed"}
                />
                <p className="text-xs text-gray-500">Opsional, untuk % diskon</p>
              </div>
            </div>

            {/* Usage Limit */}
            <div className="space-y-2">
              <Label>Batas Penggunaan *</Label>
              <Input
                type="number"
                placeholder="100"
                value={formData.usageLimit || ""}
                onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
              />
              <p className="text-xs text-gray-500">
                Jumlah maksimal voucher dapat digunakan
              </p>
            </div>

            {/* Valid Period */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Berlaku Dari *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Berlaku Hingga *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Deskripsi *</Label>
              <Textarea
                rows={3}
                placeholder="Deskripsi voucher (minimal 10 karakter)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitAdd}
              disabled={createVoucherMutation.isPending}
            >
              {createVoucherMutation.isPending ? "Menyimpan..." : "Simpan Voucher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Similar to Add Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) {
          setSelectedVoucher(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Voucher</DialogTitle>
            <DialogDescription>
              Ubah detail voucher: {selectedVoucher?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Form fields populated with formData from selectedVoucher */}
            <div className="space-y-2">
              <Label>Kode Voucher *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-2">
              <Label>Nama Voucher *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipe Diskon *</Label>
                <Select value={formData.type} onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                    <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nilai Diskon *</Label>
                <Input
                  type="number"
                  value={formData.value || ""}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min. Pembelian (Rp) *</Label>
                <Input
                  type="number"
                  value={formData.minPurchase || ""}
                  onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max. Diskon (Rp)</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount || ""}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                  disabled={formData.type === "fixed"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Batas Penggunaan *</Label>
              <Input
                type="number"
                value={formData.usageLimit || ""}
                onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Berlaku Dari *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Berlaku Hingga *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={updateVoucherMutation.isPending}
            >
              {updateVoucherMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </AdminLayout>
  );
}
