import { router } from '../trpc';
import { productsRouter } from './products';
import { authRouter } from './auth';

export const appRouter = router({
  products: productsRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;