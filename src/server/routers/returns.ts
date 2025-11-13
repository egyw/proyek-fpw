import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import Order from '@/models/Order';

// Generate unique return number
function generateReturnNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RET-${year}${month}${day}-${random}`;
}

export const returnsRouter = router({
  // Create return request
  createReturnRequest: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        items: z.array(
          z.object({
            productId: z.string(),
            productName: z.string(),
            quantity: z.number().min(1),
            price: z.number(),
            reason: z.string().min(10, 'Alasan minimal 10 karakter'),
            condition: z.enum(['damaged', 'defective', 'wrong_item', 'not_as_described', 'other']),
          })
        ),
        reason: z.string().min(10, 'Alasan minimal 10 karakter'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        // Find order and verify ownership
        const order = await Order.findOne({
          orderId: input.orderId,
          userId: ctx.user.id,
          orderStatus: 'delivered',
        });

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order tidak ditemukan atau belum delivered',
          });
        }

        // Check if return request already exists
        const existingReturn = await Return.findOne({ orderId: order._id });
        if (existingReturn) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Pengembalian untuk order ini sudah pernah diajukan',
          });
        }

        // Calculate total amount
        const totalAmount = input.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Create return request
        const returnNumber = generateReturnNumber();
        const now = new Date().toISOString();

        const returnRequest = new Return({
          returnNumber,
          orderId: order._id,
          orderNumber: order.orderId,
          customerId: ctx.user.id,
          customerName: ctx.user.name,
          customerEmail: ctx.user.email,
          customerPhone: ctx.user.phone,
          items: input.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            reason: item.reason,
            condition: item.condition,
          })),
          totalAmount,
          reason: input.reason,
          status: 'pending',
          requestDate: now,
          createdAt: now,
          updatedAt: now,
        });

        await returnRequest.save();

        // Update order returnStatus
        order.returnStatus = 'requested';
        await order.save();

        return {
          success: true,
          returnNumber,
          message: 'Pengembalian berhasil diajukan',
        };
      } catch (error) {
        console.error('[createReturnRequest] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal membuat pengembalian',
          cause: error,
        });
      }
    }),

  // Check if order has return request
  checkReturnRequest: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        await connectDB();

        // Find order
        const order = await Order.findOne({
          orderId: input.orderId,
          userId: ctx.user.id,
        });

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order tidak ditemukan',
          });
        }

        // Check if return exists
        const returnRequest = await Return.findOne({ orderId: order._id }).lean();

        return {
          hasReturn: !!returnRequest,
          returnData: returnRequest,
          returnStatus: order.returnStatus || 'none',
        };
      } catch (error) {
        console.error('[checkReturnRequest] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal memeriksa return request',
          cause: error,
        });
      }
    }),

  // Get all returns (Admin only)
  getAllReturns: protectedProcedure
    .input(
      z.object({
        status: z.enum(['all', 'pending', 'approved', 'rejected', 'completed']).optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Check admin/staff role
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Hanya admin/staff yang dapat mengakses',
          });
        }

        await connectDB();

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (input.status && input.status !== 'all') {
          query.status = input.status;
        }

        if (input.search) {
          query.$or = [
            { returnNumber: { $regex: input.search, $options: 'i' } },
            { orderNumber: { $regex: input.search, $options: 'i' } },
            { customerName: { $regex: input.search, $options: 'i' } },
          ];
        }

        // Pagination
        const skip = (input.page - 1) * input.limit;

        const [returns, total] = await Promise.all([
          Return.find(query)
            .sort({ requestDate: -1 })
            .skip(skip)
            .limit(input.limit)
            .lean(),
          Return.countDocuments(query),
        ]);

        return {
          returns,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit),
          },
        };
      } catch (error) {
        console.error('[getAllReturns] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mengambil data returns',
          cause: error,
        });
      }
    }),

  // Approve return (Admin only)
  approveReturn: protectedProcedure
    .input(z.object({ returnId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Hanya admin yang dapat approve return',
          });
        }

        await connectDB();

        const returnRequest = await Return.findById(input.returnId);

        if (!returnRequest) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Return request tidak ditemukan',
          });
        }

        if (returnRequest.status !== 'pending') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Return request sudah diproses',
          });
        }

        const now = new Date().toISOString();
        returnRequest.status = 'approved';
        returnRequest.approvedDate = now;
        returnRequest.updatedAt = now;
        await returnRequest.save();

        // Update order returnStatus
        const order = await Order.findById(returnRequest.orderId);
        if (order) {
          order.returnStatus = 'approved';
          await order.save();
        }

        return { success: true, message: 'Return request disetujui' };
      } catch (error) {
        console.error('[approveReturn] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal approve return',
          cause: error,
        });
      }
    }),

  // Reject return (Admin only)
  rejectReturn: protectedProcedure
    .input(
      z.object({
        returnId: z.string(),
        rejectionReason: z.string().min(10, 'Alasan penolakan minimal 10 karakter'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Hanya admin yang dapat reject return',
          });
        }

        await connectDB();

        const returnRequest = await Return.findById(input.returnId);

        if (!returnRequest) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Return request tidak ditemukan',
          });
        }

        if (returnRequest.status !== 'pending') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Return request sudah diproses',
          });
        }

        const now = new Date().toISOString();
        returnRequest.status = 'rejected';
        returnRequest.rejectionReason = input.rejectionReason;
        returnRequest.rejectedDate = now;
        returnRequest.updatedAt = now;
        await returnRequest.save();

        // Update order returnStatus
        const order = await Order.findById(returnRequest.orderId);
        if (order) {
          order.returnStatus = 'rejected';
          await order.save();
        }

        return { success: true, message: 'Return request ditolak' };
      } catch (error) {
        console.error('[rejectReturn] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal reject return',
          cause: error,
        });
      }
    }),

  // Complete return (Admin only)
  completeReturn: protectedProcedure
    .input(z.object({ returnId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Hanya admin yang dapat complete return',
          });
        }

        await connectDB();

        const returnRequest = await Return.findById(input.returnId);

        if (!returnRequest) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Return request tidak ditemukan',
          });
        }

        if (returnRequest.status !== 'approved') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Return harus approved dulu',
          });
        }

        const now = new Date().toISOString();
        returnRequest.status = 'completed';
        returnRequest.completedDate = now;
        returnRequest.updatedAt = now;
        await returnRequest.save();

        // Update order returnStatus and orderStatus
        const order = await Order.findById(returnRequest.orderId);
        if (order) {
          order.returnStatus = 'completed';
          order.orderStatus = 'returned'; // Mark order as returned
          await order.save();
        }

        return { success: true, message: 'Return selesai diproses' };
      } catch (error) {
        console.error('[completeReturn] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal complete return',
          cause: error,
        });
      }
    }),
});
