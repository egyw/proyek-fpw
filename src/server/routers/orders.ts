import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import connectDB from '@/lib/mongodb';
import Order, { IOrder } from '@/models/Order';
import Cart from '@/models/Cart';
import { createSnapToken } from '@/lib/midtrans';

// Generate unique order ID
function generateOrderId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
}

export const ordersRouter = router({
  // Create new order (before payment)
  createOrder: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            name: z.string(),
            slug: z.string(),
            image: z.string(),
            price: z.number(),
            quantity: z.number(),
            unit: z.string(),
            category: z.string(),
          })
        ),
        shippingAddress: z.object({
          recipientName: z.string(),
          phoneNumber: z.string(),
          fullAddress: z.string(),
          district: z.string(),
          city: z.string(),
          province: z.string(),
          postalCode: z.string(),
          notes: z.string().optional(),
        }),
        subtotal: z.number(),
        shippingCost: z.number(),
        total: z.number(),
        paymentMethod: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const user = ctx.user;

        // Generate unique order ID
        const orderId = generateOrderId();

        // Create order with pending_payment status
        const order = await Order.create({
          orderId,
          userId: user.id,
          items: input.items,
          shippingAddress: input.shippingAddress,
          subtotal: input.subtotal,
          shippingCost: input.shippingCost,
          total: input.total,
          paymentMethod: input.paymentMethod,
          paymentStatus: 'pending',
          orderStatus: 'pending_payment',
        });

        // If payment method is Midtrans, create Snap token
        let snapToken: string | undefined;
        let snapRedirectUrl: string | undefined;

        if (input.paymentMethod === 'midtrans') {
          try {
            const snapResult = await createSnapToken({
              orderId: orderId,
              grossAmount: input.total,
              customerDetails: {
                first_name: user.name || input.shippingAddress.recipientName,
                email: user.email,
                phone: user.phone || input.shippingAddress.phoneNumber,
              },
              itemDetails: [
                ...input.items.map((item) => ({
                  id: item.productId,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                })),
                // Add shipping as separate item
                {
                  id: 'SHIPPING',
                  name: `Ongkir ke ${input.shippingAddress.city}`,
                  price: input.shippingCost,
                  quantity: 1,
                },
              ],
              shippingAddress: {
                first_name: input.shippingAddress.recipientName,
                phone: input.shippingAddress.phoneNumber,
                address: input.shippingAddress.fullAddress,
                city: input.shippingAddress.city,
                postal_code: input.shippingAddress.postalCode,
                country_code: 'IDN',
              },
            });

            snapToken = snapResult.token;
            snapRedirectUrl = snapResult.redirectUrl;

            // Update order with Midtrans data
            order.snapToken = snapToken;
            order.snapRedirectUrl = snapRedirectUrl;
            order.transactionId = orderId;
            await order.save();
          } catch (error) {
            console.error('[createOrder] Midtrans error:', error);
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Gagal membuat token pembayaran',
              cause: error,
            });
          }
        }

        // Clear user's cart after order created
        await Cart.findOneAndUpdate(
          { userId: user.id },
          { items: [] }
        );

        return {
          success: true,
          orderId: order.orderId,
          _id: order._id.toString(),
          snapToken,
          snapRedirectUrl,
          total: order.total,
        };
      } catch (error) {
        console.error('[createOrder] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal membuat pesanan',
          cause: error,
        });
      }
    }),

  // Get user's orders
  getUserOrders: protectedProcedure.query(async ({ ctx }) => {
    try {
      await connectDB();

      const orders = await Order.find({ userId: ctx.user.id })
        .sort({ createdAt: -1 })
        .lean();

      return { orders };
    } catch (error) {
      console.error('[getUserOrders] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Gagal mengambil data pesanan',
        cause: error,
      });
    }
  }),

  // Get single order detail
  getOrderById: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        await connectDB();

        const order = await Order.findOne({
          orderId: input.orderId,
          userId: ctx.user.id, // Ensure user owns this order
        }).lean();

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Pesanan tidak ditemukan',
          });
        }

        return { order };
      } catch (error) {
        console.error('[getOrderById] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mengambil detail pesanan',
          cause: error,
        });
      }
    }),

  // Cancel order (before payment or if payment failed)
  cancelOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const order = await Order.findOne({
          orderId: input.orderId,
          userId: ctx.user.id,
        });

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Pesanan tidak ditemukan',
          });
        }

        // Can only cancel if not paid yet
        if (order.paymentStatus === 'paid') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Pesanan yang sudah dibayar tidak dapat dibatalkan',
          });
        }

        order.orderStatus = 'cancelled';
        order.cancelReason = input.reason;
        order.cancelledAt = new Date();
        await order.save();

        return { success: true };
      } catch (error) {
        console.error('[cancelOrder] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal membatalkan pesanan',
          cause: error,
        });
      }
    }),

  // Update payment status (called from webhook)
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        paymentStatus: z.enum(['pending', 'paid', 'failed', 'expired']),
        orderStatus: z.enum([
          'pending_payment',
          'paid',
          'processing',
          'shipped',
          'delivered',
          'completed',
          'cancelled',
        ]),
        paidAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await connectDB();

        const updateData: Partial<IOrder> = {
          paymentStatus: input.paymentStatus,
          orderStatus: input.orderStatus,
        };

        if (input.paidAt) {
          updateData.paidAt = new Date(input.paidAt);
        }

        const order = await Order.findOneAndUpdate(
          { orderId: input.orderId },
          updateData,
          { new: true }
        );

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
          });
        }

        return { success: true, order };
      } catch (error) {
        console.error('[updatePaymentStatus] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update payment status',
          cause: error,
        });
      }
    }),
});
