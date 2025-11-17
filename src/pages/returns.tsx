import MainLayout from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw, Clock, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';
import Link from 'next/link';

export default function ReturnsPage() {
  const returnReasons = [
    { value: 'damaged', label: 'Produk Rusak', description: 'Produk diterima dalam kondisi rusak atau cacat' },
    { value: 'wrong', label: 'Produk Tidak Sesuai', description: 'Produk yang diterima tidak sesuai dengan pesanan' },
    { value: 'defective', label: 'Produk Cacat', description: 'Produk memiliki cacat produksi atau tidak berfungsi' },
    { value: 'other', label: 'Lainnya', description: 'Alasan lain yang perlu dijelaskan secara detail' },
  ];

  const returnSteps = [
    {
      icon: Package,
      title: 'Ajukan Pengembalian',
      description: 'Masuk ke halaman "Pesanan Saya", pilih pesanan yang ingin dikembalikan, dan klik tombol "Ajukan Pengembalian".',
      color: 'blue',
    },
    {
      icon: AlertCircle,
      title: 'Pilih Produk & Alasan',
      description: 'Pilih produk yang ingin dikembalikan, pilih kondisi produk, dan jelaskan alasan pengembalian (minimal 10 karakter).',
      color: 'yellow',
    },
    {
      icon: Clock,
      title: 'Menunggu Persetujuan',
      description: 'Admin akan meninjau pengajuan Anda dalam 1-2 hari kerja. Anda akan mendapat notifikasi via email.',
      color: 'purple',
    },
    {
      icon: CheckCircle,
      title: 'Proses Refund',
      description: 'Jika disetujui, refund akan diproses dalam 3-7 hari kerja ke metode pembayaran awal Anda.',
      color: 'green',
    },
  ];

  const statusConfig = {
    pending: { label: 'Menunggu Persetujuan', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Disetujui', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800', icon: XCircle },
    completed: { label: 'Selesai', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <RotateCcw className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Kebijakan Pengembalian</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kami berkomitmen untuk kepuasan pelanggan. Berikut informasi lengkap tentang proses pengembalian barang di Toko Pelita Bangunan.
          </p>
        </div>

        {/* Syarat & Ketentuan */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Syarat & Ketentuan Pengembalian
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Status Pesanan: Completed</h3>
                <p className="text-sm text-gray-600">
                  Hanya pesanan dengan status <Badge className="bg-green-100 text-green-800">Completed</Badge> yang dapat diajukan pengembalian. Pesanan harus sudah diterima dan dikonfirmasi oleh pelanggan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Batas Waktu: 7 Hari</h3>
                <p className="text-sm text-gray-600">
                  Pengajuan pengembalian harus dilakukan maksimal 7 hari setelah pesanan selesai (status completed). Pengajuan melewati batas waktu tidak dapat diproses.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Package className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Kondisi Produk</h3>
                <p className="text-sm text-gray-600">
                  Untuk alasan selain produk rusak/cacat, barang harus dalam kondisi asli (belum dibuka/digunakan) dengan kemasan lengkap. Produk rusak/cacat akan diperiksa oleh tim kami.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Alasan Valid</h3>
                <p className="text-sm text-gray-600">
                  Pengembalian harus disertai alasan yang jelas (minimal 10 karakter). Admin berhak menolak pengajuan jika alasan tidak valid atau tidak sesuai dengan kondisi produk yang diterima.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Alasan Pengembalian */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Alasan Pengembalian yang Diterima</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {returnReasons.map((reason, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">{reason.label}</h3>
                <p className="text-sm text-gray-600">{reason.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Proses Pengembalian */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Cara Mengajukan Pengembalian</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {returnSteps.map((step, index) => {
              const Icon = step.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600',
                yellow: 'bg-yellow-50 text-yellow-600',
                purple: 'bg-purple-50 text-purple-600',
                green: 'bg-green-50 text-green-600',
              };

              return (
                <Card key={index} className="p-6 text-center">
                  <div className={`w-16 h-16 ${colorClasses[step.color as keyof typeof colorClasses]} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <Badge variant="outline" className="mb-3">
                    Langkah {index + 1}
                  </Badge>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Status Pengembalian */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Status Pengembalian</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              return (
                <div key={status} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="shrink-0">
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <Badge className={config.color}>{config.label}</Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      {status === 'pending' && 'Pengajuan sedang ditinjau oleh admin. Mohon tunggu konfirmasi via email.'}
                      {status === 'approved' && 'Pengajuan disetujui. Proses refund akan segera dilakukan ke metode pembayaran awal.'}
                      {status === 'rejected' && 'Pengajuan ditolak oleh admin. Lihat alasan penolakan di detail pengembalian.'}
                      {status === 'completed' && 'Proses pengembalian selesai. Refund telah dikirim ke rekening Anda.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Refund Information */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Refund</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900 font-semibold">Metode Refund</p>
                <p className="text-sm text-gray-600">Refund akan dikembalikan ke metode pembayaran awal yang Anda gunakan saat checkout (Virtual Account, E-Wallet, atau QRIS).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900 font-semibold">Waktu Proses</p>
                <p className="text-sm text-gray-600">Refund akan diproses dalam 3-7 hari kerja setelah pengajuan disetujui. Waktu sampai ke rekening tergantung bank masing-masing.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900 font-semibold">Jumlah Refund</p>
                <p className="text-sm text-gray-600">Jumlah refund mencakup harga produk yang dikembalikan. Ongkos kirim tidak dapat dikembalikan kecuali kesalahan dari pihak toko.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Produk yang Tidak Dapat Dikembalikan */}
        <Card className="p-6 mb-8 border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Produk yang Tidak Dapat Dikembalikan
          </h2>
          <ul className="space-y-2 text-sm text-red-800">
            <li className="flex items-start gap-2">
              <span className="shrink-0">•</span>
              <span>Produk yang sudah dibuka/digunakan (kecuali produk rusak/cacat)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0">•</span>
              <span>Produk custom atau pesanan khusus yang dibuat sesuai permintaan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0">•</span>
              <span>Produk yang rusak akibat kelalaian pelanggan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0">•</span>
              <span>Produk dengan kemasan yang rusak atau tidak lengkap (kecuali rusak saat pengiriman)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0">•</span>
              <span>Produk yang melewati batas waktu pengembalian (lebih dari 7 hari)</span>
            </li>
          </ul>
        </Card>

        {/* CTA Button */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Sudah siap untuk mengajukan pengembalian?</p>
          <Link href="/orders">
            <Button size="lg">
              <RotateCcw className="h-5 w-5 mr-2" />
              Lihat Pesanan Saya
            </Button>
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Pertanyaan Umum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Berapa lama proses persetujuan?</h3>
              <p className="text-sm text-gray-600">
                Admin akan meninjau pengajuan dalam 1-2 hari kerja. Anda akan mendapat notifikasi via email setelah pengajuan diproses.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Apakah ongkir dikembalikan?</h3>
              <p className="text-sm text-gray-600">
                Ongkos kirim hanya dikembalikan jika kesalahan dari pihak toko (produk salah kirim atau rusak). Untuk alasan lain, ongkir tidak dapat dikembalikan.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Bagaimana cara cek status pengembalian?</h3>
              <p className="text-sm text-gray-600">
                Login ke akun Anda, masuk ke halaman &quot;Pesanan Saya&quot;, lalu cek tab status pengembalian untuk melihat status terkini pengajuan Anda.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Apa yang terjadi jika ditolak?</h3>
              <p className="text-sm text-gray-600">
                Jika pengajuan ditolak, Anda akan menerima email dengan alasan penolakan dari admin. Anda dapat menghubungi customer service untuk klarifikasi.
              </p>
            </Card>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Masih ada pertanyaan tentang pengembalian?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button variant="outline">
                Hubungi Customer Service
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline">
                Lihat FAQ Lengkap
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
