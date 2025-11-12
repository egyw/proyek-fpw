import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Package, AlertCircle, Download, FileText, Tag } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

interface SlowMovingProduct {
  id: string;
  productName: string;
  category: string;
  currentStock: number;
  unit: string;
  totalSold: number;
  lastSoldDate: string | null;
  daysNotSold: number;
  stockValue: number;
  price: number;
  status: 'dead' | 'very_slow' | 'slow' | null;
}

export default function SlowMovingReportContent() {
  const [period, setPeriod] = useState<'30days' | '60days' | '90days' | '6months'>('90days');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'dead' | 'very_slow' | 'slow'>('all');

  // tRPC Query
  const { data: reportData, isLoading, error } = trpc.reports.getSlowMoving.useQuery({
    period,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'dead':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Stok Mati</Badge>;
      case 'very_slow':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Sangat Lambat</Badge>;
      case 'slow':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Lambat</Badge>;
      default:
        return <Badge>-</Badge>;
    }
  };

  // Get products from query
  const products: SlowMovingProduct[] = reportData?.products || [];
  const filteredData = products;

  // Calculate stats from query result
  const deadStockCount = products.filter((p: SlowMovingProduct) => p.status === 'dead').length;
  const totalProducts = products.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Laporan Stok Kurang Laku</h2>
        <p className="text-gray-600 mt-1">
          Identifikasi produk dengan penjualan rendah untuk program diskon atau cuci gudang
        </p>
      </div>

      {/* Alert Banner */}
      {deadStockCount > 0 && (
        <Card className="bg-red-50 border-red-200">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">
                  STOK MATI TERDETEKSI: {deadStockCount} Produk tidak terjual 90+ hari!
                </p>
                <p className="text-sm text-red-800 mt-1">
                  Pertimbangkan program diskon besar-besaran atau cuci gudang untuk mengosongkan ruang dan meningkatkan cash flow.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Produk Lambat</p>
              <h3 className="text-2xl font-bold text-orange-600">{totalProducts}</h3>
              <p className="text-xs text-gray-500 mt-1">Perlu perhatian</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Stok Mati (90+ hari)</p>
              <h3 className="text-2xl font-bold text-red-600">{deadStockCount}</h3>
              <p className="text-xs text-gray-500 mt-1">Prioritas tinggi</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Periode Analisa</label>
            <Select 
              value={period} 
              onValueChange={(value) => setPeriod(value as '30days' | '60days' | '90days' | '6months')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                <SelectItem value="60days">60 Hari Terakhir</SelectItem>
                <SelectItem value="90days">90 Hari Terakhir</SelectItem>
                <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Kategori</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="Paku">Paku</SelectItem>
                <SelectItem value="Baut">Baut</SelectItem>
                <SelectItem value="Cat">Cat</SelectItem>
                <SelectItem value="Triplek">Triplek</SelectItem>
                <SelectItem value="Kawat">Kawat</SelectItem>
                <SelectItem value="Aspal">Aspal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Status</label>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as 'all' | 'dead' | 'very_slow' | 'slow')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="dead">Stok Mati</SelectItem>
                <SelectItem value="very_slow">Sangat Lambat</SelectItem>
                <SelectItem value="slow">Lambat</SelectItem>
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

      {/* Slow Moving Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daftar Produk Kurang Laku</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Stok Tersisa</TableHead>
                <TableHead className="text-right">Terjual</TableHead>
                <TableHead className="text-center">Tidak Terjual</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Nilai Stok</TableHead>
                <TableHead>Terakhir Terjual</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    Tidak ada produk slow-moving dalam periode ini
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((product: SlowMovingProduct) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <p className="font-medium text-gray-900">{product.productName}</p>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(product.status || '')}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-gray-900">
                        {product.currentStock}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">{product.unit}</span>
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {product.totalSold} {product.unit}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold ${
                        product.daysNotSold >= 90 ? 'text-red-600' :
                        product.daysNotSold >= 60 ? 'text-orange-600' :
                        'text-yellow-600'
                      }`}>
                        {product.daysNotSold} hari
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-blue-600">
                      {formatCurrency(product.stockValue)}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {product.lastSoldDate || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                        <Tag className="h-3 w-3 mr-1" />
                        Diskon
                      </Button>
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
