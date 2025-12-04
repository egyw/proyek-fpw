import MainLayout from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Store, Building2, Clock, CheckCircle, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function PaymentPage() {
  const paymentMethods = [
    {
      category: 'Virtual Account',
      icon: Building2,
      color: 'blue',
      description: 'Transfer bank melalui nomor Virtual Account yang unik untuk setiap transaksi',
      methods: [
        { name: 'BCA Virtual Account', logo: '/images/pembayaran/bca.png', time: '15 menit + 45 menit' },
        { name: 'Mandiri Virtual Account', logo: '/images/pembayaran/mandiri.png', time: '15 menit + 45 menit' },
        { name: 'BNI Virtual Account', logo: '/images/pembayaran/bni.png', time: '15 menit + 45 menit' },
        { name: 'BRI Virtual Account', logo: '/images/pembayaran/bri.png', time: '15 menit + 45 menit' },
        { name: 'Permata Virtual Account', logo: '/images/pembayaran/permata.png', time: '15 menit + 45 menit' },
      ],
    },
    {
      category: 'E-Wallet',
      icon: Smartphone,
      color: 'green',
      description: 'Bayar cepat menggunakan dompet digital favorit Anda',
      methods: [
        { name: 'GoPay', logo: '/images/pembayaran/gopay.png', time: '15 menit + 45 menit' },
        { name: 'ShopeePay', logo: '/images/pembayaran/shopeepay.png', time: '15 menit + 45 menit' },
        { name: 'QRIS', logo: '/images/pembayaran/qris.png', time: '15 menit + 45 menit' },
      ],
    },
    {
      category: 'Convenience Store',
      icon: Store,
      color: 'orange',
      description: 'Bayar tunai di minimarket terdekat dengan kode pembayaran',
      methods: [
        { name: 'Alfamart', logo: '/images/pembayaran/alfamart.png', time: '15 menit + 45 menit' },
        { name: 'Indomaret', logo: '/images/pembayaran/indomaret.png', time: '15 menit + 45 menit' },
      ],
    },
  ];

  const paymentSteps = [
    {
      icon: CreditCard,
      title: 'Pilih Produk',
      description: 'Tambahkan produk yang diinginkan ke keranjang belanja dan lanjutkan ke checkout',
      color: 'blue',
    },
    {
      icon: CheckCircle,
      title: 'Pilih Metode Pembayaran',
      description: 'Popup Midtrans akan muncul, pilih metode pembayaran yang Anda inginkan (15 menit untuk memilih)',
      color: 'purple',
    },
    {
      icon: Clock,
      title: 'Lakukan Pembayaran',
      description: 'Ikuti instruksi pembayaran yang diberikan. Selesaikan pembayaran dalam 45 menit setelah memilih metode',
      color: 'yellow',
    },
    {
      icon: ShieldCheck,
      title: 'Konfirmasi Otomatis',
      description: 'Setelah pembayaran berhasil, status pesanan akan otomatis berubah dan Anda akan menerima notifikasi',
      color: 'green',
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Metode Pembayaran</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kami bekerja sama dengan Midtrans untuk menyediakan berbagai metode pembayaran yang aman dan mudah untuk kenyamanan Anda.
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex justify-center mb-8">
          <Card className="p-4 inline-flex items-center gap-3 border-green-200 bg-green-50">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-semibold text-green-900">Pembayaran Aman dengan Midtrans</p>
              <p className="text-xs text-green-700">Semua transaksi dilindungi dengan enkripsi tingkat bank</p>
            </div>
          </Card>
        </div>

        {/* Payment Methods */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Metode Pembayaran yang Tersedia</h2>
          <div className="space-y-8">
            {paymentMethods.map((category, idx) => {
              const Icon = category.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600 border-blue-200',
                green: 'bg-green-50 text-green-600 border-green-200',
                orange: 'bg-orange-50 text-orange-600 border-orange-200',
              };

              return (
                <Card key={idx} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 ${colorClasses[category.color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {category.methods.map((method, index) => (
                      <Card key={index} className="p-4 text-center hover:shadow-md transition-shadow border-gray-200">
                        <div className="w-full aspect-video bg-white rounded-lg flex items-center justify-center mb-3 p-2 relative">
                          <Image
                            src={method.logo}
                            alt={method.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-contain"
                          />
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm mb-2">{method.name}</h4>
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>{method.time}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Payment Time Explanation */}
        <Card className="p-6 mb-8 border-blue-200 bg-blue-50">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Waktu Pembayaran (60 Menit Total)
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-700 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">15 Menit - Pilih Metode Pembayaran</h3>
                <p className="text-sm text-blue-800">
                  Setelah klik &quot;Bayar Sekarang&quot;, popup Midtrans akan muncul. Anda memiliki 15 menit untuk browsing dan memilih metode pembayaran yang diinginkan (Virtual Account, E-Wallet, atau Convenience Store).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-700 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">45 Menit - Selesaikan Pembayaran</h3>
                <p className="text-sm text-blue-800">
                  Setelah memilih metode pembayaran, Anda mendapat 45 menit tambahan untuk menyelesaikan transaksi. Waktu ini cukup untuk transfer via m-banking, scan QRIS, atau pergi ke minimarket.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>⏰ Total Waktu:</strong> 15 menit (pilih metode) + 45 menit (bayar) = <strong>60 menit</strong> sejak pesanan dibuat. Jika melewati batas waktu, pesanan akan otomatis dibatalkan.
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Cara Melakukan Pembayaran</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paymentSteps.map((step, index) => {
              const Icon = step.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600',
                purple: 'bg-purple-50 text-purple-600',
                yellow: 'bg-yellow-50 text-yellow-600',
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

        {/* Virtual Account Guide */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Cara Bayar dengan Virtual Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Via Mobile Banking:</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">1.</span>
                  <span>Pilih Virtual Account di popup Midtrans (contoh: BCA VA)</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">2.</span>
                  <span>Salin nomor Virtual Account yang muncul</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">3.</span>
                  <span>Buka aplikasi m-banking (contoh: BCA mobile)</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">4.</span>
                  <span>Pilih menu Transfer → Virtual Account</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">5.</span>
                  <span>Masukkan nomor VA dan nominal sesuai tagihan</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">6.</span>
                  <span>Konfirmasi dan selesaikan transaksi</span>
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Via ATM:</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">1.</span>
                  <span>Catat nomor Virtual Account dari popup Midtrans</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">2.</span>
                  <span>Kunjungi ATM sesuai bank VA (contoh: ATM BCA)</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">3.</span>
                  <span>Pilih menu Transaksi Lainnya</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">4.</span>
                  <span>Pilih Transfer → Virtual Account Billing</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">5.</span>
                  <span>Masukkan nomor Virtual Account</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">6.</span>
                  <span>Konfirmasi detail pembayaran dan selesaikan</span>
                </li>
              </ol>
            </div>
          </div>
        </Card>

        {/* E-Wallet Guide */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Cara Bayar dengan E-Wallet & QRIS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">GoPay / ShopeePay:</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">1.</span>
                  <span>Pilih GoPay atau ShopeePay di popup Midtrans</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">2.</span>
                  <span>QR Code akan muncul di layar</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">3.</span>
                  <span>Buka aplikasi GoPay/ShopeePay di HP Anda</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">4.</span>
                  <span>Scan QR Code yang ditampilkan</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">5.</span>
                  <span>Verifikasi transaksi dengan PIN aplikasi</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">6.</span>
                  <span>Pembayaran selesai, tunggu konfirmasi otomatis</span>
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">QRIS (Semua E-Wallet):</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">1.</span>
                  <span>Pilih QRIS di popup Midtrans</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">2.</span>
                  <span>QR Code QRIS akan ditampilkan</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">3.</span>
                  <span>Buka e-wallet favorit Anda (GoPay, OVO, DANA, dll)</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">4.</span>
                  <span>Pilih fitur Scan/Bayar QRIS</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">5.</span>
                  <span>Scan QR Code yang ditampilkan</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-semibold">6.</span>
                  <span>Konfirmasi pembayaran dengan PIN e-wallet</span>
                </li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Convenience Store Guide */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Cara Bayar di Minimarket (Alfamart / Indomaret)
          </h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="shrink-0 font-semibold">1.</span>
              <span>Pilih Alfamart atau Indomaret di popup Midtrans</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-semibold">2.</span>
              <span>Kode pembayaran akan muncul - catat atau screenshot kode tersebut</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-semibold">3.</span>
              <span>Kunjungi gerai Alfamart/Indomaret terdekat (dalam 45 menit)</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-semibold">4.</span>
              <span>Sampaikan ke kasir bahwa Anda ingin melakukan pembayaran dengan kode</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-semibold">5.</span>
              <span>Berikan kode pembayaran kepada kasir</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-semibold">6.</span>
              <span>Bayar tunai sesuai nominal yang tertera</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-semibold">7.</span>
              <span>Simpan struk pembayaran sebagai bukti transaksi</span>
            </li>
          </ol>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Tips:</strong> Pastikan Anda sampai di minimarket sebelum waktu pembayaran habis (45 menit setelah pilih metode). Bawa HP untuk menunjukkan kode pembayaran.
            </p>
          </div>
        </Card>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Pertanyaan Umum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Apakah pembayaran aman?</h3>
              <p className="text-sm text-gray-600">
                Ya, semua transaksi diproses melalui Midtrans yang menggunakan enkripsi tingkat bank dan tersertifikasi PCI DSS Level 1. Data pembayaran Anda 100% aman.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Berapa lama konfirmasi pembayaran?</h3>
              <p className="text-sm text-gray-600">
                Konfirmasi pembayaran biasanya instan untuk Virtual Account dan E-Wallet. Untuk Convenience Store, konfirmasi akan diterima dalam 5-10 menit setelah pembayaran di kasir.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Apa yang terjadi jika melewati batas waktu?</h3>
              <p className="text-sm text-gray-600">
                Pesanan akan otomatis dibatalkan jika pembayaran tidak diselesaikan dalam 60 menit. Status pesanan akan berubah menjadi &quot;Expired&quot; dan Anda perlu membuat pesanan baru.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Apakah ada biaya admin?</h3>
              <p className="text-sm text-gray-600">
                Tidak ada biaya admin tambahan dari toko kami. Namun, beberapa metode pembayaran mungkin dikenakan biaya admin oleh penyedia layanan (bank/e-wallet), silakan cek di aplikasi masing-masing.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
