import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  getProvinces,
  getCitiesByProvince,
  searchCity,
  calculateShippingCost,
  calculateMultipleCouriers,
  isInternationalDestination,
  getAvailableCouriers,
  COURIER_CONFIG,
} from '@/lib/rajaongkir';

export const shippingRouter = router({
  // Get all provinces
  getProvinces: publicProcedure.query(async () => {
    try {
      const provinces = await getProvinces();
      return { provinces };
    } catch (error) {
      console.error('[getProvinces] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch provinces',
        cause: error,
      });
    }
  }),

  // Get cities by province
  getCitiesByProvince: publicProcedure
    .input(z.object({ provinceId: z.string() }))
    .query(async ({ input }) => {
      try {
        const cities = await getCitiesByProvince(input.provinceId);
        return { cities };
      } catch (error) {
        console.error('[getCitiesByProvince] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch cities',
          cause: error,
        });
      }
    }),

  // Search city by name (untuk auto-complete atau match dengan input user)
  searchCity: publicProcedure
    .input(z.object({ cityName: z.string().min(3) }))
    .query(async ({ input }) => {
      try {
        const cities = await searchCity(input.cityName);
        return { cities };
      } catch (error) {
        console.error('[searchCity] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search city',
          cause: error,
        });
      }
    }),

  // Calculate shipping cost
  calculateShippingCost: publicProcedure
    .input(
      z.object({
        origin: z.string(), // Store city ID (e.g., "501" for Yogyakarta)
        destination: z.string(), // Customer city ID
        weight: z.number().positive(), // Weight in grams
        courier: z.string(), // Courier code (jne, pos, tiki, sicepat, etc)
      })
    )
    .query(async ({ input }) => {
      try {
        const results = await calculateShippingCost({
          origin: input.origin,
          destination: input.destination,
          weight: input.weight,
          courier: input.courier,
        });

        return { results };
      } catch (error) {
        console.error('[calculateShippingCost] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to calculate shipping cost',
          cause: error,
        });
      }
    }),

  // Check if destination is international
  checkInternational: publicProcedure
    .input(z.object({ cityName: z.string() }))
    .query(async ({ input }) => {
      try {
        const isInternational = await isInternationalDestination(input.cityName);
        return { isInternational };
      } catch (error) {
        console.error('[checkInternational] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check international destination',
          cause: error,
        });
      }
    }),

  // Get available couriers based on destination
  getAvailableCouriers: publicProcedure
    .input(
      z.object({
        isInternational: z.boolean(),
        plan: z.enum(['free', 'all']).default('free'),
      })
    )
    .query(({ input }) => {
      try {
        const couriers = getAvailableCouriers(input.isInternational, input.plan);
        
        // Map courier codes to display names
        const courierOptions = couriers.map(code => ({
          code,
          name: COURIER_CONFIG.names[code] || code.toUpperCase(),
        }));

        return { 
          couriers: courierOptions,
          isInternational: input.isInternational,
        };
      } catch (error) {
        console.error('[getAvailableCouriers] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get available couriers',
          cause: error,
        });
      }
    }),

  // Get all shipping options (multiple couriers)
  getAllShippingOptions: publicProcedure
    .input(
      z.object({
        origin: z.string(),
        destination: z.string(),
        weight: z.number().positive(),
        isInternational: z.boolean().default(false),
        plan: z.enum(['free', 'all']).default('free'),
      })
    )
    .query(async ({ input }) => {
      try {
        // Get available couriers based on destination
        const availableCouriers = getAvailableCouriers(
          input.isInternational,
          input.plan
        );

        // Fetch all couriers in parallel
        const results = await calculateMultipleCouriers({
          origin: input.origin,
          destination: input.destination,
          weight: input.weight,
          couriers: availableCouriers,
        });

        // Flatten all services from all couriers
        const allOptions: Array<{
          courier: string;
          courierName: string;
          service: string;
          description: string;
          cost: number;
          etd: string;
        }> = [];

        results.forEach((courierResult) => {
          courierResult.costs.forEach((service) => {
            service.cost.forEach((costDetail) => {
              allOptions.push({
                courier: courierResult.code,
                courierName: courierResult.name,
                service: service.service,
                description: service.description,
                cost: costDetail.value,
                etd: costDetail.etd,
              });
            });
          });
        });

        // Sort by cost (cheapest first)
        allOptions.sort((a, b) => a.cost - b.cost);

        return { 
          options: allOptions,
          isInternational: input.isInternational,
          availableCouriers,
        };
      } catch (error) {
        console.error('[getAllShippingOptions] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch shipping options',
          cause: error,
        });
      }
    }),
});
