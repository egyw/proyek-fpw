import { router, procedure } from "../trpc";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Product, { IProductData } from "@/models/Product";
import User from "@/models/User";

function formatRupiahShort(value) {
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
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfThisMonthISO = startOfThisMonth.toISOString();

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

        totalCustomersThisMonth,
        totalCustomersLastMonth,

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

        // Revenue stats - dummy for now
        Promise.resolve(125000000),
        Promise.resolve(108000000),
      ]);

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
      };
    } catch (error) {
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
          cause: error,
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
});
