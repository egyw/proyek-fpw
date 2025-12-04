import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import Cart, { type ICartItem } from '@/models/Cart';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

const cartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.number().min(0),
  quantity: z.number().min(0.001), // Allow decimals for unit conversion (e.g., 0.5 sak from 25kg)
  unit: z.string(),
  image: z.string(),
  stock: z.number(),
  category: z.string(),
});

export const cartRouter = router({
  // Get user's cart (protected - requires login)
  getCart: protectedProcedure.query(async ({ ctx }) => {
    try {
      await connectDB();

      // Convert string userId to ObjectId for MongoDB query
      const cart = await Cart.findOne({ 
        userId: new mongoose.Types.ObjectId(ctx.user.id) 
      }).lean() as { items: ICartItem[] } | null;

      if (!cart) {
        return { items: [] };
      }

      return {
        items: cart.items.map((item: ICartItem) => ({
          productId: item.productId.toString(),
          name: item.name,
          slug: item.slug,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          image: item.image,
          stock: item.stock,
          category: item.category,
        })),
      };
    } catch (error) {
      console.error('[getCart] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get cart',
        cause: error,
      });
    }
  }),

  // Add item to cart (protected)
  addItem: protectedProcedure
    .input(cartItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        let cart = await Cart.findOne({ 
          userId: new mongoose.Types.ObjectId(ctx.user.id) 
        });

        if (!cart) {
          // Create new cart
          cart = new Cart({
            userId: new mongoose.Types.ObjectId(ctx.user.id),
            items: [input],
          });
        } else {
          // Check if item with same productId AND unit already exists
          const existingItemIndex = cart.items.findIndex(
            (item: ICartItem) => 
              item.productId.toString() === input.productId &&
              item.unit === input.unit // Same product + same unit = merge
          );

          if (existingItemIndex > -1) {
            const newQuantity = cart.items[existingItemIndex].quantity + input.quantity;
            
            if (newQuantity > input.stock) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Stok tidak cukup',
              });
            }
            
            cart.items[existingItemIndex].quantity = newQuantity;
          } else {
            // New item (different product or different unit), add to cart
            cart.items.push({
              productId: new mongoose.Types.ObjectId(input.productId),
              name: input.name,
              slug: input.slug,
              price: input.price,
              quantity: input.quantity,
              unit: input.unit,
              image: input.image,
              stock: input.stock,
              category: input.category,
            } as ICartItem);
          }
        }

        await cart.save();

        return {
          success: true,
          items: cart.items.map((item: ICartItem) => ({
            productId: item.productId.toString(),
            name: item.name,
            slug: item.slug,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
            image: item.image,
            stock: item.stock,
            category: item.category,
          })),
        };
      } catch (error) {
        console.error('[addItem] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stok tidak cukup',
          cause: error,
        });
      }
    }),

  // Update item quantity (protected)
  updateQuantity: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        unit: z.string(), // Add unit to identify specific item
        quantity: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const cart = await Cart.findOne({ 
          userId: new mongoose.Types.ObjectId(ctx.user.id) 
        });

        if (!cart) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cart not found',
          });
        }

        if (input.quantity === 0) {
          // Remove item if quantity is 0
          cart.items = cart.items.filter(
            (item: ICartItem) => 
              !(item.productId.toString() === input.productId && item.unit === input.unit)
          );
        } else {
          // Update quantity - match both productId AND unit
          const item = cart.items.find(
            (item: ICartItem) => 
              item.productId.toString() === input.productId && item.unit === input.unit
          );

          if (item) {
            item.quantity = input.quantity;
          }
        }

        await cart.save();

        return {
          success: true,
          items: cart.items.map((item: ICartItem) => ({
            productId: item.productId.toString(),
            name: item.name,
            slug: item.slug,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
            image: item.image,
            stock: item.stock,
            category: item.category,
          })),
        };
      } catch (error) {
        console.error('[updateQuantity] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update quantity',
          cause: error,
        });
      }
    }),

  // Remove item from cart (protected)
  removeItem: protectedProcedure
    .input(z.object({ 
      productId: z.string(),
      unit: z.string(), // Add unit to identify specific item
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const cart = await Cart.findOne({ 
          userId: new mongoose.Types.ObjectId(ctx.user.id) 
        });

        if (!cart) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cart not found',
          });
        }

        // Remove item matching both productId AND unit
        cart.items = cart.items.filter(
          (item: ICartItem) => 
            !(item.productId.toString() === input.productId && item.unit === input.unit)
        );

        await cart.save();

        return {
          success: true,
          items: cart.items.map((item: ICartItem) => ({
            productId: item.productId.toString(),
            name: item.name,
            slug: item.slug,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
            image: item.image,
            stock: item.stock,
            category: item.category,
          })),
        };
      } catch (error) {
        console.error('[removeItem] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove item',
          cause: error,
        });
      }
    }),

  // Clear cart (protected)
  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await connectDB();

      await Cart.findOneAndUpdate({ 
        userId: new mongoose.Types.ObjectId(ctx.user.id) 
      }, { items: [] });

      return { success: true, items: [] };
    } catch (error) {
      console.error('[clearCart] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to clear cart',
        cause: error,
      });
    }
  }),

  // Merge guest cart to user cart (on login)
  mergeCart: protectedProcedure
    .input(
      z.object({
        guestItems: z.array(cartItemSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        let cart = await Cart.findOne({ 
          userId: new mongoose.Types.ObjectId(ctx.user.id) 
        });

        if (!cart) {
          // Create new cart with guest items
          cart = new Cart({
            userId: new mongoose.Types.ObjectId(ctx.user.id),
            items: input.guestItems,
          });
        } else {
          // Merge guest items with existing cart
          input.guestItems.forEach((guestItem) => {
            // Check if item with same productId AND unit exists
            const existingItemIndex = cart!.items.findIndex(
              (item: ICartItem) => 
                item.productId.toString() === guestItem.productId &&
                item.unit === guestItem.unit // Same product + same unit = merge
            );

            if (existingItemIndex > -1) {
              const newQuantity = cart!.items[existingItemIndex].quantity + guestItem.quantity;
              
              if (newQuantity > guestItem.stock) {
                throw new TRPCError({
                  code: 'BAD_REQUEST',
                  message: 'Stok tidak cukup',
                });
              }
              
              cart!.items[existingItemIndex].quantity = newQuantity;
            } else {
              // New item (different product or different unit), add to cart
              cart!.items.push({
                productId: new mongoose.Types.ObjectId(guestItem.productId),
                name: guestItem.name,
                slug: guestItem.slug,
                price: guestItem.price,
                quantity: guestItem.quantity,
                unit: guestItem.unit,
                image: guestItem.image,
                stock: guestItem.stock,
                category: guestItem.category,
              } as ICartItem);
            }
          });
        }

        await cart.save();

        return {
          success: true,
          items: cart.items.map((item: ICartItem) => ({
            productId: item.productId.toString(),
            name: item.name,
            slug: item.slug,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
            image: item.image,
            stock: item.stock,
            category: item.category,
          })),
        };
      } catch (error) {
        console.error('[mergeCart] Error:', error);
        
        // If error is TRPCError (like stock validation), re-throw it
        if (error instanceof TRPCError) {
          throw error;
        }
        
        // For other errors, throw generic message
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal menggabungkan keranjang',
          cause: error,
        });
      }
    }),
});
