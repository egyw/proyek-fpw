import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Package, 
  Shield, 
  Truck,
  Store,
  ChevronRight,
  Home
} from "lucide-react";

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>Beranda</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Tentang Kami</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tentang Kami
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Toko Pelita Bangunan adalah mitra terpercaya Anda untuk kebutuhan material bangunan berkualitas di Makassar
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* About Card */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Tentang Toko</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>
                Toko Pelita Bangunan hadir sebagai solusi lengkap untuk kebutuhan material bangunan Anda. 
                Kami menyediakan berbagai produk berkualitas dengan harga kompetitif dan pelayanan terbaik.
              </p>
              <p>
                Dengan pengalaman bertahun-tahun di industri material bangunan, kami berkomitmen untuk 
                memberikan produk terbaik dan layanan yang memuaskan kepada setiap pelanggan.
              </p>
            </div>
          </Card>

          {/* Location Card */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Lokasi Kami</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">Alamat:</p>
                <p className="text-gray-600">Jl. Bumi Tamalanrea Permai, Paccerakkang</p>
                <p className="text-gray-600">Kec. Biringkanaya, Kota Makassar</p>
                <p className="text-gray-600">Sulawesi Selatan 90562</p>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>081338697515</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>info@pelitabangunan.com</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Info Cards Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Business Hours */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">Jam Operasional</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Senin - Sabtu</span>
                <span className="font-medium text-gray-900">08:00 - 17:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Minggu</span>
                <span className="font-medium text-gray-900">08:00 - 17:00</span>
              </div>
            </div>
          </Card>

          {/* Shipping */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900">Pengiriman</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-600">Return gratis untuk barang rusak atau tidak sesuai</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-600">Proses pengiriman</span>
                <span className="font-medium text-gray-900">1-2 hari kerja</span>
              </div>
            </div>
          </Card>

          {/* Quality */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900">Kualitas Terjamin</h3>
            </div>
            <p className="text-sm text-gray-600">
              Semua produk kami dijamin kualitasnya dan bersertifikat SNI. 
              Kami hanya menjual produk dari brand terpercaya.
            </p>
          </Card>
        </div>

        {/* Why Choose Us */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Mengapa Memilih Kami?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Kami berkomitmen memberikan pengalaman terbaik untuk setiap pelanggan
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Produk Lengkap</h3>
              <p className="text-sm text-gray-600">
                Tersedia berbagai jenis material bangunan dalam satu tempat
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Kualitas Terjamin</h3>
              <p className="text-sm text-gray-600">
                Produk berkualitas tinggi dengan sertifikat SNI
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Pengiriman Cepat</h3>
              <p className="text-sm text-gray-600">
                Proses pengiriman 1-2 hari kerja ke seluruh Indonesia
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Layanan Ramah</h3>
              <p className="text-sm text-gray-600">
                Tim customer service siap membantu kebutuhan Anda
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="p-8 bg-linear-to-r from-primary to-primary/90 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">
            Siap Memulai Proyek Bangunan Anda?
          </h2>
          <p className="text-white/90 mb-6">
            Hubungi kami untuk konsultasi gratis atau kunjungi toko kami langsung
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6281338697515?text=Halo%20Toko%20Pelita%20Bangunan%2C%20saya%20ingin%20bertanya%20tentang%20produk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Phone className="h-5 w-5" />
              Hubungi Kami
            </a>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white/20"
            >
              <Package className="h-5 w-5" />
              Lihat Produk
            </Link>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
