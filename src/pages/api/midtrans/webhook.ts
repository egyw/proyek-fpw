import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifySignature, mapMidtransStatus } from '@/lib/midtrans';
import { appRouter } from '@/server/routers/_app';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const notification = req.body;

    console.log('[Midtrans Webhook] Received notification:', {
      orderId: notification.order_id,
      transactionStatus: notification.transaction_status,
      fraudStatus: notification.fraud_status,
      paymentType: notification.payment_type,
    });

    // Extract notification data
    const {
      order_id: orderId,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      payment_type: paymentType, // e.g., "gopay", "bank_transfer", "qris", "echannel", "credit_card"
    } = notification;

    // Verify signature to ensure this is really from Midtrans
    const isValidSignature = verifySignature(
      orderId,
      statusCode,
      grossAmount,
      signatureKey
    );

    if (!isValidSignature) {
      console.error('[Midtrans Webhook] Invalid signature!');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Connect to database
    await connectDB();

    // Find order
    const order = await Order.findOne({ orderId });

    if (!order) {
      console.error('[Midtrans Webhook] Order not found:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Map Midtrans status to our order status
    const { paymentStatus, orderStatus } = mapMidtransStatus(
      transactionStatus,
      fraudStatus
    );

    // Update order
    order.paymentStatus = paymentStatus;
    order.orderStatus = orderStatus;
    
    // Save payment type from Midtrans
    if (paymentType) {
      order.paymentType = paymentType;
    }

    // If payment successful, set paidAt timestamp
    if (paymentStatus === 'paid' && !order.paidAt) {
      order.paidAt = new Date();
    }

    await order.save();

    console.log('[Midtrans Webhook] Order updated:', {
      orderId,
      paymentStatus,
      orderStatus,
      paymentType,
    });

    // Send notification to all admins when payment is successful
    if (paymentStatus === 'paid') {
      try {
        const admins = await User.find({ role: 'admin' }).lean();
        
        // Create tRPC caller for server-side calls (webhook context without auth)
        const caller = appRouter.createCaller({
          session: null,
          user: undefined, // Use undefined instead of null for optional user
        });

        // Send notification to each admin
        for (const admin of admins) {
          try {
            await caller.notifications.createNotification({
              userId: admin._id.toString(),
              type: 'new_paid_order',
              title: 'Pesanan Baru Perlu Diproses',
              message: `Pesanan #${order.orderNumber} telah dibayar. Total: Rp ${order.total.toLocaleString('id-ID')}`,
              clickAction: '/admin/orders?status=paid',
              icon: 'shopping-cart',
              color: 'blue',
              data: { orderId: order._id.toString() },
            });
          } catch (notifError) {
            console.error('[Midtrans Webhook] Failed to create notification for admin:', admin._id, notifError);
          }
        }

        console.log(`[Midtrans Webhook] Sent notifications to ${admins.length} admin(s)`);
      } catch (notifError) {
        console.error('[Midtrans Webhook] Error sending notifications:', notifError);
        // Don't fail the webhook if notification fails
      }
    }

    // Send success response to Midtrans
    return res.status(200).json({
      success: true,
      message: 'Notification processed successfully',
    });
  } catch (error) {
    console.error('[Midtrans Webhook] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
