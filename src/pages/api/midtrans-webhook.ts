import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * Midtrans Webhook Handler
 * 
 * Endpoint: POST /api/midtrans-webhook
 * 
 * This endpoint handles payment notifications from Midtrans.
 * When payment status changes, Midtrans sends a POST request with transaction details.
 * 
 * Setup in Midtrans Dashboard:
 * 1. Go to Settings > Configuration
 * 2. Set Payment Notification URL: https://yourdomain.com/api/midtrans-webhook
 * 3. Enable HTTP Notification
 * 
 * Flow:
 * 1. Verify signature (security check)
 * 2. Parse transaction status from Midtrans
 * 3. Update order payment status in database
 * 4. Auto-update order status to 'processing' if payment successful
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const notification = req.body;

    console.log('[Midtrans Webhook] Received notification:', notification);

    // Verify signature for security
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('[Midtrans Webhook] MIDTRANS_SERVER_KEY not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = notification;

    // Create signature for verification
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    // Verify signature
    if (hash !== signature_key) {
      console.error('[Midtrans Webhook] Invalid signature');
      return res.status(403).json({ message: 'Invalid signature' });
    }

    console.log('[Midtrans Webhook] Signature verified ✓');

    // Connect to database
    await connectDB();

    // Find order by orderId
    const order = await Order.findOne({ orderId: order_id });

    if (!order) {
      console.error('[Midtrans Webhook] Order not found:', order_id);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('[Midtrans Webhook] Order found:', order_id);
    console.log('[Midtrans Webhook] Transaction status:', transaction_status);
    console.log('[Midtrans Webhook] Fraud status:', fraud_status);

    // Map Midtrans transaction_status to our payment status
    let paymentStatus: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled' = 'pending';
    let orderStatus = order.orderStatus; // Keep current order status by default

    if (transaction_status === 'capture') {
      // Credit card capture - check fraud status
      if (fraud_status === 'accept') {
        paymentStatus = 'paid';
        orderStatus = 'processing'; // Auto-move to processing
      } else if (fraud_status === 'challenge') {
        paymentStatus = 'pending'; // Wait for manual review
      } else {
        paymentStatus = 'failed';
        orderStatus = 'cancelled';
      }
    } else if (transaction_status === 'settlement') {
      // Payment successful (e-wallet, bank transfer, etc)
      paymentStatus = 'paid';
      orderStatus = 'processing'; // Auto-move to processing
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending';
    } else if (transaction_status === 'deny') {
      paymentStatus = 'failed';
      orderStatus = 'cancelled';
    } else if (transaction_status === 'cancel' || transaction_status === 'expire') {
      paymentStatus = 'cancelled';
      orderStatus = 'cancelled';
    } else if (transaction_status === 'refund') {
      paymentStatus = 'cancelled';
      orderStatus = 'cancelled';
      order.cancelReason = 'Pembayaran di-refund oleh Midtrans';
      order.cancelledAt = new Date();
    }

    // Update order
    order.paymentStatus = paymentStatus;
    order.orderStatus = orderStatus;

    // Set paidAt timestamp if payment successful
    if (paymentStatus === 'paid' && !order.paidAt) {
      order.paidAt = new Date();
    }

    await order.save();

    console.log('[Midtrans Webhook] Order updated successfully');
    console.log('[Midtrans Webhook] Payment Status:', paymentStatus);
    console.log('[Midtrans Webhook] Order Status:', orderStatus);

    // Send notifications when payment successful
    if (paymentStatus === 'paid') {
      try {
        const Notification = (await import('@/models/Notification')).default;
        const User = (await import('@/models/User')).default;

        // 1. Send order_confirmed notification to CUSTOMER
        await Notification.create({
          userId: order.userId,
          type: 'order_confirmed',
          title: 'Pesanan Dikonfirmasi',
          message: `Pesanan #${order.orderId} sedang diproses. Estimasi pengiriman 1-2 hari kerja`,
          clickAction: `/orders/${order.orderId}`,
          icon: 'package',
          color: 'blue',
          data: { orderId: order.orderId.toString() },
        });
        console.log('[Midtrans Webhook] Customer notification sent');

        // 2. Send new_paid_order notification to ALL ADMIN/STAFF
        const adminUsers = await User.find({ 
          role: { $in: ['admin', 'staff'] },
          isActive: true 
        }).select('_id');

        const adminNotifications = adminUsers.map(admin => ({
          userId: admin._id,
          type: 'new_paid_order',
          title: 'Pesanan Baru Masuk',
          message: `Pesanan baru #${order.orderId} telah dibayar sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total)}. Segera proses!`,
          clickAction: `/admin/orders?orderId=${order.orderId}`,
          icon: 'shopping-cart',
          color: 'blue',
          isRead: false,
          data: { orderId: order.orderId.toString() },
        }));

        await Notification.insertMany(adminNotifications);
        console.log(`[Midtrans Webhook] Sent notifications to ${adminUsers.length} admin(s)`);
      } catch (notifError) {
        console.error('[Midtrans Webhook] Failed to send notifications:', notifError);
        // Continue - notification failure shouldn't block webhook processing
      }
    }

    // Return success response to Midtrans
    return res.status(200).json({
      message: 'Notification processed successfully',
      orderId: order_id,
      paymentStatus,
      orderStatus,
    });
  } catch (error) {
    console.error('[Midtrans Webhook] Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
