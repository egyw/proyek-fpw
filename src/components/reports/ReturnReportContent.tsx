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
import { Package, AlertCircle, CheckCircle, XCircle, Clock, Download, FileText } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

export default function ReturnReportContent() {
  const [period, setPeriod] = useState('30days');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');

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

  // Get return report data
  const { data: reportData, isLoading } = trpc.reports.getReturnReport.useQuery({
    startDate,
    endDate,
    status: statusFilter,
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      pending: {
        label: 'Menunggu',
        className: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="h-3 w-3" />,
      },
      approved: {
        label: 'Disetujui',
        className: 'bg-blue-100 text-blue-800',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      rejected: {
        label: 'Ditolak',
        className: 'bg-red-100 text-red-800',
        icon: <XCircle className="h-3 w-3" />,
      },
      completed: {
        label: 'Selesai',
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-3 w-3" />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      damaged: 'Rusak',
      defective: 'Cacat Produksi',
      wrong_item: 'Barang Salah',
      not_as_described: 'Tidak Sesuai',
      other: 'Lainnya',
    };
    return labels[condition] || condition;
  };

  const stats = reportData?.stats || {
    totalReturns: 0,
    totalAmount: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  };

  const returns = reportData?.returns || [];
  const productReturns = reportData?.productReturns || [];

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('Laporan Retur Barang', 105, 20, { align: 'center' });
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
      doc.text(`Total Retur: ${stats.totalReturns}`, 20, 60);
      doc.text(`Total Nilai: ${formatCurrency(stats.totalAmount)}`, 20, 66);
      doc.text(`Menunggu: ${stats.pending}`, 110, 60);
      doc.text(`Selesai: ${stats.completed}`, 110, 66);

      // Returns Table
      let startY = 80;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Daftar Retur', 20, startY);
      startY += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('No. Retur', 20, startY);
      doc.text('Tanggal', 60, startY);
      doc.text('Pelanggan', 100, startY);
      doc.text('Status', 150, startY);
      doc.text('Nilai', 180, startY);
      startY += 6;

      doc.setFont('helvetica', 'normal');
      returns.slice(0, 20).forEach((returnItem) => {
        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }

        const statusLabels: Record<string, string> = {
          pending: 'Menunggu',
          approved: 'Disetujui',
          rejected: 'Ditolak',
          completed: 'Selesai',
        };

        doc.text(`${returnItem.returnNumber}`, 20, startY);
        doc.text(formatDate(returnItem.returnDate), 60, startY);
        doc.text(returnItem.customerName.substring(0, 20), 100, startY);
        doc.text(statusLabels[returnItem.status] || returnItem.status, 150, startY);
        doc.text(formatCurrency(returnItem.totalAmount), 180, startY, { align: 'right' });
        startY += 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.text('Laporan ini dibuat secara otomatis oleh sistem', 105, 285, { align: 'center' });

      doc.save(`Laporan-Retur-${new Date().getTime()}.pdf`);
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
      const excelData = returns.map((returnItem) => ({
        'No. Retur': returnItem.returnNumber,
        'Tanggal': formatDate(returnItem.returnDate),
        'Pelanggan': returnItem.customerName,
        'Telepon': returnItem.customerPhone,
        'Status': returnItem.status === 'pending' ? 'Menunggu' : returnItem.status === 'approved' ? 'Disetujui' : returnItem.status === 'rejected' ? 'Ditolak' : 'Selesai',
        'Alasan': getConditionLabel(returnItem.reason),
        'Total Nilai': returnItem.totalAmount,
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Column widths
      ws['!cols'] = [
        { wch: 15 }, // No. Retur
        { wch: 12 }, // Tanggal
        { wch: 20 }, // Pelanggan
        { wch: 15 }, // Telepon
        { wch: 12 }, // Status
        { wch: 20 }, // Alasan
        { wch: 15 }, // Total Nilai
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Retur Barang');

      // Add summary sheet
      const summaryData = [
        { Label: 'Total Retur', Nilai: stats.totalReturns },
        { Label: 'Total Nilai', Nilai: formatCurrency(stats.totalAmount) },
        { Label: 'Menunggu', Nilai: stats.pending },
        { Label: 'Disetujui', Nilai: stats.approved },
        { Label: 'Ditolak', Nilai: stats.rejected },
        { Label: 'Selesai', Nilai: stats.completed },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

      // Save file
      XLSX.writeFile(wb, `Laporan-Retur-${new Date().getTime()}.xlsx`);
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
        <h2 className="text-2xl font-bold text-gray-900">Laporan Retur Barang</h2>
        <p className="text-gray-600 mt-1">
          Mencatat semua transaksi retur yang telah divalidasi dengan detail produk dan pelanggan
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Retur</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalReturns}</h3>
              <p className="text-xs text-gray-500 mt-1">Transaksi retur</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Nilai</p>
              <h3 className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalAmount).replace('Rp', 'Rp ')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Nilai retur</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Menunggu</p>
              <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
              <p className="text-xs text-gray-500 mt-1">Perlu diproses</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Selesai</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
              <p className="text-xs text-gray-500 mt-1">Retur selesai</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
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
            <label className="text-sm text-gray-600 mb-2 block">Status</label>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as 'all' | 'pending' | 'approved' | 'rejected' | 'completed')
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
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

      {/* Most Returned Products */}
      {productReturns.length > 0 && (
        <Card>
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Produk Paling Sering Diretur</h3>
            <p className="text-sm text-gray-600 mt-1">Produk dengan tingkat retur tertinggi</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Jumlah Retur</TableHead>
                <TableHead className="text-right">Total Unit</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead>Alasan Utama</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productReturns.slice(0, 5).map((product) => {
                const topReason = product.reasons.sort((a, b) => b.count - a.count)[0];
                return (
                  <TableRow key={product.productId}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{product.productName}</p>
                        <p className="text-xs text-gray-500">{product.productId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{product.totalReturns}</TableCell>
                    <TableCell className="text-right">{product.totalQuantity}</TableCell>
                    <TableCell className="text-right text-red-600 font-semibold">
                      {formatCurrency(product.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge className="bg-gray-100 text-gray-800 text-xs">
                          {getConditionLabel(topReason.condition)}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">{topReason.reason}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Returns List */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Retur</h3>
          <p className="text-sm text-gray-600 mt-1">
            Menampilkan {returns.length} transaksi retur
          </p>
        </div>

        {returns.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada data retur untuk periode ini</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Retur</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Alasan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map((returnItem, index) => (
                <TableRow key={returnItem.returnNumber || `return-${index}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{returnItem.returnNumber}</p>
                      <p className="text-xs text-gray-500">Order: {returnItem.orderNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{returnItem.customerName}</p>
                      <p className="text-xs text-gray-500">{returnItem.customerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(returnItem.requestDate)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {returnItem.items.map((item: { productName: string; quantity: number }, idx: number) => (
                        <p key={idx} className="text-sm">
                          {item.productName} <span className="text-gray-500">(x{item.quantity})</span>
                        </p>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-red-600">
                    {formatCurrency(returnItem.totalAmount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-700 max-w-xs truncate">{returnItem.reason}</p>
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
