/**
 * Midtrans Payment Webhook Handler
 * This endpoint receives payment notifications from Midtrans
 * Documentation: https://docs.midtrans.com/en/after-payment/http-notification
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifySignature, mapMidtransStatus } from '@/lib/midtrans';

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
    });

    // Extract notification data
    const {
      order_id: orderId,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
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

    // If payment successful, set paidAt timestamp
    if (paymentStatus === 'paid' && !order.paidAt) {
      order.paidAt = new Date();
    }

    await order.save();

    console.log('[Midtrans Webhook] Order updated:', {
      orderId,
      paymentStatus,
      orderStatus,
    });

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
