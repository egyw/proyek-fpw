import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const router = t.router;
export const procedure = t.procedure;

// Public procedures (tidak perlu authentication)
// Digunakan untuk: register, get products, dll
export const publicProcedure = t.procedure;

// NOTE: Authentication now handled by NextAuth (see src/pages/api/auth/[...nextauth].ts)
// For protected tRPC endpoints, add authMiddleware:
// export const protectedProcedure = t.procedure.use(authMiddleware);
// Currently all procedures are public (products, auth.register)