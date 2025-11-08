/**
 * Midtrans Payment Gateway Integration
 * Documentation: https://docs.midtrans.com/
 */

// @ts-expect-error - midtrans-client doesn't have TypeScript definitions
import { Snap, CoreApi } from 'midtrans-client';
import crypto from 'crypto';

// Validate environment variables
if (!process.env.MIDTRANS_SERVER_KEY) {
  throw new Error('MIDTRANS_SERVER_KEY is not defined in environment variables');
}

if (!process.env.MIDTRANS_CLIENT_KEY) {
  throw new Error('MIDTRANS_CLIENT_KEY is not defined in environment variables');
}

// Initialize Snap API (for Snap payment page)
export const snap = new Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Initialize Core API (for transaction status, refund, etc.)
export const coreApi = new CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 * Create Snap transaction token
 * This token will be used to open Midtrans payment page
 */
export interface MidtransTransactionParams {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  shippingAddress?: {
    first_name: string;
    last_name?: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    country_code?: string;
  };
}

export async function createSnapToken(params: MidtransTransactionParams) {
  try {
    const parameter = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      customer_details: params.customerDetails,
      item_details: params.itemDetails,
      shipping_address: params.shippingAddress,
      // Enable all payment methods
      enabled_payments: [
        'credit_card',
        'gopay',
        'shopeepay',
        'other_qris',
        'bca_va',
        'bni_va',
        'bri_va',
        'permata_va',
        'other_va',
        'echannel', // Mandiri Bill Payment
        'alfamart',
        'indomaret',
      ],
      // Credit card config
      credit_card: {
        secure: true,
      },
      // Expiry time (24 hours)
      expiry: {
        unit: 'hours',
        duration: 24,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    
    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  } catch (error) {
    console.error('[Midtrans] Error creating Snap token:', error);
    throw new Error(`Failed to create Midtrans transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get transaction status from Midtrans
 */
export async function getTransactionStatus(orderId: string) {
  try {
    const statusResponse = await coreApi.transaction.status(orderId);
    return statusResponse;
  } catch (error) {
    console.error('[Midtrans] Error getting transaction status:', error);
    throw new Error(`Failed to get transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Cancel transaction
 */
export async function cancelTransaction(orderId: string) {
  try {
    const cancelResponse = await coreApi.transaction.cancel(orderId);
    return cancelResponse;
  } catch (error) {
    console.error('[Midtrans] Error canceling transaction:', error);
    throw new Error(`Failed to cancel transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify notification signature from Midtrans webhook
 * This ensures the webhook is really from Midtrans
 */
export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');
  
  return hash === signatureKey;
}

/**
 * Map Midtrans transaction status to our order status
 */
export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string
): {
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired';
  orderStatus: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
} {
  // Midtrans status reference:
  // https://docs.midtrans.com/en/after-payment/get-status#transaction-status
  
  if (transactionStatus === 'capture') {
    if (fraudStatus === 'accept') {
      return { paymentStatus: 'paid', orderStatus: 'paid' };
    } else if (fraudStatus === 'challenge') {
      return { paymentStatus: 'pending', orderStatus: 'pending_payment' };
    } else {
      return { paymentStatus: 'failed', orderStatus: 'cancelled' };
    }
  } else if (transactionStatus === 'settlement') {
    return { paymentStatus: 'paid', orderStatus: 'paid' };
  } else if (transactionStatus === 'pending') {
    return { paymentStatus: 'pending', orderStatus: 'pending_payment' };
  } else if (transactionStatus === 'deny') {
    return { paymentStatus: 'failed', orderStatus: 'cancelled' };
  } else if (transactionStatus === 'expire') {
    return { paymentStatus: 'expired', orderStatus: 'cancelled' };
  } else if (transactionStatus === 'cancel') {
    return { paymentStatus: 'failed', orderStatus: 'cancelled' };
  } else {
    return { paymentStatus: 'pending', orderStatus: 'pending_payment' };
  }
}
