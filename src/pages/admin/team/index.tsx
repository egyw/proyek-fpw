import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/layouts/AdminLayout";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
import { UserCog, Plus, Edit, Power, Search, UserCheck, Shield, Users } from "lucide-react";
import { toast } from "sonner";

interface StaffUser {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "staff";
  isActive: boolean;
  lastLogin: string;
}

interface StaffFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: "admin" | "staff";
}

interface EditStaffFormData {
  fullName: string;
  email: string;
  role: "admin" | "staff";
}

export default function StaffManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "staff">("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
  });
  const [editFormData, setEditFormData] = useState<EditStaffFormData>({
    fullName: "",
    email: "",
    role: "staff",
  });

  // Queries
  const {
    data: staffList,
    isLoading,
    refetch,
  } = trpc.users.getAllStaff.useQuery(undefined, {
    enabled: isAdmin,
  });

  // Mutations
  const createStaffMutation = trpc.users.createStaff.useMutation({
    onSuccess: () => {
      toast.success("Staff Berhasil Ditambahkan!", {
        description: "Akun staff baru telah berhasil dibuat.",
      });
      setShowAddDialog(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "staff",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Gagal Menambahkan Staff", {
        description: error.message,
      });
    },
  });

  const updateStaffMutation = trpc.users.updateStaff.useMutation({
    onSuccess: () => {
      toast.success("Staff Berhasil Diperbarui!", {
        description: "Data staff telah berhasil diperbarui.",
      });
      setShowEditDialog(false);
      setSelectedStaff(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Gagal Memperbarui Staff", {
        description: error.message,
      });
    },
  });

  const toggleStaffStatusMutation = trpc.users.toggleStaffStatus.useMutation({
    onSuccess: (data) => {
      const statusText = data.isActive ? "diaktifkan" : "dinonaktifkan";
      toast.success(`Staff Berhasil ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}!`, {
        description: `Akun staff telah ${statusText}.`,
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Gagal Mengubah Status", {
        description: error.message,
      });
    },
  });

  // Loading state while checking auth
  if (status === "loading") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Card className="p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCog className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 mb-4">
              Anda tidak memiliki izin untuk mengakses halaman ini. Halaman manajemen staff hanya dapat diakses oleh admin.
            </p>
            <Button onClick={() => router.push("/admin")} className="w-full">
              Kembali ke Dashboard
            </Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  // Handlers
  const handleAddStaff = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error("Data Tidak Lengkap", {
        description: "Mohon lengkapi semua field yang diperlukan.",
      });
      return;
    }

    // Validate phone format (starts with 08 and 10-13 digits)
    const phoneRegex = /^08\d{8,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Format Nomor Telepon Salah", {
        description: "Nomor telepon harus dimulai dengan 08 dan 10-13 digit.",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Format Email Salah", {
        description: "Mohon masukkan email yang valid.",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password Terlalu Pendek", {
        description: "Password minimal 8 karakter.",
      });
      return;
    }

    await createStaffMutation.mutateAsync(formData);
  };

  const handleEditStaff = async () => {
    if (!selectedStaff || !editFormData.fullName || !editFormData.email) {
      toast.error("Data Tidak Lengkap", {
        description: "Mohon lengkapi semua field yang diperlukan.",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      toast.error("Format Email Tidak Valid", {
        description: "Mohon masukkan alamat email yang valid.",
      });
      return;
    }

    await updateStaffMutation.mutateAsync({
      userId: selectedStaff._id,
      ...editFormData,
    });
  };

  const handleToggleStatus = async (userId: string) => {
    await toggleStaffStatusMutation.mutateAsync({ userId });
  };

  const openEditDialog = (staff: StaffUser) => {
    setSelectedStaff(staff);
    setEditFormData({
      fullName: staff.fullName,
      email: staff.email,
      role: staff.role,
    });
    setShowEditDialog(true);
  };

  // Filter staff by search query and role
  const filteredStaff = (staffList as StaffUser[] | undefined)?.filter((staff) => {
    const matchesSearch =
      staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate stats
  const totalStaff = (staffList as StaffUser[] | undefined)?.length || 0;
  const activeStaff = (staffList as StaffUser[] | undefined)?.filter(s => s.isActive).length || 0;
  const totalAdmins = (staffList as StaffUser[] | undefined)?.filter(s => s.role === 'admin').length || 0;
  const totalStaffRole = (staffList as StaffUser[] | undefined)?.filter(s => s.role === 'staff').length || 0;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Team</h1>
        <p className="text-gray-600 mt-1">
          Kelola akun admin dan staff sistem
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Akun</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalStaff}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <UserCog className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Akun Aktif</p>
              <h3 className="text-2xl font-bold text-green-600">{activeStaff}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Admin</p>
              <h3 className="text-2xl font-bold text-purple-600">{totalAdmins}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Staff</p>
              <h3 className="text-2xl font-bold text-orange-600">{totalStaffRole}</h3>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Button */}
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Akun
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data staff...</p>
            </div>
          ) : filteredStaff && filteredStaff.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff?.map((staff) => (
                  <TableRow key={staff._id}>
                    <TableCell className="font-medium">
                      {staff.fullName}
                    </TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          staff.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {staff.role === "admin" ? "Admin" : "Staff"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          staff.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {staff.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(staff.lastLogin)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(staff._id)}
                          disabled={toggleStaffStatusMutation.isPending}
                          title={staff.isActive ? "Nonaktifkan akun" : "Aktifkan akun"}
                        >
                          <Power
                            className={`h-4 w-4 ${
                              staff.isActive ? "text-green-600" : "text-gray-400"
                            }`}
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(staff)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-900 font-semibold mb-1">
                {searchQuery ? "Staff tidak ditemukan" : "Belum ada staff"}
              </p>
              <p className="text-gray-600 text-sm">
                {searchQuery
                  ? "Coba kata kunci pencarian yang berbeda"
                  : "Klik tombol 'Tambah Akun' untuk membuat akun baru"}
              </p>
            </div>
          )}
        </Card>

        {/* Add Staff Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Akun Baru</DialogTitle>
              <DialogDescription>
                Buat akun staff atau admin baru untuk sistem
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-fullName">Nama Lengkap *</Label>
                <Input
                  id="add-fullName"
                  type="text"
                  placeholder="Contoh: John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-email">Email *</Label>
                <Input
                  id="add-email"
                  type="text"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-phone">Nomor Telepon *</Label>
                <Input
                  id="add-phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <p className="text-xs text-gray-600">
                  Format: 08xxxxxxxxxx (10-13 digit)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-password">Password *</Label>
                <Input
                  id="add-password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <p className="text-xs text-gray-600">
                  Password minimal 8 karakter
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "staff") =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger id="add-role">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600">
                  Staff: Akses terbatas | Admin: Akses penuh
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={createStaffMutation.isPending}
              >
                Batal
              </Button>
              <Button
                onClick={handleAddStaff}
                disabled={createStaffMutation.isPending}
              >
                {createStaffMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Akun
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Staff Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Akun</DialogTitle>
              <DialogDescription>
                Perbarui informasi akun (password tidak dapat diubah di sini)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Nama Lengkap *</Label>
                <Input
                  id="edit-fullName"
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, fullName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="text"
                  placeholder="nama@email.com"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value: "admin" | "staff") =>
                    setEditFormData({ ...editFormData, role: value })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {selectedStaff?._id === session?.user?.id && (
                  <p className="text-xs text-amber-600">
                    Anda tidak dapat mengubah role Anda sendiri
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setSelectedStaff(null);
                }}
                disabled={updateStaffMutation.isPending}
              >
                Batal
              </Button>
              <Button
                onClick={handleEditStaff}
                disabled={updateStaffMutation.isPending}
              >
                {updateStaffMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </AdminLayout>
  );
}
