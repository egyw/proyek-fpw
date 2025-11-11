import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import User from '@/models/User';
import Order from '@/models/Order';

export const usersRouter = router({
  // Get all customers (role: user only)
  getAllCustomers: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(['all', 'active', 'inactive']).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = { role: 'user' }; // Only customers

        // Search filter
        if (input.search) {
          filter.$or = [
            { fullName: { $regex: input.search, $options: 'i' } },
            { email: { $regex: input.search, $options: 'i' } },
            { phone: { $regex: input.search, $options: 'i' } },
          ];
        }

        // Status filter
        if (input.status === 'active') {
          filter.isActive = true;
        } else if (input.status === 'inactive') {
          filter.isActive = false;
        }

        const customers = await User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .lean();

        // Get order stats for all customers in one aggregation query
        const customerIds = customers.map(c => c._id);
        const orderStats = await Order.aggregate([
          {
            $match: {
              userId: { $in: customerIds },
              paymentStatus: 'paid'
            }
          },
          {
            $group: {
              _id: '$userId',
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$total' }
            }
          }
        ]);

        // Create a map for quick lookup
        const statsMap = new Map(
          orderStats.map(stat => [stat._id.toString(), stat])
        );

        // Merge order stats with customers
        const customersWithStats = customers.map(customer => ({
          ...customer,
          totalOrders: statsMap.get(customer._id.toString())?.totalOrders || 0,
          totalSpent: statsMap.get(customer._id.toString())?.totalSpent || 0,
        }));

        return { customers: customersWithStats };
      } catch (error) {
        console.error('[getAllCustomers] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customers',
          cause: error,
        });
      }
    }),

  // Get customer by ID
  getCustomerById: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      try {
        const customer = await User.findById(input.userId)
          .select('-password')
          .lean();

        if (!customer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          });
        }

        return { customer };
      } catch (error) {
        console.error('[getCustomerById] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customer',
          cause: error,
        });
      }
    }),

  // Suspend customer (set isActive to false)
  suspendCustomer: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().min(10, 'Alasan minimal 10 karakter'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Only admin can suspend
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Hanya admin yang dapat menonaktifkan customer',
          });
        }

        const customer = await User.findById(input.userId);

        if (!customer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer tidak ditemukan',
          });
        }

        if (customer.role !== 'user') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Hanya customer (role: user) yang dapat dinonaktifkan',
          });
        }

        if (!customer.isActive) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Customer sudah dalam status tidak aktif',
          });
        }

        customer.isActive = false;
        customer.suspendedAt = new Date();
        customer.suspensionReason = input.reason;
        await customer.save();

        return {
          success: true,
          message: 'Customer berhasil dinonaktifkan',
        };
      } catch (error) {
        console.error('[suspendCustomer] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal menonaktifkan customer',
          cause: error,
        });
      }
    }),

  // Reactivate customer (set isActive to true)
  reactivateCustomer: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Only admin can reactivate
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Hanya admin yang dapat mengaktifkan kembali customer',
          });
        }

        const customer = await User.findById(input.userId);

        if (!customer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer tidak ditemukan',
          });
        }

        if (customer.role !== 'user') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Hanya customer (role: user) yang dapat diaktifkan kembali',
          });
        }

        if (customer.isActive) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Customer sudah dalam status aktif',
          });
        }

        customer.isActive = true;
        customer.suspendedAt = undefined;
        customer.suspensionReason = undefined;
        await customer.save();

        return {
          success: true,
          message: 'Customer berhasil diaktifkan kembali',
        };
      } catch (error) {
        console.error('[reactivateCustomer] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mengaktifkan kembali customer',
          cause: error,
        });
      }
    }),

  // Get customer statistics
  getCustomerStats: protectedProcedure.query(async () => {
    try {
      const [totalCustomers, activeCustomers, inactiveCustomers] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'user', isActive: true }),
        User.countDocuments({ role: 'user', isActive: false }),
      ]);

      // Calculate total revenue from all paid orders
      const orders = await Order.find({ paymentStatus: 'paid' }).lean();
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

      return {
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        totalRevenue,
      };
    } catch (error) {
      console.error('[getCustomerStats] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch customer statistics',
        cause: error,
      });
    }
  }),

  // Get customer order statistics
  getCustomerOrderStats: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      try {
        // Query orders from database
        // Only count orders that are paid or beyond (exclude pending/failed/expired/cancelled)
        const orders = await Order.find({ 
          userId: input.userId,
          paymentStatus: 'paid', // Only paid orders count
        }).lean();
        
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        
        // Get last order date
        const sortedOrders = orders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const lastOrderDate = sortedOrders[0]?.createdAt ? sortedOrders[0].createdAt.toISOString() : null;
        
        return {
          totalOrders,
          totalSpent,
          lastOrderDate,
        };
      } catch (error) {
        console.error('[getCustomerOrderStats] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customer order statistics',
          cause: error,
        });
      }
    }),
});
