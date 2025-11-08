# RajaOngkir Integration Guide

## 🎯 Overview

RajaOngkir adalah API untuk menghitung ongkos kirim dari berbagai ekspedisi di Indonesia. Project ini mendukung **2 plan**:

### **FREE Plan (Starter)** ✅
- ✅ 1000 requests per bulan
- ✅ 3 kurir: JNE, POS Indonesia, TIKI
- ✅ Support pengiriman domestik & internasional (JNE, TIKI, POS)
- ✅ Data provinsi, kota, dan kecamatan
- ✅ **TIDAK butuh billing/credit card**

### **PAID Plan (Basic - Rp 50.000/bulan)** 💰
- ✅ 10,000 requests per bulan
- ✅ 11 kurir: JNE, POS, TIKI, SiCepat, IDExpress, SAP Express, Ninja Xpress, J&T Express, Wahana, Lion Parcel, Royal Express
- ✅ Support pengiriman domestik (semua kurir)
- ✅ Support pengiriman internasional (hanya JNE, TIKI, POS)

## 🚢 Supported Couriers

| Courier | Code | Free Plan | Paid Plan | Domestic | International |
|---------|------|-----------|-----------|----------|---------------|
| JNE | `jne` | ✅ | ✅ | ✅ | ✅ |
| POS Indonesia | `pos` | ✅ | ✅ | ✅ | ✅ |
| TIKI | `tiki` | ✅ | ✅ | ✅ | ✅ |
| SiCepat | `sicepat` | ❌ | ✅ | ✅ | ❌ |
| ID Express | `ide` | ❌ | ✅ | ✅ | ❌ |
| SAP Express | `sap` | ❌ | ✅ | ✅ | ❌ |
| Ninja Xpress | `ninja` | ❌ | ✅ | ✅ | ❌ |
| J&T Express | `jnt` | ❌ | ✅ | ✅ | ❌ |
| Wahana Express | `wahana` | ❌ | ✅ | ✅ | ❌ |
| Lion Parcel | `lion` | ❌ | ✅ | ✅ | ❌ |
| Royal Express Asia | `rex` | ❌ | ✅ | ✅ | ❌ |

## 📋 Setup Guide

### 1. Registrasi RajaOngkir

1. Kunjungi: https://rajaongkir.com/register
2. Isi form registrasi:
   - Nama
   - Email
   - Password
   - No. HP
3. Verifikasi email (cek inbox/spam)
4. Login ke dashboard: https://rajaongkir.com/akun

### 2. Dapatkan API Key

1. Login ke dashboard RajaOngkir
2. Klik menu **"Akun"** atau **"API Key"**
3. Copy API Key dari plan **"Starter"** (gratis)
4. API Key format: `1234567890abcdef` (16 karakter)

### 3. Konfigurasi Environment Variable

1. Copy `.env.example` ke `.env.local`:
```bash
copy .env.example .env.local
```

2. Edit `.env.local`, tambahkan API Key:
```bash
RAJAONGKIR_API_KEY=1234567890abcdef
```

3. **JANGAN commit `.env.local`** (sudah di-gitignore)

### 4. Tentukan City ID Toko

RajaOngkir menggunakan **City ID** untuk menghitung ongkir. Anda perlu tahu City ID toko Anda.

**Cara cek City ID:**

1. **Via API Manual** (Postman/Thunder Client):
```bash
GET https://api.rajaongkir.com/starter/city
Headers:
  key: YOUR_API_KEY
```

2. **Via tRPC Query** (setelah setup):
```typescript
// Di browser console atau React component
const { data } = trpc.shipping.searchCity.useQuery({ 
  cityName: "Yogyakarta" 
});
console.log(data); // Lihat city_id
```

3. **City ID Umum** (reference):
| Kota | City ID |
|------|---------|
| Jakarta Selatan | 151 |
| Jakarta Utara | 152 |
| Bandung | 23 |
| Surabaya | 444 |
| Yogyakarta | 501 |
| Semarang | 398 |
| Medan | 151 |
| Denpasar | 114 |

4. **Update `STORE_CITY_ID`** di `src/components/ShippingCalculator.tsx`:
```typescript
// Line ~27
const STORE_CITY_ID = '501'; // ⬅️ GANTI dengan City ID toko Anda
```

## 🚀 Usage di Checkout Page

### Import Component

```typescript
import ShippingCalculator from '@/components/ShippingCalculator';
```

### Example Implementation

```typescript
export default function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  
  // Get cart items
  const cartItems = useCartStore((state) => state.items);
  
  // Calculate total weight (example: each item = 1kg)
  const totalWeight = cartItems.reduce((total, item) => {
    const itemWeight = 1000; // 1000 grams = 1kg per item
    return total + (itemWeight * item.quantity);
  }, 0);

  return (
    <div>
      {/* Address Selection (your existing code) */}
      
      {/* Shipping Calculator */}
      {selectedAddress && (
        <ShippingCalculator
          destinationCity={selectedAddress.city}
          destinationCountry={selectedAddress.country || 'Indonesia'} // ⭐ NEW: Country detection
          cartWeight={totalWeight}
          onSelectShipping={(option) => setSelectedShipping(option)}
          selectedShipping={selectedShipping}
          rajaOngkirPlan="free" // ⭐ NEW: 'free' or 'all' (default: 'free')
        />
      )}
      
      {/* Order Summary */}
      {selectedShipping && (
        <div>
          <p>Subtotal: Rp {subtotal}</p>
          <p>Ongkir ({selectedShipping.courierName} - {selectedShipping.service}): 
             Rp {selectedShipping.cost}</p>
          <p>Total: Rp {subtotal + selectedShipping.cost}</p>
        </div>
      )}
    </div>
  );
}
```

### Props Reference

```typescript
interface ShippingCalculatorProps {
  destinationCity: string;        // Required: City name (e.g., "Jakarta")
  destinationCountry?: string;    // Optional: Country name (default: "Indonesia")
  cartWeight: number;             // Required: Total weight in grams
  onSelectShipping: (option) => void; // Required: Callback when user selects shipping
  selectedShipping?: ShippingOption;  // Optional: Currently selected option
  rajaOngkirPlan?: 'free' | 'all';   // Optional: RajaOngkir plan (default: 'free')
}
```

## 🌍 International Shipping

Sistem otomatis deteksi pengiriman internasional berdasarkan `destinationCountry`:

### Domestic Shipping (Indonesia)
```typescript
<ShippingCalculator
  destinationCity="Jakarta"
  destinationCountry="Indonesia" // atau kosongkan (default Indonesia)
  cartWeight={5000}
  rajaOngkirPlan="free" // JNE, POS, TIKI
  // atau
  rajaOngkirPlan="all"  // JNE, POS, TIKI, SiCepat, J&T, Ninja, dll
  onSelectShipping={handleSelect}
/>
```

**Available Couriers (Domestic)**:
- **Free Plan**: JNE, POS Indonesia, TIKI (3 kurir)
- **Paid Plan**: + SiCepat, IDExpress, SAP Express, Ninja, J&T, Wahana, Lion Parcel, Royal Express (11 kurir total)

### International Shipping
```typescript
<ShippingCalculator
  destinationCity="Singapore"
  destinationCountry="Singapore" // ⭐ Bukan Indonesia = International
  cartWeight={5000}
  rajaOngkirPlan="free" // Plan tidak berpengaruh untuk international
  onSelectShipping={handleSelect}
/>
```

**Available Couriers (International)**:
- ✅ JNE (International service)
- ✅ TIKI (International service)  
- ✅ POS Indonesia (International service)
- ❌ SiCepat, J&T, Ninja, dll (Domestic only)

**Important**: Untuk international, sistem otomatis filter hanya kurir yang support international (JNE, TIKI, POS) - tidak peduli plan apa yang digunakan.

## 💰 Upgrade dari FREE ke PAID Plan

### Kapan Perlu Upgrade?

1. **Free Plan Limits (1000 requests/bulan)**
   - Estimasi: ~33 requests per hari
   - Cocok untuk: Development, startup kecil (< 30 orders/hari)
   
2. **Need More Couriers (11 vs 3)**
   - Customer complain: "Kok gak ada SiCepat/J&T?"
   - Kompetitor offer more courier options
   
3. **Paid Plan Benefits (Rp 50,000/bulan)**
   - 10,000 requests/bulan (~333 requests/hari)
   - 8 additional couriers (SiCepat, IDExpress, SAP, Ninja, J&T, Wahana, Lion, Rex)
   - Better for scaling business

### How to Upgrade

**Step 1**: Beli paket Basic di RajaOngkir
- Login ke https://rajaongkir.com/panel/dashboard
- Pilih: **"Upgrade Paket"**
- Pilih: **Basic Plan (Rp 50,000/bulan)**
- Bayar via transfer/virtual account

**Step 2**: Update Environment Variable
```bash
# .env.local (TIDAK PERLU GANTI API KEY)
RAJAONGKIR_API_KEY=your_api_key # ⭐ Sama seperti FREE plan, API key tidak berubah
```

**Step 3**: Update Component Props
```typescript
// Before (FREE plan)
<ShippingCalculator
  destinationCity="Jakarta"
  cartWeight={5000}
  rajaOngkirPlan="free" // ⭐ 3 kurir
  onSelectShipping={handleSelect}
/>

// After (PAID plan)
<ShippingCalculator
  destinationCity="Jakarta"
  cartWeight={5000}
  rajaOngkirPlan="all" // ⭐ 11 kurir
  onSelectShipping={handleSelect}
/>
```

**Important**: Setelah upgrade ke Basic plan, ganti `rajaOngkirPlan="all"` untuk aktifkan semua 11 kurir.

### Plan Switching Logic

Sistem otomatis filter kurir berdasarkan plan:

```typescript
// src/lib/rajaongkir.ts
export function getAvailableCouriers(
  isInternational: boolean,
  plan: 'free' | 'all' = 'free'
): string[] {
  if (isInternational) {
    return COURIER_CONFIG.international; // Always 3 couriers (JNE, TIKI, POS)
  }
  
  return plan === 'all' 
    ? COURIER_CONFIG.all     // 11 couriers
    : COURIER_CONFIG.free;   // 3 couriers
}
```

**Scenarios**:
- `rajaOngkirPlan="free"` + Domestic → 3 kurir (JNE, POS, TIKI)
- `rajaOngkirPlan="all"` + Domestic → 11 kurir
- `rajaOngkirPlan="free"` + International → 3 kurir (forced)
- `rajaOngkirPlan="all"` + International → 3 kurir (forced) - ⚠️ Paid plan tidak menambah kurir international

## 🎨 UI/UX Notes

### Info Cards

System automatically shows contextual information:

**1. International Shipping Notice** (Blue card)
```
🌍 Pengiriman Internasional
Hanya kurir JNE, TIKI, dan POS Indonesia yang tersedia untuk pengiriman ke luar negeri.
```

**2. Free Plan Notice** (Blue card)
```
ℹ️ Plan Gratis RajaOngkir
Anda menggunakan plan gratis dengan 3 pilihan kurir. Upgrade ke plan berbayar untuk 8 kurir tambahan.
```

**3. Paid Plan Info** (Green card)
```
✅ Plan Berbayar RajaOngkir
Anda memiliki akses ke 11 kurir pengiriman.
```

### Shipping Option Cards

Tampilan opsi pengiriman dengan:
- Logo kurir (optional - bisa tambahkan image)
- Nama kurir + service (e.g., "JNE - REG")
- Estimasi waktu (e.g., "2-3 HARI")
- Biaya ongkir (e.g., "Rp 25,000")
- Selected state (green border + checkmark)

### Empty State

Jika tidak ada opsi pengiriman:
```
📦 Tidak ada opsi pengiriman tersedia
Mohon periksa kembali kota tujuan atau coba refresh halaman.
```

## 🐛 Troubleshooting

### Error: "Invalid API key"

**Problem**: API key tidak diterima oleh RajaOngkir

**Solution**:
1. Check `.env.local` file:
   ```bash
   RAJAONGKIR_API_KEY=your_actual_api_key_here
   ```
2. Restart dev server: `npm run dev`
3. Verify API key di dashboard RajaOngkir
4. Make sure no spaces/quotes around API key

### Error: "Destination not found"

**Problem**: Nama kota tidak valid atau tidak ada di database RajaOngkir

**Solution**:
1. Gunakan `searchCity` query untuk validasi:
   ```typescript
   const { data: cities } = trpc.shipping.searchCity.useQuery({ query: "Jakarta" });
   ```
2. Gunakan exact city name dari hasil search
3. Don't use abbreviations (e.g., use "Jakarta Barat", not "Jakbar")

### Error: "Unsupported courier for destination"

**Problem**: Kurir tidak support pengiriman ke destinasi tertentu

**Solution**:
1. Check international destination → hanya JNE/TIKI/POS
2. Beberapa kurir tidak cover semua kota di Indonesia
3. Tambahkan error handling di component:
   ```typescript
   {shippingOptions.length === 0 && (
     <p>Tidak ada kurir tersedia untuk kota ini. Coba kurir lain.</p>
   )}
   ```

### No Shipping Options Returned

**Problem**: API call success tapi tidak ada shipping options

**Possible Causes**:
1. **Weight too heavy**: Some couriers limit max weight
   - JNE: Max 30kg per shipment
   - Solution: Split order into multiple packages
   
2. **City not covered**: Remote areas may not be covered
   - Solution: Show message "Area tidak terjangkau"
   
3. **Invalid origin city**: Origin city ID wrong in backend
   - Solution: Verify ORIGIN_CITY_ID in rajaongkir.ts (default: 501 for Yogyakarta)

### Slow API Response

**Problem**: calculateShippingCost takes > 3 seconds

**Solution**:
1. **Use loading state**:
   ```typescript
   {isLoading && <Spinner />}
   ```
2. **Parallel fetching already implemented**:
   ```typescript
   // calculateMultipleCouriers uses Promise.all
   const results = await Promise.all(promises);
   ```
3. **Consider caching** (advanced):
   - Cache shipping costs for same city + weight combination
   - TTL: 1 hour (shipping costs rarely change)

### Rate Limit Exceeded

**Problem**: "429 Too Many Requests" error

**Causes**:
- Free plan: 1000 requests/bulan exceeded
- Basic plan: 10,000 requests/bulan exceeded

**Solution**:
1. **Monitor usage** di RajaOngkir dashboard
2. **Implement caching** untuk reduce API calls
3. **Upgrade plan** if needed
4. **Add rate limit handling**:
   ```typescript
   try {
     const result = await fetch(rajaOngkirAPI);
   } catch (error) {
     if (error.response?.status === 429) {
       toast.error('Rate limit exceeded. Please try again later.');
     }
   }
   ```

## ✅ Best Practices

### 1. Weight Calculation

```typescript
// ✅ CORRECT: Calculate accurate weight
const totalWeight = cartItems.reduce((total, item) => {
  // Get actual product weight from database
  const itemWeight = item.weight || 1000; // Default 1kg if weight not set
  return total + (itemWeight * item.quantity);
}, 0);

// ❌ WRONG: Fixed weight per item
const totalWeight = cartItems.length * 1000; // Assumes all items 1kg
```

### 2. Address Validation

```typescript
// ✅ CORRECT: Validate city name before calculating
const { data: cities } = trpc.shipping.searchCity.useQuery({ 
  query: userAddress.city 
});

if (cities && cities.length > 0) {
  const validCity = cities[0].city_name;
  // Use validCity for shipping calculator
}

// ❌ WRONG: Use user input directly
<ShippingCalculator destinationCity={userAddress.city} /> // May have typos
```

### 3. Error Handling

```typescript
// ✅ CORRECT: Show fallback for errors
<ShippingCalculator
  destinationCity={address.city}
  cartWeight={totalWeight}
  onSelectShipping={handleSelect}
  onError={(error) => {
    console.error('Shipping error:', error);
    toast.error('Gagal menghitung ongkir. Coba lagi.');
  }}
/>

// ❌ WRONG: No error feedback to user
<ShippingCalculator {...props} /> // Silent failure
```

### 4. Plan Management

```typescript
// ✅ CORRECT: Get plan from user settings or environment
const userPlan = user?.subscription?.rajaOngkirPlan || 'free';

<ShippingCalculator
  rajaOngkirPlan={userPlan} // Dynamic based on user
  {...otherProps}
/>

// ❌ WRONG: Hardcode plan in component
<ShippingCalculator rajaOngkirPlan="free" /> // Can't scale
```

### 5. International Detection

```typescript
// ✅ CORRECT: Use country field from address
<ShippingCalculator
  destinationCity={address.city}
  destinationCountry={address.country || 'Indonesia'} // Explicit country
  cartWeight={totalWeight}
  {...otherProps}
/>

// ❌ WRONG: Assume always Indonesia
<ShippingCalculator
  destinationCity={address.city} // Missing country prop
  {...otherProps}
/>
```

### 6. Performance Optimization

```typescript
// ✅ CORRECT: Memoize expensive calculations
const totalWeight = useMemo(() => {
  return cartItems.reduce((total, item) => 
    total + (item.weight * item.quantity), 0
  );
}, [cartItems]);

// ❌ WRONG: Recalculate on every render
const totalWeight = cartItems.reduce(...); // Inside component body
```

## 📚 Additional Resources

- **RajaOngkir Documentation**: https://rajaongkir.com/dokumentasi
- **API Starter Guide**: https://rajaongkir.com/dokumentasi/starter
- **Supported Cities List**: Use `getProvinces` and `getCitiesByProvince` queries
- **Courier Coverage**: Check individual courier websites for area coverage

## 🔄 Migration Notes

If upgrading from static shipping cost:

**Before**:
```typescript
const shippingCost = 15000; // Static
const total = subtotal + shippingCost;
```

**After**:
```typescript
const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

<ShippingCalculator
  destinationCity={address.city}
  cartWeight={totalWeight}
  onSelectShipping={setSelectedShipping}
/>

const total = subtotal + (selectedShipping?.cost || 0);
```

**Database Schema Changes**:
```typescript
// Add to Order model
interface Order {
  // ... existing fields
  shippingDetails: {
    courierCode: string;      // e.g., "jne"
    courierName: string;      // e.g., "JNE"
    service: string;          // e.g., "REG"
    cost: number;             // e.g., 25000
    estimatedDays: string;    // e.g., "2-3 HARI"
  };
}
```

---

**Last Updated**: November 2025  
**Version**: 2.0 (Multi-courier + International support)  
**Maintained by**: proyek-fpw development team

## 📦 Calculate Product Weight

RajaOngkir membutuhkan berat dalam **gram**. Anda perlu tambahkan field `weight` di Product model atau estimasi.

### Option 1: Add Weight Field to Product (Recommended)

```typescript
// src/models/Product.ts
export interface IProduct extends Document {
  // ... existing fields
  weight?: number; // Weight in kg (optional, default 1kg)
}

// Schema
const ProductSchema = new Schema<IProduct>({
  // ... existing fields
  weight: {
    type: Number,
    default: 1, // Default 1kg if not specified
    min: [0.001, 'Weight must be positive']
  }
});
```

### Option 2: Category-Based Weight Estimation

```typescript
// src/lib/rajaongkir.ts
export function estimateProductWeight(category: string): number {
  const weightMap: Record<string, number> = {
    'Semen': 50, // 50kg per sak
    'Besi': 7.4, // 7.4kg per batang (depends on diameter)
    'Pipa': 2, // 2kg per batang
    'Cat': 5, // 5kg per kaleng
    'Triplek': 15, // 15kg per lembar
    'Kawat': 25, // 25kg per gulung
    'Tangki Air': 30, // 30kg per unit
    'Paku': 1, // 1kg per pack
    'Baut': 0.5, // 0.5kg per pack
    'Aspal': 20, // 20kg per drum
  };
  
  return (weightMap[category] || 1) * 1000; // Convert to grams
}

// Usage
const totalWeight = cartItems.reduce((total, item) => {
  const weightPerItem = estimateProductWeight(item.category);
  return total + (weightPerItem * item.quantity);
}, 0);
```

### Option 3: Use Product Attributes

```typescript
// Jika product punya attributes.weight_kg
const totalWeight = cartItems.reduce((total, item) => {
  // Get weight from product attributes or default to 1kg
  const weightKg = item.weight || 1; // Assume you fetch product data
  const weightGrams = weightKg * 1000;
  return total + (weightGrams * item.quantity);
}, 0);
```

## 🔍 API Reference

### Available tRPC Procedures

```typescript
// 1. Get all provinces
const { data: provinces } = trpc.shipping.getProvinces.useQuery();

// 2. Get cities by province
const { data: cities } = trpc.shipping.getCitiesByProvince.useQuery({
  provinceId: '5' // Yogyakarta province
});

// 3. Search city by name
const { data: cityResults } = trpc.shipping.searchCity.useQuery({
  cityName: 'Jakarta'
});

// 4. Calculate shipping cost (single courier)
const { data: shippingCost } = trpc.shipping.calculateShippingCost.useQuery({
  origin: '501', // Yogyakarta
  destination: '152', // Jakarta Utara
  weight: 1000, // 1kg in grams
  courier: 'jne'
});

// 5. Get all shipping options (JNE + POS + TIKI)
const { data: allOptions } = trpc.shipping.getAllShippingOptions.useQuery({
  origin: '501',
  destination: '152',
  weight: 1000
});
```

## ⚠️ Important Notes

### 1. Free Plan Limitations

- **1000 requests/month**: Hitung estimasi traffic
  - 1 checkout = ~2 requests (search city + get shipping options)
  - 500 checkout/bulan = 1000 requests
- **Tidak support COD auto-check**: Harus enable manual
- **3 kurir only**: JNE, POS, TIKI (tidak ada SiCepat, J&T, dll)

### 2. City Matching Strategy

RajaOngkir city name bisa beda dengan input user:
- User input: "Jakarta" → RajaOngkir: "Jakarta Selatan", "Jakarta Utara", dll
- User input: "Yogyakarta" → RajaOngkir: "Yogyakarta"

**Solusi**: `ShippingCalculator` auto-match city name, ambil first result

**Improve matching** (optional):
```typescript
// Filter by exact match first, then partial match
const exactMatch = cities.find(city => 
  city.city_name.toLowerCase() === destinationCity.toLowerCase()
);
const cityId = exactMatch?.city_id || cities[0]?.city_id;
```

### 3. Weight Calculation

- Berat material bangunan bisa **sangat berat** (semen 50kg, besi 7.4kg)
- Total berat cart bisa 100kg+ → ongkir mahal
- **Rekomendasi**: Tambah informasi berat di product detail
- **Alternative**: Hubungi admin untuk nego ongkir

### 4. Error Handling

```typescript
// Jika API error atau quota habis
try {
  const result = await calculateShippingCost({ ... });
} catch (error) {
  // Fallback: Tampilkan static ongkir atau contact admin
  toast.error('Gagal menghitung ongkir', {
    description: 'Silakan hubungi admin untuk info ongkir'
  });
}
```

## 🎨 Customization

### Change Store Location

Edit `ShippingCalculator.tsx`:
```typescript
const STORE_CITY_ID = '501'; // Change to your city ID
```

### Add More Couriers (Upgrade Plan)

Free plan hanya 3 kurir. Untuk lebih banyak (SiCepat, J&T, Anteraja, dll):
- Upgrade ke **Basic Plan** (Rp 50.000/bulan)
- Atau gunakan API lain (ongkoskirim.com, binderbyte.com)

### Styling Shipping Options

Component menggunakan shadcn Card. Customize di `ShippingCalculator.tsx`:
- Line 160-220: Card layout
- Line 175-184: Courier icon/logo (bisa ganti dengan image)
- Line 230-240: Selected shipping summary

## 🚨 Troubleshooting

### "Failed to fetch provinces"

1. Check API Key valid:
```bash
# Test via curl
curl -H "key: YOUR_API_KEY" https://api.rajaongkir.com/starter/province
```

2. Check `.env.local` loaded:
```typescript
console.log(process.env.RAJAONGKIR_API_KEY); // Should not be undefined
```

3. Restart dev server:
```bash
# Ctrl+C to stop, then:
npm run dev
```

### "Quota exceeded"

Free plan limit 1000 requests/month. Solutions:
- Wait next month (quota reset)
- Upgrade plan
- Cache city data (reduce API calls)

### "City not found"

City name tidak match dengan RajaOngkir database:
- Log search result: `console.log(citySearchResult)`
- Manual input city ID (better accuracy)
- Improve matching logic

## 📚 Alternative APIs (100% Free)

Jika RajaOngkir quota habis, alternatif:

### 1. BinderByte (FREE)
- **Website**: https://binderbyte.com
- **Free Plan**: Unlimited requests (with rate limit)
- **Kurir**: JNE, POS, TIKI, SiCepat, J&T, Anteraja, Ninja, Lion Parcel
- **Registrasi**: Email only (no CC)

### 2. OngkosKirim.com (FREE)
- **Website**: https://ongkoskirim.com
- **Free Plan**: 500 requests/month
- **Kurir**: 10+ kurir nasional
- **Registrasi**: Email only

## 📝 Next Steps

1. ✅ Registrasi RajaOngkir
2. ✅ Copy API Key ke `.env.local`
3. ✅ Update `STORE_CITY_ID` di ShippingCalculator
4. ✅ Add weight field to Product model (optional)
5. ✅ Integrate ShippingCalculator ke checkout page
6. ✅ Test dengan alamat berbeda
7. ✅ Handle error cases (quota, city not found)

## 💡 Tips

- **Cache city data**: Store provinces/cities di database untuk reduce API calls
- **Show weight info**: Tampilkan estimasi berat di cart untuk transparency
- **Multiple shipping address**: Hitung ongkir per alamat berbeda
- **Admin override**: Allow admin set custom shipping cost jika API error

---

**Documentation Updated**: November 8, 2025
