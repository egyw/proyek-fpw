import { router, procedure } from '../trpc';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Product, { IProductData } from '@/models/Product';

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
        query['discount.percentage'] = { $gt: 0 };
      }

      // Search by name or description
      if (input.search) {
        query.$or = [
          { name: { $regex: input.search, $options: 'i' } },
          { description: { $regex: input.search, $options: 'i' } },
        ];
      }

      // Determine sort order
      let sortQuery: Record<string, 1 | -1> = { createdAt: -1 }; // Default: newest first
      
      if (input.sortBy) {
        switch (input.sortBy) {
          case 'popular':
            sortQuery = { sold: -1 }; // Most sold first
            break;
          case 'newest':
            sortQuery = { createdAt: -1 }; // Newest first
            break;
          case 'price-low':
            sortQuery = { price: 1 }; // Lowest price first
            break;
          case 'price-high':
            sortQuery = { price: -1 }; // Highest price first
            break;
          case 'name':
            sortQuery = { name: 1 }; // A-Z
            break;
          case 'name-desc':
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
        throw new Error('Product not found');
      }

      return product;
    }),

  // Get featured products
  getFeatured: procedure
    .query(async () => {
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
        throw new Error('Product not found');
      }

      return product;
    }),
});
