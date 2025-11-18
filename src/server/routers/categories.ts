import { router, protectedProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

export const categoriesRouter = router({
  // Get all categories (public - for product filters, homepage)
  getAll: publicProcedure
    .input(
      z
        .object({
          includeInactive: z.boolean().optional().default(false),
          includeProductCount: z.boolean().optional().default(true),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        await connectDB();

        const query: Record<string, unknown> = {};
        
        // Filter by isActive
        if (!input?.includeInactive) {
          query.isActive = true;
        }

        const categories = await Category.find(query)
          .sort({ order: 1, name: 1 })
          .lean();

        // Update product count if requested
        if (input?.includeProductCount) {
          const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
              const productCount = await Product.countDocuments({
                category: category.name,
                isActive: true,
              });

              return {
                ...category,
                productCount,
              };
            })
          );

          return categoriesWithCount;
        }

        return categories;
      } catch (error) {
        console.error('[getAll Categories] Error:', error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch categories',
          cause: error,
        });
      }
    }),

  // Get single category by slug (public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        await connectDB();

        const category = await Category.findOne({ slug: input.slug }).lean();

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        // Get product count
        const productCount = await Product.countDocuments({
          category: category.name,
          isActive: true,
        });

        return {
          ...category,
          productCount,
        };
      } catch (error) {
        console.error('[getBySlug Category] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch category',
          cause: error,
        });
      }
    }),

  // Admin: Get all categories for management
  getAdminAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Check if user is admin or staff
      if (!['admin', 'staff'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin and staff can view all categories',
        });
      }

      await connectDB();

      const categories = await Category.find().sort({ order: 1, name: 1 }).lean();

      // Get product count for each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({
            category: category.name,
          });

          return {
            ...category,
            productCount,
          };
        })
      );

      // Calculate stats
      const totalCategories = categoriesWithCount.length;
      const activeCategories = categoriesWithCount.filter((c) => c.isActive).length;
      const inactiveCategories = categoriesWithCount.filter((c) => !c.isActive).length;

      return {
        categories: categoriesWithCount,
        stats: {
          total: totalCategories,
          active: activeCategories,
          inactive: inactiveCategories,
        },
      };
    } catch (error) {
      console.error('[getAdminAll Categories] Error:', error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch categories',
        cause: error,
      });
    }
  }),

  // Admin: Create category
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Nama kategori minimal 2 karakter'),
        slug: z.string().min(2, 'Slug minimal 2 karakter'),
        description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
        icon: z.string().optional(),
        image: z.string().optional(),
        availableUnits: z.array(
          z.object({
            value: z.string(),
            label: z.string(),
            conversionRate: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin can create categories',
          });
        }

        await connectDB();

        // Check if category with same name or slug already exists
        const existingCategory = await Category.findOne({
          $or: [{ name: input.name }, { slug: input.slug }],
        });

        if (existingCategory) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Kategori dengan nama atau slug ini sudah ada',
          });
        }

        // Auto-generate order from last category + 1
        const lastCategory = await Category.findOne().sort({ order: -1 }).limit(1);
        const newOrder = lastCategory ? lastCategory.order + 1 : 1;

        // Create new category
        const category = await Category.create({
          name: input.name,
          slug: input.slug.toLowerCase(),
          description: input.description,
          icon: input.icon || 'folder-tree',
          image: input.image || '',
          availableUnits: input.availableUnits,
          order: newOrder,
          isActive: true,
          productCount: 0,
        });

        return {
          success: true,
          category,
          message: 'Kategori berhasil ditambahkan',
        };
      } catch (error) {
        console.error('[create Category] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create category',
          cause: error,
        });
      }
    }),

  // Admin: Update category
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2, 'Nama kategori minimal 2 karakter').optional(),
        slug: z.string().min(2, 'Slug minimal 2 karakter').optional(),
        description: z.string().min(10, 'Deskripsi minimal 10 karakter').optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        order: z.number().min(0).optional(),
        availableUnits: z.array(
          z.object({
            value: z.string(),
            label: z.string(),
            conversionRate: z.number(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin can update categories',
          });
        }

        await connectDB();

        const category = await Category.findById(input.id);

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        // Check if name or slug already used by another category
        if (input.name || input.slug) {
          const existingCategory = await Category.findOne({
            _id: { $ne: input.id },
            $or: [
              ...(input.name ? [{ name: input.name }] : []),
              ...(input.slug ? [{ slug: input.slug }] : []),
            ],
          });

          if (existingCategory) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Kategori dengan nama atau slug ini sudah ada',
            });
          }
        }

        // Handle order swap if order is changed
        if (input.order !== undefined && input.order !== category.order) {
          // Find category with target order
          const targetCategory = await Category.findOne({ order: input.order });
          
          if (targetCategory) {
            // Swap orders
            targetCategory.order = category.order;
            await targetCategory.save();
          }
        }

        // Get old category name for updating products
        const oldCategoryName = category.name;

        // Update category fields
        if (input.name) category.name = input.name;
        if (input.slug) category.slug = input.slug.toLowerCase();
        if (input.description) category.description = input.description;
        if (input.icon !== undefined) category.icon = input.icon;
        if (input.image !== undefined) category.image = input.image;
        if (input.order !== undefined) category.order = input.order;
        if (input.availableUnits) category.availableUnits = input.availableUnits;

        await category.save();

        // If category name changed, update all products with this category
        if (input.name && input.name !== oldCategoryName) {
          await Product.updateMany(
            { category: oldCategoryName },
            { category: input.name }
          );
        }

        return {
          success: true,
          category,
          message: 'Kategori berhasil diperbarui',
        };
      } catch (error) {
        console.error('[update Category] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update category',
          cause: error,
        });
      }
    }),

  // Admin: Toggle category status (soft delete)
  toggleStatus: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin or staff
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin and staff can toggle category status',
          });
        }

        await connectDB();

        const category = await Category.findById(input.id);

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        category.isActive = !category.isActive;
        await category.save();

        return {
          success: true,
          category,
          message: `Kategori berhasil ${category.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
        };
      } catch (error) {
        console.error('[toggleStatus Category] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle category status',
          cause: error,
        });
      }
    }),

  // Admin: Delete category (only if no products)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin can delete categories',
          });
        }

        await connectDB();

        const category = await Category.findById(input.id);

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        // Check if category has products
        const productCount = await Product.countDocuments({
          category: category.name,
        });

        if (productCount > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Tidak dapat menghapus kategori yang masih memiliki ${productCount} produk. Hapus atau pindahkan produk terlebih dahulu.`,
          });
        }

        // Hard delete category
        await Category.findByIdAndDelete(input.id);

        return {
          success: true,
          message: 'Kategori berhasil dihapus',
        };
      } catch (error) {
        console.error('[delete Category] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete category',
          cause: error,
        });
      }
    }),
});
