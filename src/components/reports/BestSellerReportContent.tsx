import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, DollarSign, Download, FileText } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

interface BestSellerProduct {
  productId: string;
  productName: string;
  category: string;
  totalQuantity: number;
  totalValue: number;
  averagePrice: number;
  salesCount: number;
}

export default function BestSellerReportContent() {
  const [period, setPeriod] = useState('30days');
  const [sortBy, setSortBy] = useState<'quantity' | 'value'>('quantity');

  // Calculate date range based on period - Memoized to prevent infinite loop
  const { startDate, endDate } = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [period]); // Only recalculate when period changes

  // tRPC Query
  const { data: reportData, isLoading, error } = trpc.reports.getBestSellers.useQuery({
    startDate,
    endDate,
    sortBy,
    limit: 20,
  });

  // Show error toast if query fails
  if (error) {
    toast.error('Gagal memuat data', {
      description: error.message,
    });
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get products array from query result
  const products: BestSellerProduct[] = reportData?.products || [];
  const totalQuantitySold = products.reduce((sum: number, p: BestSellerProduct) => sum + p.totalQuantity, 0);
  const totalRevenue = products.reduce((sum: number, p: BestSellerProduct) => sum + p.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Laporan Produk Terlaris</h2>
        <p className="text-gray-600 mt-1">
          Menampilkan produk dengan penjualan tertinggi berdasarkan kuantitas atau nilai penjualan
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Unit Terjual</p>
              <h3 className="text-2xl font-bold text-blue-600">
                {totalQuantitySold.toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Semua kategori</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pendapatan</p>
              <h3 className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue).replace('Rp', 'Rp ')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Dari produk terlaris</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Periode</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                <SelectItem value="90days">90 Hari Terakhir</SelectItem>
                <SelectItem value="thisyear">Tahun Ini</SelectItem>
                <SelectItem value="all">Semua Waktu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Urutkan Berdasarkan</label>
            <Select value={sortBy} onValueChange={(value: 'quantity' | 'value') => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantity">Kuantitas Terjual</SelectItem>
                <SelectItem value="value">Nilai Penjualan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Best Sellers Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daftar Produk Terlaris</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Qty Terjual</TableHead>
                <TableHead className="text-right">Harga Rata-rata</TableHead>
                <TableHead className="text-right">Total Pendapatan</TableHead>
                <TableHead className="text-center">Jumlah Order</TableHead>
                <TableHead>Terakhir Terjual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Tidak ada data produk terlaris
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: BestSellerProduct, index: number) => (
                <TableRow key={product.productId || index}>
                  <TableCell className="font-medium">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : index === 1
                          ? 'bg-gray-100 text-gray-800'
                          : index === 2
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{product.productName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-gray-900">
                      {product.totalQuantity.toLocaleString('id-ID')}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">unit</span>
                  </TableCell>
                  <TableCell className="text-right text-gray-700">
                    {formatCurrency(product.averagePrice)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatCurrency(product.totalValue)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                      {product.salesCount} order
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    -
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

    </div>
  );
}
