import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import connectDB from '@/lib/mongodb';
import StockMovement from '@/models/StockMovement';
import Product from '@/models/Product';

export const stockMovementsRouter = router({
  // Get all stock movements with filters
  getAll: protectedProcedure
    .input(
      z.object({
        productId: z.string().optional(),
        productCode: z.string().optional(),
        movementType: z.enum(['in', 'out']).optional(),
        referenceType: z.enum(['order', 'adjustment', 'initial', 'return']).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        await connectDB();

        // Build filter query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = {};

        if (input.productId) {
          filter.productId = input.productId;
        }

        if (input.productCode) {
          filter.productCode = { $regex: input.productCode, $options: 'i' };
        }

        if (input.movementType) {
          filter.movementType = input.movementType;
        }

        if (input.referenceType) {
          filter.referenceType = input.referenceType;
        }

        if (input.dateFrom || input.dateTo) {
          filter.createdAt = {};
          if (input.dateFrom) {
            filter.createdAt.$gte = new Date(input.dateFrom).toISOString();
          }
          if (input.dateTo) {
            const endDate = new Date(input.dateTo);
            endDate.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = endDate.toISOString();
          }
        }

        // Get total count
        const total = await StockMovement.countDocuments(filter);

        // Get movements with pagination
        const movements = await StockMovement.find(filter)
          .sort({ createdAt: -1 })
          .limit(input.limit)
          .skip(input.offset)
          .lean();

        return {
          movements,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        console.error('[getStockMovements] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch stock movements',
          cause: error,
        });
      }
    }),

  // Get movements by product
  getByProduct: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        await connectDB();

        const movements = await StockMovement.find({ productId: input.productId })
          .sort({ createdAt: -1 })
          .limit(input.limit)
          .lean();

        return { movements };
      } catch (error) {
        console.error('[getMovementsByProduct] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch product movements',
          cause: error,
        });
      }
    }),

  // Get summary statistics
  getSummary: protectedProcedure
    .input(
      z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        await connectDB();

        // Build date filter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dateFilter: any = {};
        if (input.dateFrom || input.dateTo) {
          dateFilter.createdAt = {};
          if (input.dateFrom) {
            dateFilter.createdAt.$gte = new Date(input.dateFrom).toISOString();
          }
          if (input.dateTo) {
            const endDate = new Date(input.dateTo);
            endDate.setHours(23, 59, 59, 999);
            dateFilter.createdAt.$lte = endDate.toISOString();
          }
        }

        // Get total IN movements
        const totalIn = await StockMovement.aggregate([
          { $match: { movementType: 'in', ...dateFilter } },
          { $group: { _id: null, total: { $sum: '$quantity' } } },
        ]);

        // Get total OUT movements
        const totalOut = await StockMovement.aggregate([
          { $match: { movementType: 'out', ...dateFilter } },
          { $group: { _id: null, total: { $sum: '$quantity' } } },
        ]);

        const totalInQuantity = totalIn[0]?.total || 0;
        const totalOutQuantity = totalOut[0]?.total || 0;
        const netStock = totalInQuantity - totalOutQuantity;

        // Get movement counts by type
        const inCount = await StockMovement.countDocuments({
          movementType: 'in',
          ...dateFilter,
        });
        const outCount = await StockMovement.countDocuments({
          movementType: 'out',
          ...dateFilter,
        });

        return {
          totalInQuantity,
          totalOutQuantity,
          netStock,
          inCount,
          outCount,
        };
      } catch (error) {
        console.error('[getStockMovementSummary] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch summary',
          cause: error,
        });
      }
    }),

  // Record stock movement (used internally by other routers)
  recordMovement: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        movementType: z.enum(['in', 'out']),
        quantity: z.number().positive(),
        reason: z.string(),
        referenceType: z.enum(['order', 'adjustment', 'initial', 'return']),
        referenceId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await connectDB();

        // Get product details
        const product = await Product.findById(input.productId);
        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          });
        }

        const previousStock = product.stock;
        const newStock =
          input.movementType === 'in'
            ? previousStock + input.quantity
            : previousStock - input.quantity;

        // Validate stock won't go negative
        if (newStock < 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient stock',
          });
        }

        // Update product stock
        product.stock = newStock;
        await product.save();

        // Record movement
        const movement = await StockMovement.create({
          productId: product._id,
          productName: product.name,
          productCode: product.slug,
          movementType: input.movementType,
          quantity: input.quantity,
          unit: product.unit,
          reason: input.reason,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          performedBy: ctx.user.id,
          performedByName: ctx.user.name,
          previousStock,
          newStock,
          notes: input.notes,
        });

        return {
          success: true,
          movement,
          previousStock,
          newStock,
        };
      } catch (error) {
        console.error('[recordStockMovement] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record stock movement',
          cause: error,
        });
      }
    }),
});
