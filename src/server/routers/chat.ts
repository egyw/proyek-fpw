import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getTawktoConversations, getTawktoConversation, sendTawktoMessage, transformTawktoConversation } from '@/lib/tawkto';

export const chatRouter = router({
  // Get all conversations
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin or staff
    if (!['admin', 'staff'].includes(ctx.user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admin and staff can access chat conversations',
      });
    }

    try {
      // Fetch from Tawk.to API
      const apiData = await getTawktoConversations();
      
      // Transform API response to our format
      const conversations = Array.isArray(apiData) 
        ? apiData.map(transformTawktoConversation)
        : apiData?.conversations?.map(transformTawktoConversation) || [];

      return {
        success: true,
        conversations,
      };
    } catch (error) {
      console.error('[getConversations] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch conversations from Tawk.to API',
        cause: error,
      });
    }
  }),

  // Get single conversation with messages
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin or staff
      if (!['admin', 'staff'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin and staff can access chat conversations',
        });
      }

      try {
        // Fetch from Tawk.to API
        const apiData = await getTawktoConversation(input.conversationId);
        const conversation = transformTawktoConversation(apiData);

        return {
          success: true,
          conversation,
        };
      } catch (error) {
        console.error('[getConversation] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch conversation from Tawk.to API',
          cause: error,
        });
      }
    }),

  // Send message
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        message: z.string().min(1, 'Message cannot be empty'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin or staff
      if (!['admin', 'staff'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin and staff can send messages',
        });
      }

      try {
        // Send message via Tawk.to API
        const agentName = ctx.user.name || 'Admin';
        await sendTawktoMessage(input.conversationId, input.message, agentName);

        const newMessage = {
          id: `m${Date.now()}`,
          text: input.message,
          sender: 'agent' as const,
          timestamp: new Date().toISOString(),
          agentName,
        };

        return {
          success: true,
          message: newMessage,
        };
      } catch (error) {
        console.error('[sendMessage] Error sending to Tawk.to API:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message',
          cause: error,
        });
      }
    }),

  // Get chat statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin or staff
    if (!['admin', 'staff'].includes(ctx.user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admin and staff can access chat stats',
      });
    }

    try {
      // Fetch conversations to calculate stats
      const apiData = await getTawktoConversations();
      const conversations = Array.isArray(apiData) 
        ? apiData.map(transformTawktoConversation)
        : apiData?.conversations?.map(transformTawktoConversation) || [];

      const activeChats = conversations.filter((c) => c.status === 'active').length;
      const totalChats = conversations.length;

      return {
        success: true,
        stats: {
          activeChats,
          totalChats,
          avgResponseTime: '2 menit',
        },
      };
    } catch (error) {
      console.error('[getStats] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch chat stats',
        cause: error,
      });
    }
  }),
});
