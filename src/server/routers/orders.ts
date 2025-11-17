import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import connectDB from '@/lib/mongodb';
import Order, { IOrder } from '@/models/Order';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';
import { createSnapToken, getTransactionStatus } from '@/lib/midtrans';

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
        discount: z.object({
          code: z.string(),
          amount: z.number(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const user = ctx.user;

        // Generate unique order ID
        const orderId = generateOrderId();

        // Set payment expiry time (60 minutes from now)
        // Strategy: 15 min Snap popup + 45 min payment completion
        const paymentExpiredAt = new Date();
        paymentExpiredAt.setMinutes(paymentExpiredAt.getMinutes() + 60);

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
          paymentExpiredAt, // 30 minutes deadline
          orderStatus: 'awaiting_payment',
          discount: input.discount,
        });

        // If payment method is Midtrans, create Snap token
        let snapToken: string | undefined;
        let snapRedirectUrl: string | undefined;

        if (input.paymentMethod === 'midtrans') {
          try {
            // Format expiry time for Midtrans
            // Format: "2024-12-02 17:00:00 +0700"
            // Snap popup: 15 min to choose payment method
            const expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + 15);
            const formattedExpiry = expiryTime.toISOString().slice(0, 19).replace('T', ' ') + ' +0700';

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
                // Add discount as negative item (if applied)
                ...(input.discount ? [{
                  id: 'DISCOUNT',
                  name: `Diskon (${input.discount.code})`,
                  price: -input.discount.amount,
                  quantity: 1,
                }] : []),
              ],
              shippingAddress: {
                first_name: input.shippingAddress.recipientName,
                phone: input.shippingAddress.phoneNumber,
                address: input.shippingAddress.fullAddress,
                city: input.shippingAddress.city,
                postal_code: input.shippingAddress.postalCode,
                country_code: 'IDN',
              },
              // ⭐ Snap popup expiry: 15 minutes to choose payment method
              // After selection, Midtrans dashboard settings apply: +45 min for payment
              // Total: 15 min (popup) + 45 min (payment) = 60 min (our order expiry)
              customExpiry: {
                start_time: formattedExpiry,
                unit: 'minute',
                duration: 15,
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
        // This prevents duplicate orders from same cart
        const Cart = (await import('@/models/Cart')).default;
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

  // Update payment status (called from webhook)
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        paymentStatus: z.enum(['pending', 'paid', 'failed', 'expired', 'cancelled']),
        orderStatus: z.enum([
          'awaiting_payment',
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

  // Update order status (for admin to move order through workflow)
  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        orderStatus: z.enum([
          'awaiting_payment',
          'processing',
          'shipped',
          'delivered',
          'completed',
          'cancelled',
        ]),
        shippingInfo: z.object({
          courier: z.string(),
          trackingNumber: z.string(),
          shippedDate: z.string(),
        }).optional(),
        cancelReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin or staff
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin or staff can update order status',
          });
        }

        await connectDB();

        const order = await Order.findOne({ orderId: input.orderId });

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
          });
        }

        // Update order status
        order.orderStatus = input.orderStatus;

        // If status is shipped, add shipping info
        if (input.orderStatus === 'shipped' && input.shippingInfo) {
          order.shippingInfo = {
            courier: input.shippingInfo.courier,
            trackingNumber: input.shippingInfo.trackingNumber,
            shippedDate: new Date(input.shippingInfo.shippedDate),
          };
        }

        // If status is cancelled, add cancel reason
        if (input.orderStatus === 'cancelled' && input.cancelReason) {
          order.cancelReason = input.cancelReason;
          order.cancelledAt = new Date();
        }

        await order.save();

        return { 
          success: true, 
          order: {
            orderId: order.orderId,
            orderStatus: order.orderStatus,
            shippingInfo: order.shippingInfo,
          }
        };
      } catch (error) {
        console.error('[updateOrderStatus] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update order status',
          cause: error,
        });
      }
    }),

  // Check if order payment has expired (30 minutes deadline)
  checkOrderExpiry: protectedProcedure
    .input(z.object({
      orderId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        await connectDB();

        const order = await Order.findOne({ orderId: input.orderId });

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
          });
        }

        // Check if order has expired
        const now = new Date();
        const isExpired = order.paymentExpiredAt && now > order.paymentExpiredAt;

        // Auto-update status if expired and still pending
        if (isExpired && order.paymentStatus === 'pending') {
          order.paymentStatus = 'expired';
          order.orderStatus = 'cancelled';
          order.cancelReason = 'Pembayaran melebihi batas waktu 30 menit';
          order.cancelledAt = now;
          await order.save();
        }

        return {
          isExpired: order.paymentStatus === 'expired',
          paymentExpiredAt: order.paymentExpiredAt?.toISOString(),
          remainingSeconds: order.paymentExpiredAt 
            ? Math.max(0, Math.floor((order.paymentExpiredAt.getTime() - now.getTime()) / 1000))
            : 0,
        };
      } catch (error) {
        console.error('[checkOrderExpiry] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check order expiry',
          cause: error,
        });
      }
    }),

  // ⭐ Simulate payment success (for Sandbox testing only)
  // In production, this should be done via webhook
  simulatePaymentSuccess: protectedProcedure
    .input(z.object({ orderId: z.string() }))
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

        // Only allow if payment is still pending
        if (order.paymentStatus !== 'pending') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Pesanan sudah dibayar atau dibatalkan',
          });
        }

        // Update to paid
        order.paymentStatus = 'paid';
        order.orderStatus = 'processing';
        order.paidAt = new Date();
        
        // Fetch payment_type from Midtrans API
        try {
          const midtransResponse = await getTransactionStatus(order.orderId);
          
          if (midtransResponse.payment_type) {
            order.paymentType = midtransResponse.payment_type;
          }
        } catch (error) {
          console.error('[simulatePaymentSuccess] Failed to fetch payment_type:', error);
          // Continue anyway - payment status update is more important
        }
        
        await order.save();

        return { success: true, order };
      } catch (error) {
        console.error('[simulatePaymentSuccess] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mensimulasi pembayaran',
          cause: error,
        });
      }
    }),

  // ========== ADMIN PROCEDURES ==========

  // Get all orders (admin only)
  getAllOrders: protectedProcedure
    .input(
      z.object({
        status: z.enum(['all', 'pending', 'awaiting_payment', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Check if user is admin or staff
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin and staff can access all orders',
          });
        }

        await connectDB();

        // Build query
        interface OrderQuery {
          orderStatus?: string;
          $or?: Array<Record<string, RegExp>>;
        }
        const query: OrderQuery = {};

        // Filter by status
        if (input.status && input.status !== 'all') {
          query.orderStatus = input.status;
        }

        // Search by order number, customer name, or phone
        if (input.search) {
          const searchRegex = new RegExp(input.search, 'i');
          query.$or = [
            { orderNumber: searchRegex },
            { 'shippingAddress.recipientName': searchRegex },
            { 'shippingAddress.phoneNumber': searchRegex },
          ];
        }

        const orders = await Order.find(query)
          .populate('userId', 'fullName name email phone')
          .sort({ createdAt: -1 })
          .lean();

        return { orders };
      } catch (error) {
        console.error('[getAllOrders] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch orders',
          cause: error,
        });
      }
    }),

  // Get order by ID (admin)
  // Get order by ID (User can view own orders, Admin/Staff can view all)
  getOrderById: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        await connectDB();

        // Build query based on role
        const query: { orderId: string; userId?: string } = { orderId: input.orderId };
        
        // Regular users can only view their own orders
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          query.userId = ctx.user.id;
        }
        // Admin/staff can view any order (no userId filter)

        const order = await Order.findOne(query)
          .populate('userId', 'fullName name email phone')
          .lean();

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
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
          message: 'Failed to fetch order',
          cause: error,
        });
      }
    }),

  // Process order (paid → processing)
  processOrder: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin or staff
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin and staff can process orders',
          });
        }

        await connectDB();

        const order = await Order.findOneAndUpdate(
          { orderId: input.orderId, orderStatus: 'paid' },
          { orderStatus: 'processing' },
          { new: true }
        ).lean();

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found or already processed',
          });
        }

        // ⭐ Phase 1: Record stock OUT for each order item
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const item of (order as any).items) {
          // Get product details
          const product = await Product.findById(item.productId);
          if (product) {
            // Update product stock
            const previousStock = product.stock;
            const newStock = previousStock - item.quantity;
            
            if (newStock < 0) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Insufficient stock for product: ${product.name}`,
              });
            }

            product.stock = newStock;
            product.sold = (product.sold || 0) + item.quantity;
            await product.save();

            // Record stock movement
            await StockMovement.create({
              productId: product._id,
              productName: product.name,
              productCode: product.slug,
              movementType: 'out',
              quantity: item.quantity,
              unit: product.unit,
              reason: `Pesanan customer - ${input.orderId}`,
              referenceType: 'order',
              referenceId: input.orderId,
              performedBy: ctx.user.id,
              performedByName: ctx.user.name,
              previousStock,
              newStock,
              notes: `Order diproses oleh ${ctx.user.name}`,
            });
          }
        }

        return { success: true, order };
      } catch (error) {
        console.error('[processOrder] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process order',
          cause: error,
        });
      }
    }),

  // Ship order (processing → shipped)
  shipOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        courier: z.string(),
        courierName: z.string(),
        service: z.string(),
        trackingNumber: z.string(),
        shippedDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin or staff
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin and staff can ship orders',
          });
        }

        await connectDB();

        const order = await Order.findOneAndUpdate(
          { orderId: input.orderId, orderStatus: 'processing' },
          {
            orderStatus: 'shipped',
            shippingInfo: {
              courier: input.courier,
              courierName: input.courierName,
              service: input.service,
              trackingNumber: input.trackingNumber,
              shippedDate: input.shippedDate,
            },
          },
          { new: true }
        ).lean();

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found or not in processing status',
          });
        }

        return { success: true, order };
      } catch (error) {
        console.error('[shipOrder] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to ship order',
          cause: error,
        });
      }
    }),

  // Cancel order
  cancelOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        cancelReason: z.string().min(1, 'Cancel reason is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin or staff
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin and staff can cancel orders',
          });
        }

        await connectDB();

        // Get order first to check status
        const existingOrder = await Order.findOne({ orderId: input.orderId });
        if (!existingOrder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
          });
        }

        if (!['paid', 'processing'].includes(existingOrder.orderStatus)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Order cannot be cancelled',
          });
        }

        const wasProcessing = existingOrder.orderStatus === 'processing';

        const order = await Order.findOneAndUpdate(
          {
            orderId: input.orderId,
            orderStatus: { $in: ['paid', 'processing'] },
          },
          {
            orderStatus: 'cancelled',
            cancelReason: input.cancelReason,
          },
          { new: true }
        ).lean();

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found or cannot be cancelled',
          });
        }

        // ⭐ Phase 1: Restore stock if order was already processing (stock was reduced)
        if (wasProcessing) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const item of (order as any).items) {
            const product = await Product.findById(item.productId);
            if (product) {
              const previousStock = product.stock;
              const newStock = previousStock + item.quantity;

              product.stock = newStock;
              product.sold = Math.max(0, (product.sold || 0) - item.quantity);
              await product.save();

              // Record stock movement (return/restore)
              await StockMovement.create({
                productId: product._id,
                productName: product.name,
                productCode: product.slug,
                movementType: 'in',
                quantity: item.quantity,
                unit: product.unit,
                reason: `Pesanan dibatalkan - ${input.orderId}`,
                referenceType: 'return',
                referenceId: input.orderId,
                performedBy: ctx.user.id,
                performedByName: ctx.user.name,
                previousStock,
                newStock,
                notes: `Alasan pembatalan: ${input.cancelReason}`,
              });
            }
          }
        }

        return { success: true, order };
      } catch (error) {
        console.error('[cancelOrder] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel order',
          cause: error,
        });
      }
    }),

  // Confirm order delivered (shipped → delivered)
  confirmDelivered: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        deliveredDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin or staff
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin and staff can confirm delivery',
          });
        }

        await connectDB();

        const order = await Order.findOneAndUpdate(
          { orderId: input.orderId, orderStatus: 'shipped' },
          {
            orderStatus: 'delivered',
            deliveredDate: input.deliveredDate,
          },
          { new: true }
        ).lean();

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found or not in shipped status',
          });
        }

        return { success: true, order };
      } catch (error) {
        console.error('[confirmDelivered] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to confirm delivery',
          cause: error,
        });
      }
    }),

  // User confirm order received (delivered → completed)
  confirmOrderReceived: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        // Find order and verify ownership
        const order = await Order.findOne({ 
          orderId: input.orderId,
          userId: ctx.user.id,
          orderStatus: 'delivered'
        });

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found, not delivered yet, or you do not have permission',
          });
        }

        // Update status to completed
        order.orderStatus = 'completed';
        order.updatedAt = new Date().toISOString();
        await order.save();

        return { success: true, order };
      } catch (error) {
        console.error('[confirmOrderReceived] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to confirm order received',
          cause: error,
        });
      }
    }),

  // User submit rating for completed order
  submitRating: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        score: z.number().min(1).max(5),
        review: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        // Find order and verify ownership
        const order = await Order.findOne({ 
          orderId: input.orderId,
          userId: ctx.user.id,
          orderStatus: 'completed'
        });

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found, not completed yet, or you do not have permission',
          });
        }

        // Check if already rated (check for score, not just rating object)
        if (order.rating && order.rating.score) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Order sudah diberi rating',
          });
        }

        // Save rating to order
        order.rating = {
          score: input.score,
          review: input.review,
          createdAt: new Date(),
        };
        order.updatedAt = new Date().toISOString();
        await order.save();

        // Update product ratings (calculate new average)
        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          if (product) {
            const currentTotal = product.rating.average * product.rating.count;
            const newCount = product.rating.count + 1;
            const newAverage = (currentTotal + input.score) / newCount;
            
            product.rating.average = Math.round(newAverage * 10) / 10; // Round to 1 decimal
            product.rating.count = newCount;
            await product.save();
          }
        }

        return { success: true, order };
      } catch (error) {
        console.error('[submitRating] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit rating',
          cause: error,
        });
      }
    }),

  // Get order statistics (for dashboard cards)
  getOrderStatistics: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Check if user is admin or staff
      if (!['admin', 'staff'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin and staff can access statistics',
        });
      }

      await connectDB();

      const [paidCount, processingCount, shippedCount, completedCount] = await Promise.all([
        Order.countDocuments({ orderStatus: 'paid' }),
        Order.countDocuments({ orderStatus: 'processing' }),
        Order.countDocuments({ orderStatus: 'shipped' }),
        Order.countDocuments({ orderStatus: 'completed' }),
      ]);

      return {
        paid: paidCount,
        processing: processingCount,
        shipped: shippedCount,
        completed: completedCount,
      };
    } catch (error) {
      console.error('[getOrderStatistics] Error:', error);
      
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch order statistics',
        cause: error,
      });
    }
  }),
});
