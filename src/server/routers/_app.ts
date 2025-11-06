import { router } from '../trpc';
import { productsRouter } from './products';
import { authRouter } from './auth';
import { cartRouter } from './cart';
import { userRouter } from './user';
import { ordersRouter } from './orders';

export const appRouter = router({
  products: productsRouter,
  auth: authRouter,
  cart: cartRouter,
  user: userRouter,
  orders: ordersRouter,
});

export type AppRouter = typeof appRouter;