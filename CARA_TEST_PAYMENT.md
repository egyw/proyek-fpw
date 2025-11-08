# 🎯 Cara Test Payment di Sandbox Midtrans

## ❌ MASALAH: QRIS "Tidak Sesuai" / blu BCA "Terputus"

**Penyebab**: 
- Anda di Sandbox mode (testing)
- QR code sandbox TIDAK compatible dengan app bank real
- BCA Mobile, blu, Dana, OVO → Semua tidak bisa scan QR sandbox

**Solusi**: Gunakan salah satu metode testing di bawah ⬇️

---

## ✅ METODE 1: Via Midtrans Dashboard (RECOMMENDED)

### Step by Step:

**1. Create Order di Web Anda**
```
- Login ke web
- Add produk ke cart
- Checkout
- Klik "Bayar Sekarang"
- Pilih payment method apa saja (QRIS/VA/dll)
- Copy Order ID (e.g., "ORD-20251109-001")
- Popup Midtrans muncul (BIARKAN TERBUKA atau close juga OK)
```

**2. Buka Midtrans Dashboard**
```
URL: https://dashboard.sandbox.midtrans.com/
Login dengan akun Midtrans Anda
```

**3. Cari Transaction Anda**
```
📍 Lokasi: Sidebar kiri → "Transactions"

Cara cari:
- Scroll down untuk cari berdasarkan waktu
- Atau gunakan search box (ketik Order ID)
- Klik transaction yang sesuai
```

**4. Set Transaction ke Success**
```
Di halaman detail transaction:

1. Cari dropdown "Action" (pojok kanan atas)
2. Klik dropdown → Pilih salah satu:
   - "Set to Settlement" ✅
   - "Mark as Success" ✅
3. Confirm action
4. Status berubah jadi "settlement" (paid)
```

**5. Refresh Order Page**
```
- Kembali ke web Anda
- Refresh halaman order detail (F5)
- Status seharusnya: "Paid" atau "Dibayar" ✅
- Invoice bisa di-download
```

### Screenshot Guide:

```
Dashboard Layout:
┌─────────────────────────────────────────────┐
│ [Midtrans Logo]  Sandbox  [User Menu]     │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Home     │  Transaction List               │
│ →Trans.. │  ┌────────────────────────────┐ │
│ Settings │  │ ORD-20251109-001           │ │
│ Reports  │  │ Status: pending            │ │
│          │  │ Amount: Rp 150,000         │ │
│          │  │ [View Details]             │ │
│          │  └────────────────────────────┘ │
│          │                                  │
│          │  Transaction Detail              │
│          │  ┌────────────────────────────┐ │
│          │  │ Order: ORD-20251109-001    │ │
│          │  │ Status: pending            │ │
│          │  │                            │ │
│          │  │ [Action ▼]                 │ │
│          │  │  - Set to Settlement ✅    │ │
│          │  │  - Mark as Success         │ │
│          │  │  - Cancel Transaction      │ │
│          │  └────────────────────────────┘ │
└──────────┴──────────────────────────────────┘
```

---

## ✅ METODE 2: Test dengan Credit Card

### Keuntungan:
- ✅ Instant success (tidak perlu manual approval)
- ✅ Test flow end-to-end
- ✅ Tidak perlu ke dashboard

### Test Card Numbers:

**Success Scenario:**
```
Card Number: 4811 1111 1111 1114
CVV: 123
Exp Date: 01/25 (atau bulan/tahun > sekarang)
OTP/3DS: 112233

Result: Langsung success ✅
```

**Failure Scenario (untuk test error):**
```
Card Number: 4011 1111 1111 1112
CVV: 123
Exp Date: 01/25
OTP: 112233

Result: Payment failed (untuk test error handling)
```

**Fraud Challenge (untuk test fraud detection):**
```
Card Number: 4411 1111 1111 1118
CVV: 123
Exp Date: 01/25
OTP: 112233

Result: Status "challenge" (manual review)
```

### Steps:
```
1. Checkout → Pilih "Credit Card"
2. Masukkan card number test di atas
3. Klik "Pay"
4. Masukkan OTP: 112233
5. Payment langsung berhasil ✅
6. Redirect ke order detail page
```

---

## ✅ METODE 3: Test dengan GoPay/ShopeePay

### Steps:

**1. Pilih Payment Method**
```
- Checkout
- Pilih "GoPay" atau "ShopeePay"
- Klik "Bayar Sekarang"
```

**2. Redirect ke Simulator**
```
Akan redirect ke halaman simulator Midtrans
Ada 3 tombol:
┌──────────────────────────────┐
│  GoPay Payment Simulator     │
├──────────────────────────────┤
│  Amount: Rp 150,000          │
│                               │
│  [✅ Pay]  (hijau)           │
│  [⏳ Keep Pending]  (kuning) │
│  [❌ Cancel]  (merah)        │
└──────────────────────────────┘
```

**3. Klik "Pay"**
```
- Klik tombol hijau "Pay"
- Payment berhasil ✅
- Redirect ke order detail page
```

---

## ✅ METODE 4: PowerShell Script (Advanced)

### Setup (First Time Only):

**1. Pastikan PowerShell ExecutionPolicy Allow**
```powershell
# Buka PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ketik 'Y' untuk confirm
```

### Usage:

**1. Buka PowerShell (BUKAN cmd)**
```powershell
# Right-click Start → Windows PowerShell
# Atau: Win+X → Windows PowerShell
```

**2. Navigate ke Project**
```powershell
cd d:\workspace\proyek-fpw
```

**3. Run Script**
```powershell
# Syntax:
.\scripts\simulate-payment.ps1 -OrderId "YOUR_ORDER_ID"

# Example:
.\scripts\simulate-payment.ps1 -OrderId "ORD-20251109-001"
```

**4. Output**
```
════════════════════════════════════════
  Midtrans Payment Simulator (Sandbox)
════════════════════════════════════════

📦 Order ID    : ORD-20251109-001
🔑 Server Key  : Mid-server-8BoN...

🔄 Sending request to Midtrans API...

✅ SUCCESS! Payment simulated successfully!

📄 Response:
{
  "status_code": "200",
  "transaction_status": "settlement",
  ...
}

Next Steps:
1. Refresh order detail page in browser
2. Payment status should change to 'Paid'
```

**5. Refresh Order Page**
```
- Kembali ke browser
- Refresh halaman order (F5)
- Status: "Paid" ✅
```

---

## ⚠️ TROUBLESHOOTING

### Problem: Transaction Not Found (404)

**Error:**
```
❌ FAILED! Error occurred:
Status Code: 404
- Order ID not found in Midtrans
```

**Penyebab:**
- Order belum di-create
- Order ID salah
- Transaction belum masuk sistem Midtrans

**Solusi:**
1. Pastikan Anda sudah klik "Bayar Sekarang" di web
2. Pastikan popup Midtrans sempat muncul
3. Check dashboard: https://dashboard.sandbox.midtrans.com/transactions
4. Tunggu 1-2 menit, lalu coba lagi

---

### Problem: Invalid Server Key (401)

**Error:**
```
❌ FAILED! Error occurred:
Status Code: 401
- Invalid Server Key
```

**Penyebab:**
- Server Key salah di `.env.local`
- Pakai Production key di Sandbox mode

**Solusi:**
1. Buka `.env.local`
2. Cek `MIDTRANS_SERVER_KEY=...`
3. Harus diawali dengan `SB-Mid-server-` (Sandbox)
4. Copy ulang dari: https://dashboard.sandbox.midtrans.com/ → Settings → Access Keys

---

### Problem: QRIS "Tidak Sesuai"

**Error:**
```
Scan QR code dengan BCA Mobile/blu
Result: "QR tidak sesuai" atau "Terputus"
```

**Penyebab:**
- QR sandbox tidak compatible dengan app bank real

**Solusi:**
- ✅ Gunakan Metode 1 (Dashboard)
- ✅ Atau gunakan Credit Card test
- ❌ JANGAN scan QR dengan app bank di Sandbox

---

### Problem: Popup Midtrans Tidak Muncul

**Penyebab:**
- Popup di-block browser
- JavaScript error

**Solusi:**
1. Allow popup untuk localhost:3000
2. Buka Console (F12) → Lihat error
3. Refresh page
4. Coba browser lain (Chrome/Edge)

---

## 🚀 SWITCH KE PRODUCTION (Optional)

### Kapan Perlu Production?

- ✅ Mau test dengan BCA/blu/Dana **REAL**
- ✅ Mau deploy ke live server
- ✅ Sudah siap terima payment customer

### Steps:

**1. Verifikasi Bisnis di Midtrans**
```
Requirements:
- KTP owner
- NPWP (jika ada)
- Dokumen legalitas (SIUP/NIB)
- Rekening bank bisnis

Submit: https://dashboard.midtrans.com/settings/business
Approval: 1-3 hari kerja
```

**2. Get Production Keys**
```
Login: https://dashboard.midtrans.com/
Switch: "Sandbox" → "Production" (top right)
Settings → Access Keys
Copy:
- Production Server Key (Mid-server-xxx)
- Production Client Key (Mid-client-xxx)
```

**3. Update `.env.local`**
```bash
# Ganti keys (TANPA prefix "SB-")
MIDTRANS_SERVER_KEY=Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxxx

# Set production mode
MIDTRANS_IS_PRODUCTION=true
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true
```

**4. Restart Server**
```bash
npm run dev
```

**5. Test Real Payment**
```
- Create order
- Scan QRIS dengan BCA/blu → Berhasil! ✅
- Transfer VA dengan m-banking → Berhasil! ✅
- Bayar Alfamart/Indomaret → Berhasil! ✅
```

---

## 📚 RESOURCES

- **Midtrans Sandbox Dashboard**: https://dashboard.sandbox.midtrans.com/
- **Midtrans Production Dashboard**: https://dashboard.midtrans.com/
- **API Documentation**: https://docs.midtrans.com/
- **Test Cards**: https://docs.midtrans.com/docs/testing-payment
- **Support**: support@midtrans.com

---

## ✅ CHECKLIST

**Testing di Sandbox:**
- [ ] Create order berhasil
- [ ] Popup Midtrans muncul
- [ ] Test credit card → Success
- [ ] Test via dashboard → Success
- [ ] Status order update → Paid
- [ ] Invoice bisa di-download
- [ ] Webhook notification (optional)

**Ready Production:**
- [ ] Bisnis terverifikasi
- [ ] Production keys didapat
- [ ] `.env.local` updated
- [ ] Test small amount (Rp 10,000)
- [ ] Webhook configured (HTTPS)
- [ ] SSL certificate active
- [ ] Domain configured

---

## 💡 TIPS

1. **Jangan test QRIS di Sandbox** → Tidak akan berhasil dengan app real
2. **Gunakan Credit Card test** → Paling cepat untuk test flow
3. **Dashboard paling reliable** → Untuk manual approval
4. **PowerShell script** → Untuk automated testing
5. **Test semua scenarios** → Success, Failed, Pending
6. **Check webhook logs** → Untuk debug auto-update issues

---

Semoga membantu! 🚀
