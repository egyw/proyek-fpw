import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import connectDB from '@/lib/mongodb';
import Voucher from '@/models/Voucher';

export const voucherRouter = router({
  // Get all vouchers (admin)
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(['all', 'active', 'inactive', 'expired']).optional(),
        type: z.enum(['all', 'percentage', 'fixed']).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Check if user is admin or staff
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin and staff can view vouchers',
          });
        }

        await connectDB();

        // Build query
        interface QueryFilter {
          $or?: Array<{ code?: { $regex: string; $options: string }; name?: { $regex: string; $options: string } }>;
          isActive?: boolean;
          startDate?: { $lte: string } | string;
          endDate?: { $gte: string; $lt?: string } | { $lt: string };
          type?: string;
        }
        
        const query: QueryFilter = {};

        // Search by code or name
        if (input.search) {
          query.$or = [
            { code: { $regex: input.search, $options: 'i' } },
            { name: { $regex: input.search, $options: 'i' } },
          ];
        }

        // Filter by status
        const now = new Date().toISOString();
        if (input.status === 'active') {
          query.isActive = true;
          query.startDate = { $lte: now };
          query.endDate = { $gte: now };
        } else if (input.status === 'inactive') {
          query.isActive = false;
        } else if (input.status === 'expired') {
          query.endDate = { $lt: now };
        }

        // Filter by type
        if (input.type && input.type !== 'all') {
          query.type = input.type;
        }

        // Calculate pagination
        const skip = (input.page - 1) * input.limit;

        // Get vouchers with pagination
        const [vouchers, total] = await Promise.all([
          Voucher.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(input.limit)
            .lean(),
          Voucher.countDocuments(query),
        ]);

        return {
          vouchers,
          pagination: {
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
          },
        };
      } catch (error) {
        console.error('[getAll] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch vouchers',
          cause: error,
        });
      }
    }),

  // Get voucher stats (admin)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Check if user is admin or staff
      if (!['admin', 'staff'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin and staff can view voucher stats',
        });
      }

      await connectDB();

      const now = new Date().toISOString();

      const [
        totalVouchers,
        activeVouchers,
        inactiveVouchers,
        expiredVouchers,
        totalUsage,
      ] = await Promise.all([
        Voucher.countDocuments({}),
        Voucher.countDocuments({
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now },
        }),
        Voucher.countDocuments({ isActive: false }),
        Voucher.countDocuments({ endDate: { $lt: now } }),
        Voucher.aggregate([
          { $group: { _id: null, total: { $sum: '$usedCount' } } },
        ]),
      ]);

      return {
        totalVouchers,
        activeVouchers,
        inactiveVouchers,
        expiredVouchers,
        totalUsage: totalUsage[0]?.total || 0,
      };
    } catch (error) {
      console.error('[getStats] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch voucher stats',
        cause: error,
      });
    }
  }),

  // Create voucher (admin only)
  create: protectedProcedure
    .input(
      z.object({
        code: z.string().min(3).max(20).toUpperCase(),
        name: z.string().min(3),
        description: z.string().min(10),
        type: z.enum(['percentage', 'fixed']),
        value: z.number().min(0),
        minPurchase: z.number().min(0),
        maxDiscount: z.number().min(0).optional(),
        usageLimit: z.number().min(1),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin can create vouchers',
          });
        }

        await connectDB();

        // Check if code already exists
        const existingVoucher = await Voucher.findOne({ code: input.code });
        if (existingVoucher) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Voucher code already exists',
          });
        }

        // Validate dates
        if (new Date(input.endDate) <= new Date(input.startDate)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'End date must be after start date',
          });
        }

        // Create voucher
        const now = new Date().toISOString();
        const voucher = new Voucher({
          ...input,
          usedCount: 0,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });

        await voucher.save();

        return { success: true, voucher };
      } catch (error) {
        console.error('[create] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create voucher',
          cause: error,
        });
      }
    }),

  // Update voucher (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        code: z.string().min(3).max(20).toUpperCase().optional(),
        name: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        type: z.enum(['percentage', 'fixed']).optional(),
        value: z.number().min(0).optional(),
        minPurchase: z.number().min(0).optional(),
        maxDiscount: z.number().min(0).optional(),
        usageLimit: z.number().min(1).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin can update vouchers',
          });
        }

        await connectDB();

        const { id, ...updateData } = input;

        // Check if voucher exists
        const voucher = await Voucher.findById(id);
        if (!voucher) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Voucher not found',
          });
        }

        // If code is being updated, check if new code already exists
        if (updateData.code && updateData.code !== voucher.code) {
          const existingVoucher = await Voucher.findOne({
            code: updateData.code,
          });
          if (existingVoucher) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Voucher code already exists',
            });
          }
        }

        // Validate dates if provided
        if (updateData.startDate || updateData.endDate) {
          const startDate = updateData.startDate || voucher.startDate;
          const endDate = updateData.endDate || voucher.endDate;
          if (new Date(endDate) <= new Date(startDate)) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'End date must be after start date',
            });
          }
        }

        // Update voucher
        const updatedVoucher = await Voucher.findByIdAndUpdate(
          id,
          {
            ...updateData,
            updatedAt: new Date().toISOString(),
          },
          { new: true }
        );

        return { success: true, voucher: updatedVoucher };
      } catch (error) {
        console.error('[update] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update voucher',
          cause: error,
        });
      }
    }),

  // Toggle voucher status (admin only)
  toggleStatus: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin can toggle voucher status',
          });
        }

        await connectDB();

        const voucher = await Voucher.findById(input.id);
        if (!voucher) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Voucher not found',
          });
        }

        voucher.isActive = !voucher.isActive;
        voucher.updatedAt = new Date().toISOString();
        await voucher.save();

        return { success: true, voucher };
      } catch (error) {
        console.error('[toggleStatus] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle voucher status',
          cause: error,
        });
      }
    }),

  // Delete voucher (admin only) - Soft delete
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin can delete vouchers',
          });
        }

        await connectDB();

        const voucher = await Voucher.findByIdAndUpdate(
          input.id,
          {
            isActive: false,
            updatedAt: new Date().toISOString(),
          },
          { new: true }
        );

        if (!voucher) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Voucher not found',
          });
        }

        return {
          success: true,
          message: 'Voucher deactivated successfully (soft delete)',
        };
      } catch (error) {
        console.error('[delete] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete voucher',
          cause: error,
        });
      }
    }),

  // Validate voucher (for customer checkout)
  validate: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        subtotal: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await connectDB();

        const voucher = await Voucher.findOne({
          code: input.code.toUpperCase(),
        });

        if (!voucher) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Voucher tidak ditemukan',
          });
        }

        const now = new Date().toISOString();

        // Check if voucher is active
        if (!voucher.isActive) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Voucher tidak aktif',
          });
        }

        // Check if voucher is valid (date range)
        if (now < voucher.startDate || now > voucher.endDate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Voucher sudah tidak berlaku',
          });
        }

        // Check if voucher has reached usage limit
        if (voucher.usedCount >= voucher.usageLimit) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Voucher sudah mencapai batas penggunaan',
          });
        }

        // Check minimum purchase
        if (input.subtotal < voucher.minPurchase) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Minimum pembelian Rp ${voucher.minPurchase.toLocaleString('id-ID')}`,
          });
        }

        // Calculate discount
        let discount = 0;
        if (voucher.type === 'percentage') {
          discount = (input.subtotal * voucher.value) / 100;
          if (voucher.maxDiscount && discount > voucher.maxDiscount) {
            discount = voucher.maxDiscount;
          }
        } else {
          discount = voucher.value;
        }

        return {
          success: true,
          voucher: {
            code: voucher.code,
            name: voucher.name,
            type: voucher.type,
            value: voucher.value,
            discount,
          },
        };
      } catch (error) {
        console.error('[validate] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate voucher',
          cause: error,
        });
      }
    }),
});
