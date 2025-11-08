import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import connectDB from '@/lib/mongodb';
import StoreConfig, { IStoreConfig } from '@/models/StoreConfig';

export const storeRouter = router({
  // Get active store configuration
  getConfig: publicProcedure.query(async () => {
    try {
      await connectDB();

      // Debug: Log query attempt
      console.log('[getConfig] Searching for active store config...');
      
      // Find active store config (should only be one)
      const storeConfig = await StoreConfig.findOne({ isActive: true }).lean() as unknown as IStoreConfig;

      // Debug: Log result
      console.log('[getConfig] Found store config:', storeConfig ? 'YES' : 'NO');
      
      if (!storeConfig) {
        // Debug: Check if ANY store config exists
        const anyConfig = await StoreConfig.findOne({}).lean();
        console.log('[getConfig] Any config exists?', anyConfig ? 'YES' : 'NO');
        if (anyConfig) {
          console.log('[getConfig] Sample config:', JSON.stringify(anyConfig, null, 2));
        }
        
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store configuration not found',
        });
      }

      return {
        storeName: storeConfig.storeName,
        storeCity: storeConfig.storeCity,
        storeCityId: storeConfig.storeCityId,
        storeProvince: storeConfig.storeProvince,
        storeAddress: storeConfig.storeAddress,
        contact: storeConfig.contact,
        businessHours: storeConfig.businessHours,
        shippingSettings: storeConfig.shippingSettings,
      };
    } catch (error) {
      console.error('[getConfig] Error:', error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch store configuration',
        cause: error,
      });
    }
  }),
});
