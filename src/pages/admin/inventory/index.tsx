import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpCircle, ArrowDownCircle, Package, Calendar } from "lucide-react";

// TODO: Replace with tRPC query
// Expected API: trpc.inventory.getStockMovements.useQuery()
// Input: { type?: 'in' | 'out' | 'all', startDate?: string, endDate?: string, search?: string }
// Output: StockMovement[]

interface StockMovement {
  id: string;
  date: string;
  time: string;
  productId: string;
  productName: string;
  sku: string;
  type: "in" | "out";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  source: string; // e.g., "Penjualan", "Pembelian", "Retur Customer", "Retur Supplier"
  referenceId: string; // e.g., Order ID, PO ID
  notes?: string;
  performedBy: string;
}

const dummyStockMovements: StockMovement[] = [
  {
    id: "1",
    date: "2025-01-10",
    time: "14:30",
    productId: "prod1",
    productName: "Semen Gresik 50kg",
    sku: "SGR-50",
    type: "in",
    quantity: 100,
    stockBefore: 150,
    stockAfter: 250,
    source: "Pembelian",
    referenceId: "PO-2025-001",
    notes: "Pembelian rutin dari supplier",
    performedBy: "Admin",
  },
  {
    id: "2",
    date: "2025-01-10",
    time: "15:45",
    productId: "prod2",
    productName: "Cat Avian 5L",
    sku: "AVI-5L",
    type: "out",
    quantity: 10,
    stockBefore: 55,
    stockAfter: 45,
    source: "Penjualan",
    referenceId: "ORD-2025-123",
    notes: "Order dari customer A",
    performedBy: "System",
  },
  {
    id: "3",
    date: "2025-01-09",
    time: "10:20",
    productId: "prod3",
    productName: "Besi Beton 10mm",
    sku: "BES-10",
    type: "out",
    quantity: 50,
    stockBefore: 300,
    stockAfter: 250,
    source: "Penjualan",
    referenceId: "ORD-2025-120",
    notes: "Order proyek konstruksi",
    performedBy: "System",
  },
  {
    id: "4",
    date: "2025-01-09",
    time: "09:15",
    productId: "prod4",
    productName: "Pipa PVC 3 inch",
    sku: "PVC-3",
    type: "in",
    quantity: 200,
    stockBefore: 80,
    stockAfter: 280,
    source: "Pembelian",
    referenceId: "PO-2025-002",
    notes: "Restok pipa PVC",
    performedBy: "Admin",
  },
  {
    id: "5",
    date: "2025-01-08",
    time: "16:00",
    productId: "prod2",
    productName: "Cat Avian 5L",
    sku: "AVI-5L",
    type: "in",
    quantity: 5,
    stockBefore: 50,
    stockAfter: 55,
    source: "Retur Customer",
    referenceId: "RET-2025-005",
    notes: "Retur barang tidak sesuai",
    performedBy: "Admin",
  },
  {
    id: "6",
    date: "2025-01-08",
    time: "11:30",
    productId: "prod5",
    productName: "Keramik Platinum 40x40",
    sku: "PLT-40",
    type: "out",
    quantity: 30,
    stockBefore: 150,
    stockAfter: 120,
    source: "Penjualan",
    referenceId: "ORD-2025-118",
    notes: "Order renovasi rumah",
    performedBy: "System",
  },
  {
    id: "7",
    date: "2025-01-07",
    time: "13:45",
    productId: "prod1",
    productName: "Semen Gresik 50kg",
    sku: "SGR-50",
    type: "out",
    quantity: 20,
    stockBefore: 170,
    stockAfter: 150,
    source: "Penjualan",
    referenceId: "ORD-2025-115",
    notes: "Order toko bangunan",
    performedBy: "System",
  },
  {
    id: "8",
    date: "2025-01-07",
    time: "10:00",
    productId: "prod6",
    productName: "Genteng Metal",
    sku: "GEN-MTL",
    type: "in",
    quantity: 150,
    stockBefore: 50,
    stockAfter: 200,
    source: "Pembelian",
    referenceId: "PO-2025-003",
    notes: "Stok baru genteng metal",
    performedBy: "Admin",
  },
];

export default function StockMovementsPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Filter data
  const filteredMovements = dummyStockMovements.filter((movement) => {
    const matchType = filterType === "all" || movement.type === filterType;
    const matchSearch =
      movement.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.referenceId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  // Calculate stats
  const totalIn = dummyStockMovements
    .filter((m) => m.type === "in")
    .reduce((sum, m) => sum + m.quantity, 0);
  const totalOut = dummyStockMovements
    .filter((m) => m.type === "out")
    .reduce((sum, m) => sum + m.quantity, 0);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Stock Movements</h1>
        <p className="text-gray-600 mt-2">
          Riwayat pergerakan stok masuk dan keluar secara otomatis
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stock IN</p>
              <h3 className="text-2xl font-bold text-green-600 mt-2">
                +{formatNumber(totalIn)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Items masuk</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <ArrowDownCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stock OUT</p>
              <h3 className="text-2xl font-bold text-red-600 mt-2">
                -{formatNumber(totalOut)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Items keluar</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <ArrowUpCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Movement</p>
              <h3 className="text-2xl font-bold text-primary mt-2">
                {totalIn - totalOut > 0 ? "+" : ""}
                {formatNumber(totalIn - totalOut)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Selisih bersih</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari produk, SKU, atau reference ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tipe Movement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="in">Stock IN</SelectItem>
              <SelectItem value="out">Stock OUT</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Periode</SelectItem>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal & Waktu</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Stock Before</TableHead>
              <TableHead className="text-right">Stock After</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Tidak ada data pergerakan stok
                </TableCell>
              </TableRow>
            ) : (
              filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{movement.date}</p>
                        <p className="text-sm text-gray-600">{movement.time}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{movement.productName}</p>
                      <p className="text-sm text-gray-600">{movement.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        movement.type === "in"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {movement.type === "in" ? (
                        <ArrowDownCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowUpCircle className="h-3 w-3 mr-1" />
                      )}
                      {movement.type === "in" ? "IN" : "OUT"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span
                      className={
                        movement.type === "in" ? "text-green-600" : "text-red-600"
                      }
                    >
                      {movement.type === "in" ? "+" : "-"}
                      {formatNumber(movement.quantity)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {formatNumber(movement.stockBefore)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(movement.stockAfter)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{movement.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {movement.referenceId}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-600 truncate">
                      {movement.notes || "-"}
                    </p>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Info */}
      <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Package className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Stock movements tercatat otomatis</p>
            <p>
              Data pergerakan stok direkam secara otomatis dari transaksi penjualan,
              pembelian, retur customer, dan retur supplier. Tidak perlu input manual.
            </p>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
