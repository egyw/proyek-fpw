# 🎯 QUICK GUIDE: Test Payment Sandbox

## 🚀 CARA TERCEPAT (3 Menit)

### Metode 1: Dashboard (Semua Payment Method)
```
1. Checkout → Bayar → Copy Order ID
2. Buka: https://dashboard.sandbox.midtrans.com/
3. Transactions → Cari order → Action → "Set to Settlement"
4. Refresh order page → Status: Paid ✅
```

### Metode 2: Credit Card (Instant)
```
1. Checkout → Pilih Credit Card
2. Card: 4811 1111 1111 1114
3. CVV: 123, Exp: 01/25, OTP: 112233
4. Langsung berhasil ✅
```

---

## ❌ JANGAN LAKUKAN INI

```
❌ Scan QRIS dengan BCA Mobile/blu/Dana
   → Tidak akan berhasil (sandbox QR code)

❌ Transfer VA dengan m-banking real
   → Tidak akan masuk (sandbox VA number)

❌ Bayar di Alfamart/Indomaret real
   → Tidak ada di sistem (sandbox code)
```

---

## ✅ YANG BISA DI-TEST

| Payment Method | Cara Test |
|----------------|-----------|
| **QRIS** | Dashboard → Set to Settlement |
| **Credit Card** | Test card: 4811 1111 1111 1114 |
| **GoPay** | Klik → Simulator → Pay |
| **ShopeePay** | Klik → Simulator → Pay |
| **BCA VA** | Dashboard → Set to Settlement |
| **BNI VA** | Dashboard → Set to Settlement |
| **Mandiri Bill** | Dashboard → Set to Settlement |
| **Alfamart** | Dashboard → Set to Settlement |
| **Indomaret** | Dashboard → Set to Settlement |

---

## 🔧 PowerShell Script

```powershell
# Run di PowerShell (bukan cmd!)
cd d:\workspace\proyek-fpw
.\scripts\simulate-payment.ps1 -OrderId "ORD-20251109-001"
```

---

## 📱 Test Credit Cards

**Success:**
```
Card: 4811 1111 1111 1114
CVV: 123
Exp: 01/25
OTP: 112233
```

**Failed:**
```
Card: 4011 1111 1111 1112
CVV: 123
Exp: 01/25
OTP: 112233
```

---

## 🌐 Links

- Dashboard Sandbox: https://dashboard.sandbox.midtrans.com/
- Dashboard Production: https://dashboard.midtrans.com/
- Docs: https://docs.midtrans.com/

---

## 💡 Tips

1. **QRIS tidak bisa scan** → Gunakan dashboard
2. **Tercepat** → Test dengan credit card
3. **Paling reliable** → Via dashboard
4. **Automated** → PowerShell script

---

## ⚠️ Troubleshooting

**404 - Transaction Not Found**
```
→ Tunggu 1-2 menit setelah create order
→ Check dashboard: ada transaction atau tidak
```

**401 - Invalid Server Key**
```
→ Check .env.local → MIDTRANS_SERVER_KEY
→ Harus ada prefix "SB-" untuk sandbox
```

**QRIS "Tidak Sesuai"**
```
→ Normal! QR sandbox tidak bisa scan dengan app real
→ Gunakan dashboard untuk set success
```

---

Butuh bantuan? Buka: `CARA_TEST_PAYMENT.md` 📖
