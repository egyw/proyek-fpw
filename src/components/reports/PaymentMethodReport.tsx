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

  // Clear date filter
  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  // Find most used payment method
  const mostUsedMethod = reportData?.methods[0];

  // Export to PDF
  const exportToPDF = async () => {
    if (!reportData?.methods || reportData.methods.length === 0) {
      toast.error('Tidak ada data untuk diekspor', {
        description: 'Tidak ada data metode pembayaran yang tersedia untuk diekspor',
      });
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('Laporan Metode Pembayaran', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Toko Pelita Bangunan', 105, 30, { align: 'center' });
      doc.text('Jl. Raya Bangunan No. 123, Makassar', 105, 35, { align: 'center' });
      doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 105, 40, { align: 'center' });

      // Date range
      doc.setFontSize(9);
      const dateRangeText = reportData.dateRange 
        ? `Periode: ${new Date(reportData.dateRange.start).toLocaleDateString('id-ID')} - ${new Date(reportData.dateRange.end).toLocaleDateString('id-ID')}`
        : 'Periode: Semua waktu';
      doc.text(dateRangeText, 105, 45, { align: 'center' });

      // Summary
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ringkasan', 20, 55);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      let startY = 62;
      doc.text(`Total Metode Pembayaran:`, 20, startY);
      doc.text(`${reportData.methods.length}`, 80, startY);
      startY += 6;
      doc.text(`Total Transaksi:`, 20, startY);
      doc.text(`${reportData.totalTransactions}`, 80, startY);
      startY += 6;
      doc.text(`Total Nilai:`, 20, startY);
      doc.text(formatCurrencyFull(reportData.totalAmount), 80, startY);
      startY += 6;
      if (mostUsedMethod) {
        doc.text(`Metode Terpopuler:`, 20, startY);
        const methodName = PAYMENT_METHOD_NAMES[mostUsedMethod.method] || mostUsedMethod.method;
        doc.text(`${methodName} (${mostUsedMethod.count} transaksi)`, 80, startY);
      }

      // Table
      startY += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Detail Metode Pembayaran', 20, startY);
      doc.setFont('helvetica', 'normal');

      startY += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Metode', 20, startY);
      doc.text('Transaksi', 90, startY, { align: 'right' });
      doc.text('%', 110, startY, { align: 'right' });
      doc.text('Total Nilai', 145, startY, { align: 'right' });
      doc.text('Rata-rata', 180, startY, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      startY += 2;
      doc.line(20, startY, 190, startY);

      startY += 6;

      reportData.methods.forEach((method) => {
        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }

        const methodName = (PAYMENT_METHOD_NAMES[method.method] || method.method).substring(0, 30);

        doc.text(methodName, 20, startY);
        doc.text(`${method.count}`, 90, startY, { align: 'right' });
        doc.text(`${method.percentage.toFixed(1)}%`, 110, startY, { align: 'right' });
        doc.text(formatCurrencyFull(method.totalAmount).substring(0, 18), 145, startY, { align: 'right' });
        doc.text(formatCurrencyFull(method.averageAmount).substring(0, 18), 180, startY, { align: 'right' });

        startY += 6;
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(
          'Laporan ini dibuat secara otomatis oleh sistem',
          105,
          285,
          { align: 'center' }
        );
        doc.setFont('helvetica', 'normal');
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' });
      }

      const fileName = `Laporan-Metode-Pembayaran-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF Berhasil Diunduh!', {
        description: `File ${fileName} telah berhasil diunduh`,
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Gagal mengekspor PDF', {
        description: 'Terjadi kesalahan saat membuat file PDF',
      });
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    if (!reportData?.methods || reportData.methods.length === 0) {
      toast.error('Tidak ada data untuk diekspor', {
        description: 'Tidak ada data metode pembayaran yang tersedia untuk diekspor',
      });
      return;
    }

    try {
      const XLSX = await import('xlsx');

      // Sheet 1: Payment Methods Data
      const dataForExcel = reportData.methods.map((method, index: number) => ({
        '#': index + 1,
        'Metode Pembayaran': PAYMENT_METHOD_NAMES[method.method] || method.method,
        'Kode': method.method,
        'Jumlah Transaksi': method.count,
        'Persentase': `${method.percentage.toFixed(1)}%`,
        'Persentase Angka': method.percentage,
        'Total Nilai': method.totalAmount,
        'Total Nilai Format': formatCurrencyFull(method.totalAmount),
        'Rata-rata': method.averageAmount,
        'Rata-rata Format': formatCurrencyFull(method.averageAmount),
      }));

      const ws1 = XLSX.utils.json_to_sheet(dataForExcel);
      ws1['!cols'] = [
        { wch: 5 },  // #
        { wch: 30 }, // Metode Pembayaran
        { wch: 20 }, // Kode
        { wch: 18 }, // Jumlah Transaksi
        { wch: 12 }, // Persentase
        { wch: 15 }, // Persentase Angka
        { wch: 15 }, // Total Nilai
        { wch: 20 }, // Total Nilai Format
        { wch: 15 }, // Rata-rata
        { wch: 20 }, // Rata-rata Format
      ];

      // Sheet 2: Ringkasan
      const summaryData = [
        { 'Keterangan': 'Tanggal Ekspor', 'Nilai': new Date().toLocaleDateString('id-ID') },
        { 'Keterangan': 'Periode', 'Nilai': reportData.dateRange 
          ? `${new Date(reportData.dateRange.start).toLocaleDateString('id-ID')} - ${new Date(reportData.dateRange.end).toLocaleDateString('id-ID')}`
          : 'Semua waktu'
        },
        { 'Keterangan': '', 'Nilai': '' },
        { 'Keterangan': 'Total Metode Pembayaran', 'Nilai': reportData.methods.length },
        { 'Keterangan': 'Total Transaksi', 'Nilai': reportData.totalTransactions },
        { 'Keterangan': 'Total Nilai Transaksi', 'Nilai': formatCurrencyFull(reportData.totalAmount) },
        { 'Keterangan': '', 'Nilai': '' },
      ];

      // Add most used method
      if (mostUsedMethod) {
        const methodName = PAYMENT_METHOD_NAMES[mostUsedMethod.method] || mostUsedMethod.method;
        summaryData.push(
          { 'Keterangan': 'Metode Terpopuler', 'Nilai': methodName },
          { 'Keterangan': 'Jumlah Transaksi Terpopuler', 'Nilai': mostUsedMethod.count },
          { 'Keterangan': 'Persentase Terpopuler', 'Nilai': `${mostUsedMethod.percentage.toFixed(1)}%` },
          { 'Keterangan': 'Total Nilai Terpopuler', 'Nilai': formatCurrencyFull(mostUsedMethod.totalAmount) }
        );
      }

      // Add top 3 methods
      summaryData.push({ 'Keterangan': '', 'Nilai': '' });
      summaryData.push({ 'Keterangan': 'Top 3 Metode Pembayaran', 'Nilai': '' });
      reportData.methods.slice(0, 3).forEach((method, index) => {
        const methodName = PAYMENT_METHOD_NAMES[method.method] || method.method;
        summaryData.push({
          'Keterangan': `${index + 1}. ${methodName}`,
          'Nilai': `${method.count} transaksi (${method.percentage.toFixed(1)}%)`
        });
      });

      const ws2 = XLSX.utils.json_to_sheet(summaryData);
      ws2['!cols'] = [{ wch: 35 }, { wch: 40 }];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws1, 'Metode Pembayaran');
      XLSX.utils.book_append_sheet(wb, ws2, 'Ringkasan');

      const fileName = `Laporan-Metode-Pembayaran-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Excel Berhasil Diunduh!', {
        description: `File ${fileName} telah berhasil diunduh`,
      });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Gagal mengekspor Excel', {
        description: 'Terjadi kesalahan saat membuat file Excel',
      });
    }
  };

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
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
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
