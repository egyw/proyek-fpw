import { router, procedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Product, { IProductData } from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import StockMovement from "@/models/StockMovement";
import { TRPCError } from "@trpc/server";

function formatRupiahShort(value: number): string {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " M";
  } else if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + " jt";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + " rb";
  } else {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  }
}

export const productsRouter = router({
  // Get all products
  getAll: procedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        hasDiscount: z.boolean().optional(),
        limit: z.number().default(20),
        skip: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      await connectDB();

      const query: Record<string, unknown> = { isActive: true };

      // Filter by category
      if (input.category) {
        query.category = input.category;
      }

      // Filter by price range
      if (input.minPrice !== undefined || input.maxPrice !== undefined) {
        query.price = {};
        if (input.minPrice !== undefined) {
          (query.price as Record<string, number>).$gte = input.minPrice;
        }
        if (input.maxPrice !== undefined) {
          (query.price as Record<string, number>).$lte = input.maxPrice;
        }
      }

      // Filter by discount
      if (input.hasDiscount) {
        query["discount.percentage"] = { $gt: 0 };
      }

      // Search by name or description
      if (input.search) {
        query.$or = [
          { name: { $regex: input.search, $options: "i" } },
          { description: { $regex: input.search, $options: "i" } },
        ];
      }

      // Determine sort order
      let sortQuery: Record<string, 1 | -1> = { createdAt: -1 }; // Default: newest first

      if (input.sortBy) {
        switch (input.sortBy) {
          case "popular":
            sortQuery = { sold: -1 }; // Most sold first
            break;
          case "newest":
            sortQuery = { createdAt: -1 }; // Newest first
            break;
          case "price-low":
            sortQuery = { price: 1 }; // Lowest price first
            break;
          case "price-high":
            sortQuery = { price: -1 }; // Highest price first
            break;
          case "name":
            sortQuery = { name: 1 }; // A-Z
            break;
          case "name-desc":
            sortQuery = { name: -1 }; // Z-A
            break;
          default:
            sortQuery = { createdAt: -1 };
        }
      }

      // Get total count for pagination
      const total = await Product.countDocuments(query);

      // Get products with pagination
      const products = await Product.find(query)
        .skip(input.skip)
        .limit(input.limit)
        .sort(sortQuery)
        .lean<IProductData[]>();

      return {
        products,
        total,
      };
    }),

  getDashBoardStats: procedure.query(async () => {
    try {
      await connectDB();

      const now = new Date();
      
      // Start of today (00:00:00)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfTodayISO = startOfToday.toISOString();
      
      // Start of yesterday (00:00:00)
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const startOfYesterdayISO = startOfYesterday.toISOString();
      
      // This month range
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfThisMonthISO = startOfThisMonth.toISOString();

      // Last month range
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const startOfLastMonthISO = startOfLastMonth.toISOString();

      const endOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );

      const endOfLastMonthISO = endOfLastMonth.toISOString();
      console.log("Date ranges:", {
        startOfThisMonthISO,
        startOfLastMonthISO,
        endOfLastMonthISO,
      });
      const [
        totalProducts,
        lowStockProducts,
        recentProducts,

        totalProductThisMonth,
        totalProductLastMonth,

        totalCustomersThisMonth,
        totalCustomersLastMonth,

        recentOrders,
        
        // Orders today count
        ordersToday,
        ordersYesterday,

        // Revenue calculations
        totalRevenueThisMonth,
        totalRevenueLastMonth,
      ] = await Promise.all([
        Product.countDocuments({ isActive: true }),

        Product.find({
          $expr: { $lte: ["$stock", "$minStock"] },
          isActive: true,
        })
          .select("name stock minStock category unit")
          .limit(10)
          .lean(),

        Product.find({ isActive: true })
          .sort({ createdAt: -1 })
          .select("name category price stock createdAt")
          .limit(5)
          .lean(),

        Product.countDocuments({
          createdAt: { $gte: startOfThisMonthISO },
          isActive: true,
        }),

        Product.countDocuments({
          createdAt: {
            $gte: startOfLastMonthISO,
            $lte: endOfLastMonthISO,
          },
          isActive: true,
        }),

        User.countDocuments({
          role: "user",
          createdAt: { $gte: startOfThisMonthISO },
        }),

        User.countDocuments({
          role: "user",
          createdAt: {
            $gte: startOfThisMonthISO,
            $lte: endOfLastMonthISO,
          },
        }),

        // Recent orders - get latest 10 orders with user info
        Order.find()
          .sort({ createdAt: -1 })
          .populate('userId', 'fullName name') // Populate user name
          .select("orderId userId items total orderStatus createdAt")
          .limit(10)
          .lean(),
        
        // Orders today count
        Order.countDocuments({
          createdAt: { $gte: startOfTodayISO },
        }),

        // Orders yesterday count
        Order.countDocuments({
          createdAt: {
            $gte: startOfYesterdayISO,
            $lt: startOfTodayISO, // Before today
          },
        }),

        // Revenue this month - sum of completed orders
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfThisMonthISO },
              orderStatus: { $in: ["completed", "delivered"] }, // Only count completed/delivered orders
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$total" },
            },
          },
        ]).then((result) => result[0]?.total || 0),

        // Revenue last month - sum of completed orders
        Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startOfLastMonthISO,
                $lte: endOfLastMonthISO,
              },
              orderStatus: { $in: ["completed", "delivered"] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$total" },
            },
          },
        ]).then((result) => result[0]?.total || 0),
      ]);

      const productGrowth =
        totalProductLastMonth > 0
          ? Math.round(
              ((totalProductThisMonth - totalProductLastMonth) /
                totalProductLastMonth) *
                100
            )
          : 0;

      // Calculate orders growth - handle edge cases properly
      let ordersGrowth = 0;
      if (ordersYesterday > 0) {
        // Normal calculation when there were orders yesterday
        ordersGrowth = Math.round(
          ((ordersToday - ordersYesterday) / ordersYesterday) * 100
        );
      } else if (ordersToday > 0 && ordersYesterday === 0) {
        // If no orders yesterday but orders today, it's technically infinite growth
        // We'll use null to indicate this special case
        ordersGrowth = 999; // Use 999 as a flag for "new orders"
      }
      // else: both 0, keep ordersGrowth = 0

      const customerGrowth =
        totalCustomersLastMonth > 0
          ? Math.round(
              ((totalCustomersThisMonth - totalCustomersLastMonth) /
                totalCustomersLastMonth) *
                100
            )
          : 0;

      const revenueGrowth =
        totalRevenueLastMonth > 0
          ? Math.round(
              ((totalRevenueThisMonth - totalRevenueLastMonth) /
                totalRevenueLastMonth) *
                100
            )
          : 0;

      const totalCustomer = {
        thisMonth: totalCustomersThisMonth,
        lastMonth: totalCustomersLastMonth,
        growth: customerGrowth,
        trend: customerGrowth >= 0 ? ("up" as const) : ("down" as const),
      };

      const totalRevenue = {
        thisMonth: totalRevenueThisMonth,
        lastMonth: totalRevenueLastMonth,
        growth: revenueGrowth,
        trend: revenueGrowth >= 0 ? ("up" as const) : ("down" as const),
        formatted: formatRupiahShort(totalRevenueThisMonth),
      };

      return {
        totalProducts,
        lowStockProducts,
        recentProducts,
        totalProductThisMonth,
        totalCustomer,
        totalRevenue,
        recentOrders,
        ordersToday, // Orders count today
        productGrowth, // Product growth %
        ordersGrowth, // Orders growth %
      };
    } catch (error: unknown) {
      console.error("[products.getDashBoardStats] Error:", error);

      if (error instanceof Error) {
        if (error.message.includes("connection")) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed for dashboard stats",
            cause: error,
          });
        }

        if (error.message.includes("User")) {
          console.warn("User model not found, using dummy customer data");
        }
      }

      if (!(error instanceof Error && error.message.includes("User"))) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch dashboard statistics",
          cause: error instanceof Error ? error : undefined,
        });
      }
    }
  }),

  // Get product by slug
  getBySlug: procedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      await connectDB();

      const product = await Product.findOne({
        slug: input.slug,
        isActive: true,
      }).lean<IProductData>();

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    }),

  // Get featured products
  getFeatured: procedure.query(async () => {
    await connectDB();

    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .limit(8)
      .sort({ sold: -1 })
      .lean<IProductData[]>();

    return products;
  }),

  // Get product by ID
  getById: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      await connectDB();

      const product = await Product.findById(input.id).lean<IProductData>();

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    }),

  // Get multiple products by IDs (for weight calculation in checkout)
  getByIds: procedure
    .input(
      z.object({
        productIds: z.array(z.string()).min(1).max(100), // Limit to 100 products
      })
    )
    .query(async ({ input }) => {
      try {
        await connectDB();

        // Query products by IDs
        const products = await Product.find({
          _id: { $in: input.productIds },
          isActive: true, // Only get active products
        })
          .select('_id name slug category unit attributes') // Only select needed fields
          .lean<IProductData[]>();

        return {
          products,
        };
      } catch (error) {
        console.error('[getByIds] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch products',
          cause: error,
        });
      }
    }),

  // ADMIN: Get all products for admin panel
  getAdminAll: procedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        status: z.enum(['all', 'active', 'inactive']).default('all'),
        sortBy: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        await connectDB();

        const query: Record<string, unknown> = {};

        // Filter by status
        if (input.status === 'active') {
          query.isActive = true;
        } else if (input.status === 'inactive') {
          query.isActive = false;
        }

        // Filter by category
        if (input.category && input.category !== 'all') {
          query.category = input.category;
        }

        // Search by name or brand
        if (input.search) {
          query.$or = [
            { name: { $regex: input.search, $options: 'i' } },
            { brand: { $regex: input.search, $options: 'i' } },
          ];
        }

        // Determine sort order
        let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };

        if (input.sortBy) {
          switch (input.sortBy) {
            case 'newest':
              sortQuery = { createdAt: -1 };
              break;
            case 'oldest':
              sortQuery = { createdAt: 1 };
              break;
            case 'name-asc':
              sortQuery = { name: 1 };
              break;
            case 'name-desc':
              sortQuery = { name: -1 };
              break;
            case 'price-low':
              sortQuery = { price: 1 };
              break;
            case 'price-high':
              sortQuery = { price: -1 };
              break;
            case 'stock-low':
              sortQuery = { stock: 1 };
              break;
            case 'stock-high':
              sortQuery = { stock: -1 };
              break;
            default:
              sortQuery = { createdAt: -1 };
          }
        }

        // Calculate pagination
        const skip = (input.page - 1) * input.limit;

        // Get total count for pagination
        const totalCount = await Product.countDocuments(query);

        // Get paginated products
        const products = await Product.find(query)
          .sort(sortQuery)
          .skip(skip)
          .limit(input.limit)
          .lean<IProductData[]>();

        // Calculate stats from all products (not just current page)
        const allProducts = await Product.find(query).lean();
        const totalProducts = allProducts.length;
        const activeProducts = allProducts.filter(p => p.isActive).length;
        const inactiveProducts = allProducts.filter(p => !p.isActive).length;
        const lowStockProducts = allProducts.filter(
          p => p.stock <= p.minStock
        ).length;
        const outOfStockProducts = allProducts.filter(p => p.stock === 0).length;

        return {
          products,
          pagination: {
            currentPage: input.page,
            totalPages: Math.ceil(totalCount / input.limit),
            totalItems: totalCount,
            itemsPerPage: input.limit,
            hasNextPage: input.page < Math.ceil(totalCount / input.limit),
            hasPrevPage: input.page > 1,
          },
          stats: {
            total: totalProducts,
            active: activeProducts,
            inactive: inactiveProducts,
            lowStock: lowStockProducts,
            outOfStock: outOfStockProducts,
          },
        };
      } catch (error) {
        console.error('[getAdminAll] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch products',
          cause: error,
        });
      }
    }),

  // ADMIN: Create product
  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        slug: z.string().min(3),
        category: z.string(),
        brand: z.string(),
        unit: z.string(),
        price: z.number().positive(),
        originalPrice: z.number().optional(),
        discount: z.object({
          percentage: z.number().min(0).max(100),
          validUntil: z.string(),
        }).optional(),
        stock: z.number().min(0),
        minStock: z.number().min(0),
        availableUnits: z.array(z.string()),
        images: z.array(z.string()),
        description: z.string().min(10),
        attributes: z.record(z.string(), z.unknown()),
        isActive: z.boolean(),
        isFeatured: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await connectDB();

        // Check if slug already exists
        const existingProduct = await Product.findOne({ slug: input.slug });
        if (existingProduct) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Product with this slug already exists',
          });
        }

        const product = await Product.create(input);

        // ⭐ Phase 3: Record initial stock movement if stock > 0
        if (input.stock > 0) {
          await StockMovement.create({
            productId: product._id as unknown as import('mongoose').Types.ObjectId,
            productName: product.name,
            productCode: product.slug,
            movementType: 'in',
            quantity: input.stock,
            unit: product.unit,
            reason: 'Produk baru ditambahkan',
            referenceType: 'initial',
            referenceId: (product._id as unknown as import('mongoose').Types.ObjectId).toString(),
            performedBy: ctx.user.id,
            performedByName: ctx.user.name,
            previousStock: 0,
            newStock: input.stock,
            notes: 'Stok awal saat produk dibuat',
          });
        }

        return {
          success: true,
          product: product.toObject(),
        };
      } catch (error) {
        console.error('[createProduct] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create product',
          cause: error,
        });
      }
    }),

  // ADMIN: Update product
  updateProduct: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).optional(),
        slug: z.string().min(3).optional(),
        category: z.string().optional(),
        brand: z.string().optional(),
        unit: z.string().optional(),
        price: z.number().positive().optional(),
        originalPrice: z.number().optional(),
        discount: z.object({
          percentage: z.number().min(0).max(100),
          validUntil: z.string(),
        }).optional(),
        stock: z.number().min(0).optional(),
        minStock: z.number().min(0).optional(),
        availableUnits: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
        description: z.string().min(10).optional(),
        attributes: z.record(z.string(), z.unknown()).optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        stockAdjustmentReason: z.string().optional(), // ⭐ For stock movement tracking
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await connectDB();

        const { id, stockAdjustmentReason, ...updateData } = input;

        // Check if slug is being updated and already exists
        if (updateData.slug) {
          const existingProduct = await Product.findOne({ 
            slug: updateData.slug,
            _id: { $ne: id }
          });
          if (existingProduct) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Product with this slug already exists',
            });
          }
        }

        // ⭐ Phase 2: Track stock adjustment if stock is being updated
        let previousStock = 0;
        if (updateData.stock !== undefined) {
          const currentProduct = await Product.findById(id);
          if (!currentProduct) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Product not found',
            });
          }
          previousStock = currentProduct.stock;

          // Record stock movement if stock changed
          if (previousStock !== updateData.stock) {
            const stockDifference = updateData.stock - previousStock;
            const movementType = stockDifference > 0 ? 'in' : 'out';
            const quantity = Math.abs(stockDifference);

            await StockMovement.create({
              productId: currentProduct._id,
              productName: currentProduct.name,
              productCode: currentProduct.slug,
              movementType,
              quantity,
              unit: currentProduct.unit,
              reason: stockAdjustmentReason || 'Penyesuaian stok manual',
              referenceType: 'adjustment',
              referenceId: `ADJ-${Date.now()}`,
              performedBy: ctx.user.id,
              performedByName: ctx.user.name,
              previousStock,
              newStock: updateData.stock,
              notes: stockAdjustmentReason,
            });
          }
        }

        const product = await Product.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true, runValidators: true }
        );

        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          });
        }

        return {
          success: true,
          product: product.toObject(),
        };
      } catch (error) {
        console.error('[updateProduct] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update product',
          cause: error,
        });
      }
    }),

  // ADMIN: Delete product (SOFT DELETE)
  deleteProduct: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await connectDB();

        // Soft delete: set isActive = false (keep product in database)
        const product = await Product.findByIdAndUpdate(
          input.id,
          { 
            isActive: false,
            updatedAt: new Date().toISOString()
          },
          { new: true }
        );

        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          });
        }

        // ⭐ NOTE: We do NOT delete images from Cloudinary
        // Reason: Product can be restored, and we want to keep images
        // If you need to clean up orphaned images, use a scheduled job

        return {
          success: true,
          message: 'Product archived successfully (soft delete)',
        };
      } catch (error) {
        console.error('[deleteProduct] Error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete product',
          cause: error,
        });
      }
    }),

  // Toggle product status (admin only)
  toggleStatus: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin or staff
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin and staff can toggle product status',
          });
        }

        await connectDB();

        const product = await Product.findById(input.id);
        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          });
        }

        product.isActive = !product.isActive;
        product.updatedAt = new Date().toISOString();
        await product.save();

        return { success: true, product };
      } catch (error) {
        console.error('[toggleStatus] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle product status',
          cause: error,
        });
      }
    }),
});
