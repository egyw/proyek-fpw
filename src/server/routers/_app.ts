import { router } from '../trpc';

export const appRouter = router({
  // Daftarkan routers disini
  // user: userRouter,
  // post: postRouter,
});

export type AppRouter = typeof appRouter;