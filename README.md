# 🏗️ Toko Material Bangunan — E-Commerce Web App

Aplikasi e-commerce material bangunan berbasis web yang dibangun menggunakan **Next.js 15**, **TypeScript**, **tRPC**, **MongoDB**, dan **Midtrans** sebagai payment gateway. Proyek ini dikembangkan sebagai tugas besar mata kuliah **Framework Pemrograman Web (FPW)** semester 5.

---

## 🚀 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (Pages Router) |
| **Language** | TypeScript |
| **API** | [tRPC v11](https://trpc.io/) + React Query |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) (JWT Strategy) |
| **Database** | MongoDB + [Mongoose](https://mongoosejs.com/) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **State Management** | Zustand |
| **Payment** | [Midtrans](https://midtrans.com/) |
| **Upload Gambar** | [Cloudinary](https://cloudinary.com/) |
| **Maps** | Leaflet + React Leaflet |
| **Charts** | Recharts |
| **Export** | jsPDF + XLSX |
| **Shipping** | RajaOngkir API |
| **Forms** | React Hook Form + Zod |

---

## ✨ Fitur Utama

### 🛍️ Customer
- Beranda dengan carousel produk unggulan & promo
- Browsing & pencarian produk berdasarkan kategori
- Detail produk dengan galeri gambar
- Keranjang belanja (cart)
- Checkout dengan perhitungan ongkir otomatis (RajaOngkir)
- Pembayaran online via Midtrans (QRIS, transfer bank, e-wallet, dll.)
- Riwayat pesanan & tracking status
- Pengajuan pengembalian barang (return)
- Profil & manajemen akun
- Notifikasi

### 🔐 Authentication
- Register & Login (email + password)
- Password di-hash dengan bcrypt
- Session berbasis JWT (30 hari)
- Proteksi route berdasarkan role

### 🛠️ Admin Dashboard
- Statistik & laporan penjualan (charts, export Excel/PDF)
- Manajemen produk (CRUD + upload gambar via Cloudinary)
- Manajemen kategori
- Manajemen pesanan (ubah status, detail)
- Manajemen pengembalian barang
- Manajemen voucher/promo
- Manajemen inventaris & stok
- Manajemen pelanggan
- Manajemen tim/staff
- Konfigurasi toko

---

## 📁 Struktur Proyek

