import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import Notification from '@/models/Notification';
import connectDB from '@/lib/mongodb';

export const notificationsRouter = router({
  // Get user notifications (for customers - order and return notifications)
  getUserNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        await connectDB();

        const query: { userId: string; isRead?: boolean } = { userId: ctx.user.id };
        if (input.unreadOnly) {
          query.isRead = false;
        }

        const notifications = await Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(input.offset)
          .limit(input.limit)
          .lean();

        const total = await Notification.countDocuments(query);

        return {
          notifications,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        console.error('[getUserNotifications] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications',
          cause: error,
        });
      }
    }),

  // Get admin notifications with pagination and filters
  getAdminNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Only admin/staff can access notifications
        if (!['admin', 'staff'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admin and staff can access notifications',
          });
        }

        await connectDB();

        const query: { userId: string; isRead?: boolean } = { userId: ctx.user.id };
        if (input.unreadOnly) {
          query.isRead = false;
        }

        const notifications = await Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(input.offset)
          .limit(input.limit)
          .lean();

        const total = await Notification.countDocuments(query);

        return {
          notifications,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        console.error('[getAdminNotifications] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications',
          cause: error,
        });
      }
    }),

  // Get unread count for badge (works for all users)
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    try {
      await connectDB();

      const count = await Notification.countDocuments({
        userId: ctx.user.id,
        isRead: false,
      });

      return { count };
    } catch (error) {
      console.error('[getUnreadCount] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get unread count',
        cause: error,
      });
    }
  }),

  // Mark single notification as read
  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const notification = await Notification.findOneAndUpdate(
          {
            _id: input.notificationId,
            userId: ctx.user.id,
          },
          { isRead: true },
          { new: true }
        );

        if (!notification) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Notification not found',
          });
        }

        return { success: true };
      } catch (error) {
        console.error('[markAsRead] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notification as read',
          cause: error,
        });
      }
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await connectDB();

      await Notification.updateMany(
        {
          userId: ctx.user.id,
          isRead: false,
        },
        { isRead: true }
      );

      return { success: true };
    } catch (error) {
      console.error('[markAllAsRead] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to mark all notifications as read',
        cause: error,
      });
    }
  }),

  // Delete single notification
  deleteNotification: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const result = await Notification.deleteOne({
          _id: input.notificationId,
          userId: ctx.user.id,
        });

        if (result.deletedCount === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Notification not found',
          });
        }

        return { success: true };
      } catch (error) {
        console.error('[deleteNotification] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete notification',
          cause: error,
        });
      }
    }),

  // Create notification (internal use by other routers)
  createNotification: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum(['new_paid_order', 'new_return_request', 'low_stock_alert']),
        title: z.string().min(1),
        message: z.string().min(1),
        clickAction: z.string().min(1),
        icon: z.enum(['shopping-cart', 'rotate-ccw', 'alert-triangle']),
        color: z.enum(['blue', 'orange', 'yellow']),
        data: z
          .object({
            orderId: z.string().optional(),
            returnId: z.string().optional(),
            productId: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await connectDB();

        const notification = await Notification.create({
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          clickAction: input.clickAction,
          icon: input.icon,
          color: input.color,
          isRead: false,
          data: input.data || {},
        });

        return { success: true, notificationId: notification._id.toString() };
      } catch (error) {
        console.error('[createNotification] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create notification',
          cause: error,
        });
      }
    }),
});
