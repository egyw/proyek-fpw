import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';

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

        // Generate unique order ID
        const orderId = generateOrderId();

        // Create order with pending_payment status
        const order = await Order.create({
          orderId,
          userId: ctx.user.id,
          items: input.items,
          shippingAddress: input.shippingAddress,
          subtotal: input.subtotal,
          shippingCost: input.shippingCost,
          total: input.total,
          paymentMethod: input.paymentMethod,
          paymentStatus: 'pending',
          orderStatus: 'pending_payment',
        });

        // Clear user's cart after order created
        await Cart.deleteOne({ userId: ctx.user.id });

        return {
          success: true,
          orderId: order.orderId,
          _id: order._id.toString(),
        };
      } catch (error) {
        console.error('[createOrder] Error:', error);
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
});
