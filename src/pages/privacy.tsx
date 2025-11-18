import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck, AlertTriangle, Mail, CheckCircle } from "lucide-react";

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Kebijakan Privasi
            </h1>
            <p className="text-lg text-gray-600">
              Terakhir diperbarui: 13 November 2025
            </p>
          </div>

          {/* Introduction */}
          <Card className="p-8 mb-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              Toko Pelita Bangunan berkomitmen untuk melindungi privasi dan keamanan 
              informasi pribadi Anda. Kebijakan privasi ini menjelaskan bagaimana kami 
              mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda 
              saat menggunakan layanan kami.
            </p>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-800">
                  <strong>Komitmen Kami:</strong> Kami tidak akan pernah menjual, 
                  menyewakan, atau membagikan informasi pribadi Anda kepada pihak ketiga 
                  tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.
                </p>
              </div>
            </div>
          </Card>

          {/* Section 1: Informasi yang Kami Kumpulkan */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Informasi yang Kami Kumpulkan</h2>
            </div>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  1.1. Informasi yang Anda Berikan
                </h3>
                <div className="pl-7 space-y-3">
                  <div>
                    <p className="font-medium mb-2">Informasi Akun:</p>
                    <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                      <li>Nama lengkap</li>
                      <li>Email</li>
                      <li>Nomor telepon</li>
                      <li>Username dan password (terenkripsi)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Informasi Pengiriman:</p>
                    <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                      <li>Alamat lengkap (jalan, kecamatan, kota, provinsi, kode pos)</li>
                      <li>Nama penerima</li>
                      <li>Nomor telepon penerima</li>
                      <li>Catatan alamat (opsional)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Informasi Transaksi:</p>
                    <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                      <li>Riwayat pesanan dan pembayaran</li>
                      <li>Produk yang dibeli</li>
                      <li>Metode pembayaran yang digunakan</li>
                      <li>Kode voucher atau diskon yang diterapkan</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  1.2. Informasi yang Dikumpulkan Secara Otomatis
                </h3>
                <div className="pl-7">
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Alamat IP dan lokasi geografis</li>
                    <li>Jenis browser dan sistem operasi</li>
                    <li>Halaman yang dikunjungi dan waktu akses</li>
                    <li>Produk yang dilihat dan ditambahkan ke keranjang</li>
                    <li>Cookies dan teknologi pelacakan serupa</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Bagaimana Kami Menggunakan Informasi */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Bagaimana Kami Menggunakan Informasi</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed mb-4">
                Informasi yang kami kumpulkan digunakan untuk tujuan berikut:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-900">Pemrosesan Pesanan</h4>
                  <p className="text-sm text-blue-800">
                    Memproses dan mengirimkan pesanan Anda, termasuk komunikasi 
                    terkait status pengiriman.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-900">Layanan Pelanggan</h4>
                  <p className="text-sm text-green-800">
                    Merespons pertanyaan, keluhan, atau permintaan dukungan dari Anda.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-900">Keamanan Akun</h4>
                  <p className="text-sm text-purple-800">
                    Melindungi akun Anda dari akses tidak sah dan aktivitas penipuan.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-orange-900">Peningkatan Layanan</h4>
                  <p className="text-sm text-orange-800">
                    Menganalisis penggunaan platform untuk meningkatkan produk dan layanan.
                  </p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-pink-900">Personalisasi</h4>
                  <p className="text-sm text-pink-800">
                    Memberikan rekomendasi produk yang sesuai dengan preferensi Anda.
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-yellow-900">Marketing</h4>
                  <p className="text-sm text-yellow-800">
                    Mengirimkan promosi, penawaran khusus, dan newsletter (dengan persetujuan).
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Berbagi Informasi dengan Pihak Ketiga */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Berbagi Informasi dengan Pihak Ketiga</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed mb-4">
                Kami hanya membagikan informasi pribadi Anda dengan pihak ketiga dalam 
                situasi berikut:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Mitra Logistik</p>
                    <p className="text-sm">
                      Kami membagikan informasi pengiriman (nama, alamat, nomor telepon) 
                      kepada mitra kurir (JNE, J&T, SiCepat, dll) untuk mengirimkan 
                      pesanan Anda.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Payment Gateway</p>
                    <p className="text-sm">
                      Informasi pembayaran diproses melalui Midtrans dengan enkripsi 
                      standar industri. Kami tidak menyimpan detail kartu kredit Anda.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Penyedia Layanan</p>
                    <p className="text-sm">
                      Pihak ketiga yang membantu operasional kami (hosting, email, 
                      analytics) dengan perjanjian kerahasiaan yang ketat.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Kewajiban Hukum</p>
                    <p className="text-sm">
                      Jika diwajibkan oleh hukum atau untuk mematuhi proses hukum, 
                      kami dapat mengungkapkan informasi Anda kepada pihak berwenang.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800">
                    <strong>Catatan Penting:</strong> Kami TIDAK PERNAH menjual atau 
                    menyewakan data pribadi Anda kepada pihak ketiga untuk tujuan marketing 
                    atau komersial mereka.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 4: Keamanan Data */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Keamanan Data</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed mb-4">
                Kami menerapkan berbagai langkah keamanan untuk melindungi informasi 
                pribadi Anda:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Lock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Enkripsi SSL/TLS</p>
                    <p className="text-sm">
                      Semua data yang dikirimkan antara browser Anda dan server kami 
                      dienkripsi menggunakan protokol HTTPS.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Lock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Password Hashing</p>
                    <p className="text-sm">
                      Password Anda disimpan dalam bentuk hash menggunakan algoritma 
                      bcrypt yang tidak dapat dikembalikan.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Lock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Akses Terbatas</p>
                    <p className="text-sm">
                      Hanya karyawan yang berwenang yang memiliki akses ke data pribadi 
                      untuk keperluan operasional.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Lock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Monitoring Keamanan</p>
                    <p className="text-sm">
                      Sistem kami dipantau secara berkala untuk mendeteksi dan mencegah 
                      aktivitas mencurigakan.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>Peringatan:</strong> Meskipun kami menerapkan standar keamanan 
                  terbaik, tidak ada metode transmisi data melalui internet yang 100% aman. 
                  Kami tidak dapat menjamin keamanan absolut.
                </p>
              </div>
            </div>
          </Card>

          {/* Section 5: Cookies dan Teknologi Pelacakan */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cookies dan Teknologi Pelacakan</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed mb-4">
                Kami menggunakan cookies untuk meningkatkan pengalaman Anda:
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Cookies Esensial</p>
                  <p className="text-sm">
                    Diperlukan untuk fungsi dasar website (login, keranjang belanja, 
                    keamanan). Tidak dapat dinonaktifkan.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Cookies Preferensi</p>
                  <p className="text-sm">
                    Menyimpan pengaturan Anda seperti bahasa, mata uang, dan preferensi 
                    tampilan.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Cookies Analytics</p>
                  <p className="text-sm">
                    Membantu kami memahami bagaimana pengunjung menggunakan website 
                    untuk perbaikan layanan.
                  </p>
                </div>
              </div>
              <p className="text-sm mt-4">
                Anda dapat mengatur browser Anda untuk menolak cookies, namun beberapa 
                fitur website mungkin tidak berfungsi dengan baik.
              </p>
            </div>
          </Card>

          {/* Section 6: Hak Anda */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Hak Anda atas Data Pribadi</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed mb-4">
                Sesuai dengan regulasi perlindungan data, Anda memiliki hak-hak berikut:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Hak Akses</p>
                    <p className="text-sm">
                      Meminta salinan data pribadi yang kami simpan tentang Anda.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Hak Perbaikan</p>
                    <p className="text-sm">
                      Memperbarui atau memperbaiki informasi yang tidak akurat atau tidak lengkap.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Hak Penghapusan</p>
                    <p className="text-sm">
                      Meminta penghapusan data pribadi Anda dalam kondisi tertentu.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Hak Pembatasan</p>
                    <p className="text-sm">
                      Membatasi pemrosesan data pribadi Anda dalam situasi tertentu.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Hak Portabilitas</p>
                    <p className="text-sm">
                      Menerima data pribadi Anda dalam format yang dapat dibaca mesin.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Hak Keberatan</p>
                    <p className="text-sm">
                      Menolak pemrosesan data untuk tujuan marketing atau kepentingan sah kami.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm mt-4 bg-blue-50 p-4 rounded-lg">
                Untuk menggunakan hak-hak di atas, silakan hubungi kami melalui informasi 
                kontak yang tercantum di bagian bawah halaman ini.
              </p>
            </div>
          </Card>

          {/* Section 7: Penyimpanan Data */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Penyimpanan dan Retensi Data</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Kami menyimpan data pribadi Anda selama diperlukan untuk memenuhi tujuan 
                yang dijelaskan dalam kebijakan ini atau selama diwajibkan oleh hukum:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong>Data Akun:</strong> Disimpan selama akun Anda aktif, ditambah 
                  12 bulan setelah penutupan akun untuk keperluan audit dan hukum.
                </li>
                <li>
                  <strong>Data Transaksi:</strong> Disimpan minimal 10 tahun sesuai 
                  peraturan perpajakan dan akuntansi Indonesia.
                </li>
                <li>
                  <strong>Data Marketing:</strong> Disimpan hingga Anda mencabut persetujuan 
                  atau meminta penghapusan.
                </li>
                <li>
                  <strong>Cookies:</strong> Masa berlaku bervariasi (session hingga 1 tahun).
                </li>
              </ul>
            </div>
          </Card>

          {/* Section 8: Privasi Anak-anak */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Privasi Anak-anak</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Layanan kami tidak ditujukan untuk anak-anak di bawah usia 18 tahun. 
                Kami tidak dengan sengaja mengumpulkan informasi pribadi dari anak-anak. 
                Jika Anda adalah orang tua atau wali dan mengetahui bahwa anak Anda telah 
                memberikan informasi pribadi kepada kami, silakan hubungi kami agar kami 
                dapat menghapus informasi tersebut.
              </p>
            </div>
          </Card>

          {/* Section 9: Perubahan Kebijakan */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Perubahan Kebijakan Privasi</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu untuk 
                mencerminkan perubahan dalam praktik kami atau karena alasan operasional, 
                hukum, atau regulasi lainnya. Perubahan material akan diberitahukan melalui 
                email atau pemberitahuan di website.
              </p>
              <p className="leading-relaxed">
                Kami mendorong Anda untuk meninjau kebijakan ini secara berkala untuk 
                tetap mendapatkan informasi tentang bagaimana kami melindungi data Anda.
              </p>
            </div>
          </Card>

          {/* Section 10: Hubungi Kami */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Hubungi Kami</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed mb-4">
                Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait 
                kebijakan privasi ini atau pemrosesan data pribadi Anda, silakan hubungi 
                kami melalui:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="font-semibold min-w-[100px]">Toko:</span>
                  <span>Toko Pelita Bangunan</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-semibold min-w-[100px]">Telepon:</span>
                  <span>081338697515</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-semibold min-w-[100px]">Alamat:</span>
                  <span>Jl. Bumi Tamalanrea Permai, Paccerakkang, Biringkanaya, Makassar, Sulawesi Selatan 90562</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-semibold min-w-[100px]">Jam Kerja:</span>
                  <div>
                    <p>Senin - Minggu: 08:00 - 17:00 WITA</p>
                  </div>
                </div>
              </div>
              <p className="text-sm mt-4">
                Kami akan merespons permintaan Anda dalam waktu 30 hari kerja sesuai 
                dengan regulasi yang berlaku.
              </p>
            </div>
          </Card>

          {/* Final Notice */}
          <Card className="p-8 bg-primary/5 border-2 border-primary/20">
            <div className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Komitmen Perlindungan Data
              </h3>
              <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
                Dengan menggunakan layanan Toko Pelita Bangunan, Anda menyatakan bahwa 
                telah membaca dan memahami kebijakan privasi ini serta menyetujui 
                pengumpulan dan penggunaan informasi seperti yang dijelaskan di atas.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
