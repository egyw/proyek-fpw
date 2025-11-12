import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Layers, TrendingUp, Package, Download, FileText } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

/**
 * Category Sales Report Component
 * 
 * Features:
 * - Optional date range filter
 * - 3 Stats cards (Total Categories, Highest Revenue, Lowest Revenue)
 * - Bar chart by category
 * - Table with columns: Kategori, Revenue, Percentage, Order Count, Products Sold
 * - Sort by revenue
 * 
 * Connected to: trpc.reports.getCategorySales
 */

// Category colors for chart
const CATEGORY_COLORS: Record<string, string> = {
  'Pipa': '#3B82F6',
  'Besi': '#EF4444',
  'Semen': '#10B981',
  'Triplek': '#F59E0B',
  'Tangki Air': '#8B5CF6',
  'Kawat': '#EC4899',
  'Paku': '#14B8A6',
  'Baut': '#F97316',
  'Aspal': '#6366F1',
};

export default function CategorySalesReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // tRPC Query with optional date filter
  const { data: reportData, isLoading, error } = trpc.reports.getCategorySales.useQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // Format currency full
  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { category: string; revenue: number; percentage: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{data.category}</p>
          <p className="text-sm text-gray-600">
            Pendapatan: <span className="font-semibold">{formatCurrencyFull(data.revenue)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Persentase: <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle export
  const handleExport = (type: 'pdf' | 'excel') => {
    toast.info(`Export ${type.toUpperCase()}`, {
      description: `Fitur export ${type.toUpperCase()} akan segera tersedia`,
    });
  };

  // Clear date filter
  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  // Find highest and lowest revenue categories
  const highestCategory = reportData?.categories[0];
  const lowestCategory = reportData?.categories[reportData.categories.length - 1];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data laporan...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <div className="text-red-600">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Gagal Memuat Data</h3>
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 space-y-2">
          <Label>Tanggal Mulai (Opsional)</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label>Tanggal Akhir (Opsional)</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {(startDate || endDate) && (
            <Button variant="outline" size="sm" onClick={handleClearFilter}>
              Reset Filter
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Categories */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Kategori</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {reportData?.totalCategories || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-2">Kategori dengan penjualan</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Highest Revenue Category */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kategori Tertinggi</p>
              <h3 className="text-lg font-bold text-gray-900">
                {highestCategory?.category || '-'}
              </h3>
              <p className="text-sm text-green-600 font-semibold mt-1">
                {highestCategory ? formatCurrencyFull(highestCategory.revenue) : '-'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Lowest Revenue Category */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kategori Terendah</p>
              <h3 className="text-lg font-bold text-gray-900">
                {lowestCategory?.category || '-'}
              </h3>
              <p className="text-sm text-gray-600 font-semibold mt-1">
                {lowestCategory ? formatCurrencyFull(lowestCategory.revenue) : '-'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Pendapatan per Kategori</h3>
          <p className="text-sm text-gray-600">
            {reportData?.dateRange 
              ? `Periode: ${new Date(reportData.dateRange.start).toLocaleDateString('id-ID')} - ${new Date(reportData.dateRange.end).toLocaleDateString('id-ID')}`
              : 'Semua waktu'
            }
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={reportData?.categories || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" name="Pendapatan (Rp)">
              {reportData?.categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#8884d8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Table */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Detail Penjualan per Kategori</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Total Penjualan</TableHead>
              <TableHead className="text-right">Persentase</TableHead>
              <TableHead className="text-right">Jumlah Order</TableHead>
              <TableHead className="text-right">Produk Terjual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData?.categories && reportData.categories.length > 0 ? (
              reportData.categories.map((category, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: CATEGORY_COLORS[category.category] || '#8884d8' }}
                      ></div>
                      {category.category}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrencyFull(category.revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-mono">
                      {category.percentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {category.orderCount}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {category.productsSold}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  Belum ada data penjualan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
