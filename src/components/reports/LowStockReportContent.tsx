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
import { AlertTriangle, Package, Download, FileText } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

interface LowStockProduct {
  id: string;
  productName: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  price: number;
  priority: 'critical' | 'warning' | 'low';
  lastUpdated: string;
  image: string;
}

export default function LowStockReportContent() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // tRPC Query
  const { data: reportData, isLoading, error } = trpc.reports.getLowStock.useQuery({
    threshold: 20,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    sortBy: 'stock-asc',
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

  const getStatusBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Kritis</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Peringatan</Badge>;
      case 'low':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Rendah</Badge>;
      default:
        return <Badge>-</Badge>;
    }
  };

  // Get products from query
  const products: LowStockProduct[] = reportData?.products || [];
  
  // Filter by status
  const filteredData = products.filter((product: LowStockProduct) => {
    if (statusFilter !== 'all' && product.priority !== statusFilter) return false;
    return true;
  });

  // Calculate stats from query result
  const criticalCount = reportData?.stats?.critical || 0;
  const warningCount = reportData?.stats?.warning || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Laporan Stok Menipis</h2>
        <p className="text-gray-600 mt-1">
          Daftar produk yang stoknya sudah mencapai atau di bawah batas minimum
        </p>
      </div>

      {/* Alert Banner */}
      {criticalCount > 0 && (
        <Card className="bg-red-50 border-red-200">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">
                  PERHATIAN: {criticalCount} Produk dalam Status KRITIS!
                </p>
                <p className="text-sm text-red-800 mt-1">
                  Segera lakukan pemesanan ulang untuk menghindari kehabisan stok dan kehilangan penjualan.
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
              <p className="text-sm text-gray-600 mb-1">Produk Stok Kritis</p>
              <h3 className="text-2xl font-bold text-red-600">{criticalCount}</h3>
              <p className="text-xs text-gray-500 mt-1">Di bawah 50% min. stok</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Produk Stok Rendah</p>
              <h3 className="text-2xl font-bold text-yellow-600">{warningCount}</h3>
              <p className="text-xs text-gray-500 mt-1">50-100% dari min. stok</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Kategori</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="Semen">Semen</SelectItem>
                <SelectItem value="Besi">Besi</SelectItem>
                <SelectItem value="Cat">Cat</SelectItem>
                <SelectItem value="Pipa">Pipa</SelectItem>
                <SelectItem value="Triplek">Triplek</SelectItem>
                <SelectItem value="Kawat">Kawat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Status Stok</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="critical">Kritis</SelectItem>
                <SelectItem value="warning">Peringatan</SelectItem>
                <SelectItem value="low">Rendah</SelectItem>
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

      {/* Low Stock Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daftar Produk Stok Menipis</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Stok Saat Ini</TableHead>
                <TableHead className="text-right">Min. Stok</TableHead>
                <TableHead className="text-center">% Stok</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-center">Estimasi Habis</TableHead>
                <TableHead>Terakhir Restock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Tidak ada produk dengan stok rendah
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((product: LowStockProduct) => {
                  const stockPercentage = Math.round((product.currentStock / product.minStock) * 100);
                  
                  return (
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
                        {getStatusBadge(product.priority)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${
                          product.priority === 'critical' ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {product.currentStock}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">{product.unit}</span>
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {product.minStock} {product.unit}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                product.priority === 'critical'
                                  ? 'bg-red-500'
                                  : product.priority === 'warning'
                                  ? 'bg-yellow-500'
                                  : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {stockPercentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-gray-700">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell className="text-center text-gray-500">
                        -
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        -
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
