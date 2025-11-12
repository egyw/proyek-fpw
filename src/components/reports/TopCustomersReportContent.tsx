import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { UserCheck, Trophy, TrendingUp, DollarSign, Download, FileText } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

export default function TopCustomersReportContent() {
  const [period, setPeriod] = useState('30days');
  const [sortBy, setSortBy] = useState<'totalSpent' | 'orderCount'>('totalSpent');

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
  }, [period]);

  // Get top customers data
  const { data: reportData, isLoading } = trpc.reports.getTopCustomers.useQuery({
    startDate,
    endDate,
    limit: 20,
    sortBy,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const stats = reportData?.stats || {
    totalCustomers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    averageSpentPerCustomer: 0,
  };

  const customers = reportData?.customers || [];

  // Get top 3 for podium display
  const topThree = customers.slice(0, 3);

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('Laporan Pelanggan Teratas', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Toko Pelita Bangunan', 105, 28, { align: 'center' });
      
      // Period
      const periodLabel = period === '7days' ? '7 Hari Terakhir' : period === '30days' ? '30 Hari Terakhir' : period === '90days' ? '90 Hari Terakhir' : period === '6months' ? '6 Bulan Terakhir' : '1 Tahun Terakhir';
      doc.text(`Periode: ${periodLabel}`, 105, 34, { align: 'center' });
      doc.text(`Tanggal: ${formatDate(new Date().toISOString())}`, 105, 40, { align: 'center' });

      // Summary Stats
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ringkasan', 20, 52);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total Pelanggan: ${stats.totalCustomers}`, 20, 60);
      doc.text(`Total Revenue: ${formatCurrency(stats.totalRevenue)}`, 20, 66);
      doc.text(`Total Pesanan: ${stats.totalOrders}`, 110, 60);

      // Top 3 Section
      let startY = 78;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Top 3 Pelanggan Terbaik', 20, startY);
      startY += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      topThree.forEach((customer, index) => {
        const rank = index + 1;
        const rankLabel = rank === 1 ? 'TOP 1' : rank === 2 ? 'TOP 2' : 'TOP 3';
        doc.text(`[${rankLabel}] ${customer.customerName}`, 20, startY);
        doc.text(`${formatCurrency(customer.totalSpent)} | ${customer.orderCount} transaksi`, 30, startY + 5);
        startY += 12;
      });

      // Customers Table
      startY += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Daftar Pelanggan', 20, startY);
      startY += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('#', 20, startY);
      doc.text('Nama', 30, startY);
      doc.text('Kontak', 90, startY);
      doc.text('Belanja', 140, startY);
      doc.text('Order', 175, startY);
      startY += 6;

      doc.setFont('helvetica', 'normal');
      customers.slice(0, 20).forEach((customer, index) => {
        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }

        doc.text(`${index + 1}`, 20, startY);
        doc.text(customer.customerName.substring(0, 25), 30, startY);
        doc.text(customer.customerPhone, 90, startY);
        doc.text(formatCurrency(customer.totalSpent), 140, startY);
        doc.text(`${customer.orderCount}`, 175, startY);
        startY += 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.text('Laporan ini dibuat secara otomatis oleh sistem', 105, 285, { align: 'center' });

      const fileName = `Laporan-Pelanggan-Teratas-${new Date().toISOString().split('T')[0]}.pdf`;
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
    try {
      const XLSX = await import('xlsx');

      // Prepare data
      const excelData = customers.map((customer, index) => ({
        '#': index + 1,
        'Nama Pelanggan': customer.customerName,
        'Telepon': customer.customerPhone,
        'Total Belanja': customer.totalSpent,
        'Jumlah Transaksi': customer.orderCount,
        'Rata-rata per Order': customer.averageOrderValue,
        'Pesanan Pertama': formatDate(customer.firstOrderDate),
        'Pesanan Terakhir': formatDate(customer.lastOrderDate),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Column widths
      ws['!cols'] = [
        { wch: 5 },  // #
        { wch: 25 }, // Nama
        { wch: 15 }, // Telepon
        { wch: 15 }, // Total Belanja
        { wch: 12 }, // Jumlah Transaksi
        { wch: 15 }, // Rata-rata
        { wch: 15 }, // Pesanan Pertama
        { wch: 15 }, // Pesanan Terakhir
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Top Customers');

      // Add summary sheet
      const summaryData = [
        { Label: 'Total Pelanggan', Nilai: stats.totalCustomers },
        { Label: 'Total Revenue', Nilai: formatCurrency(stats.totalRevenue) },
        { Label: 'Total Pesanan', Nilai: stats.totalOrders },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

      // Save file
      const fileName = `Laporan-Pelanggan-Teratas-${new Date().toISOString().split('T')[0]}.xlsx`;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Laporan Pelanggan Teratas</h2>
        <p className="text-gray-600 mt-1">
          Menampilkan pelanggan dengan total belanja atau transaksi tertinggi untuk program loyalitas
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pelanggan</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</h3>
              <p className="text-xs text-gray-500 mt-1">Pelanggan aktif</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue).replace('Rp', 'Rp ')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Total penjualan</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pesanan</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.totalOrders}</h3>
              <p className="text-xs text-gray-500 mt-1">Transaksi berhasil</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Export Buttons */}
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
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
                <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
                <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Urutkan Berdasarkan</label>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as 'totalSpent' | 'orderCount')}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalSpent">Total Belanja</SelectItem>
                <SelectItem value="orderCount">Jumlah Transaksi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 3 Pelanggan Terbaik
          </h3>
          <div className="flex items-end justify-center gap-4">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-gray-600">2</span>
                </div>
                <div className="text-center mb-3">
                  <p className="font-semibold text-gray-900">{topThree[1].customerName}</p>
                  <p className="text-xs text-gray-500">{topThree[1].customerPhone}</p>
                </div>
                <div className="bg-gray-100 px-4 py-6 rounded-t-lg w-32 text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Belanja</p>
                  <p className="font-bold text-gray-900 text-sm">
                    {formatCurrency(topThree[1].totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{topThree[1].orderCount} pesanan</p>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="flex flex-col items-center -mt-8">
                <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
                <div className="w-28 h-28 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-4xl font-bold text-white">1</span>
                </div>
                <div className="text-center mb-3">
                  <p className="font-bold text-gray-900 text-lg">{topThree[0].customerName}</p>
                  <p className="text-xs text-gray-500">{topThree[0].customerPhone}</p>
                </div>
                <div className="bg-linear-to-br from-yellow-400 to-yellow-600 px-4 py-8 rounded-t-lg w-36 text-center shadow-lg">
                  <p className="text-sm text-yellow-900 mb-1 font-medium">Total Belanja</p>
                  <p className="font-bold text-white text-base">
                    {formatCurrency(topThree[0].totalSpent)}
                  </p>
                  <p className="text-xs text-yellow-100 mt-2">{topThree[0].orderCount} pesanan</p>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-orange-600">3</span>
                </div>
                <div className="text-center mb-3">
                  <p className="font-semibold text-gray-900 text-sm">{topThree[2].customerName}</p>
                  <p className="text-xs text-gray-500">{topThree[2].customerPhone}</p>
                </div>
                <div className="bg-orange-100 px-4 py-4 rounded-t-lg w-28 text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Belanja</p>
                  <p className="font-bold text-gray-900 text-xs">
                    {formatCurrency(topThree[2].totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{topThree[2].orderCount} pesanan</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Full Customer List */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Pelanggan Teratas</h3>
          <p className="text-sm text-gray-600 mt-1">
            Menampilkan {customers.length} pelanggan berdasarkan {sortBy === 'totalSpent' ? 'total belanja' : 'jumlah transaksi'}
          </p>
        </div>

        {customers.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada data pelanggan untuk periode ini</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead className="text-right">Total Belanja</TableHead>
                <TableHead className="text-right">Jumlah Pesanan</TableHead>
                <TableHead className="text-right">Rata-rata/Pesanan</TableHead>
                <TableHead>Periode Aktif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, index) => (
                <TableRow key={customer.customerId}>
                  <TableCell className="font-semibold text-gray-900">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{customer.customerName}</p>
                      {index < 3 && (
                        <Badge className={index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'}>
                          {index === 0 ? '🥇 Top 1' : index === 1 ? '🥈 Top 2' : '🥉 Top 3'}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">{customer.customerPhone}</p>
                      <p className="text-xs text-gray-500">{customer.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{customer.orderCount}</TableCell>
                  <TableCell className="text-right text-gray-700">
                    {formatCurrency(customer.averageOrderValue)}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-600">
                      <p>Mulai: {formatDate(customer.firstOrderDate)}</p>
                      <p>Terakhir: {formatDate(customer.lastOrderDate)}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
