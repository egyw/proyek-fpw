# Setup Cloudinary untuk Upload Gambar Produk

## 📋 Langkah-langkah Setup

### 1. Registrasi Akun Cloudinary (GRATIS)

1. **Buka**: https://cloudinary.com/users/register/free
2. **Isi form registrasi**:
   - Email
   - Password
   - Cloud name (e.g., "proyek-fpw")
3. **Verifikasi email** Anda
4. **Login** ke dashboard: https://console.cloudinary.com/

### 2. Ambil Credentials

Setelah login, di dashboard Anda akan melihat:

```
Account Details
Cloud name: dxxxxxx
API Key: 123456789012345
API Secret: xxxxxxxxxxxxxxx (klik "eye" icon untuk lihat)
```

**Copy 3 credentials ini!**

### 3. Update File .env.local

Buka file `.env.local` dan update bagian Cloudinary:

```bash
# Cloudinary Cloud Name (FRONTEND - public, untuk upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxxxx

# Cloudinary API Key (BACKEND - untuk signed uploads)
CLOUDINARY_API_KEY=123456789012345

# Cloudinary API Secret (BACKEND - rahasia, untuk signed uploads)
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxx

# Cloudinary Upload Preset (FRONTEND - untuk unsigned uploads dari browser)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=products
```

⚠️ **PENTING**: Ganti `dxxxxxx`, `123456789012345`, dan `xxxxxxxxxxxxxxx` dengan credentials Anda!

### 4. Buat Upload Preset (Unsigned)

Upload preset memungkinkan upload langsung dari browser tanpa signature backend.

1. **Login ke dashboard**: https://console.cloudinary.com/
2. **Navigasi**: Settings (icon gear) → Upload
3. **Klik**: "Add upload preset" (bagian bawah)
4. **Isi form**:
   - **Upload preset name**: `products`
   - **Signing mode**: **Unsigned** (PENTING!)
   - **Folder**: `proyek-fpw/products` (opsional, untuk organisasi)
   - **Access mode**: Public (default)
   - **Unique filename**: Yes (recommended)
   - **Overwrite**: No (recommended)
5. **Klik**: Save

### 5. Restart Dev Server

Setelah update `.env.local`, **WAJIB restart dev server**:

```bash
# Tekan Ctrl+C untuk stop server
# Lalu jalankan lagi:
npm run dev
```

## ✅ Testing Upload

1. **Buka**: http://localhost:3000/admin/products
2. **Klik**: "Tambah Produk Baru"
3. **Upload gambar** di section "Gambar Produk"
4. **Lihat preview** - gambar akan langsung muncul
5. **Submit form** - URL gambar akan disimpan ke database

## 🔍 Struktur File

```
src/
├── components/
│   └── CloudinaryUpload.tsx          # ✅ Component untuk upload
├── pages/
│   └── admin/
│       └── products/
│           └── index.tsx             # ✅ Menggunakan CloudinaryUpload
└── .env.local                        # ✅ Credentials Cloudinary
```

## 📦 Package yang Diinstall

```json
{
  "cloudinary": "^2.x.x"  // SDK Cloudinary
}
```

## 🎨 Fitur CloudinaryUpload Component

### Props:
- `onUploadSuccess: (url: string) => void` - Callback saat upload sukses
- `currentImage?: string` - URL gambar saat ini (untuk preview)
- `onRemove?: () => void` - Callback untuk hapus gambar

### Features:
✅ Upload langsung ke Cloudinary (tidak lewat backend)
✅ Preview gambar sebelum upload
✅ Validasi file type (hanya gambar)
✅ Validasi file size (max 5MB)
✅ Loading state dengan spinner
✅ Error handling
✅ Hapus gambar dengan button
✅ Responsive design

### Validasi:
- **File type**: Hanya image/* (PNG, JPG, JPEG, GIF, WebP)
- **File size**: Maksimal 5MB
- **Folder**: Otomatis ke `proyek-fpw/products`

## 🔐 Security

### Unsigned Upload (Current Implementation):
- ✅ Upload langsung dari browser (fast)
- ✅ Tidak perlu backend endpoint
- ⚠️ Upload preset harus **Unsigned**
- ⚠️ Siapa saja bisa upload ke preset ini (mitigasi: folder + monitoring)

### Best Practices:
1. **Monitor usage** di Cloudinary dashboard
2. **Set upload limits** di preset settings
3. **Enable Auto Backup** di Cloudinary settings
4. **Use transformations** untuk optimize gambar

## 📊 Cloudinary Free Tier

| Feature | Limit |
|---------|-------|
| Storage | 25 GB |
| Bandwidth | 25 GB/month |
| Transformations | 25,000/month |
| Admin API calls | 500/hour |
| Upload API calls | Unlimited |

**Cukup untuk development dan small production!**

## 🚀 URL Gambar yang Dihasilkan

Format:
```
https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/proyek-fpw/products/{filename}.{ext}
```

Contoh:
```
https://res.cloudinary.com/dxxxxxx/image/upload/v1699612345/proyek-fpw/products/semen-gresik.jpg
```

URL ini **PERMANENT** dan bisa diakses publik!

## 🎯 Keuntungan Cloudinary

✅ **Auto CDN** - Gambar served dari CDN global (cepat)
✅ **Auto Optimization** - Kompresi otomatis tanpa quality loss
✅ **Responsive Images** - Bisa transform on-the-fly
✅ **Backup & Recovery** - Otomatis backup
✅ **No Server Storage** - Hemat server space
✅ **Scalable** - Handle traffic tinggi
✅ **Free Tier** - 25GB gratis

## 🔧 Troubleshooting

### Error: "Upload failed"
- Cek credentials di `.env.local` sudah benar
- Pastikan upload preset `products` sudah dibuat
- Pastikan preset mode = **Unsigned**
- Restart dev server setelah update `.env.local`

### Error: "Invalid cloud name"
- Cek `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` typo atau salah
- Cloud name format: huruf kecil, no space (e.g., "dxxxxxx")

### Error: "Preset not found"
- Preset name di `.env.local` harus match dengan yang dibuat di dashboard
- Default: `products`

### Gambar tidak muncul:
- Cek URL di database sudah benar format Cloudinary
- Cek gambar tidak dihapus di Cloudinary dashboard
- Cek browser console untuk error

## 📝 Notes

- Gambar yang diupload **PERMANENT** di Cloudinary
- Untuk delete, harus manual di Cloudinary dashboard atau via API
- Saat update product image, URL lama tetap ada di Cloudinary (tidak otomatis dihapus)
- Pertimbangkan implement cleanup job untuk hapus unused images

## 🎉 Status

✅ CloudinaryUpload component created
✅ Integrated into Admin Products page
✅ .env.local configured
✅ Unsigned upload setup
✅ Validation implemented
✅ Error handling implemented
✅ TypeScript errors resolved

**Siap digunakan!** Tinggal setup credentials Cloudinary Anda! 🚀
