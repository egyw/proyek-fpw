import MainLayout from '@/components/layouts/MainLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    {
      category: 'Pemesanan',
      questions: [
        {
          q: 'Bagaimana cara melakukan pemesanan?',
          a: 'Anda dapat melakukan pemesanan dengan cara: 1) Browse produk di katalog, 2) Pilih produk yang diinginkan, 3) Klik "Tambah ke Keranjang" (bisa atur jumlah dan unit dengan kalkulator jika tersedia), 4) Lihat keranjang dan klik "Checkout", 5) Login atau registrasi jika belum punya akun, 6) Pilih/tambah alamat pengiriman, 7) Pilih ekspedisi dan layanan pengiriman, 8) Terapkan voucher diskon jika ada, 9) Pilih metode pembayaran via Midtrans, 10) Selesaikan pembayaran dalam 60 menit.',
        },
        {
          q: 'Apakah bisa pesan tanpa registrasi?',
          a: 'Anda bisa browse produk dan menambahkan ke keranjang tanpa login (guest). Namun untuk checkout dan menyelesaikan pemesanan, Anda HARUS login atau registrasi terlebih dahulu. Registrasi mudah, hanya perlu username, nama lengkap, email, nomor HP, dan password.',
        },
        {
          q: 'Apakah ada minimum pemesanan?',
          a: 'Tidak ada minimum pemesanan. Anda dapat membeli produk sesuai kebutuhan, baik dalam jumlah satuan maupun grosir.',
        },
        {
          q: 'Bagaimana cara mengubah pesanan yang sudah dibuat?',
          a: 'Pesanan yang sudah dibuat tidak bisa diubah. Jika belum dibayar, biarkan pesanan expired (60 menit) lalu buat pesanan baru. Jika sudah dibayar tapi belum diproses admin, hubungi customer service via chat/WhatsApp untuk pembatalan.',
        },
      ],
    },
    {
      category: 'Pembayaran',
      questions: [
        {
          q: 'Metode pembayaran apa saja yang tersedia?',
          a: 'Kami menggunakan payment gateway Midtrans dengan berbagai metode: Virtual Account (BCA, Mandiri, BNI, BRI, Permata), E-Wallet (GoPay, ShopeePay), QRIS (scan QR code), dan pembayaran di minimarket (Alfamart, Indomaret). Semua pembayaran langsung melalui popup Midtrans Snap yang aman.',
        },
        {
          q: 'Berapa lama batas waktu pembayaran?',
          a: 'Total waktu 60 menit sejak checkout: 1) 15 menit untuk membuka popup Midtrans dan memilih metode pembayaran, 2) 45 menit untuk menyelesaikan pembayaran (transfer VA, scan QRIS, atau bayar di minimarket). Countdown timer ditampilkan di halaman detail pesanan.',
        },
        {
          q: 'Bagaimana jika pembayaran saya gagal?',
          a: 'Jika pembayaran gagal, Anda dapat mencoba kembali dengan membuat pesanan baru. Pastikan saldo atau limit kartu Anda mencukupi.',
        },
        {
          q: 'Apakah pembayaran saya aman?',
          a: 'Ya, sangat aman. Kami menggunakan payment gateway Midtrans yang telah tersertifikasi PCI DSS Level 1. Semua transaksi dienkripsi dan data kartu Anda tidak disimpan di server kami.',
        },
      ],
    },
    {
      category: 'Pengiriman',
      questions: [
        {
          q: 'Ekspedisi apa saja yang tersedia?',
          a: 'Kami menggunakan RajaOngkir API dengan 11 ekspedisi: JNE, POS Indonesia, TIKI (gratis plan). Untuk plan berbayar tersedia: SiCepat, ID Express, SAP Express, Ninja Xpress, J&T Express, Wahana, Lion Parcel, Royal Express. Pilihan ekspedisi muncul otomatis saat checkout berdasarkan lokasi tujuan.',
        },
        {
          q: 'Berapa lama estimasi pengiriman?',
          a: 'Estimasi ditampilkan real-time saat memilih ekspedisi di checkout (misal: JNE REG 2-3 hari, TIKI ONS 1 hari). Estimasi bervariasi tergantung jarak dan layanan yang dipilih. Pengiriman dari toko kami di Makassar.',
        },
        {
          q: 'Bagaimana cara melacak pesanan saya?',
          a: 'Setelah admin mengirim pesanan, nomor resi otomatis muncul di halaman "Pesanan Saya". Klik nomor resi untuk tracking atau cek manual di website ekspedisi. Status pesanan terupdate: Menunggu Pembayaran → Dibayar → Diproses → Dikirim → Sudah Sampai → Selesai.',
        },
        {
          q: 'Apakah bisa request ekspedisi tertentu?',
          a: 'Saat checkout, sistem otomatis menampilkan semua ekspedisi yang melayani kota tujuan Anda dengan harga dan estimasi. Anda bebas memilih ekspedisi dan layanan (REG/YES/ONS) yang paling sesuai.',
        },
        {
          q: 'Bagaimana cara menghitung ongkir?',
          a: 'Ongkir dihitung otomatis berdasarkan: 1) Berat total produk di keranjang (sudah termasuk konversi unit, misal: 2 sak semen = 100kg), 2) Jarak dari Makassar ke kota tujuan, 3) Layanan ekspedisi yang dipilih. Harga ongkir real-time dari API RajaOngkir.',
        },
      ],
    },
    {
      category: 'Produk',
      questions: [
        {
          q: 'Apakah semua produk original/asli?',
          a: 'Ya, semua produk dijamin original dari distributor resmi dengan brand ternama (Fumato, Conch, Holcim, Tiga Roda, dll). Setiap produk memiliki detail brand dan spesifikasi lengkap di halaman produk.',
        },
        {
          q: 'Bagaimana cara mengetahui stok produk?',
          a: 'Stok ditampilkan real-time di halaman detail produk (misal: "Stok: 150 batang"). Jika stok habis (Stok: 0), tombol "Tambah ke Keranjang" nonaktif. Stok selalu update otomatis.',
        },
        {
          q: 'Apakah harga sudah termasuk PPN?',
          a: 'Harga yang tertera BELUM termasuk PPN. Harga adalah harga jual toko tanpa pajak tambahan. Total yang dibayar = harga produk + ongkir (tanpa PPN).',
        },
        {
          q: 'Apakah bisa beli dengan satuan berbeda?',
          a: 'Ya, di halaman detail produk, klik tombol "Hitung Konversi Unit" untuk membuka Unit Converter. Masukkan jumlah dan pilih satuan tujuan (misal: 2 sak semen → 100kg). Harga otomatis disesuaikan dengan konversi.',
        },
        {
          q: 'Bagaimana dengan produk yang rusak/cacat?',
          a: 'Setelah pesanan selesai (status "Selesai"), klik "Ajukan Pengembalian" di halaman detail pesanan. Pilih kondisi (Rusak/Cacat/Salah Item/Tidak Sesuai/Lainnya), tulis alasan (min 10 karakter), lalu kirim. Admin akan review dan proses refund jika disetujui.',
        },
      ],
    },
    {
      category: 'Pengembalian & Refund',
      questions: [
        {
          q: 'Apakah bisa return/retur barang?',
          a: 'Ya, return hanya bisa diajukan setelah pesanan berstatus "Selesai" (customer sudah konfirmasi terima). Di halaman detail pesanan, klik "Ajukan Pengembalian", pilih kondisi barang (Rusak/Cacat/Salah Item/Tidak Sesuai/Lainnya), tulis alasan detail (min 10 karakter), lalu submit. SEMUA item dalam pesanan akan di-return (tidak bisa pilih item tertentu).',
        },
        {
          q: 'Berapa lama proses refund?',
          a: 'Setelah admin approve return, status berubah menjadi "Disetujui". Durasi refund tidak ditentukan sistem - tergantung proses manual admin. Refund dikembalikan ke metode pembayaran original (VA/E-Wallet/dll sesuai pembayaran awal).',
        },
        {
          q: 'Apakah bisa tukar dengan produk lain?',
          a: 'Tidak, sistem hanya support return dengan refund (tidak ada fitur tukar barang). Jika ingin produk lain, lakukan pemesanan baru setelah refund diterima.',
        },
        {
          q: 'Siapa yang menanggung ongkir return?',
          a: 'Return request tidak mencantumkan detail ongkir return di sistem. Kebijakan ongkir ditentukan manual saat admin review request. Biasanya: kesalahan toko = toko tanggung, alasan customer = customer tanggung.',
        },
      ],
    },
    {
      category: 'Akun & Keamanan',
      questions: [
        {
          q: 'Bagaimana cara mengubah password?',
          a: 'Fitur ubah password belum tersedia di halaman profil. Untuk ganti password, gunakan fitur "Lupa password?" di halaman login untuk reset password via email.',
        },
        {
          q: 'Lupa password, bagaimana cara reset?',
          a: 'Di halaman login, klik link "Lupa password?" di bawah kolom password. Link ini akan arahkan ke halaman reset password (fitur belum fully implemented - dalam pengembangan).',
        },
        {
          q: 'Apakah data saya aman?',
          a: 'Ya, sistem menggunakan: 1) NextAuth.js dengan JWT token (30 hari expiry), 2) HTTP-only cookies (immune XSS attack), 3) Password hashing bcryptjs (10 rounds), 4) Session validation per request. Data tidak dibagikan ke pihak ketiga.',
        },
        {
          q: 'Bagaimana cara menambah/edit alamat?',
          a: 'Saat checkout, sistem akan minta alamat pengiriman jika belum ada. Anda bisa tambah multiple alamat dengan label (Rumah/Kantor/Gudang). Edit/hapus alamat dilakukan di form checkout saat pilih alamat (belum ada halaman profil terpisah).',
        },
      ],
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan jawaban untuk pertanyaan yang sering diajukan seputar pemesanan, pembayaran, pengiriman, dan lainnya
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8 mb-12">
            {faqs.map((category, catIndex) => (
              <Card key={catIndex} className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {catIndex + 1}
                    </span>
                  </div>
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, qIndex) => (
                    <AccordionItem
                      key={qIndex}
                      value={`${catIndex}-${qIndex}`}
                      className="border-b border-gray-200 last:border-0"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-medium text-gray-900 pr-4">
                          {faq.q}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 leading-relaxed pb-4">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Tidak Menemukan Jawaban?
            </h2>
            <p className="text-gray-600 mb-6">
              Hubungi tim customer service kami untuk bantuan lebih lanjut
            </p>
            <Link href="/contact">
              <Button size="lg">
                <MessageCircle className="h-5 w-5 mr-2" />
                Hubungi Kami
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
