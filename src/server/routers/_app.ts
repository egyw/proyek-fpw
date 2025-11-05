import { router } from '../trpc';
import { productsRouter } from './products';
import { authRouter } from './auth';
import { cartRouter } from './cart';

export const appRouter = router({
  products: productsRouter,
  auth: authRouter,
  cart: cartRouter,
});

export type AppRouter = typeof appRouter;