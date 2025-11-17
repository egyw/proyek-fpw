import MainLayout from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Clock, Package, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function ShippingPage() {
  const couriers = [
    { name: 'JNE', logo: '/images/jasa-pengiriman/jne.png', services: ['REG', 'YES', 'OKE'] },
    { name: 'POS Indonesia', logo: '/images/jasa-pengiriman/post_indonesia.png', services: ['Reguler', 'Express'] },
    { name: 'TIKI', logo: '/images/jasa-pengiriman/tiki.png', services: ['REG', 'ONS', 'ECO'] },
    { name: 'SiCepat', logo: '/images/jasa-pengiriman/sicepat.png', services: ['REG', 'BEST', 'GOKIL'] },
    { name: 'J&T Express', logo: '/images/jasa-pengiriman/j&t.jpg', services: ['REG', 'EZ'] },
    { name: 'Ninja Xpress', logo: '/images/jasa-pengiriman/ninja.png', services: ['REG', 'Express'] },
    { name: 'ID Express', logo: '/images/jasa-pengiriman/id.jpg', services: ['REG', 'Express'] },
    { name: 'SAP Express', logo: '/images/jasa-pengiriman/sap.png', services: ['REG', 'Express'] },
    { name: 'Wahana', logo: '/images/jasa-pengiriman/wahana.png', services: ['REG', 'Express'] },
    { name: 'Lion Parcel', logo: '/images/jasa-pengiriman/lion.png', services: ['REG', 'REGPACK'] },
    { name: 'Royal Express', logo: '/images/jasa-pengiriman/royal.png', services: ['REG', 'Express'] },
  ];

  const shippingSteps = [
    {
      icon: Package,
      title: 'Pesanan Diproses',
      description: 'Setelah pembayaran diterima, kami akan segera memproses pesanan Anda dan mempersiapkan barang untuk dikirim.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Truck,
      title: 'Dikirim ke Ekspedisi',
      description: 'Pesanan diserahkan ke ekspedisi pilihan Anda. Nomor resi akan dikirim via email dan tampil di halaman "Pesanan Saya".',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: MapPin,
      title: 'Dalam Perjalanan',
      description: 'Paket sedang dalam perjalanan ke alamat tujuan. Anda dapat melacak paket dengan nomor resi di website ekspedisi.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: CheckCircle,
      title: 'Paket Tiba',
      description: 'Paket telah sampai di alamat tujuan. Mohon konfirmasi penerimaan di halaman "Pesanan Saya" setelah menerima barang.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Informasi Pengiriman
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kami bekerja sama dengan berbagai ekspedisi terpercaya untuk memastikan produk sampai dengan aman dan tepat waktu
          </p>
        </div>

        {/* Shipping Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pengiriman dari Makassar</h3>
                <p className="text-sm text-gray-600">
                  Semua produk dikirim dari gudang kami di Makassar, Sulawesi Selatan
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Estimasi Real-Time</h3>
                <p className="text-sm text-gray-600">
                  Estimasi waktu dan biaya pengiriman dihitung otomatis saat checkout berdasarkan lokasi Anda
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">11 Pilihan Ekspedisi</h3>
                <p className="text-sm text-gray-600">
                  Pilih ekspedisi favorit Anda dengan layanan REG, Express, atau ekonomis
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Shipping Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Proses Pengiriman
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shippingSteps.map((step, index) => (
              <Card key={index} className="p-6 text-center">
                <div className={`w-16 h-16 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
                <div className="mb-3">
                  <Badge variant="outline" className="text-xs">
                    Langkah {index + 1}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Available Couriers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Ekspedisi yang Tersedia
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Pilihan ekspedisi dan layanan akan muncul otomatis saat checkout berdasarkan lokasi tujuan Anda
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {couriers.map((courier, index) => (
              <Card key={index} className="p-4 text-center hover:shadow-lg transition-shadow">
                <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center mb-3 p-4 relative">
                  <Image src={courier.logo} alt={courier.name} fill className="object-contain p-2" sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{courier.name}</h3>
                <div className="flex flex-wrap justify-center gap-1">
                  {courier.services.map((service, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* How to Calculate Shipping */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Cara Menghitung Ongkos Kirim
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Berat Total Produk</h3>
                  <p className="text-sm text-gray-600">
                    Sistem otomatis menghitung berat berdasarkan produk di keranjang, termasuk konversi unit (misal: 2 sak semen = 100kg)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Jarak Pengiriman</h3>
                  <p className="text-sm text-gray-600">
                    Dihitung dari Makassar ke kota tujuan Anda berdasarkan alamat yang dipilih saat checkout
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Layanan Ekspedisi</h3>
                  <p className="text-sm text-gray-600">
                    Setiap layanan (REG/Express/Ekonomis) memiliki tarif dan estimasi waktu berbeda
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Harga Real-Time</h3>
                  <p className="text-sm text-gray-600">
                    Ongkir dihitung real-time menggunakan API RajaOngkir, langsung dari ekspedisi resmi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tracking Info */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Cara Melacak Paket
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-blue-600">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Cek Nomor Resi</h3>
                <p className="text-sm text-gray-600">
                  Setelah pesanan dikirim, nomor resi otomatis muncul di halaman <strong>&quot;Pesanan Saya&quot;</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-blue-600">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Klik Nomor Resi</h3>
                <p className="text-sm text-gray-600">
                  Klik nomor resi untuk membuka halaman tracking di website ekspedisi terkait
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-blue-600">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Pantau Status Pengiriman</h3>
                <p className="text-sm text-gray-600">
                  Status pesanan akan terupdate otomatis: <strong>Menunggu Pembayaran → Dibayar → Diproses → Dikirim → Sudah Sampai → Selesai</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-blue-600">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Konfirmasi Penerimaan</h3>
                <p className="text-sm text-gray-600">
                  Setelah paket tiba, jangan lupa konfirmasi penerimaan di detail pesanan untuk menyelesaikan transaksi
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
