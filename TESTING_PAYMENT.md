# Testing Payment di Sandbox

## QRIS Testing

### ❌ Cara SALAH (Tidak akan berhasil):
1. Create order
2. Klik "Bayar Sekarang" → Pilih QRIS
3. Scan QR code dengan BCA Mobile/blu/Dana/OVO
4. **GAGAL**: "QR tidak sesuai" atau "Terputus"

### ✅ Cara BENAR (Sandbox Simulation):

**Opsi 1: Via Midtrans Dashboard** (PALING MUDAH) ⭐
1. Create order di web Anda
2. Login Midtrans Dashboard: https://dashboard.sandbox.midtrans.com/
3. Sidebar kiri → **"Transactions"**
4. Cari order Anda (by Order ID atau waktu)
5. Klik transaction → Dropdown **"Action"**
6. Pilih **"Set to Settlement"** atau **"Mark as Success"**
7. Refresh halaman order di web Anda ✅

**Opsi 2: Test Credit Card** (INSTANT SUCCESS)
1. Create order → Pilih "Credit Card"
2. Masukkan test card:
   ```
   Card: 4811 1111 1111 1114
   CVV: 123
   Exp: 01/25
   OTP: 112233
   ```
3. Payment langsung berhasil ✅

**Opsi 3: GoPay/ShopeePay Simulator**
1. Pilih GoPay atau ShopeePay
2. Redirect ke simulator page
3. Klik tombol **"Pay"** (hijau)
4. Payment berhasil ✅

**Opsi 4: PowerShell Script** (AUTOMATED)
```powershell
# Di terminal PowerShell
cd d:\workspace\proyek-fpw
.\scripts\simulate-payment.ps1 -OrderId "ORD-20251109-001"

# Output:
# ✅ SUCCESS! Payment simulated successfully!
# Refresh order page → Status jadi "Paid"
```

## Payment Methods yang Bisa Ditest di Sandbox

### 1. Credit Card (Test Cards)
```
VISA Success:
- Card: 4811 1111 1111 1114
- CVV: 123
- Exp: 01/25

VISA Denied:
- Card: 4011 1111 1111 1112
- CVV: 123
- Exp: 01/25
```

### 2. GoPay/ShopeePay
1. Pilih payment method
2. Redirect ke simulator page
3. Klik "Success" atau "Pending" atau "Failed"

### 3. Bank Transfer (VA)
1. Pilih bank (BCA VA, BNI VA, dll)
2. Dapatkan VA number
3. **JANGAN transfer real** (sandbox!)
4. Use simulator atau dashboard untuk mark as paid

### 4. QRIS
- **Simulator only** (tidak bisa scan dengan app real)
- Use Snap simulator atau dashboard

## Switch ke Production (Real Payment)

### Kapan Harus Switch?
- ✅ Testing phase selesai
- ✅ Sudah verified business (KTP, NPWP)
- ✅ Siap terima real payment
- ✅ Webhook sudah setup dengan HTTPS URL

### Steps:
1. **Midtrans Dashboard**:
   - Switch ke "Production" (top right)
   - Complete verification
   - Copy Production keys

2. **Update `.env.local`**:
   ```bash
   MIDTRANS_SERVER_KEY=Mid-server-xxxxx (tanpa "SB-")
   MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
   MIDTRANS_IS_PRODUCTION=true
   NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true
   ```

3. **Restart server**: `npm run dev`

4. **Test real payment**:
   - QRIS → Scan dengan BCA/blu/Dana ✅
   - VA → Transfer dengan m-banking ✅
   - Alfamart/Indomaret → Bayar di kasir ✅

## Troubleshooting

### QR Code "Tidak Sesuai"
- **Penyebab**: Sandbox QR tidak compatible dengan real apps
- **Solusi**: Use simulator atau switch ke production

### blu BCA "Terputus"
- **Penyebab**: blu detect sandbox environment
- **Solusi**: Switch ke production untuk real testing

### Webhook Tidak Trigger
- **Penyebab**: Webhook URL must be public HTTPS
- **Solusi**: Use ngrok untuk local testing
  ```bash
  ngrok http 3000
  # Copy HTTPS URL ke Midtrans dashboard
  ```

## Rekomendasi

**Untuk Development (Now):**
- ✅ Tetap pakai Sandbox
- ✅ Test dengan simulator/dashboard
- ✅ Verify semua flow (success/failed/pending)

**Untuk Production (Later):**
- ✅ Complete Midtrans verification
- ✅ Update ke production keys
- ✅ Setup webhook dengan domain HTTPS
- ✅ Test dengan real small amount (Rp 10,000)
