import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Syarat dan Ketentuan
            </h1>
            <p className="text-lg text-gray-600">
              Terakhir diperbarui: 13 November 2025
            </p>
          </div>

          {/* Introduction */}
          <Card className="p-8 mb-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              Selamat datang di Toko Pelita Bangunan. Dengan mengakses dan menggunakan 
              layanan kami, Anda setuju untuk terikat dengan syarat dan ketentuan berikut. 
              Mohon baca dengan seksama sebelum melakukan pemesanan.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>Penting:</strong> Jika Anda tidak setuju dengan syarat dan ketentuan 
                ini, harap tidak menggunakan layanan kami.
              </p>
            </div>
          </Card>

          {/* Section 1: Definisi */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Definisi</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="font-semibold mb-2">1.1. Platform</p>
                <p className="leading-relaxed pl-4">
                  Platform mengacu pada website Toko Pelita Bangunan dan semua layanan 
                  yang disediakan melalui website tersebut.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">1.2. Pengguna</p>
                <p className="leading-relaxed pl-4">
                  Pengguna adalah setiap individu atau badan hukum yang mengakses dan 
                  menggunakan Platform untuk melakukan transaksi pembelian.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">1.3. Produk</p>
                <p className="leading-relaxed pl-4">
                  Produk adalah material bangunan dan barang-barang terkait konstruksi 
                  yang dijual melalui Platform.
                </p>
              </div>
            </div>
          </Card>

          {/* Section 2: Pendaftaran Akun */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Pendaftaran Akun</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">2.1. Kewajiban Pengguna</p>
                  <p className="leading-relaxed">
                    Pengguna wajib memberikan informasi yang akurat, lengkap, dan terkini 
                    saat mendaftar akun. Informasi yang tidak benar dapat mengakibatkan 
                    penangguhan atau penghapusan akun.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">2.2. Keamanan Akun</p>
                  <p className="leading-relaxed">
                    Pengguna bertanggung jawab untuk menjaga kerahasiaan password dan 
                    semua aktivitas yang terjadi di akun mereka. Segera laporkan jika 
                    terjadi penggunaan akun yang tidak sah.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">2.3. Syarat Usia</p>
                  <p className="leading-relaxed">
                    Pengguna harus berusia minimal 18 tahun atau memiliki izin dari orang 
                    tua/wali untuk menggunakan Platform dan melakukan transaksi.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Pemesanan dan Pembayaran */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">3</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Pemesanan dan Pembayaran</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="font-semibold mb-2">3.1. Proses Pemesanan</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Pesanan dianggap sah setelah pembayaran dikonfirmasi</li>
                  <li>Harga produk yang tertera sudah termasuk PPN 11%</li>
                  <li>Kami berhak menolak pesanan jika stok tidak tersedia</li>
                  <li>Konfirmasi pesanan akan dikirim melalui email</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">3.2. Metode Pembayaran</p>
                <p className="leading-relaxed pl-4 mb-2">
                  Kami menerima pembayaran melalui:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-8">
                  <li>Transfer Bank (BCA, Mandiri, BNI, BRI)</li>
                  <li>E-Wallet (GoPay, ShopeePay, QRIS)</li>
                  <li>Virtual Account</li>
                  <li>Cash on Delivery (untuk area tertentu)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">3.3. Batas Waktu Pembayaran</p>
                <p className="leading-relaxed pl-4">
                  Pembayaran harus diselesaikan dalam waktu 60 menit setelah pemesanan 
                  dibuat. Pesanan akan otomatis dibatalkan jika pembayaran tidak diterima 
                  dalam batas waktu tersebut.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">3.4. Voucher dan Diskon</p>
                <p className="leading-relaxed pl-4">
                  Voucher dan kode diskon memiliki syarat dan ketentuan masing-masing. 
                  Satu voucher hanya dapat digunakan untuk satu transaksi dan tidak dapat 
                  ditukar dengan uang tunai.
                </p>
              </div>
            </div>
          </Card>

          {/* Section 4: Pengiriman */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">4</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Pengiriman</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="font-semibold mb-2">4.1. Area Pengiriman</p>
                <p className="leading-relaxed pl-4">
                  Kami melayani pengiriman ke seluruh Indonesia melalui mitra logistik 
                  terpercaya (JNE, J&T, SiCepat, dll). Biaya pengiriman dihitung otomatis 
                  berdasarkan berat dan tujuan.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">4.2. Estimasi Pengiriman</p>
                <p className="leading-relaxed pl-4 mb-2">
                  Estimasi waktu pengiriman tergantung pada:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-8">
                  <li>Jasa kurir yang dipilih</li>
                  <li>Lokasi tujuan pengiriman</li>
                  <li>Ketersediaan produk di gudang</li>
                  <li>Kondisi cuaca dan lalu lintas</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">4.3. Pemeriksaan Barang</p>
                <p className="leading-relaxed pl-4">
                  Pengguna wajib memeriksa kondisi barang saat diterima. Laporkan segera 
                  jika terdapat kerusakan atau ketidaksesuaian dalam waktu maksimal 1x24 jam 
                  setelah penerimaan.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">4.4. Tanggung Jawab Pengiriman</p>
                <p className="leading-relaxed pl-4">
                  Kami tidak bertanggung jawab atas keterlambatan yang disebabkan oleh 
                  force majeure, kesalahan alamat pengiriman yang diberikan pembeli, atau 
                  penerima tidak berada di tempat.
                </p>
              </div>
            </div>
          </Card>

          {/* Section 5: Pengembalian dan Penukaran */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">5</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Pengembalian dan Penukaran</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="font-semibold mb-2">5.1. Kondisi Pengembalian</p>
                <p className="leading-relaxed pl-4 mb-2">
                  Produk dapat dikembalikan dalam kondisi berikut:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-8">
                  <li>Produk rusak atau cacat produksi</li>
                  <li>Produk tidak sesuai dengan pesanan</li>
                  <li>Produk kurang atau tidak lengkap</li>
                  <li>Kesalahan pengiriman dari pihak kami</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">5.2. Syarat Pengembalian</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Pengajuan maksimal 7 hari sejak barang diterima</li>
                  <li>Produk dalam kondisi asli dan belum digunakan</li>
                  <li>Kemasan dan label masih utuh</li>
                  <li>Menyertakan bukti pembelian dan foto produk</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">5.3. Produk yang Tidak Dapat Dikembalikan</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Produk custom atau pesanan khusus</li>
                  <li>Produk yang sudah dibuka atau digunakan</li>
                  <li>Produk yang rusak karena kesalahan pengguna</li>
                  <li>Produk dalam kategori sale atau clearance</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">5.4. Proses Pengembalian Dana</p>
                <p className="leading-relaxed pl-4">
                  Setelah pengembalian produk disetujui, dana akan dikembalikan dalam 
                  waktu 7-14 hari kerja ke metode pembayaran awal atau ke saldo akun.
                </p>
              </div>
            </div>
          </Card>

          {/* Section 6: Hak Kekayaan Intelektual */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">6</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Hak Kekayaan Intelektual</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Semua konten yang terdapat dalam Platform, termasuk namun tidak terbatas 
                pada teks, gambar, logo, ikon, video, dan perangkat lunak adalah milik 
                Toko Pelita Bangunan atau pemberi lisensi kami. Dilarang menggunakan, 
                menyalin, atau mendistribusikan konten tanpa izin tertulis dari kami.
              </p>
            </div>
          </Card>

          {/* Section 7: Batasan Tanggung Jawab */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">7</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Batasan Tanggung Jawab</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-yellow-800">
                    <strong>Penting:</strong> Kami tidak bertanggung jawab atas kerugian 
                    tidak langsung, insidental, atau konsekuensial yang timbul dari 
                    penggunaan Platform atau produk.
                  </p>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2">7.1. Informasi Produk</p>
                <p className="leading-relaxed pl-4">
                  Kami berusaha memberikan informasi produk yang akurat, namun tidak 
                  menjamin bahwa semua deskripsi, gambar, atau konten lain bebas dari 
                  kesalahan. Warna produk pada layar mungkin berbeda dengan aslinya.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">7.2. Ketersediaan Stok</p>
                <p className="leading-relaxed pl-4">
                  Kami berhak membatalkan pesanan jika produk tidak tersedia atau terjadi 
                  kesalahan harga yang signifikan. Dana akan dikembalikan secara penuh 
                  dalam kasus ini.
                </p>
              </div>
            </div>
          </Card>

          {/* Section 8: Perubahan Syarat dan Ketentuan */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">8</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Perubahan Syarat dan Ketentuan</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Kami berhak mengubah atau memperbarui syarat dan ketentuan ini sewaktu-waktu 
                tanpa pemberitahuan sebelumnya. Perubahan akan berlaku segera setelah 
                dipublikasikan di Platform. Pengguna disarankan untuk memeriksa halaman 
                ini secara berkala.
              </p>
              <p className="leading-relaxed">
                Dengan terus menggunakan Platform setelah perubahan dipublikasikan, 
                Anda dianggap telah menerima dan menyetujui perubahan tersebut.
              </p>
            </div>
          </Card>

          {/* Section 9: Hukum yang Berlaku */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">9</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Hukum yang Berlaku</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Syarat dan ketentuan ini diatur dan ditafsirkan sesuai dengan hukum 
                Republik Indonesia. Setiap perselisihan yang timbul akan diselesaikan 
                melalui musyawarah. Jika tidak tercapai kesepakatan, perselisihan akan 
                diselesaikan melalui pengadilan di wilayah Makassar, Sulawesi Selatan.
              </p>
            </div>
          </Card>

          {/* Section 10: Kontak */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">10</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Hubungi Kami</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed mb-4">
                Jika Anda memiliki pertanyaan atau memerlukan klarifikasi mengenai 
                syarat dan ketentuan ini, silakan hubungi kami melalui:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="font-semibold min-w-[100px]">Telepon:</span>
                  <span>081338697515</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-semibold min-w-[100px]">Alamat:</span>
                  <span>Jl. Bumi Tamalanrea Permai, Paccerakkang, Biringkanaya, Makassar, Sulawesi Selatan 90562</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-semibold min-w-[100px]">Jam Operasional:</span>
                  <div>
                    <p>Senin - Minggu: 08:00 - 17:00 WITA</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Acceptance Notice */}
          <Card className="p-8 bg-primary/5 border-2 border-primary/20">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Persetujuan Syarat dan Ketentuan
              </h3>
              <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
                Dengan menggunakan layanan Toko Pelita Bangunan, Anda menyatakan bahwa 
                telah membaca, memahami, dan menyetujui semua syarat dan ketentuan yang 
                tercantum dalam dokumen ini.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
