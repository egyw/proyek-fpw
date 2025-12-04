import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown, ShoppingCart, Package, Download, FileText } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function PeriodicSalesReport() {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // tRPC Query with dynamic inputs
  const { data: reportData, isLoading, error } = trpc.reports.getPeriodicSales.useQuery({
    period,
    startDate: period === 'custom' ? customStartDate : undefined,
    endDate: period === 'custom' ? customEndDate : undefined,
  }, {
    enabled: period !== 'custom' || (customStartDate !== '' && customEndDate !== ''),
  });

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}M`; // Billion
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}jt`; // Million
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}rb`; // Thousand
    }
    return value.toString();
  };

  // Format currency full
  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; dataKey: string; payload?: { period: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {payload[0]?.payload?.period}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600">
              {entry.dataKey === 'revenue' ? 'Pendapatan: ' : 'Pesanan: '}
              <span className="font-semibold">
                {entry.dataKey === 'revenue' 
                  ? formatCurrencyFull(entry.value)
                  : entry.value
                }
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!reportData || !reportData.chartData || reportData.chartData.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('Laporan Penjualan Periodik', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text('Toko Pelita Bangunan', 105, 30, { align: 'center' });
      doc.text('Jl. Raya Bangunan No. 123, Makassar', 105, 35, { align: 'center' });
      
      // Period and date
      doc.setFontSize(9);
      doc.text(`Periode: ${reportData.periodLabel || '-'}`, 105, 45, { align: 'center' });
      doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}`, 105, 50, { align: 'center' });

      // Summary Stats
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ringkasan Penjualan', 20, 62);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Pendapatan: ${formatCurrencyFull(reportData.totalRevenue || 0)}`, 20, 70);
      doc.text(`Total Pesanan: ${reportData.totalOrders || 0}`, 20, 76);
      doc.text(`Produk Terjual: ${reportData.totalProductsSold || 0} unit`, 20, 82);

      // Table Header
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Data Penjualan per Periode', 20, 95);

      // Table
      let startY = 105;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Periode', 20, startY);
      doc.text('Pendapatan', 90, startY);
      doc.text('Pesanan', 150, startY);

      // Draw header line
      doc.line(20, startY + 2, 190, startY + 2);

      // Table rows
      startY += 8;
      doc.setFont('helvetica', 'normal');
      
      reportData.chartData.forEach((item: { period: string; revenue: number; orders: number }) => {
        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }

        const period = String(item.period || '-');
        const revenue = formatCurrencyFull(item.revenue || 0);
        const orders = String(item.orders || 0);

        doc.text(period, 20, startY);
        doc.text(revenue, 90, startY);
        doc.text(orders, 150, startY);

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
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' });
      }

      // Save PDF
      const fileName = `Laporan-Penjualan-Periodik-${new Date().toISOString().split('T')[0]}.pdf`;
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
    if (!reportData || !reportData.chartData || reportData.chartData.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    try {
      const XLSX = await import('xlsx');

      // Sheet 1: Sales Data
      const salesData = reportData.chartData.map((item: { period: string; revenue: number; orders: number }, index: number) => ({
        '#': index + 1,
        'Periode': item.period || '-',
        'Pendapatan': item.revenue || 0,
        'Pendapatan (Format)': formatCurrencyFull(item.revenue || 0),
        'Jumlah Pesanan': item.orders || 0,
      }));

      const ws1 = XLSX.utils.json_to_sheet(salesData);
      ws1['!cols'] = [
        { wch: 5 },  // #
        { wch: 20 }, // Periode
        { wch: 15 }, // Pendapatan
        { wch: 20 }, // Pendapatan (Format)
        { wch: 15 }, // Jumlah Pesanan
      ];

      // Sheet 2: Summary
      const summaryData = [
        { 'Metrik': 'Total Pendapatan', 'Nilai': formatCurrencyFull(reportData.totalRevenue || 0) },
        { 'Metrik': 'Total Pesanan', 'Nilai': reportData.totalOrders || 0 },
        { 'Metrik': 'Produk Terjual', 'Nilai': `${reportData.totalProductsSold || 0} unit` },
        { 'Metrik': 'Periode Laporan', 'Nilai': reportData.periodLabel || '-' },
        { 'Metrik': 'Tanggal Export', 'Nilai': new Date().toLocaleDateString('id-ID', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) },
      ];

      const ws2 = XLSX.utils.json_to_sheet(summaryData);
      ws2['!cols'] = [
        { wch: 20 }, // Metrik
        { wch: 30 }, // Nilai
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws1, 'Data Penjualan');
      XLSX.utils.book_append_sheet(wb, ws2, 'Ringkasan');

      // Save Excel
      const fileName = `Laporan-Penjualan-Periodik-${new Date().toISOString().split('T')[0]}.xlsx`;
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
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        {/* Period Selector */}
        <div className="flex-1 space-y-2">
          <Label>Periode Laporan</Label>
          <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian (7 hari terakhir)</SelectItem>
              <SelectItem value="weekly">Mingguan (8 minggu terakhir)</SelectItem>
              <SelectItem value="monthly">Bulanan (12 bulan terakhir)</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range (only shown when period = custom) */}
        {period === 'custom' && (
          <>
            <div className="flex-1 space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Tanggal Akhir</Label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Export Buttons */}
        <div className="flex gap-2">
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
        {/* Total Revenue */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pendapatan</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(reportData?.totalRevenue || 0)}
              </h3>
              <p className="text-xs text-gray-500 mt-2">{reportData?.periodLabel}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pesanan</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {reportData?.totalOrders || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-2">Pesanan lunas</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Total Products Sold */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Produk Terjual</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {reportData?.totalProductsSold || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-2">Total unit</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Grafik Penjualan</h3>
            <p className="text-sm text-gray-600">{reportData?.periodLabel}</p>
          </div>
          <Select value={chartType} onValueChange={(value) => setChartType(value as typeof chartType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipe grafik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'line' ? (
            <LineChart data={reportData?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                strokeWidth={2}
                name="Pendapatan (Rp)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Jumlah Pesanan"
              />
            </LineChart>
          ) : (
            <BarChart data={reportData?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                fill="#8884d8"
                name="Pendapatan (Rp)"
              />
              <Bar
                yAxisId="right"
                dataKey="orders"
                fill="#82ca9d"
                name="Jumlah Pesanan"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Card>

      {/* Empty State */}
      {reportData?.chartData?.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Data</h3>
            <p className="text-gray-600">Tidak ada transaksi pada periode yang dipilih</p>
          </div>
        </Card>
      )}
    </div>
  );
}
