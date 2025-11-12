import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, TrendingUp, ShoppingCart, Download, FileText } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Payment Method Report Component
 * 
 * Features:
 * - Optional date range filter
 * - 3 Stats cards (Total Methods, Most Used, Total Transactions)
 * - Pie chart for distribution
 * - Table with: Method, Count, Percentage, Total Amount, Average
 * - Color-coded badges
 * 
 * Payment Data Source:
 * - Uses paymentType from Midtrans callback (specific payment type like "gopay", "bca_va", "qris")
 * - Fallback to paymentMethod for non-Midtrans orders (e.g., "cod")
 * 
 * Connected to: trpc.reports.getPaymentMethodStats
 */

// Payment method colors for chart
const PAYMENT_COLORS: string[] = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Orange
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange2
  '#6366F1', // Indigo
];

// Payment method display names (based on Midtrans payment_type)
const PAYMENT_METHOD_NAMES: Record<string, string> = {
  // Midtrans payment types
  'gopay': 'GoPay',
  'shopeepay': 'ShopeePay',
  'qris': 'QRIS',
  'other_qris': 'QRIS',
  'bank_transfer': 'Transfer Bank',
  'bca_va': 'BCA Virtual Account',
  'bni_va': 'BNI Virtual Account',
  'bri_va': 'BRI Virtual Account',
  'permata_va': 'Permata Virtual Account',
  'other_va': 'Virtual Account Lainnya',
  'echannel': 'Mandiri Bill Payment',
  'credit_card': 'Kartu Kredit',
  'alfamart': 'Alfamart',
  'indomaret': 'Indomaret',
  'cstore': 'Convenience Store',
  'akulaku': 'Akulaku',
  
  // Legacy/fallback methods
  'midtrans': 'Midtrans (Legacy)',
  'cod': 'Cash on Delivery',
  'transfer': 'Transfer Bank',
  'unknown': 'Tidak Diketahui',
};

export default function PaymentMethodReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // tRPC Query with optional date filter
  const { data: reportData, isLoading, error } = trpc.reports.getPaymentMethodStats.useQuery({
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

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { method: string; count: number; percentage: number; totalAmount: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {PAYMENT_METHOD_NAMES[data.method] || data.method}
          </p>
          <p className="text-sm text-gray-600">
            Transaksi: <span className="font-semibold">{data.count}</span>
          </p>
          <p className="text-sm text-gray-600">
            Persentase: <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
          </p>
          <p className="text-sm text-gray-600">
            Total: <span className="font-semibold">{formatCurrencyFull(data.totalAmount)}</span>
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

  // Find most used payment method
  const mostUsedMethod = reportData?.methods[0];

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
        {/* Total Payment Methods */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Metode</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {reportData?.methods.length || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-2">Metode pembayaran digunakan</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Most Used Method */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Paling Banyak Digunakan</p>
              <h3 className="text-lg font-bold text-gray-900">
                {mostUsedMethod ? (PAYMENT_METHOD_NAMES[mostUsedMethod.method] || mostUsedMethod.method) : '-'}
              </h3>
              <p className="text-sm text-green-600 font-semibold mt-1">
                {mostUsedMethod ? `${mostUsedMethod.count} transaksi (${mostUsedMethod.percentage.toFixed(1)}%)` : '-'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Total Transactions */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transaksi</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {reportData?.totalTransactions || 0}
              </h3>
              <p className="text-sm text-gray-600 font-semibold mt-1">
                {reportData ? formatCurrencyFull(reportData.totalAmount) : '-'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pie Chart */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Distribusi Metode Pembayaran</h3>
          <p className="text-sm text-gray-600">
            {reportData?.dateRange 
              ? `Periode: ${new Date(reportData.dateRange.start).toLocaleDateString('id-ID')} - ${new Date(reportData.dateRange.end).toLocaleDateString('id-ID')}`
              : 'Semua waktu'
            }
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={reportData?.methods.map((method) => ({
                ...method,
                name: PAYMENT_METHOD_NAMES[method.method] || method.method,
                value: method.count,
                label: `${PAYMENT_METHOD_NAMES[method.method] || method.method}: ${method.percentage.toFixed(1)}%`,
              })) || []}
              cx="50%"
              cy="50%"
              labelLine
              label
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {reportData?.methods.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Table */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Detail Metode Pembayaran</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metode Pembayaran</TableHead>
              <TableHead className="text-right">Jumlah Transaksi</TableHead>
              <TableHead className="text-right">Persentase</TableHead>
              <TableHead className="text-right">Total Nilai</TableHead>
              <TableHead className="text-right">Rata-rata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData?.methods && reportData.methods.length > 0 ? (
              reportData.methods.map((method, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: PAYMENT_COLORS[index % PAYMENT_COLORS.length] }}
                      ></div>
                      {PAYMENT_METHOD_NAMES[method.method] || method.method}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {method.count}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-mono">
                      {method.percentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {formatCurrencyFull(method.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {formatCurrencyFull(method.averageAmount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  Belum ada data transaksi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
