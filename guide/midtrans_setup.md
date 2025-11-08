# Midtrans Payment Gateway Integration Guide

## 📋 Overview

Midtrans adalah payment gateway Indonesia yang mendukung berbagai metode pembayaran:
- **E-Wallet**: GoPay, ShopeePay, QRIS
- **Virtual Account**: BCA, Mandiri, BNI, BRI, Permata
- **Credit Card**: Visa, MasterCard, JCB
- **Gerai Retail**: Alfamart, Indomaret

## 🚀 Quick Start

### 1. Registrasi Midtrans

1. Daftar akun di: https://dashboard.midtrans.com/register
2. Verifikasi email Anda
3. Login ke dashboard: https://dashboard.midtrans.com/

### 2. Dapatkan API Keys

#### **Sandbox (Development/Testing)**
1. Pilih **SANDBOX** environment di dashboard
2. Go to **Settings** > **Access Keys**
3. Copy:
   - **Server Key** (contoh: `SB-Mid-server-xxxxx`)
   - **Client Key** (contoh: `SB-Mid-client-xxxxx`)

#### **Production (Live Payment)**
1. Submit dokumen verifikasi bisnis
2. Setelah approved, pilih **PRODUCTION** environment
3. Copy Server Key dan Client Key dari Production

### 3. Setup Environment Variables

Edit file `.env.local`:

```bash
# Midtrans Server Key (RAHASIA - jangan commit ke git!)
MIDTRANS_SERVER_KEY=SB-Mid-server-your_key_here

# Midtrans Client Key (PUBLIC - aman untuk frontend)
MIDTRANS_CLIENT_KEY=SB-Mid-client-your_key_here

# Environment (false = sandbox, true = production)
MIDTRANS_IS_PRODUCTION=false
```

**⚠️ IMPORTANT**: 
- Gunakan **SANDBOX** keys untuk development
- Ganti dengan **PRODUCTION** keys saat deploy

### 4. Install Dependencies

```bash
npm install midtrans-client
```

### 5. Restart Development Server

```bash
npm run dev
```

## 🔧 Architecture

### Flow Diagram

```
Customer → Checkout Page → Create Order (tRPC)
                                ↓
                        Generate Midtrans Snap Token
                                ↓
                        Open Midtrans Payment Page
                                ↓
                    Customer Completes Payment
                                ↓
                        Midtrans Webhook → Our Server
                                ↓
                        Update Order Status
                                ↓
                        Customer → Order Success Page
```

### File Structure

```
src/
├── lib/
│   └── midtrans.ts                    # Midtrans helper functions
├── models/
│   └── Order.ts                       # Order model with Midtrans fields
├── pages/
│   └── api/
│       └── midtrans/
│           └── webhook.ts             # Webhook handler
├── server/
│   └── routers/
│       └── orders.ts                  # Order tRPC router
└── components/
    └── MidtransPaymentButton.tsx     # (TO BE CREATED)
```

## 📝 Key Components

### 1. Order Model (`src/models/Order.ts`)

Order sudah include fields untuk Midtrans:

```typescript
{
  orderId: string;           // Unique order ID
  snapToken: string;         // Midtrans Snap token
  snapRedirectUrl: string;   // Payment page URL
  transactionId: string;     // Midtrans transaction ID
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired';
  orderStatus: 'pending_payment' | 'paid' | 'processing' | ...;
}
```

### 2. Midtrans Helper (`src/lib/midtrans.ts`)

Helper functions:
- `createSnapToken()` - Create payment token
- `getTransactionStatus()` - Check payment status
- `verifySignature()` - Verify webhook authenticity
- `mapMidtransStatus()` - Map status to our format

### 3. Orders Router (`src/server/routers/orders.ts`)

tRPC procedures:
- `createOrder` - Create order + Midtrans token
- `getUserOrders` - Get user's orders
- `getOrderById` - Get order detail
- `updatePaymentStatus` - Update from webhook
- `cancelOrder` - Cancel unpaid order

### 4. Webhook Handler (`src/pages/api/midtrans/webhook.ts`)

Receives payment notifications from Midtrans and updates order status.

## 🔐 Webhook Configuration

### Setup Webhook URL in Midtrans Dashboard

1. Login ke: https://dashboard.midtrans.com/
2. Go to **Settings** > **Configuration**
3. Set **Payment Notification URL**:
   - Development: `http://localhost:3000/api/midtrans/webhook`
   - Production: `https://yourdomain.com/api/midtrans/webhook`

**⚠️ For localhost testing**:
- Use **ngrok** to expose local server: `ngrok http 3000`
- Use ngrok URL as webhook: `https://xxxx.ngrok.io/api/midtrans/webhook`

### Webhook Events

Midtrans akan mengirim POST request ke webhook Anda untuk events:
- `pending` - Payment initiated
- `settlement` - Payment success
- `capture` - Card payment captured
- `deny` - Payment rejected
- `expire` - Payment expired
- `cancel` - Payment canceled

## 💳 Payment Flow Implementation

### Frontend Integration (TO DO)

#### 1. Checkout Page

```tsx
// src/pages/checkout.tsx
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/router';

export default function CheckoutPage() {
  const router = useRouter();
  const createOrderMutation = trpc.orders.createOrder.useMutation();

  const handlePayment = async () => {
    try {
      // Create order with Midtrans
      const result = await createOrderMutation.mutateAsync({
        items: cartItems,
        shippingAddress: selectedAddress,
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        paymentMethod: 'midtrans',
      });

      // Load Midtrans Snap script
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
      document.head.appendChild(script);

      script.onload = () => {
        // Open Midtrans payment page
        window.snap.pay(result.snapToken, {
          onSuccess: function(result) {
            router.push(`/orders/${result.orderId}?status=success`);
          },
          onPending: function(result) {
            router.push(`/orders/${result.orderId}?status=pending`);
          },
          onError: function(result) {
            router.push(`/orders/${result.orderId}?status=failed`);
          },
          onClose: function() {
            // Customer closed payment page
          }
        });
      };
    } catch (error) {
      toast.error('Gagal membuat pesanan');
    }
  };

  return (
    <MainLayout>
      {/* Checkout form */}
      <Button onClick={handlePayment}>Bayar Sekarang</Button>
    </MainLayout>
  );
}
```

#### 2. Add to `.env.local` (Public key for frontend)

```bash
# Midtrans Client Key (public - safe for frontend)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-your_key_here
```

#### 3. Order Success Page

```tsx
// src/pages/orders/[orderId].tsx
export default function OrderDetailPage() {
  const router = useRouter();
  const { orderId, status } = router.query;

  return (
    <MainLayout>
      {status === 'success' && (
        <div>✅ Pembayaran Berhasil!</div>
      )}
      {status === 'pending' && (
        <div>⏳ Menunggu Pembayaran...</div>
      )}
      {/* Order details */}
    </MainLayout>
  );
}
```

## 🧪 Testing

### Sandbox Test Cards

Midtrans menyediakan test card untuk sandbox:

**Success Card:**
- Card Number: `4811 1111 1111 1114`
- CVV: `123`
- Expiry: Any future date
- OTP/3DS: `112233`

**Failed Card:**
- Card Number: `4911 1111 1111 1113`
- CVV: `123`
- Expiry: Any future date

**Test Virtual Account:**
- Pilih bank (BCA, Mandiri, dll)
- Copy VA number yang digenerate
- Gunakan Midtrans Simulator untuk bayar: https://simulator.sandbox.midtrans.com/

### Test Flow

1. Create order di checkout page
2. Pilih payment method (card, VA, e-wallet)
3. Complete payment dengan test credentials
4. Webhook akan update order status
5. Check order detail page

## 📊 Order Status Mapping

| Midtrans Status | Payment Status | Order Status | Description |
|----------------|----------------|--------------|-------------|
| `pending` | `pending` | `pending_payment` | Waiting payment |
| `settlement` | `paid` | `paid` | Payment success |
| `capture` (fraud=accept) | `paid` | `paid` | Card captured |
| `capture` (fraud=challenge) | `pending` | `pending_payment` | Under review |
| `deny` | `failed` | `cancelled` | Payment rejected |
| `expire` | `expired` | `cancelled` | Payment expired |
| `cancel` | `failed` | `cancelled` | Payment canceled |

## 🚨 Common Issues

### 1. "Invalid Server Key"
- Check `.env.local` has correct key
- Restart server after changing env vars
- Ensure no spaces in key

### 2. "Webhook not receiving notifications"
- For localhost: Use ngrok
- Check webhook URL in Midtrans dashboard
- Verify webhook endpoint is accessible

### 3. "Snap token not generated"
- Check all required fields are filled
- Verify gross_amount matches sum of items
- Check Midtrans server status

### 4. "Payment success but order still pending"
- Check webhook is configured
- Verify signature validation passes
- Check database connection in webhook

## 🔒 Security Best Practices

1. **Never expose Server Key**
   - Keep in `.env.local`
   - Never commit to git
   - Use different keys for sandbox/production

2. **Verify webhook signature**
   - Always validate signature in webhook handler
   - Reject requests with invalid signature

3. **Use HTTPS in production**
   - Midtrans requires HTTPS for webhooks
   - Use SSL certificate

4. **Validate amounts**
   - Verify total matches cart items + shipping
   - Check amounts in webhook match order

## 📚 Resources

- **Midtrans Docs**: https://docs.midtrans.com/
- **Sandbox Dashboard**: https://dashboard.sandbox.midtrans.com/
- **Production Dashboard**: https://dashboard.midtrans.com/
- **Simulator**: https://simulator.sandbox.midtrans.com/
- **Status Codes**: https://docs.midtrans.com/en/after-payment/get-status

## ✅ Next Steps

1. ✅ Install `midtrans-client` package
2. ✅ Setup environment variables
3. ✅ Create Midtrans helper (`lib/midtrans.ts`)
4. ✅ Update Order model with Midtrans fields
5. ✅ Create webhook handler
6. ✅ Update orders router with Snap token
7. ⏳ Create checkout page with payment button
8. ⏳ Test with sandbox credentials
9. ⏳ Setup webhook URL with ngrok
10. ⏳ Submit for production approval

---

**Ready to test!** 🚀

Start server: `npm run dev`

Register Midtrans: https://dashboard.midtrans.com/register
