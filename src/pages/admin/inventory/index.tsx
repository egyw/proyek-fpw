import { useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Search, ArrowUpCircle, ArrowDownCircle, Package, Calendar } from "lucide-react";
import { trpc } from "@/utils/trpc";

export default function StockMovementsPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Calculate date range based on filter (memoized to prevent infinite loop)
  const dateFrom = useMemo(() => {
    switch (dateFilter) {
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString();
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo.toISOString();
      case "month":
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return monthAgo.toISOString();
      default:
        return undefined;
    }
  }, [dateFilter]);

  // Get stock movements from database
  const { data: movementsData, isLoading } = trpc.stockMovements.getAll.useQuery({
    movementType: filterType === "all" ? undefined : (filterType as "in" | "out"),
    productCode: searchQuery || undefined,
    dateFrom,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });

  // Get summary statistics
  const { data: summaryData } = trpc.stockMovements.getSummary.useQuery({
    dateFrom,
  });

  const movements = movementsData?.movements || [];
  const totalIn = summaryData?.totalInQuantity || 0;
  const totalOut = summaryData?.totalOutQuantity || 0;

  // Calculate pagination metadata
  const totalItems = movementsData?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

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
              <TableHead className="w-[140px]">Tanggal & Waktu</TableHead>
              <TableHead className="w-[200px]">Produk</TableHead>
              <TableHead className="text-right w-[120px]">Stok Awal</TableHead>
              <TableHead className="w-[280px] pl-6">Keterangan</TableHead>
              <TableHead className="text-right w-[140px]">Qty</TableHead>
              <TableHead className="text-right w-[110px]">Stok Akhir</TableHead>
              <TableHead className="w-[180px]">Referensi</TableHead>
              <TableHead className="w-[140px]">Performed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span>Memuat data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
                  <TableCell className="text-right text-gray-600">
                    {formatNumber(movement.previousStock)}
                  </TableCell>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          movement.movementType === "in"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 shrink-0"
                            : "bg-red-100 text-red-800 hover:bg-red-100 shrink-0"
                        }
                      >
                        {movement.movementType === "in" ? (
                          <ArrowDownCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowUpCircle className="h-3 w-3 mr-1" />
                        )}
                        {movement.movementType === "in" ? "IN" : "OUT"}
                      </Badge>
                      <span className="text-sm text-gray-700 whitespace-nowrap">
                        {getSourceLabel(movement.referenceType, movement.reason)}
                      </span>
                    </div>
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
                  <TableCell className="text-right font-medium">
                    {formatNumber(movement.newStock)}
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

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan{" "}
            <span className="font-medium">
              {totalItems > 0
                ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                    currentPage * itemsPerPage,
                    totalItems
                  )}`
                : "0"}
            </span>{" "}
            dari <span className="font-medium">{totalItems}</span> pergerakan stok
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrevPage}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Sebelumnya
            </Button>

            {/* Page numbers */}
            {totalPages > 0 &&
              (() => {
                const pages: (number | string)[] = [];

                if (totalPages <= 7) {
                  // Show all pages if 7 or less
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Always show first page
                  pages.push(1);

                  if (currentPage > 3) {
                    pages.push("...");
                  }

                  // Show pages around current
                  for (
                    let i = Math.max(2, currentPage - 1);
                    i <= Math.min(totalPages - 1, currentPage + 1);
                    i++
                  ) {
                    pages.push(i);
                  }

                  if (currentPage < totalPages - 2) {
                    pages.push("...");
                  }

                  // Always show last page
                  pages.push(totalPages);
                }

                return pages.map((page, idx) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 py-1 text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <Button
                      key={page}
                      variant="outline"
                      size="sm"
                      className={
                        currentPage === page ? "bg-primary text-white" : ""
                      }
                      onClick={() => setCurrentPage(page as number)}
                    >
                      {page}
                    </Button>
                  );
                });
              })()}

            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
