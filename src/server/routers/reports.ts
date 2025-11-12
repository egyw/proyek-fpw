import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import Order from '@/models/Order';
import connectDB from '@/lib/mongodb';

/**
 * OrderItem Interface for type safety
 */
interface OrderItem {
  productId?: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image?: string;
  unit?: string;
}

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

  /**
   * PROCEDURE 4: Get Best Sellers Report
   * 
   * Returns products with highest sales (by quantity or value)
   * Used for: Laporan Produk Terlaris
   * 
   * Input:
   * - startDate: ISO date string
   * - endDate: ISO date string
   * - sortBy: 'quantity' | 'value'
   * - limit: Number of top products (default 10)
   * 
   * Output:
   * - products: Array of top selling products
   * - totalProducts: Total unique products sold
   * - grandTotal: Total quantity or value (depends on sortBy)
   */
  getBestSellers: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        sortBy: z.enum(['quantity', 'value']),
        limit: z.number().int().min(1).max(100).default(10),
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

        // Convert ISO strings to Date objects for MongoDB comparison
        const startDateObj = new Date(input.startDate);
        const endDateObj = new Date(input.endDate);

        // Find orders in date range with status completed/paid
        const orders = await Order.find({
          createdAt: {
            $gte: startDateObj,
            $lte: endDateObj,
          },
          paymentStatus: { $in: ['paid', 'completed'] },
        }).lean();

        console.log('[getBestSellers] Date range:', startDateObj, 'to', endDateObj);
        console.log('[getBestSellers] Found orders:', orders.length);
        console.log('[getBestSellers] Sample order:', orders[0] || 'No orders found');

        // Aggregate sales by product
        const productSales: Record<
          string,
          {
            productId: string;
            productName: string;
            category: string;
            image: string;
            totalQuantity: number;
            totalValue: number;
            averagePrice: number;
            salesCount: number;
          }
        > = {};

        orders.forEach((order) => {
          order.items.forEach((item: OrderItem) => {
            const key = item.productId?.toString() || item.name;

            if (!productSales[key]) {
              productSales[key] = {
                productId: key,
                productName: item.name,
                category: item.category || 'Unknown',
                image: item.image || '/images/dummy_image.jpg',
                totalQuantity: 0,
                totalValue: 0,
                averagePrice: item.price,
                salesCount: 0,
              };
            }

            productSales[key].totalQuantity += item.quantity;
            productSales[key].totalValue += item.price * item.quantity;
            productSales[key].salesCount += 1;
          });
        });

        // Convert to array and calculate average price
        const salesArray = Object.values(productSales).map((product) => ({
          ...product,
          averagePrice: product.totalValue / product.totalQuantity,
        }));

        // Sort by selected metric
        salesArray.sort((a, b) => {
          if (input.sortBy === 'quantity') {
            return b.totalQuantity - a.totalQuantity;
          } else {
            return b.totalValue - a.totalValue;
          }
        });

        // Limit results
        const topProducts = salesArray.slice(0, input.limit);

        // Calculate total for percentage
        const grandTotal =
          input.sortBy === 'quantity'
            ? salesArray.reduce((sum, p) => sum + p.totalQuantity, 0)
            : salesArray.reduce((sum, p) => sum + p.totalValue, 0);

        // Add percentage
        const productsWithPercentage = topProducts.map((product) => ({
          ...product,
          percentage:
            input.sortBy === 'quantity'
              ? (product.totalQuantity / grandTotal) * 100
              : (product.totalValue / grandTotal) * 100,
        }));

        return {
          products: productsWithPercentage,
          totalProducts: salesArray.length,
          grandTotal,
        };
      } catch (error) {
        console.error('[getBestSellers] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mengambil data laporan produk terlaris',
          cause: error,
        });
      }
    }),

  /**
   * PROCEDURE 5: Get Low Stock Report
   * 
   * Returns products below stock threshold
   * Used for: Laporan Stok Rendah (Low Stock Alert)
   * 
   * Input:
   * - threshold: Stock level threshold (default 20)
   * - category?: Filter by category (optional)
   * - sortBy: 'stock-asc' | 'stock-desc'
   * 
   * Output:
   * - products: Array of low stock products with priority levels
   * - stats: { total, critical, warning, low }
   */
  getLowStock: protectedProcedure
    .input(
      z.object({
        threshold: z.number().int().min(1).default(20),
        category: z.string().optional(),
        sortBy: z.enum(['stock-asc', 'stock-desc']).default('stock-asc'),
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

        const Product = (await import('@/models/Product')).default;

        // Build query
        const query: Record<string, unknown> = {
          stock: { $lte: input.threshold },
          isActive: true, // Only active products
        };

        if (input.category && input.category !== 'all') {
          query.category = input.category;
        }

        // Find products
        const products = await Product.find(query).lean();

        // Add priority level
        const productsWithPriority = products.map((product) => {
          let priority: 'critical' | 'warning' | 'low';
          if (product.stock < 5) {
            priority = 'critical';
          } else if (product.stock < 10) {
            priority = 'warning';
          } else {
            priority = 'low';
          }

          return {
            id: product._id.toString(),
            productName: product.name,
            category: product.category,
            currentStock: product.stock,
            minStock: product.minStock,
            unit: product.unit,
            price: product.price,
            image: product.images?.[0] || '/images/dummy_image.jpg',
            priority,
            lastUpdated: product.updatedAt,
          };
        });

        // Sort
        if (input.sortBy === 'stock-asc') {
          productsWithPriority.sort((a, b) => a.currentStock - b.currentStock);
        } else {
          productsWithPriority.sort((a, b) => b.currentStock - a.currentStock);
        }

        // Calculate stats
        const stats = {
          total: productsWithPriority.length,
          critical: productsWithPriority.filter((p) => p.priority === 'critical')
            .length,
          warning: productsWithPriority.filter((p) => p.priority === 'warning')
            .length,
          low: productsWithPriority.filter((p) => p.priority === 'low').length,
        };

        return {
          products: productsWithPriority,
          stats,
        };
      } catch (error) {
        console.error('[getLowStock] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mengambil data laporan stok rendah',
          cause: error,
        });
      }
    }),

  /**
   * PROCEDURE 6: Get Slow-Moving Report
   * 
   * Returns products with low/no sales (potential dead stock)
   * Used for: Laporan Stok Kurang Laku (Slow-Moving/Dead Stock)
   * 
   * Input:
   * - period: '30days' | '60days' | '90days' | '6months'
   * - category?: Filter by category (optional)
   * - status: 'all' | 'dead' | 'very_slow' | 'slow'
   * 
   * Status Definition:
   * - dead: Not sold in 90+ days or zero sales
   * - very_slow: Not sold in 60-89 days
   * - slow: Not sold in 30-59 days
   * 
   * Output:
   * - products: Array of slow-moving products
   * - stats: { totalProducts, deadStock, totalStockValue }
   */
  getSlowMoving: protectedProcedure
    .input(
      z.object({
        period: z
          .enum(['30days', '60days', '90days', '6months'])
          .default('90days'),
        category: z.string().optional(),
        status: z.enum(['all', 'dead', 'very_slow', 'slow']).default('all'),
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

        const Product = (await import('@/models/Product')).default;

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        switch (input.period) {
          case '30days':
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '60days':
            startDate.setDate(startDate.getDate() - 60);
            break;
          case '90days':
            startDate.setDate(startDate.getDate() - 90);
            break;
          case '6months':
            startDate.setMonth(startDate.getMonth() - 6);
            break;
        }

        const startDateISO = startDate.toISOString();
        const endDateISO = endDate.toISOString();

        // Get all active products
        const productQuery: Record<string, unknown> = { isActive: true };
        if (input.category && input.category !== 'all') {
          productQuery.category = input.category;
        }

        const allProducts = await Product.find(productQuery).lean();

        // Get orders in period
        const orders = await Order.find({
          createdAt: {
            $gte: startDateISO,
            $lte: endDateISO,
          },
          paymentStatus: { $in: ['paid', 'completed'] },
        }).lean();

        // Calculate sales per product
        const productSalesMap: Record<
          string,
          { totalSold: number; lastSoldDate: string | null }
        > = {};

        orders.forEach((order) => {
          order.items.forEach((item: OrderItem) => {
            const productId = item.productId?.toString() || item.name;

            if (!productSalesMap[productId]) {
              productSalesMap[productId] = {
                totalSold: 0,
                lastSoldDate: null,
              };
            }

            productSalesMap[productId].totalSold += item.quantity;

            // Track latest sale date
            if (
              !productSalesMap[productId].lastSoldDate ||
              order.createdAt > productSalesMap[productId].lastSoldDate!
            ) {
              productSalesMap[productId].lastSoldDate = order.createdAt;
            }
          });
        });

        // Process products to find slow-moving ones
        const slowMovingProducts = allProducts
          .map((product) => {
            const productId = product._id.toString();
            const salesData = productSalesMap[productId] || {
              totalSold: 0,
              lastSoldDate: null,
            };

            // Calculate days not sold
            let daysNotSold = 0;
            if (salesData.lastSoldDate) {
              const lastSold = new Date(salesData.lastSoldDate);
              daysNotSold = Math.floor(
                (endDate.getTime() - lastSold.getTime()) / (1000 * 60 * 60 * 24)
              );
            } else {
              // Never sold in period - use full period
              daysNotSold = Math.floor(
                (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
            }

            // Determine status
            let status: 'dead' | 'very_slow' | 'slow' | null = null;
            if (salesData.totalSold === 0 || daysNotSold >= 90) {
              status = 'dead';
            } else if (daysNotSold >= 60) {
              status = 'very_slow';
            } else if (daysNotSold >= 30) {
              status = 'slow';
            }

            // Calculate stock value
            const stockValue = product.stock * product.price;

            return {
              id: productId,
              productName: product.name,
              category: product.category,
              currentStock: product.stock,
              unit: product.unit,
              totalSold: salesData.totalSold,
              lastSoldDate: salesData.lastSoldDate,
              daysNotSold,
              stockValue,
              price: product.price,
              status,
            };
          })
          .filter((product) => product.status !== null); // Only slow-moving ones

        // Filter by status
        let filteredProducts = slowMovingProducts;
        if (input.status !== 'all') {
          filteredProducts = slowMovingProducts.filter(
            (p) => p.status === input.status
          );
        }

        // Sort by days not sold (highest first)
        filteredProducts.sort((a, b) => b.daysNotSold - a.daysNotSold);

        // Calculate stats
        const stats = {
          totalProducts: filteredProducts.length,
          deadStock: filteredProducts.filter((p) => p.status === 'dead').length,
          totalStockValue: filteredProducts.reduce(
            (sum, p) => sum + p.stockValue,
            0
          ),
        };

        return {
          products: filteredProducts,
          stats,
        };
      } catch (error) {
        console.error('[getSlowMoving] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mengambil data laporan stok kurang laku',
          cause: error,
        });
      }
    }),
});
