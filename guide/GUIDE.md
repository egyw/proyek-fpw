# Panduan Singkat

## 📁 Struktur

```
src/
├── pages/
│   ├── _app.tsx          → Setup tRPC (jangan diubah)
│   ├── index.tsx         → Homepage
│   └── api/trpc/[trpc].ts → API handler (jangan diubah)
├── server/
│   ├── trpc.ts           → Init tRPC (jangan diubah)
│   └── routers/_app.ts   → ⭐ TAMBAH API DISINI
└── utils/trpc.ts         → Client (jangan diubah)
```

## ✅ Yang Perlu Anda Edit

### 1. Nambah API Endpoint
**File:** `src/server/routers/_app.ts`

```typescript
export const appRouter = router({
  // Query (GET)
  getUser: procedure
    .input(z.object({ id: z.number() }))
    .query(async (opts) => {
      return { id: opts.input.id, name: "John" };
    }),

  // Mutation (POST/PUT/DELETE)
  createUser: procedure
    .input(z.object({ name: z.string() }))
    .mutation(async (opts) => {
      return { success: true };
    }),
});
```

### 2. Nambah Halaman
**File:** `src/pages/about.tsx`

```typescript
export default function About() {
  return <div>About Page</div>;
}
```

URL: `/about`

### 3. Panggil API
```typescript
import { trpc } from '../utils/trpc';

export default function Page() {
  // Query
  const user = trpc.getUser.useQuery({ id: 1 });
  
  // Mutation
  const create = trpc.createUser.useMutation();
  
  return (
    <div>
      {user.data?.name}
      <button onClick={() => create.mutate({ name: "John" })}>
        Create
      </button>
    </div>
  );
}
```

## 🎯 Workflow

1. Buat API di `server/routers/_app.ts`
2. Buat page di `pages/`
3. Panggil API pakai `trpc.namaAPI.useQuery()`

## 📚 Docs

- [tRPC](https://trpc.io)
- [Next.js](https://nextjs.org/docs)
