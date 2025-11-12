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
import { trpc } from "@/utils/trpc";

export default function StockMovementsPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date();
    let dateFrom: string | undefined;

    switch (dateFilter) {
      case "today":
        dateFrom = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        break;
      case "week":
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFrom = weekAgo.toISOString();
        break;
      case "month":
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFrom = monthAgo.toISOString();
        break;
      default:
        dateFrom = undefined;
    }

    return { dateFrom };
  };

  // Get stock movements from database
  const { data: movementsData, isLoading } = trpc.stockMovements.getAll.useQuery({
    movementType: filterType === "all" ? undefined : (filterType as "in" | "out"),
    productCode: searchQuery || undefined,
    dateFrom: getDateRange().dateFrom,
    limit: 100,
    offset: 0,
  });

  // Get summary statistics
  const { data: summaryData } = trpc.stockMovements.getSummary.useQuery({
    dateFrom: getDateRange().dateFrom,
  });

  const movements = movementsData?.movements || [];
  const totalIn = summaryData?.totalInQuantity || 0;
  const totalOut = summaryData?.totalOutQuantity || 0;

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Map reason to Indonesian label
  const getSourceLabel = (referenceType: string, reason: string) => {
    switch (referenceType) {
      case "order":
        return "Penjualan";
      case "return":
        return "Pembatalan Pesanan";
      case "adjustment":
        return "Penyesuaian Manual";
      case "initial":
        return "Stok Awal";
      default:
        return reason;
    }
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
              <TableHead>Performed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span>Memuat data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Tidak ada data pergerakan stok
                </TableCell>
              </TableRow>
            ) : (
              movements.map((movement) => (
                <TableRow key={(movement._id as unknown as import('mongoose').Types.ObjectId).toString()}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{formatDate(movement.createdAt)}</p>
                        <p className="text-sm text-gray-600">{formatTime(movement.createdAt)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{movement.productName}</p>
                      <p className="text-sm text-gray-600">{movement.productCode}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        movement.movementType === "in"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {movement.movementType === "in" ? (
                        <ArrowDownCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowUpCircle className="h-3 w-3 mr-1" />
                      )}
                      {movement.movementType === "in" ? "IN" : "OUT"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span
                      className={
                        movement.movementType === "in" ? "text-green-600" : "text-red-600"
                      }
                    >
                      {movement.movementType === "in" ? "+" : "-"}
                      {formatNumber(movement.quantity)} {movement.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {formatNumber(movement.previousStock)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(movement.newStock)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getSourceLabel(movement.referenceType, movement.reason)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {movement.referenceId}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-600 truncate">
                      {movement.performedByName}
                    </p>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
