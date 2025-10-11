import { useState } from "react";
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
import { Search, Eye, UserCheck, UserX, ShoppingBag, Calendar } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredDate: string; // ISO date
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  lastOrderDate?: string;
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailDialog, setDetailDialog] = useState(false);

  // TODO: Replace with tRPC query
  // Expected API: trpc.customers.getAll.useQuery()
  // Input: { search?: string, status?: string }
  // Output: Customer[]
  const dummyCustomers: Customer[] = [
    {
      id: "1",
      name: "Ahmad Fauzi",
      email: "ahmad.fauzi@email.com",
      phone: "081234567890",
      registeredDate: "2024-01-15T10:30:00Z",
      totalOrders: 15,
      totalSpent: 12500000,
      status: "active",
      address: {
        street: "Jl. Merdeka No. 123",
        city: "Jakarta Pusat",
        province: "DKI Jakarta",
        postalCode: "10110",
      },
      lastOrderDate: "2025-04-05T14:20:00Z",
    },
    {
      id: "2",
      name: "Siti Nurhaliza",
      email: "siti.nur@email.com",
      phone: "082345678901",
      registeredDate: "2024-02-20T09:15:00Z",
      totalOrders: 8,
      totalSpent: 6750000,
      status: "active",
      address: {
        street: "Jl. Sudirman No. 45",
        city: "Bandung",
        province: "Jawa Barat",
        postalCode: "40123",
      },
      lastOrderDate: "2025-03-28T11:45:00Z",
    },
    {
      id: "3",
      name: "Budi Santoso",
      email: "budi.santoso@email.com",
      phone: "083456789012",
      registeredDate: "2024-03-10T14:00:00Z",
      totalOrders: 22,
      totalSpent: 18900000,
      status: "active",
      address: {
        street: "Jl. Diponegoro No. 67",
        city: "Surabaya",
        province: "Jawa Timur",
        postalCode: "60241",
      },
      lastOrderDate: "2025-04-08T16:30:00Z",
    },
    {
      id: "4",
      name: "Dewi Lestari",
      email: "dewi.lestari@email.com",
      phone: "084567890123",
      registeredDate: "2024-05-12T11:20:00Z",
      totalOrders: 5,
      totalSpent: 3200000,
      status: "active",
      address: {
        street: "Jl. Gatot Subroto No. 89",
        city: "Semarang",
        province: "Jawa Tengah",
        postalCode: "50132",
      },
      lastOrderDate: "2025-03-15T10:00:00Z",
    },
    {
      id: "5",
      name: "Eko Prasetyo",
      email: "eko.prasetyo@email.com",
      phone: "085678901234",
      registeredDate: "2023-11-08T08:45:00Z",
      totalOrders: 2,
      totalSpent: 850000,
      status: "inactive",
      address: {
        street: "Jl. Ahmad Yani No. 12",
        city: "Yogyakarta",
        province: "DI Yogyakarta",
        postalCode: "55161",
      },
      lastOrderDate: "2024-06-20T13:30:00Z",
    },
    {
      id: "6",
      name: "Rina Wijaya",
      email: "rina.wijaya@email.com",
      phone: "086789012345",
      registeredDate: "2024-06-25T15:10:00Z",
      totalOrders: 0,
      totalSpent: 0,
      status: "inactive",
      address: {
        street: "Jl. Veteran No. 34",
        city: "Malang",
        province: "Jawa Timur",
        postalCode: "65119",
      },
    },
  ];

  // Filter customers based on search and status
  const filteredCustomers = dummyCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalCustomers = dummyCustomers.length;
  const activeCustomers = dummyCustomers.filter((c) => c.status === "active").length;
  const inactiveCustomers = dummyCustomers.filter((c) => c.status === "inactive").length;
  const totalRevenue = dummyCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalRevenue)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Tidak ada data pelanggan yang ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.address.city}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">{customer.email}</p>
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(customer.registeredDate)}
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
                    {customer.status === "active" ? (
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
        <DialogContent className="max-w-2xl">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
                    <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    {selectedCustomer.status === "active" ? (
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

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">
                  Alamat Pengiriman
                </h3>
                <div>
                  <p className="text-gray-900">{selectedCustomer.address.street}</p>
                  <p className="text-gray-900">
                    {selectedCustomer.address.city}, {selectedCustomer.address.province}
                  </p>
                  <p className="text-gray-900">{selectedCustomer.address.postalCode}</p>
                </div>
              </div>

              {/* Order Statistics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">
                  Statistik Pesanan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-600 font-medium">Total Pesanan</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {selectedCustomer.totalOrders}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-600 font-medium">Total Belanja</p>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <p className="text-sm text-purple-600 font-medium">Tgl Registrasi</p>
                    </div>
                    <p className="text-sm font-medium text-purple-900">
                      {formatDate(selectedCustomer.registeredDate)}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      <p className="text-sm text-orange-600 font-medium">Pesanan Terakhir</p>
                    </div>
                    <p className="text-sm font-medium text-orange-900">
                      {selectedCustomer.lastOrderDate
                        ? formatDate(selectedCustomer.lastOrderDate)
                        : "Belum ada pesanan"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setDetailDialog(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
