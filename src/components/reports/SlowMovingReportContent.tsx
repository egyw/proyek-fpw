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

  // Export to PDF
  const exportToPDF = async () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error('Tidak ada data untuk diekspor', {
        description: 'Tidak ada produk slow-moving yang tersedia untuk diekspor',
      });
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('Laporan Stok Kurang Laku', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Toko Pelita Bangunan', 105, 30, { align: 'center' });
      doc.text('Jl. Raya Bangunan No. 123, Makassar', 105, 35, { align: 'center' });
      doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 105, 40, { align: 'center' });

      // Period label
      const periodLabels: Record<string, string> = {
        '30days': '30 Hari Terakhir',
        '60days': '60 Hari Terakhir',
        '90days': '90 Hari Terakhir',
        '6months': '6 Bulan Terakhir',
      };
      doc.setFontSize(9);
      doc.text(`Periode: ${periodLabels[period] || 'Semua Periode'}`, 105, 45, { align: 'center' });

      // Summary
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ringkasan', 20, 55);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      let startY = 62;
      doc.text(`Total Produk Lambat:`, 20, startY);
      doc.text(`${totalProducts}`, 70, startY);
      startY += 6;
      doc.text(`Stok Mati (90+ hari):`, 20, startY);
      doc.text(`${deadStockCount}`, 70, startY);
      startY += 6;
      const verySlowCount = filteredData.filter((p: SlowMovingProduct) => p.status === 'very_slow').length;
      doc.text(`Sangat Lambat (60-89 hari):`, 20, startY);
      doc.text(`${verySlowCount}`, 70, startY);
      startY += 6;
      const slowCount = filteredData.filter((p: SlowMovingProduct) => p.status === 'slow').length;
      doc.text(`Lambat (30-59 hari):`, 20, startY);
      doc.text(`${slowCount}`, 70, startY);

      // Table
      startY += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Daftar Produk Kurang Laku', 20, startY);
      doc.setFont('helvetica', 'normal');

      startY += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Nama Produk', 20, startY);
      doc.text('Kategori', 75, startY);
      doc.text('Hari', 105, startY, { align: 'center' });
      doc.text('Stok', 125, startY, { align: 'right' });
      doc.text('Nilai Stok', 150, startY, { align: 'right' });
      doc.text('Status', 180, startY);
      doc.setFont('helvetica', 'normal');

      startY += 2;
      doc.line(20, startY, 190, startY);

      startY += 6;

      filteredData.forEach((product: SlowMovingProduct) => {
        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }

        const productName = product.productName.substring(0, 25);
        const category = product.category.substring(0, 12);
        const statusLabels: Record<string, string> = {
          dead: 'Stok Mati',
          very_slow: 'Sangat Lambat',
          slow: 'Lambat',
        };

        doc.text(productName, 20, startY);
        doc.text(category, 75, startY);
        doc.text(`${product.daysNotSold}`, 105, startY, { align: 'center' });
        doc.text(`${product.currentStock} ${product.unit}`, 125, startY, { align: 'right' });
        doc.text(formatCurrency(product.stockValue), 150, startY, { align: 'right' });
        doc.text(statusLabels[product.status || 'slow'] || '-', 180, startY);

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

      const fileName = `Laporan-Stok-Kurang-Laku-${new Date().toISOString().split('T')[0]}.pdf`;
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
    if (!filteredData || filteredData.length === 0) {
      toast.error('Tidak ada data untuk diekspor', {
        description: 'Tidak ada produk slow-moving yang tersedia untuk diekspor',
      });
      return;
    }

    try {
      const XLSX = await import('xlsx');

      // Period label
      const periodLabels: Record<string, string> = {
        '30days': '30 Hari Terakhir',
        '60days': '60 Hari Terakhir',
        '90days': '90 Hari Terakhir',
        '6months': '6 Bulan Terakhir',
      };

      // Status labels
      const statusLabels: Record<string, string> = {
        dead: 'Stok Mati',
        very_slow: 'Sangat Lambat',
        slow: 'Lambat',
      };

      // Sheet 1: Slow Moving Products
      const dataForExcel = filteredData.map((product: SlowMovingProduct, index: number) => ({
        '#': index + 1,
        'Nama Produk': product.productName,
        'Kategori': product.category,
        'Status': statusLabels[product.status || 'slow'] || '-',
        'Stok Tersisa': product.currentStock,
        'Satuan': product.unit,
        'Total Terjual': product.totalSold,
        'Hari Tidak Terjual': product.daysNotSold,
        'Harga Satuan': product.price,
        'Harga Format': formatCurrency(product.price),
        'Nilai Stok': product.stockValue,
        'Nilai Format': formatCurrency(product.stockValue),
        'Terakhir Terjual': product.lastSoldDate || '-',
      }));

      const ws1 = XLSX.utils.json_to_sheet(dataForExcel);
      ws1['!cols'] = [
        { wch: 5 },  // #
        { wch: 35 }, // Nama Produk
        { wch: 15 }, // Kategori
        { wch: 15 }, // Status
        { wch: 12 }, // Stok Tersisa
        { wch: 10 }, // Satuan
        { wch: 12 }, // Total Terjual
        { wch: 15 }, // Hari Tidak Terjual
        { wch: 12 }, // Harga Satuan
        { wch: 18 }, // Harga Format
        { wch: 15 }, // Nilai Stok
        { wch: 18 }, // Nilai Format
        { wch: 18 }, // Terakhir Terjual
      ];

      // Sheet 2: Ringkasan
      const verySlowCount = filteredData.filter((p: SlowMovingProduct) => p.status === 'very_slow').length;
      const slowCount = filteredData.filter((p: SlowMovingProduct) => p.status === 'slow').length;
      const totalStockValue = filteredData.reduce((sum: number, p: SlowMovingProduct) => sum + p.stockValue, 0);

      const summaryData = [
        { 'Keterangan': 'Periode', 'Nilai': periodLabels[period] || 'Semua Periode' },
        { 'Keterangan': 'Tanggal Ekspor', 'Nilai': new Date().toLocaleDateString('id-ID') },
        { 'Keterangan': '', 'Nilai': '' },
        { 'Keterangan': 'Total Produk Lambat', 'Nilai': totalProducts },
        { 'Keterangan': 'Stok Mati (90+ hari)', 'Nilai': deadStockCount },
        { 'Keterangan': 'Sangat Lambat (60-89 hari)', 'Nilai': verySlowCount },
        { 'Keterangan': 'Lambat (30-59 hari)', 'Nilai': slowCount },
        { 'Keterangan': '', 'Nilai': '' },
        { 'Keterangan': 'Total Nilai Stok Lambat', 'Nilai': formatCurrency(totalStockValue) },
      ];

      // Add filter info
      if (categoryFilter !== 'all') {
        summaryData.push({ 'Keterangan': 'Filter Kategori', 'Nilai': categoryFilter });
      }
      if (statusFilter !== 'all') {
        summaryData.push({ 'Keterangan': 'Filter Status', 'Nilai': statusLabels[statusFilter] || statusFilter });
      }

      const ws2 = XLSX.utils.json_to_sheet(summaryData);
      ws2['!cols'] = [{ wch: 30 }, { wch: 30 }];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws1, 'Stok Kurang Laku');
      XLSX.utils.book_append_sheet(wb, ws2, 'Ringkasan');

      const fileName = `Laporan-Stok-Kurang-Laku-${new Date().toISOString().split('T')[0]}.xlsx`;
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
