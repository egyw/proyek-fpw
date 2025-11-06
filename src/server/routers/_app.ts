import { router } from '../trpc';
import { productsRouter } from './products';
import { authRouter } from './auth';
import { cartRouter } from './cart';
import { userRouter } from './user';

export const appRouter = router({
  products: productsRouter,
  auth: authRouter,
  cart: cartRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;