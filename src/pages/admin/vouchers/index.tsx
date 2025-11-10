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
import { Plus, Search, Edit, Trash2, Ticket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Voucher {
  id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  status: "active" | "inactive" | "expired";
  description?: string;
}

export default function VouchersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Dummy data voucher
  const [vouchers] = useState<Voucher[]>([
    {
      id: "1",
      code: "WELCOME50",
      name: "Voucher Selamat Datang",
      type: "percentage",
      value: 50,
      minPurchase: 100000,
      maxDiscount: 50000,
      usageLimit: 100,
      usedCount: 45,
      validFrom: "2025-01-01",
      validUntil: "2025-12-31",
      status: "active",
      description: "Diskon 50% untuk pelanggan baru",
    },
    {
      id: "2",
      code: "HEMAT100K",
      name: "Hemat 100 Ribu",
      type: "fixed",
      value: 100000,
      minPurchase: 500000,
      usageLimit: 50,
      usedCount: 30,
      validFrom: "2025-01-01",
      validUntil: "2025-06-30",
      status: "active",
      description: "Potongan langsung Rp 100.000",
    },
    {
      id: "3",
      code: "RAMADAN2025",
      name: "Voucher Ramadan",
      type: "percentage",
      value: 25,
      minPurchase: 200000,
      maxDiscount: 100000,
      usageLimit: 200,
      usedCount: 150,
      validFrom: "2025-03-01",
      validUntil: "2025-04-30",
      status: "expired",
      description: "Diskon spesial bulan Ramadan",
    },
    {
      id: "4",
      code: "BUILDER30",
      name: "Builder Special",
      type: "percentage",
      value: 30,
      minPurchase: 1000000,
      maxDiscount: 300000,
      usageLimit: 20,
      usedCount: 5,
      validFrom: "2025-01-01",
      validUntil: "2025-12-31",
      status: "active",
      description: "Untuk pembelian material bangunan",
    },
    {
      id: "5",
      code: "FLASHSALE",
      name: "Flash Sale",
      type: "percentage",
      value: 40,
      minPurchase: 300000,
      maxDiscount: 150000,
      usageLimit: 50,
      usedCount: 50,
      validFrom: "2025-10-01",
      validUntil: "2025-10-31",
      status: "inactive",
      description: "Flash sale Oktober",
    },
  ]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: "Aktif", className: "bg-green-100 text-green-800" },
      inactive: {
        label: "Tidak Aktif",
        className: "bg-gray-100 text-gray-800",
      },
      expired: { label: "Kadaluarsa", className: "bg-red-100 text-red-800" },
    };
    const variant = variants[status] || variants.active;
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  // Filter vouchers
  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || voucher.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle actions
  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setShowEditDialog(true);
  };

  const handleDelete = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // TODO: Implement tRPC mutation
    toast.success("Voucher Dihapus!", {
      description: `Voucher ${selectedVoucher?.code} berhasil dihapus.`,
    });
    setShowDeleteDialog(false);
    setSelectedVoucher(null);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Total Voucher</p>
          <h3 className="text-2xl font-bold text-gray-900">{vouchers.length}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Voucher Aktif</p>
          <h3 className="text-2xl font-bold text-green-600">
            {vouchers.filter((v) => v.status === "active").length}
          </h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Total Terpakai</p>
          <h3 className="text-2xl font-bold text-blue-600">
            {vouchers.reduce((sum, v) => sum + v.usedCount, 0)}
          </h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Kadaluarsa</p>
          <h3 className="text-2xl font-bold text-red-600">
            {vouchers.filter((v) => v.status === "expired").length}
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
              <SelectItem value="expired">Kadaluarsa</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Button */}
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Voucher
          </Button>
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
            {filteredVouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-gray-500">
                    <Ticket className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada voucher ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
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
                            width: `${
                              (voucher.usedCount / voucher.usageLimit) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>{formatDate(voucher.validFrom)}</p>
                      <p className="text-gray-500">
                        s/d {formatDate(voucher.validUntil)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(voucher)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(voucher)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Voucher Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
              <Input placeholder="Contoh: WELCOME50" />
              <p className="text-xs text-gray-500">
                Gunakan huruf kapital, tanpa spasi
              </p>
            </div>

            {/* Nama Voucher */}
            <div className="space-y-2">
              <Label>Nama Voucher *</Label>
              <Input placeholder="Contoh: Voucher Selamat Datang" />
            </div>

            {/* Tipe & Nilai */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipe Diskon *</Label>
                <Select>
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
                <Input type="number" placeholder="50" />
              </div>
            </div>

            {/* Min Purchase & Max Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min. Pembelian (Rp) *</Label>
                <Input type="number" placeholder="100000" />
              </div>
              <div className="space-y-2">
                <Label>Max. Diskon (Rp)</Label>
                <Input type="number" placeholder="50000" />
                <p className="text-xs text-gray-500">Opsional, untuk % diskon</p>
              </div>
            </div>

            {/* Usage Limit */}
            <div className="space-y-2">
              <Label>Batas Penggunaan *</Label>
              <Input type="number" placeholder="100" />
              <p className="text-xs text-gray-500">
                Jumlah maksimal voucher dapat digunakan
              </p>
            </div>

            {/* Valid Period */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Berlaku Dari *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Berlaku Hingga *</Label>
                <Input type="date" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                rows={3}
                placeholder="Deskripsi voucher (opsional)"
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
              onClick={() => {
                // TODO: Implement tRPC mutation
                toast.success("Voucher Ditambahkan!", {
                  description: "Voucher baru berhasil dibuat.",
                });
                setShowAddDialog(false);
              }}
            >
              Simpan Voucher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Similar to Add Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Voucher</DialogTitle>
            <DialogDescription>
              Ubah detail voucher: {selectedVoucher?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Same form fields as Add Dialog */}
            <p className="text-sm text-gray-500">
              Form edit akan sama dengan form tambah, dengan data ter-populate
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement tRPC mutation
                toast.success("Voucher Diperbarui!", {
                  description: `Voucher ${selectedVoucher?.code} berhasil diperbarui.`,
                });
                setShowEditDialog(false);
              }}
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Voucher?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus voucher{" "}
              <code className="bg-red-50 text-red-700 px-2 py-1 rounded">
                {selectedVoucher?.code}
              </code>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus Voucher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
