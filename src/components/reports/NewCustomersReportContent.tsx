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
import { Button } from '@/components/ui/button';
import { UserPlus, TrendingUp, TrendingDown, Calendar, Download, FileText } from 'lucide-react';
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
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function NewCustomersReportContent() {
  const [period, setPeriod] = useState('30days');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Calculate date range based on period - Memoized
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

  // Get new customers report data
  const { data: reportData, isLoading } = trpc.reports.getNewCustomersReport.useQuery({
    startDate,
    endDate,
    groupBy,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const stats = reportData?.stats || {
    totalNewCustomers: 0,
    growthRate: 0,
    previousPeriodTotal: 0,
    averagePerDay: 0,
  };

  const chartData = reportData?.chartData || [];
  const customersList = reportData?.customers || [];

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('Laporan Pendaftaran Pelanggan Baru', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Toko Pelita Bangunan', 105, 28, { align: 'center' });

      // Period
      const periodLabel =
        period === '7days'
          ? '7 Hari Terakhir'
          : period === '30days'
            ? '30 Hari Terakhir'
            : period === '90days'
              ? '90 Hari Terakhir'
              : period === '6months'
                ? '6 Bulan Terakhir'
                : '1 Tahun Terakhir';
      doc.text(`Periode: ${periodLabel}`, 105, 34, { align: 'center' });
      doc.text(`Tanggal: ${formatDate(new Date().toISOString())}`, 105, 40, { align: 'center' });

      // Summary Stats
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ringkasan', 20, 52);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total Pelanggan Baru: ${stats.totalNewCustomers}`, 20, 60);
      doc.text(`Pertumbuhan: ${stats.growthRate > 0 ? '+' : ''}${stats.growthRate.toFixed(1)}%`, 110, 60);
      doc.text(`Rata-rata per Hari: ${stats.averagePerDay.toFixed(1)}`, 20, 66);

      // Customers Table
      let startY = 80;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Daftar Pelanggan Baru', 20, startY);
      startY += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Nama', 20, startY);
      doc.text('Telepon', 80, startY);
      doc.text('Tanggal Daftar', 130, startY);
      startY += 6;

      doc.setFont('helvetica', 'normal');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customersList.slice(0, 30).forEach((customer: any) => {
        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }

        doc.text(customer.fullName.substring(0, 30), 20, startY);
        doc.text(customer.phone, 80, startY);
        doc.text(formatDate(customer.createdAt), 130, startY);
        startY += 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.text('Laporan ini dibuat secara otomatis oleh sistem', 105, 285, { align: 'center' });

      doc.save(`Laporan-Pelanggan-Baru-${new Date().getTime()}.pdf`);
      toast.success('PDF berhasil diunduh!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Gagal export PDF');
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');

      // Prepare data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const excelData = customersList.map((customer: any, index: number) => ({
        '#': index + 1,
        'Nama Lengkap': customer.fullName,
        'Username': customer.username,
        'Telepon': customer.phone,
        'Tanggal Daftar': formatDate(customer.createdAt),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Column widths
      ws['!cols'] = [
        { wch: 5 },  // #
        { wch: 25 }, // Nama
        { wch: 15 }, // Username
        { wch: 15 }, // Telepon
        { wch: 15 }, // Tanggal Daftar
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pelanggan Baru');

      // Add summary sheet
      const summaryData = [
        { Label: 'Total Pelanggan Baru', Nilai: stats.totalNewCustomers },
        { Label: 'Pertumbuhan', Nilai: `${stats.growthRate > 0 ? '+' : ''}${stats.growthRate.toFixed(1)}%` },
        { Label: 'Periode Sebelumnya', Nilai: stats.previousPeriodTotal },
        { Label: 'Rata-rata per Hari', Nilai: stats.averagePerDay.toFixed(1) },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

      // Save file
      XLSX.writeFile(wb, `Laporan-Pelanggan-Baru-${new Date().getTime()}.xlsx`);
      toast.success('Excel berhasil diunduh!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Gagal export Excel');
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
        <h2 className="text-2xl font-bold text-gray-900">Laporan Pendaftaran Pelanggan Baru</h2>
        <p className="text-gray-600 mt-1">
          Menampilkan jumlah pelanggan baru yang mendaftar setiap hari, minggu, atau bulan untuk mengukur
          pertumbuhan jangkauan pasar
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pelanggan Baru</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.totalNewCustomers}</h3>
              <p className="text-xs text-gray-500 mt-1">Periode ini</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pertumbuhan</p>
              <h3
                className={`text-2xl font-bold ${stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {stats.growthRate > 0 ? '+' : ''}
                {stats.growthRate.toFixed(1)}%
              </h3>
              <p className="text-xs text-gray-500 mt-1">vs periode sebelumnya</p>
            </div>
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${stats.growthRate >= 0 ? 'bg-green-50' : 'bg-red-50'}`}
            >
              {stats.growthRate >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Periode Sebelumnya</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.previousPeriodTotal}</h3>
              <p className="text-xs text-gray-500 mt-1">Total pelanggan</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rata-rata per Hari</p>
              <h3 className="text-2xl font-bold text-purple-600">{stats.averagePerDay.toFixed(1)}</h3>
              <p className="text-xs text-gray-500 mt-1">Pelanggan/hari</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-purple-600" />
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
            <label className="text-sm text-gray-600 mb-2 block">Kelompokkan Berdasarkan</label>
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as 'day' | 'week' | 'month')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Per Hari</SelectItem>
                <SelectItem value="week">Per Minggu</SelectItem>
                <SelectItem value="month">Per Bulan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Jenis Grafik</label>
            <Select value={chartType} onValueChange={(value) => setChartType(value as 'line' | 'bar')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Garis</SelectItem>
                <SelectItem value="bar">Batang</SelectItem>
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

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grafik Pendaftaran Pelanggan</h3>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Pelanggan Baru" />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Pelanggan Baru" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Card>
      )}

      {/* Customers List */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Pelanggan Baru</h3>
          <p className="text-sm text-gray-600 mt-1">
            {customersList.length} pelanggan mendaftar dalam periode ini
          </p>
        </div>
        {customersList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Tidak ada pelanggan baru dalam periode ini
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {customersList.map((customer: any, index: number) => (
                <TableRow key={customer._id}>
                  <TableCell className="font-semibold text-gray-900">{index + 1}</TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-900">{customer.fullName}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-700">{customer.username}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-700">{customer.phone}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-700">{formatDate(customer.createdAt)}</p>
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
