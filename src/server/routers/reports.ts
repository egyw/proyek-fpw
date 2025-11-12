import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import Order from '@/models/Order';
import connectDB from '@/lib/mongodb';

/**
 * Reports Router - 3 tRPC Procedures for Admin Reports
 * 
 * 1. getPeriodicSales - Laporan Penjualan Periodik (harian/mingguan/bulanan/custom)
 * 2. getCategorySales - Laporan Penjualan per Kategori Produk
 * 3. getPaymentMethodStats - Laporan Penggunaan Metode Pembayaran
 * 
 * All procedures require admin/staff authentication
 */

export const reportsRouter = router({
  /**
   * PROCEDURE 1: Get Periodic Sales Report
   * 
   * Returns aggregated sales data based on time period
   * Used for: Laporan Penjualan Periodik with date filters
   * 
   * Input:
   * - period: 'daily' | 'weekly' | 'monthly' | 'custom'
   * - startDate?: ISO date string (required for custom)
   * - endDate?: ISO date string (required for custom)
   * 
   * Output:
   * - totalRevenue: Sum of all order totals
   * - totalOrders: Count of paid orders
   * - totalProductsSold: Sum of all item quantities
   * - chartData: Array of { period, revenue, orders, date }
   * - periodLabel: Human-readable period description
   */
  getPeriodicSales: protectedProcedure
    .input(
      z.object({
        period: z.enum(['daily', 'weekly', 'monthly', 'custom']),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Check admin/staff role
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Hanya admin dan staff yang dapat mengakses laporan',
          });
        }

        await connectDB();

        // Calculate date range based on period
        const now = new Date();
        let startDate: Date;
        let endDate = new Date(); // Today
        let periodLabel = '';

        switch (input.period) {
          case 'daily':
            // Last 7 days
            startDate = new Date();
            startDate.setDate(now.getDate() - 7);
            periodLabel = '7 Hari Terakhir';
            break;

          case 'weekly':
            // Last 8 weeks
            startDate = new Date();
            startDate.setDate(now.getDate() - 56); // 8 weeks = 56 days
            periodLabel = '8 Minggu Terakhir';
            break;

          case 'monthly':
            // Last 12 months
            startDate = new Date();
            startDate.setMonth(now.getMonth() - 12);
            periodLabel = '12 Bulan Terakhir';
            break;

          case 'custom':
            if (!input.startDate || !input.endDate) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Custom period memerlukan startDate dan endDate',
              });
            }
            startDate = new Date(input.startDate);
            endDate = new Date(input.endDate);
            periodLabel = `${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`;
            break;

          default:
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid period type',
            });
        }

        // Query orders in date range with paymentStatus = 'paid'
        const orders = await Order.find({
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid',
        }).lean();

        // Calculate totals
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const totalProductsSold = orders.reduce(
          (sum, order) => 
            sum + order.items.reduce((itemSum: number, item: { quantity: number }) => itemSum + item.quantity, 0),
          0
        );

        // Group data by period for chart
        const chartData: Array<{
          period: string;
          revenue: number;
          orders: number;
          date: string;
        }> = [];

        if (input.period === 'daily') {
          // Group by day
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const dayOrders = orders.filter(
              (order) => 
                new Date(order.createdAt) >= date && 
                new Date(order.createdAt) < nextDate
            );

            chartData.push({
              period: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
              revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
              orders: dayOrders.length,
              date: date.toISOString(),
            });
          }
        } else if (input.period === 'weekly') {
          // Group by week
          for (let i = 7; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(now.getDate() - (i * 7));
            weekStart.setHours(0, 0, 0, 0);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);

            const weekOrders = orders.filter(
              (order) => 
                new Date(order.createdAt) >= weekStart && 
                new Date(order.createdAt) < weekEnd
            );

            chartData.push({
              period: `Minggu ${8 - i}`,
              revenue: weekOrders.reduce((sum, order) => sum + order.total, 0),
              orders: weekOrders.length,
              date: weekStart.toISOString(),
            });
          }
        } else if (input.period === 'monthly') {
          // Group by month
          for (let i = 11; i >= 0; i--) {
            const monthStart = new Date();
            monthStart.setMonth(now.getMonth() - i);
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);
            
            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthStart.getMonth() + 1);

            const monthOrders = orders.filter(
              (order) => 
                new Date(order.createdAt) >= monthStart && 
                new Date(order.createdAt) < monthEnd
            );

            chartData.push({
              period: monthStart.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
              revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
              orders: monthOrders.length,
              date: monthStart.toISOString(),
            });
          }
        } else {
          // Custom period - group by day if < 31 days, by week if < 90 days, by month otherwise
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff <= 31) {
            // Group by day
            for (let i = 0; i <= daysDiff; i++) {
              const date = new Date(startDate);
              date.setDate(startDate.getDate() + i);
              date.setHours(0, 0, 0, 0);
              
              const nextDate = new Date(date);
              nextDate.setDate(date.getDate() + 1);

              const dayOrders = orders.filter(
                (order) => 
                  new Date(order.createdAt) >= date && 
                  new Date(order.createdAt) < nextDate
              );

              chartData.push({
                period: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
                orders: dayOrders.length,
                date: date.toISOString(),
              });
            }
          } else {
            // Group by month (simplified for custom ranges)
            const monthsData = new Map<string, { revenue: number; orders: number; date: Date }>();
            
            orders.forEach((order) => {
              const orderDate = new Date(order.createdAt);
              const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
              
              if (!monthsData.has(monthKey)) {
                monthsData.set(monthKey, { revenue: 0, orders: 0, date: orderDate });
              }
              
              const monthData = monthsData.get(monthKey)!;
              monthData.revenue += order.total;
              monthData.orders += 1;
            });

            monthsData.forEach((data) => {
              chartData.push({
                period: data.date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
                revenue: data.revenue,
                orders: data.orders,
                date: data.date.toISOString(),
              });
            });

            chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          }
        }

        return {
          totalRevenue,
          totalOrders,
          totalProductsSold,
          chartData,
          periodLabel,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        };
      } catch (error) {
        console.error('[getPeriodicSales] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mengambil data laporan penjualan periodik',
          cause: error,
        });
      }
    }),

  /**
   * PROCEDURE 2: Get Category Sales Report
   * 
   * Returns sales breakdown by product category
   * Used for: Laporan Penjualan per Kategori
   * 
   * Input:
   * - startDate?: ISO date string (optional filter)
   * - endDate?: ISO date string (optional filter)
   * 
   * Output:
   * - totalCategories: Number of categories with sales
   * - totalRevenue: Sum of all category revenues
   * - categories: Array of { category, revenue, percentage, orderCount, productsSold }
   */
  getCategorySales: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Check admin/staff role
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Hanya admin dan staff yang dapat mengakses laporan',
          });
        }

        await connectDB();

        // Build date filter
        const dateFilter: Record<string, unknown> = { paymentStatus: 'paid' };
        if (input.startDate && input.endDate) {
          dateFilter.createdAt = {
            $gte: new Date(input.startDate),
            $lte: new Date(input.endDate),
          };
        }

        // Get all paid orders
        const orders = await Order.find(dateFilter).lean();

        // Aggregate by category
        const categoryMap = new Map<string, {
          revenue: number;
          orderCount: number;
          productsSold: number;
        }>();

        orders.forEach((order) => {
          order.items.forEach((item: { category: string; price: number; quantity: number }) => {
            const category = item.category;
            
            if (!categoryMap.has(category)) {
              categoryMap.set(category, {
                revenue: 0,
                orderCount: 0,
                productsSold: 0,
              });
            }

            const categoryData = categoryMap.get(category)!;
            categoryData.revenue += item.price * item.quantity;
            categoryData.productsSold += item.quantity;
          });

          // Count unique orders per category
          const categoriesInOrder = new Set<string>(order.items.map((item: { category: string }) => item.category));
          categoriesInOrder.forEach((category) => {
            const categoryData = categoryMap.get(category)!;
            categoryData.orderCount += 1;
          });
        });

        // Calculate total revenue for percentages
        const totalRevenue = Array.from(categoryMap.values()).reduce(
          (sum, data) => sum + data.revenue,
          0
        );

        // Convert to array with percentages
        const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          revenue: data.revenue,
          percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
          orderCount: data.orderCount,
          productsSold: data.productsSold,
        }));

        // Sort by revenue (descending)
        categories.sort((a, b) => b.revenue - a.revenue);

        return {
          totalCategories: categories.length,
          totalRevenue,
          categories,
          dateRange: input.startDate && input.endDate
            ? {
                start: input.startDate,
                end: input.endDate,
              }
            : null,
        };
      } catch (error) {
        console.error('[getCategorySales] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mengambil data laporan penjualan per kategori',
          cause: error,
        });
      }
    }),

  /**
   * PROCEDURE 3: Get Payment Method Statistics
   * 
   * Returns usage statistics for payment methods (uses paymentType from Midtrans)
   * Used for: Laporan Penggunaan Metode Pembayaran
   * 
   * Payment Type dari Midtrans:
   * - gopay, shopeepay, qris, other_qris (E-Wallets)
   * - bank_transfer, bca_va, bni_va, bri_va, permata_va, other_va, echannel (Bank Transfer/VA)
   * - credit_card (Credit Card)
   * - alfamart, indomaret, cstore (Convenience Store)
   * - cod (Cash on Delivery - non-Midtrans)
   * 
   * Input:
   * - startDate?: ISO date string (optional filter)
   * - endDate?: ISO date string (optional filter)
   * 
   * Output:
   * - totalTransactions: Count of paid orders
   * - totalAmount: Sum of all order totals
   * - methods: Array of { method, count, percentage, totalAmount, averageAmount }
   */
  getPaymentMethodStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Check admin/staff role
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Hanya admin dan staff yang dapat mengakses laporan',
          });
        }

        await connectDB();

        // Build date filter
        const dateFilter: Record<string, unknown> = { paymentStatus: 'paid' };
        if (input.startDate && input.endDate) {
          dateFilter.createdAt = {
            $gte: new Date(input.startDate),
            $lte: new Date(input.endDate),
          };
        }

        // Get all paid orders
        const orders = await Order.find(dateFilter).lean();

        // Aggregate by payment type (use paymentType from Midtrans, fallback to paymentMethod)
        const methodMap = new Map<string, {
          count: number;
          totalAmount: number;
        }>();

        orders.forEach((order) => {
          // Prefer paymentType (specific from Midtrans), fallback to paymentMethod
          const method = order.paymentType || order.paymentMethod || 'unknown';
          
          if (!methodMap.has(method)) {
            methodMap.set(method, {
              count: 0,
              totalAmount: 0,
            });
          }

          const methodData = methodMap.get(method)!;
          methodData.count += 1;
          methodData.totalAmount += order.total;
        });

        // Calculate totals
        const totalTransactions = orders.length;
        const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

        // Convert to array with percentages and averages
        const methods = Array.from(methodMap.entries()).map(([method, data]) => ({
          method,
          count: data.count,
          percentage: totalTransactions > 0 ? (data.count / totalTransactions) * 100 : 0,
          totalAmount: data.totalAmount,
          averageAmount: data.count > 0 ? data.totalAmount / data.count : 0,
        }));

        // Sort by count (descending)
        methods.sort((a, b) => b.count - a.count);

        return {
          totalTransactions,
          totalAmount,
          methods,
          dateRange: input.startDate && input.endDate
            ? {
                start: input.startDate,
                end: input.endDate,
              }
            : null,
        };
      } catch (error) {
        console.error('[getPaymentMethodStats] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mengambil data laporan metode pembayaran',
          cause: error,
        });
      }
    }),
});
