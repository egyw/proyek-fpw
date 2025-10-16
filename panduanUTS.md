
BAGIAN YANG SUDAH DIBUAT & BISA DIKLIK

https://proyek-fpw-red.vercel.app/

========================
=     LANDING PAGE     =
========================

1. Navbar (Semua Halaman Public)
   - Logo → Kembali ke homepage (/)
   - "Produk" → Halaman katalog produk (/products)
   - Cart Icon → Halaman keranjang (/cart)
   - Profile Avatar (jika login) → Dropdown menu:
     - "Pesanan Saya" → Halaman daftar pesanan (/orders)
     - "Logout" → Logout 
   - "Masuk" button (jika belum login) → Halaman login (/auth/login)
   - "Daftar" button (jika belum login) → Halaman register (/auth/register)

2. Hero Section
   - "Belanja Sekarang" button → Halaman katalog produk (/products)
   - "Lihat Promo" button → Halaman produk dengan filter promo (/products?category=promo)

3. Auto Carousel
   - Previous/Next arrows → Navigasi antar slide promo (tidak ke halaman lain)

4. Promo Hari Ini Section
   - "Lihat Semua" link → Halaman produk dengan filter promo (/products?filter=promo)

5. Kategori Populer Section
   - di click → mengarah ke /products?category={nama})

6. Produk Terlaris Section
   - "Lihat Semua" link → Halaman produk dengan filter bestseller (/products?filter=bestseller)

7. Footer (Semua Halaman Public)
   - "Produk" dengan kategori → Halaman katalog produk (/products?category={nama})


========================
=   HALAMAN PRODUK     =
========================

1. Breadcrumb
   - "Home" → Kembali ke homepage (/)

2. Products Area Header
   - Grid view button → Toggle tampilan grid 
   - List view button → Toggle tampilan list 

3. Product Cards
   - "Lihat Detail" button (list view) → Detail produk (/products/{slug})

===============================
=   HALAMAN DETAIL PRODUK    =
===============================

1. Breadcrumb
   - "Home" → Kembali ke homepage (/)
   - "Produk" → Halaman katalog (/products)
   - Kategori → Filter by kategori (/products?category={kategori})

2. Product Gallery
   - Thumbnail images → Ganti main image 

3. Product Info
   - + / - buttons → Ubah quantity 

4. Unit Converter Component
   - Unit dropdown → Pilih unit pembelian 
   - Quantity input → Input jumlah custom 
   - "Beli" button → Memunculkan notifikasi barang berhasil ditambah
   - "Lihat Keranjang" di notifikasi saat menekan tombol beli di converter → pergi ke halaman cart (/cart)

5. Produk Terkait Section
   - "Lihat Semua" → Kembali ke katalog (/products)
   - Related product card → Detail produk lain (/products/{slug})


========================
=   HALAMAN KERANJANG  =
========================

1. Alamat Section
   - "ganti alamat" → memunculkan card untuk memilih alamat yang sudah terdaftar
   - "Tambah alamat baru" → memunculkan form untuk menambahkan alamat baru

2. Cart Items List
   - Product image → Detail produk (/products/{slug}) 
   - Product name → Detail produk (/products/{slug}) 
   - Trash icon → Hapus item dari cart 
   - - / + buttons → Ubah quantity 

3. Ringkasan Belanja Card
   - "Lanjut belanja" button → ke halaman products (/products)

========================
=   HALAMAN PESANAN    =
========================
(ada di profile → pesanan saya)

1. Navbar & Footer → (sama seperti landing page)

2. Page Header
   - Status filter dropdown → Filter pesanan by status 

3. Order Cards
   - "+ {X} produk lainnya" button → Expand/collapse items 
   - "Ajukan Pengembalian" button → Buka dialog untuk memasukkan alasan pengembalian 
   - "Beri Rating" button → Buka dialog rating 

4. Return Request Dialog
   - Textarea → Input alasan pengembalian 
   - "Ajukan Pengembalian" button → Submit return 
   - "Batal" button → Close dialog 

5. Rating Dialog
   - Star buttons (1-5) → Pilih rating
   - "Kirim Rating" button → Submit rating 
   - "Batal" button → Close dialog 

6. Empty Orders State (kalo kosong)
   - "Mulai Belanja" button → Halaman katalog produk (/products)


========================
=   HALAMAN AUTH       =
========================

https://proyek-fpw-red.vercel.app/auth/login
Login Page (/auth/login)
   - "Masuk" button → Submit login (bisa masuk dengan email dan password apapun karna belum ada pengecekan)
   - "Daftar di sini" link → Halaman register (/auth/register)

https://proyek-fpw-red.vercel.app/auth/register
Register Page (/auth/register)
   - "Daftar" button → Submit register (action)
   - "Masuk di sini" link → Halaman login (/auth/login)


========================
=   ADMIN DASHBOARD    =
========================

https://proyek-fpw-red.vercel.app/admin
Sidebar Navigation (Semua Halaman Admin)
   - Admin logo/brand → Admin dashboard (/admin)
   - "Dashboard" → Dashboard page (/admin)
   - "Produk" → Halaman kelola produk (/admin/products)
   - "Pesanan" → Halaman kelola pesanan (/admin/orders)
   - "Inventory" → Halaman stock movements (/admin/inventory)
   - "Pelanggan" → Halaman kelola customer (/admin/customers)
   - "Laporan" → Halaman reports hub (/admin/reports)
   - "sembunyikan" → perkecil sidebar

Header (Semua Halaman Admin)
   - Admin avatar dropdown → Menu:
     - "Logout" → Logout action


===============================
=   ADMIN - PRODUCTS PAGE     =
===============================

1. Button "tambah produk baru" → Buka dialog form tambah produk 

2. Add Product Dialog
   - Upload gambar → File picker 

===============================
=   ADMIN - ORDERS PAGE       =
===============================

1. Filters
   - Search input → Search orders (by no order, nama atau no tlp)
   - Status dropdown → Filter by status 

2. Orders Table Actions
   - "Proses" button (paid status) → Buka dialog confirm process 
   - "Kirim" button (processing status) → Buka dialog form shipping 
   - Eye icon (View Detail) → Buka dialog detail order 
   - Ban icon (Cancel) → Buka dialog cancel order 


===============================
=   ADMIN - INVENTORY PAGE    =
===============================

1. Filters
   - Search input → Search by product name/code 
   - Type dropdown → Filter by type (Masuk/Keluar) 

===============================
=   ADMIN - CUSTOMERS PAGE    =
===============================

1. Filters
   - Search input → Search by name/email/phone 
   - Status dropdown → Filter by status 

2. Customers Table
   - "Lihat Detail" button → Buka dialog detail customer 

===============================
=   ADMIN - REPORTS HUB       =
===============================

1. Tabs Navigation
   - "Laporan Penjualan" tab → Show sales report 
   - "Laporan 2-10" tabs → Show placeholder content 

2. Sales Report Content
   - Chart type toggle → Switch LineChart/BarChart (state change)

================================================================================

BAGIAN YANG BELUM DIBUAT (SUBJECT TO CHANGE)
==========================

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

7. Forgot Password Flow (/auth/forgot-password)
   - Request reset password
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
24. OAuth Login - Google login (button sudah ada, belum implement)
25. Product Zoom - Zoom gambar produk di detail page
26. Report Export - PDF/Excel export (button sudah ada, belum implement)
27. Quick Actions di Dashboard - Make all 4 cards clickable

28. Dashboard Charts - Grafik penjualan, traffic, dll
29. Order Tracking System - Real-time status updates
30. Product Import/Export - CSV/Excel import products
31. Customer Analytics - Customer behavior insights
32. Stock Alerts - Email/notif saat stok menipis
33. Return Management - Process return requests dari customer
34. Admin Activity Log - Track admin actions
35. Role Management - Multiple admin roles (super admin, staff, dll)


===================
=     SUMMARY     =
===================

Halaman yang Sudah Dibuat: 
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

Halaman yang Belum Dibuat: 
- Checkout (/checkout)
- Profile (/profile)
- Forgot Password (/auth/forgot-password)
- About Us (/about)
- Contact (/contact)
- Admin Settings (/admin/settings)
- Admin Profile (/admin/profile)

Fitur yang Belum Implement:
- checkout, payment, profile, add to cart, buy again
- forgot password, about, contact, settings, dll
- wishlist, reviews, live chat, dll
- charts, bulk actions, analytics, dll


