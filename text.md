================================================================================
               PANDUAN NAVIGASI & CLICKABLE ELEMENTS
        Proyek Final Project Web - E-Commerce Material Bangunan
================================================================================


BAGIAN YANG SUDAH DIBUAT & BISA DIKLIK
========================================

========================
=     LANDING PAGE     =
========================

1. Navbar (Semua Halaman Public)
   - Logo → Kembali ke homepage (/)
   - "Produk" (Menu) → Halaman katalog produk (/products)
   - Cart Icon (dengan badge jumlah) → Halaman keranjang (/cart)
   - Profile Avatar (jika login) → Dropdown menu:
     - "Profile" → Halaman profile user (/profile) [!] BELUM DIBUAT
     - "Pesanan Saya" → Halaman daftar pesanan (/orders)
     - "Logout" → Logout (action, bukan navigasi)
   - "Masuk" button (jika belum login) → Halaman login (/auth/login)
   - "Daftar" button (jika belum login) → Halaman register (/auth/register)

2. Hero Section
   - "Belanja Sekarang" button → Halaman katalog produk (/products)
   - "Lihat Promo" button → Halaman produk dengan filter promo (/products?category=promo)

3. Auto Carousel
   - Previous/Next arrows → Navigasi antar slide promo (tidak ke halaman lain)

4. Promo Hari Ini Section
   - "Lihat Semua →" link → Halaman produk dengan filter promo (/products?filter=promo)
   - Product Card (click anywhere) → [!] BELUM ADA LINK (seharusnya ke detail produk)
   - "Tambah ke Keranjang" button → Action (belum implement, seharusnya tambah ke cart)

5. Kategori Populer Section
   - [!] SUDAH DIHAPUS (sebelumnya ada 8 kategori yang mengarah ke /products?category={nama})

6. Produk Terlaris Section
   - "Lihat Semua →" link → Halaman produk dengan filter bestseller (/products?filter=bestseller)
   - Product Card (click anywhere) → [!] BELUM ADA LINK (seharusnya ke detail produk)
   - "Lihat Detail" button → [!] BELUM ADA LINK (seharusnya ke detail produk)

7. Partner Terpercaya Section
   - Logo partners → Tidak clickable (hanya display)

8. Kenapa Belanja di Sini Section
   - Benefit cards → Tidak clickable (hanya informasi)

9. Footer (Semua Halaman Public)
   - Logo → Kembali ke homepage (/)
   - "Produk" → Halaman katalog produk (/products)
   - "Tentang Kami" → [!] BELUM DIBUAT (/about)
   - "Kontak" → [!] BELUM DIBUAT (/contact)
   - Email & Phone → Mailto/tel links (functional)
   - Social media icons → [!] BELUM ADA HREF (seharusnya ke social media)


========================
=   HALAMAN PRODUK     =
========================

1. Breadcrumb
   - "Home" → Kembali ke homepage (/)
   - "Produk" → Current page (tidak clickable)

2. Sidebar Filters
   - Kategori checkboxes → Filter produk by kategori (state change, bukan navigasi)
   - Harga range slider → Filter produk by harga (state change)
   - Stok checkboxes → Filter produk by ketersediaan stok (state change)
   - Diskon checkbox → Filter produk yang diskon (state change)
   - "Reset Filter" button → Reset semua filter (action)

3. Products Area Header
   - Search input → Search produk by nama (state change)
   - Sort dropdown → Sort produk (harga, terbaru, terlaris) (state change)
   - Grid view button → Toggle tampilan grid (state change)
   - List view button → Toggle tampilan list (state change)

4. Product Cards
   - Product image → Detail produk (/products/{slug})
   - Product name → Detail produk (/products/{slug})
   - "Tambah ke Keranjang" button (grid view) → [!] Action belum implement
   - "Lihat Detail" button (list view) → Detail produk (/products/{slug})

5. Pagination
   - Page numbers → [!] BELUM IMPLEMENT (seharusnya ganti halaman)
   - Previous/Next → [!] BELUM IMPLEMENT


===============================
=   HALAMAN DETAIL PRODUK    =
===============================

1. Breadcrumb
   - "Home" → Kembali ke homepage (/)
   - "Produk" → Halaman katalog (/products)
   - Kategori → Filter by kategori (/products?category={kategori})
   - Nama Produk → Current page (tidak clickable)

2. Product Gallery
   - Thumbnail images → Ganti main image (state change)
   - Main image → Tidak ada zoom/modal (hanya display)

3. Product Info
   - Kategori badge → [!] TIDAK CLICKABLE (seharusnya filter by kategori)
   - + / - buttons → Ubah quantity (state change)
   - "Tambah ke Keranjang" button → [!] Action belum implement
   - "Beli Sekarang" button → [!] BELUM IMPLEMENT (seharusnya langsung checkout)

4. Unit Converter Component
   - Unit dropdown → Pilih unit pembelian (state change)
   - Quantity input → Input jumlah custom (state change)
   - "Tambah ke Keranjang" button → [!] Action belum implement

5. Tabs Navigation
   - "Deskripsi" tab → Show deskripsi produk (state change)
   - "Spesifikasi" tab → Show spesifikasi (state change)
   - "Ulasan" tab → Show ulasan (state change)

6. Produk Terkait Section
   - "Lihat Semua" → Kembali ke katalog (/products)
   - Related product card → Detail produk lain (/products/{slug})


========================
=   HALAMAN KERANJANG  =
========================

1. Breadcrumb
   - "Home" → Kembali ke homepage (/)
   - "Keranjang" → Current page (tidak clickable)

2. Cart Items List
   - Product image → Detail produk (/products/{slug}) [!] BELUM ADA LINK
   - Product name → Detail produk (/products/{slug}) [!] BELUM ADA LINK
   - Trash icon → Hapus item dari cart (action)
   - - / + buttons → Ubah quantity (action)

3. Ringkasan Belanja Card
   - "Masukkan Kode Promo" dialog trigger → Buka dialog input promo (state change)
   - "Terapkan" button (di dialog) → Apply kode promo (action)
   - "Edit" link (alamat pengiriman) → Buka dialog edit alamat (state change)
   - "Simpan Alamat" button → Save alamat (action)
   - "Proses Checkout" button → [!] BELUM IMPLEMENT (seharusnya ke halaman checkout)

4. Empty Cart State
   - "Mulai Belanja" button → Halaman katalog produk (/products)


========================
=   HALAMAN PESANAN    =
========================
(Customer Orders - Public)

1. Navbar & Footer → (sama seperti landing page)

2. Page Header
   - Status filter dropdown → Filter pesanan by status (state change)

3. Order Cards
   - "Lihat {X} produk lainnya" button → Expand/collapse items (state change)
   - "Ajukan Pengembalian" button → Buka dialog return request (state change)
   - "Beri Rating" button → Buka dialog rating (state change)
   - "Beli Lagi" button → [!] BELUM IMPLEMENT (seharusnya tambah ke cart)

4. Return Request Dialog
   - Textarea → Input alasan pengembalian (state change)
   - "Ajukan Pengembalian" button → Submit return (action)
   - "Batal" button → Close dialog (state change)

5. Rating Dialog
   - Star buttons (1-5) → Pilih rating (state change)
   - "Kirim Rating" button → Submit rating (action)
   - "Batal" button → Close dialog (state change)

6. Empty Orders State
   - "Mulai Belanja" button → Halaman katalog produk (/products)


========================
=   HALAMAN AUTH       =
========================

Login Page (/auth/login)
   - Google button → [!] BELUM IMPLEMENT (seharusnya OAuth)
   - Email & Password inputs → Form input (state change)
   - "Masuk" button → Submit login (action)
   - "Lupa password?" link → [!] BELUM DIBUAT (/auth/forgot-password)
   - "Daftar di sini" link → Halaman register (/auth/register)

Register Page (/auth/register)
   - 5 form inputs → Form input (state change)
   - "Daftar" button → Submit register (action)
   - "Masuk di sini" link → Halaman login (/auth/login)


========================
=   ADMIN DASHBOARD    =
========================

Sidebar Navigation (Semua Halaman Admin)
   - Admin logo/brand → Admin dashboard (/admin)
   - "Dashboard" → Dashboard page (/admin)
   - "Produk" → Halaman kelola produk (/admin/products)
   - "Pesanan" → Halaman kelola pesanan (/admin/orders)
   - "Inventory" → Halaman stock movements (/admin/inventory)
   - "Pelanggan" → Halaman kelola customer (/admin/customers)
   - "Laporan" → Halaman reports hub (/admin/reports)
   - "Pengaturan" → [!] BELUM DIBUAT (/admin/settings)

Header (Semua Halaman Admin)
   - Notification bell → [!] BELUM IMPLEMENT (seharusnya dropdown notif)
   - Admin avatar dropdown → Menu:
     - "Profile" → [!] BELUM DIBUAT (/admin/profile)
     - "Pengaturan" → [!] BELUM DIBUAT (/admin/settings)
     - "Logout" → Logout action


===============================
=   ADMIN - DASHBOARD PAGE    =
===============================

1. Stats Cards
   - Tidak clickable (hanya display stats)

2. Recent Orders Table
   - "Lihat Semua →" link → Halaman admin orders (/admin/orders)
   - Order row → [!] TIDAK CLICKABLE (seharusnya buka detail)

3. Low Stock Alert Card
   - Product items → [!] TIDAK CLICKABLE (seharusnya ke halaman produk)

4. Quick Actions Cards
   - "Tambah Produk" → [!] TIDAK CLICKABLE (seharusnya buka dialog atau /admin/products)
   - "Kelola Stok" → [!] TIDAK CLICKABLE (seharusnya ke /admin/inventory)
   - "Lihat Laporan" → [!] TIDAK CLICKABLE (seharusnya ke /admin/reports)
   - "Atur Promo" → [!] TIDAK CLICKABLE (seharusnya ke settings promo)


===============================
=   ADMIN - PRODUCTS PAGE     =
===============================

1. Filters
   - Search input → Search produk (state change)
   - Category dropdown → Filter by kategori (state change)
   - Status dropdown → Filter by status (state change)

2. Table Actions
   - "Tambah Produk Baru" button → Buka dialog form tambah produk (state change)
   - "Edit" button (per row) → [!] BELUM IMPLEMENT (seharusnya buka dialog edit)
   - "Hapus" button (per row) → [!] BELUM IMPLEMENT (seharusnya confirm delete)

3. Add Product Dialog
   - Form inputs (13 fields) → Form input (state change)
   - Category dropdown → Select kategori (state change)
   - Unit dropdown → Select satuan (state change)
   - Upload gambar → File picker (state change)
   - Checkboxes (isActive, isFeatured) → Toggle status (state change)
   - "Batal" button → Close dialog (state change)
   - "Tambah Produk" button → Submit create product (action)

4. Pagination
   - Page numbers → [!] BELUM IMPLEMENT


===============================
=   ADMIN - ORDERS PAGE       =
===============================

1. Filters
   - Search input → Search orders (state change)
   - Status dropdown → Filter by status (state change)

2. Stats Cards
   - Tidak clickable (hanya display)

3. Orders Table Actions
   - "Proses" button (paid status) → Buka dialog confirm process (state change)
   - "Kirim" button (processing status) → Buka dialog form shipping (state change)
   - Eye icon (View Detail) → Buka dialog detail order (state change)
   - Ban icon (Cancel) → Buka dialog cancel order (state change)

4. Process Order Dialog
   - "Ya, Proses" button → Update status ke processing (action)
   - "Batal" button → Close dialog (state change)

5. Ship Order Dialog
   - Ekspedisi dropdown → Select courier (state change)
   - Resi input → Input tracking number (state change)
   - Date input → Select shipping date (state change)
   - "Kirim Pesanan" button → Update status + save shipping info (action)
   - "Batal" button → Close dialog (state change)

6. Cancel Order Dialog
   - Textarea → Input cancel reason (state change)
   - "Batalkan Pesanan" button → Update status + save reason (action)
   - "Batal" button → Close dialog (state change)

7. View Detail Dialog
   - Read-only (hanya display info)
   - "Tutup" button → Close dialog (state change)


===============================
=   ADMIN - INVENTORY PAGE    =
===============================

1. Info Alert
   - Tidak clickable (hanya informasi)

2. Stats Cards
   - Tidak clickable (display Total Masuk, Keluar, Saldo)

3. Filters
   - Search input → Search by product name/code (state change)
   - Type dropdown → Filter by type (Masuk/Keluar) (state change)
   - Date input → Filter by date (state change)

4. Movements Table
   - Read-only (tidak ada actions, hanya display history)


===============================
=   ADMIN - CUSTOMERS PAGE    =
===============================

1. Stats Cards
   - Tidak clickable (display Total, Aktif, Tidak Aktif, Revenue)

2. Filters
   - Search input → Search by name/email/phone (state change)
   - Status dropdown → Filter by status (state change)

3. Customers Table
   - "Lihat Detail" button → Buka dialog detail customer (state change)

4. View Detail Dialog
   - Read-only (display full customer info + stats)
   - "Tutup" button → Close dialog (state change)


===============================
=   ADMIN - REPORTS HUB       =
===============================

1. Tabs Navigation
   - "Laporan Penjualan" tab → Show sales report (state change)
   - "Laporan 2-10" tabs → Show placeholder content (state change)

2. Sales Report Content
   - Year filter dropdown → Filter data by year (state change)
   - Chart type toggle → Switch LineChart/BarChart (state change)
   - Export PDF button → [!] BELUM IMPLEMENT (seharusnya download PDF)
   - Export Excel button → [!] BELUM IMPLEMENT (seharusnya download Excel)

3. Individual Report Pages
   - "← Kembali ke Laporan" link → Kembali ke reports hub (/admin/reports)
   - Routes: /admin/reports/sales, /admin/reports/report2-10


================================================================================

BAGIAN YANG BELUM DIBUAT
==========================

CRITICAL (Fitur Inti E-Commerce)
----------------------------------
1. Halaman Checkout (/checkout)
   - Form detail pengiriman lengkap
   - Pilihan metode pembayaran
   - Review order sebelum bayar
   - Konfirmasi pembayaran

2. Payment Integration
   - Gateway pembayaran (Midtrans, dll)
   - Payment confirmation page
   - Payment status tracking

3. Profile Page (/profile)
   - Edit informasi user
   - Ubah password
   - Manage alamat pengiriman

4. Add to Cart Functionality
   - Di homepage (promo products)
   - Di halaman katalog
   - Di detail produk
   - Di detail produk (unit converter)
   - Cart context/state management

5. Buy Again Feature (di halaman orders)
   - Tambah ulang produk ke cart

6. Product Card Links di Homepage
   - Promo products → detail produk
   - Best sellers → detail produk

IMPORTANT (Fitur Pendukung)
-----------------------------
7. Forgot Password Flow (/auth/forgot-password)
   - Request reset password
   - Email verification
   - Reset password page

8. About Us Page (/about)
9. Contact Page (/contact)
10. Admin Settings Page (/admin/settings)
    - General settings
    - Payment settings
    - Shipping settings
    - Promo management

11. Admin Profile Page (/admin/profile)
12. Edit Product (Admin) - Dialog/page untuk edit produk
13. Delete Product (Admin) - Confirm dialog + delete action
14. Notification System (Admin) - Dropdown notifications di header

NICE TO HAVE (Enhancement)
----------------------------
15. Product Search Suggestions - Autocomplete di search bar
16. Product Filters di Homepage - Quick filters
17. Wishlist/Favorites - Simpan produk favorit
18. Product Comparison - Bandingkan produk
19. Product Reviews System - User bisa tulis review + rating
20. Live Chat/Customer Support
21. Email Notifications
    - Order confirmation
    - Shipping updates
    - Marketing emails
22. Invoice/Receipt Download - PDF invoice per order
23. Pagination - Di halaman products (sudah ada UI, belum functional)
24. Social Media Links - Di footer (sudah ada icon, belum ada href)
25. OAuth Login - Google login (button sudah ada, belum implement)
26. Product Zoom - Zoom gambar produk di detail page
27. Report Export - PDF/Excel export (button sudah ada, belum implement)
28. Quick Actions di Dashboard - Make all 4 cards clickable

ADMIN ENHANCEMENTS
-------------------
29. Dashboard Charts - Grafik penjualan, traffic, dll
30. Order Tracking System - Real-time status updates
31. Bulk Actions - Bulk edit/delete products
32. Product Import/Export - CSV/Excel import products
33. Customer Analytics - Customer behavior insights
34. Stock Alerts - Email/notif saat stok menipis
35. Return Management - Process return requests dari customer
36. Admin Activity Log - Track admin actions
37. Role Management - Multiple admin roles (super admin, staff, dll)


================================================================================

SUMMARY STATISTICS
===================

Halaman yang Sudah Dibuat: 18
- Landing Page (/)
- Products Catalog (/products)
- Product Detail (/products/[slug])
- Cart (/cart)
- Orders (/orders)
- Login (/auth/login)
- Register (/auth/register)
- Admin Dashboard (/admin)
- Admin Products (/admin/products)
- Admin Orders (/admin/orders)
- Admin Inventory (/admin/inventory)
- Admin Customers (/admin/customers)
- Admin Reports Hub (/admin/reports)
- Admin Reports - Sales (/admin/reports/sales)
- Admin Reports - Report 2-10 (/admin/reports/report2-10)

### ⚠️ Halaman yang Belum Dibuat: 6
- Checkout (/checkout)
- Profile (/profile)
- Forgot Password (/auth/forgot-password)
- About Us (/about)
- Contact (/contact)
- Admin Settings (/admin/settings)
- Admin Profile (/admin/profile)

### 🔧 Fitur yang Belum Implement: 37+
- 5 Critical features (checkout, payment, profile, add to cart, buy again)
- 9 Important features (forgot password, about, contact, settings, dll)
- 11 Nice to have features (wishlist, reviews, live chat, dll)
- 9 Admin enhancements (charts, bulk actions, analytics, dll)

---

**Last Updated**: 16 Oktober 2025
**Project Status**: 🟡 Development Phase - Core Features Completed, Integration Pending
