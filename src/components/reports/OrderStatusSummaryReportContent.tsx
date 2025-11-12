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
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FileText,
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ORDER_STATUS_CONFIG = {
  awaiting_payment: { label: 'Menunggu Pembayaran', color: 'bg-yellow-500', icon: Clock },
  processing: { label: 'Sedang Diproses', color: 'bg-blue-500', icon: Package },
  shipped: { label: 'Dikirim', color: 'bg-purple-500', icon: Truck },
  delivered: { label: 'Terkirim', color: 'bg-indigo-500', icon: CheckCircle },
  completed: { label: 'Selesai', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-500', icon: XCircle },
};

const PIE_COLORS = [
  '#eab308', // awaiting_payment - yellow
  '#3b82f6', // processing - blue
  '#a855f7', // shipped - purple
  '#6366f1', // delivered - indigo
  '#22c55e', // completed - green
  '#ef4444', // cancelled - red
];

export default function OrderStatusSummaryReportContent() {
  const [period, setPeriod] = useState('today');

  // Calculate date range based on period - Memoized
  const { startDate, endDate } = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(endDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'thisMonth':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [period]);

  // Get order status summary data
  const { data: reportData, isLoading } = trpc.reports.getOrderStatusSummary.useQuery({
    startDate,
    endDate,
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Pie chart label renderer - need any type for recharts compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPieLabel = (props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`;

  const statusSummary = reportData?.statusSummary || [];
  const recentOrders = reportData?.recentOrders || [];
  const totalOrders = reportData?.totalOrders || 0;
  const totalRevenue = reportData?.totalRevenue || 0;

  // Prepare chart data
  const chartData = statusSummary
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: ORDER_STATUS_CONFIG[item.status as keyof typeof ORDER_STATUS_CONFIG]?.label || item.status,
      value: item.count,
    }));

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('Laporan Ringkasan Status Pesanan', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Toko Pelita Bangunan', 105, 28, { align: 'center' });

      // Period
      const periodLabel =
        period === 'today'
          ? 'Hari Ini'
          : period === 'yesterday'
            ? 'Kemarin'
            : period === '7days'
              ? '7 Hari Terakhir'
              : period === '30days'
                ? '30 Hari Terakhir'
                : 'Bulan Ini';
      doc.text(`Periode: ${periodLabel}`, 105, 34, { align: 'center' });
      doc.text(`Tanggal: ${formatDate(new Date().toISOString())}`, 105, 40, { align: 'center' });

      // Summary Stats
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ringkasan', 20, 52);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total Pesanan: ${totalOrders || 0}`, 20, 60);
      doc.text(`Total Revenue: ${formatCurrency(totalRevenue || 0)}`, 110, 60);

      // Status Summary
      let startY = 75;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ringkasan Status Pesanan', 20, startY);
      startY += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Status', 20, startY);
      doc.text('Jumlah', 110, startY);
      doc.text('Persentase', 150, startY);
      startY += 6;

      doc.setFont('helvetica', 'normal');
      statusSummary.forEach((item) => {
        const statusLabel = ORDER_STATUS_CONFIG[item.status as keyof typeof ORDER_STATUS_CONFIG]?.label || item.status;
        const count = String(item.count || 0);
        const percentage = `${(item.percentage || 0).toFixed(1)}%`;
        
        doc.text(String(statusLabel), 20, startY);
        doc.text(count, 110, startY);
        doc.text(percentage, 150, startY);
        startY += 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.text('Laporan ini dibuat secara otomatis oleh sistem', 105, 285, { align: 'center' });

      doc.save(`Laporan-Status-Pesanan-${new Date().getTime()}.pdf`);
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

      // Prepare status summary data
      const statusData = statusSummary.map((item) => ({
        'Status': ORDER_STATUS_CONFIG[item.status as keyof typeof ORDER_STATUS_CONFIG]?.label || item.status,
        'Jumlah': item.count,
        'Persentase': `${item.percentage.toFixed(1)}%`,
      }));

      // Prepare orders data
      const ordersData = recentOrders.map((order, index) => ({
        '#': index + 1,
        'No. Pesanan': order.orderNumber,
        'Pelanggan': order.customerName,
        'Telepon': order.customerPhone,
        'Status': ORDER_STATUS_CONFIG[order.orderStatus as keyof typeof ORDER_STATUS_CONFIG]?.label || order.orderStatus,
        'Total': order.total,
        'Tanggal': formatDate(order.createdAt),
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Add status summary sheet
      const wsStatus = XLSX.utils.json_to_sheet(statusData);
      wsStatus['!cols'] = [
        { wch: 25 }, // Status
        { wch: 10 }, // Jumlah
        { wch: 12 }, // Persentase
      ];
      XLSX.utils.book_append_sheet(wb, wsStatus, 'Status Summary');

      // Add orders sheet
      const wsOrders = XLSX.utils.json_to_sheet(ordersData);
      wsOrders['!cols'] = [
        { wch: 5 },  // #
        { wch: 18 }, // No. Pesanan
        { wch: 25 }, // Pelanggan
        { wch: 15 }, // Telepon
        { wch: 20 }, // Status
        { wch: 15 }, // Total
        { wch: 18 }, // Tanggal
      ];
      XLSX.utils.book_append_sheet(wb, wsOrders, 'Daftar Pesanan');

      // Add summary sheet
      const summaryData = [
        { Label: 'Total Pesanan', Nilai: totalOrders },
        { Label: 'Total Revenue', Nilai: totalRevenue },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

      // Save file
      XLSX.writeFile(wb, `Laporan-Status-Pesanan-${new Date().getTime()}.xlsx`);
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
        <h2 className="text-2xl font-bold text-gray-900">Laporan Ringkasan Status Pesanan</h2>
        <p className="text-gray-600 mt-1">
          Memberikan gambaran cepat mengenai jumlah pesanan dalam setiap status untuk memantau beban kerja
          harian
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pesanan</p>
              <h3 className="text-3xl font-bold text-blue-600">{totalOrders}</h3>
              <p className="text-xs text-gray-500 mt-1">Periode ini</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</h3>
              <p className="text-xs text-gray-500 mt-1">Total nilai pesanan</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Export Buttons */}
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Periode</label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="yesterday">Kemarin</SelectItem>
              <SelectItem value="7days">7 Hari Terakhir</SelectItem>
              <SelectItem value="30days">30 Hari Terakhir</SelectItem>
              <SelectItem value="thisMonth">Bulan Ini</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusSummary.map((item) => {
          const config = ORDER_STATUS_CONFIG[item.status as keyof typeof ORDER_STATUS_CONFIG];
          const Icon = config?.icon || Clock;

          return (
            <Card key={item.status} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">{config?.label || item.status}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{item.count}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.percentage.toFixed(1)}% dari total</p>
                </div>
                <div className={`w-10 h-10 ${config?.color || 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pie Chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status Pesanan</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderPieLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recent Orders Table */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Pesanan Terbaru</h3>
          <p className="text-sm text-gray-600 mt-1">{recentOrders.length} pesanan dalam periode ini</p>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Tidak ada pesanan dalam periode ini</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Pesanan</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => {
                const config = ORDER_STATUS_CONFIG[order.orderStatus as keyof typeof ORDER_STATUS_CONFIG];

                return (
                  <TableRow key={order._id}>
                    <TableCell>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-700">{order.customerPhone}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${config?.color || 'bg-gray-500'} text-white`}>
                        {config?.label || order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-700">{formatDate(order.createdAt)}</p>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
