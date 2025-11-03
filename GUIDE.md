# 📚 Learning Guide: Next.js + TypeScript + tRPC + NextAuth

> **Target Audience**: Developer yang baru pertama kali pakai Next.js, TypeScript, tRPC, dan NextAuth. Sebelumnya pakai React dengan JSX biasa.

---

## 🎯 Overview Project

Project ini adalah **E-commerce Material Bangunan** dengan stack:
- **Next.js 15** (Pages Router) - Framework React dengan SSR & routing
- **TypeScript** - JavaScript dengan type safety
- **tRPC** - Type-safe API tanpa code generation
- **NextAuth** - Authentication library untuk Next.js
- **MongoDB + Mongoose** - Database & ODM
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn/ui** - Component library berbasis Radix UI

---

## 📖 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Learning Path Recommendation](#learning-path-recommendation)
3. [Core Concepts](#core-concepts)
4. [Step-by-Step Learning](#step-by-step-learning)
5. [Common Patterns](#common-patterns)
6. [Debugging Tips](#debugging-tips)
7. [Next Steps](#next-steps)

---

## Prerequisites

**Sebelum mulai, pastikan kamu paham:**
- ✅ React Basics (components, props, state, hooks)
- ✅ JavaScript ES6+ (arrow functions, destructuring, async/await)
- ✅ HTML & CSS
- ✅ Basic REST API concepts

**Yang baru untuk kamu:**
- 🆕 TypeScript (types & interfaces)
- 🆕 Next.js (SSR, routing, API routes)
- 🆕 tRPC (type-safe API)
- 🆕 NextAuth (authentication)

---

## Learning Path Recommendation

### 🎓 Recommended Order (4 Weeks)

```
Week 1: TypeScript Basics & Next.js Fundamentals
├── Day 1-2: TypeScript syntax & types
├── Day 3-4: Next.js Pages Router & routing
├── Day 5-6: Next.js Image & Link components
└── Day 7: Practice building simple pages

Week 2: tRPC & Backend Integration
├── Day 1-2: Understand tRPC architecture
├── Day 3-4: Create tRPC procedures (queries & mutations)
├── Day 5-6: Use tRPC hooks in components
└── Day 7: Practice with real endpoints

Week 3: NextAuth & Authentication
├── Day 1-2: NextAuth setup & configuration
├── Day 3-4: Session management & callbacks
├── Day 5-6: Protected routes & middleware
└── Day 7: Practice authentication flows

Week 4: Integration & Advanced Patterns
├── Day 1-2: Form handling (react-hook-form + Zod)
├── Day 3-4: MongoDB queries & aggregations
├── Day 5-6: Optimization & best practices
└── Day 7: Build complete feature end-to-end
```

---

## Core Concepts

### 1️⃣ **TypeScript Basics**

#### Dari JSX ke TypeScript

**Before (JSX):**
```jsx
// components/Button.jsx
export default function Button({ text, onClick }) {
  return <button onClick={onClick}>{text}</button>;
}
```

**After (TypeScript):**
```tsx
// components/Button.tsx
interface ButtonProps {
  text: string;
  onClick: () => void;
}

export default function Button({ text, onClick }: ButtonProps) {
  return <button onClick={onClick}>{text}</button>;
}
```

#### Key Concepts

**1. Types & Interfaces**
```typescript
// Type Alias (untuk primitive & union types)
type Status = "active" | "inactive" | "pending";

// Interface (untuk object shapes)
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

// Interface extends (inheritance)
interface Admin extends User {
  permissions: string[];
}
```

**2. Function Types**
```typescript
// Function declaration
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Arrow function with explicit return type
const add = (a: number, b: number): number => a + b;

// Function as parameter (callback)
function fetchData(callback: (data: string) => void) {
  callback("data");
}

// Async function
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

**3. Generic Types**
```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

// Generic interface
interface Response<T> {
  data: T;
  error?: string;
}

// Usage
const userResponse: Response<User> = {
  data: { id: "1", name: "John", email: "john@example.com", role: "user" }
};
```

**4. Utility Types**
```typescript
// Partial - make all properties optional
type PartialUser = Partial<User>;

// Pick - select specific properties
type UserPreview = Pick<User, "id" | "name">;

// Omit - exclude specific properties
type UserWithoutEmail = Omit<User, "email">;

// Record - create object type with specific keys
type UserRoles = Record<string, User>;
```

**📍 Where to Learn in This Codebase:**
- **Start**: `src/types/next-auth.d.ts` - Simple interfaces
- **Intermediate**: `src/models/Product.ts` - Complex interfaces with Mongoose
- **Advanced**: `src/server/routers/products.ts` - Generic types with tRPC

---

### 2️⃣ **Next.js Pages Router**

#### File-Based Routing

```
src/pages/
├── index.tsx              → / (homepage)
├── about.tsx              → /about
├── products/
│   ├── index.tsx          → /products (product list)
│   └── [slug].tsx         → /products/:slug (dynamic route)
├── auth/
│   ├── login.tsx          → /auth/login
│   └── register.tsx       → /auth/register
└── api/
    └── trpc/
        └── [trpc].ts      → /api/trpc/* (API routes)
```

#### Dynamic Routes

**File**: `src/pages/products/[slug].tsx`

```tsx
import { useRouter } from 'next/router';

export default function ProductDetailPage() {
  const router = useRouter();
  const { slug } = router.query; // Get slug from URL
  
  // URL: /products/semen-gresik-50kg
  // slug = "semen-gresik-50kg"
  
  return <div>Product: {slug}</div>;
}
```

#### Navigation

**1. Link Component (Client-Side)**
```tsx
import Link from 'next/link';

<Link href="/products">View Products</Link>
<Link href={`/products/${product.slug}`}>View Detail</Link>
```

**2. useRouter Hook (Programmatic)**
```tsx
import { useRouter } from 'next/router';

export default function Component() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/products'); // Navigate
    router.back(); // Go back
    router.reload(); // Reload page
  };
  
  return <button onClick={handleClick}>Go</button>;
}
```

#### Query Parameters

```tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProductsPage() {
  const router = useRouter();
  
  useEffect(() => {
    if (router.isReady) { // Wait for router to be ready
      const category = router.query.category; // URL: /products?category=Semen
      const discount = router.query.discount; // URL: /products?discount=true
      
      console.log(category, discount);
    }
  }, [router.isReady, router.query]);
}
```

#### Image Component

```tsx
import Image from 'next/image';

// Static image
<Image 
  src="/images/logo.png" 
  alt="Logo" 
  width={200} 
  height={100}
  priority // Load immediately (for above-the-fold images)
/>

// Dynamic image (fill parent)
<div className="relative h-48 w-full">
  <Image 
    src={product.images[0]} 
    alt={product.name}
    fill // Fill parent container
    className="object-cover" // Maintain aspect ratio
  />
</div>

// External image (requires next.config.ts configuration)
<Image 
  src="https://example.com/image.jpg" 
  alt="External" 
  width={300} 
  height={200}
/>
```

**📍 Where to Learn in This Codebase:**
- **Routing**: `src/pages/products/index.tsx` (list page)
- **Dynamic Routes**: `src/pages/products/[slug].tsx` (detail page)
- **Query Params**: `src/pages/products/index.tsx` (lines 41-62)
- **Images**: `src/pages/index.tsx` (hero section & product cards)

---

### 3️⃣ **tRPC - Type-Safe API**

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
├─────────────────────────────────────────────────────────────┤
│  Component (products/index.tsx)                             │
│    ↓ calls                                                  │
│  tRPC Hook: trpc.products.getAll.useQuery()                │
│    ↓ HTTP request to /api/trpc/products.getAll             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                │
├─────────────────────────────────────────────────────────────┤
│  API Handler (api/trpc/[trpc].ts)                          │
│    ↓ routes to                                              │
│  tRPC Router (server/routers/products.ts)                  │
│    ↓ executes                                               │
│  Procedure: getAll → Query MongoDB → Return data            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
├─────────────────────────────────────────────────────────────┤
│  MongoDB (via Mongoose)                                     │
│  Collection: products                                       │
└─────────────────────────────────────────────────────────────┘
```

#### Setup Files

**1. tRPC Client** (`src/utils/trpc.ts`)
```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

// Create tRPC hooks with type from AppRouter
export const trpc = createTRPCReact<AppRouter>();
```

**2. tRPC Server** (`src/server/trpc.ts`)
```typescript
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const router = t.router;
export const procedure = t.procedure; // Public procedure (no auth)
export const publicProcedure = t.procedure;
```

**3. Main Router** (`src/server/routers/_app.ts`)
```typescript
import { router } from '../trpc';
import { productsRouter } from './products';
import { authRouter } from './auth';

export const appRouter = router({
  products: productsRouter, // /api/trpc/products.*
  auth: authRouter,         // /api/trpc/auth.*
});

// Export type for client
export type AppRouter = typeof appRouter;
```

**4. API Handler** (`src/pages/api/trpc/[trpc].ts`)
```typescript
import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '@/server/routers/_app';

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}), // Context for all procedures
});
```

**5. App Wrapper** (`src/pages/_app.tsx`)
```tsx
import { trpc } from '../utils/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { httpBatchLink } from '@trpc/client';

const MyApp = ({ Component, pageProps }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: '/api/trpc' })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default trpc.withTRPC(MyApp);
```

#### Creating Procedures

**Backend**: `src/server/routers/products.ts`

```typescript
import { router, procedure } from '../trpc';
import { z } from 'zod'; // Validation library
import Product from '@/models/Product';

export const productsRouter = router({
  // QUERY (GET data) - Read operation
  getAll: procedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      // Build MongoDB query
      const query = {};
      if (input.category) {
        query.category = input.category;
      }
      
      // Fetch from database
      const products = await Product.find(query)
        .limit(input.limit)
        .lean(); // Convert to plain objects
      
      return products;
    }),

  // MUTATION (POST/PUT/DELETE data) - Write operation
  create: procedure
    .input(
      z.object({
        name: z.string().min(3),
        price: z.number().positive(),
        category: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Create new product
      const product = await Product.create(input);
      return product;
    }),
});
```

#### Using tRPC in Components

**Frontend**: `src/pages/products/index.tsx`

```tsx
import { trpc } from '@/utils/trpc';

export default function ProductsPage() {
  // QUERY (auto-fetches on mount)
  const { data, isLoading, error } = trpc.products.getAll.useQuery({
    category: "Semen",
    limit: 10,
  });

  // MUTATION (manual trigger)
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      console.log("Product created!");
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      name: "New Product",
      price: 100000,
      category: "Semen",
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map((product) => (
        <div key={product._id}>{product.name}</div>
      ))}
      <button onClick={handleCreate}>Create Product</button>
    </div>
  );
}
```

#### Key Differences from REST API

| Aspect | REST API | tRPC |
|--------|----------|------|
| **Type Safety** | ❌ Manual types | ✅ Auto-generated |
| **API Definition** | Separate (Swagger/OpenAPI) | Same file as implementation |
| **Client Code** | `fetch('/api/products')` | `trpc.products.getAll.useQuery()` |
| **Validation** | Manual | Built-in with Zod |
| **Error Handling** | Try-catch + status codes | React Query error states |

**📍 Where to Learn in This Codebase:**
- **Setup**: `src/utils/trpc.ts`, `src/server/trpc.ts`, `src/pages/_app.tsx`
- **Backend Procedures**: `src/server/routers/products.ts`
- **Frontend Usage**: `src/pages/index.tsx` (lines 21-22, 138-164)
- **Advanced**: `src/server/routers/auth.ts` (mutation example)

---

### 4️⃣ **NextAuth - Authentication**

#### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. User fills form (register.tsx)
   ↓
2. Submit → tRPC mutation (auth.register)
   ↓
3. Hash password with bcrypt
   ↓
4. Save to MongoDB (users collection)
   ↓
5. Redirect to login page


┌─────────────────────────────────────────────────────────────┐
│                     LOGIN FLOW                              │
└─────────────────────────────────────────────────────────────┘

1. User fills form (login.tsx)
   ↓
2. Submit → signIn("credentials", { email, password })
   ↓
3. NextAuth calls authorize() function
   ↓
4. Verify credentials (compare password hash)
   ↓
5. Return user object
   ↓
6. jwt() callback → Store user data in JWT token
   ↓
7. session() callback → Add user data to session
   ↓
8. HTTP-only cookie created (30 days)
   ↓
9. Redirect to homepage


┌─────────────────────────────────────────────────────────────┐
│                  SESSION MANAGEMENT                         │
└─────────────────────────────────────────────────────────────┘

Component:
  useSession() → Read session from cookie
  ↓
  { data: session, status: "authenticated" }
  ↓
  Access: session.user.id, session.user.role, etc.
```

#### NextAuth Configuration

**File**: `src/pages/api/auth/[...nextauth].ts`

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  // 1. Configure authentication providers
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // 2. Verify credentials
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('Email atau password salah');
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Email atau password salah');
        }

        // Return user object (stored in JWT)
        return {
          id: String(user._id),
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
  
  // 3. Callbacks for customization
  callbacks: {
    // Add custom fields to JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    
    // Add custom fields to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'staff' | 'user';
      }
      return session;
    },
  },
  
  // 4. Custom pages
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  
  // 5. Session configuration
  session: {
    strategy: 'jwt', // Use JWT (not database sessions)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // 6. Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
```

#### Custom Session Types

**File**: `src/types/next-auth.d.ts`

```typescript
import 'next-auth';

// Extend NextAuth types with custom fields
declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    role: 'admin' | 'staff' | 'user';
    phone: string;
    // ... other custom fields
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
      role: 'admin' | 'staff' | 'user';
      phone: string;
      // ... other custom fields
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: 'admin' | 'staff' | 'user';
    // ... other custom fields
  }
}
```

#### Using NextAuth in Components

**1. Get Current User**
```tsx
import { useSession } from 'next-auth/react';

export default function Component() {
  const { data: session, status } = useSession();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome, {user.name}! Role: {user.role}</div>;
}
```

**2. Login**
```tsx
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  
  const handleSubmit = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false, // Don't auto-redirect
    });
    
    if (result?.error) {
      console.error(result.error);
    } else {
      router.push('/'); // Redirect to homepage
    }
  };
  
  return <form onSubmit={(e) => {
    e.preventDefault();
    handleSubmit('user@example.com', 'password');
  }}>
    {/* Form fields */}
  </form>;
}
```

**3. Logout**
```tsx
import { signOut } from 'next-auth/react';

export default function Component() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' }); // Redirect to homepage
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

#### Protecting Routes

**Method 1: Custom Hook (Page-Level Protection)**

**File**: `src/hooks/useRequireAuth.ts`
```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);
  
  return { session, status };
}
```

**Usage:**
```tsx
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function CartPage() {
  useRequireAuth(); // Redirect to login if not authenticated
  
  return <div>Cart Content</div>;
}
```

**Method 2: Component Wrapper (Action-Level Protection)**

**File**: `src/components/RequireAuth.tsx`
```tsx
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface RequireAuthProps {
  children: (props: { onClick: () => void }) => ReactNode;
  onAuthenticated: () => void;
}

export function RequireAuth({ children, onAuthenticated }: RequireAuthProps) {
  const { status } = useSession();
  const router = useRouter();
  
  const handleClick = () => {
    if (status !== 'authenticated') {
      router.push('/auth/login');
      return;
    }
    onAuthenticated();
  };
  
  return <>{children({ onClick: handleClick })}</>;
}
```

**Usage:**
```tsx
import { RequireAuth } from '@/components/RequireAuth';

export default function ProductPage() {
  const handleAddToCart = () => {
    console.log("Adding to cart...");
  };
  
  return (
    <RequireAuth onAuthenticated={handleAddToCart}>
      {({ onClick }) => (
        <button onClick={onClick}>Add to Cart</button>
      )}
    </RequireAuth>
  );
}
```

**Method 3: Role-Based Protection**

```tsx
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'authenticated' && session?.user.role !== 'admin') {
      router.push('/'); // Redirect if not admin
    }
  }, [session, status, router]);
  
  if (status === 'loading') return <div>Loading...</div>;
  if (session?.user.role !== 'admin') return null;
  
  return <div>Admin Dashboard</div>;
}
```

**📍 Where to Learn in This Codebase:**
- **Configuration**: `src/pages/api/auth/[...nextauth].ts`
- **Custom Types**: `src/types/next-auth.d.ts`
- **Login**: `src/pages/auth/login.tsx`
- **Register**: `src/pages/auth/register.tsx`
- **Page Protection**: `src/hooks/useRequireAuth.ts`
- **Action Protection**: `src/components/RequireAuth.tsx`
- **Usage**: `src/pages/cart.tsx`, `src/components/layouts/Navbar.tsx`

---

## Step-by-Step Learning

### 🚀 Level 1: Read & Understand (Week 1)

**Goal**: Pahami struktur project tanpa coding

**Tasks**:

1. **Explore Pages** (30 mins)
   ```bash
   # Open dan baca file ini secara berurutan:
   src/pages/index.tsx              # Homepage (simple)
   src/pages/products/index.tsx     # Product list (intermediate)
   src/pages/products/[slug].tsx    # Product detail (advanced)
   ```
   
   **What to Notice**:
   - Import statements (from where?)
   - Component structure (function component)
   - State management (useState, useEffect)
   - Data fetching (trpc.products.xxx.useQuery)

2. **Trace Data Flow** (45 mins)
   ```bash
   # Follow this flow:
   
   1. Frontend calls tRPC hook
      → src/pages/index.tsx (line 21-22)
   
   2. tRPC client sends request
      → src/utils/trpc.ts
   
   3. API handler receives request
      → src/pages/api/trpc/[trpc].ts
   
   4. Router delegates to procedure
      → src/server/routers/_app.ts
      → src/server/routers/products.ts
   
   5. Procedure queries database
      → src/models/Product.ts (Mongoose model)
   
   6. Response flows back to frontend
      → Component re-renders with data
   ```

3. **Study Authentication Flow** (45 mins)
   ```bash
   # Read these files:
   src/pages/auth/login.tsx           # Login form
   src/pages/api/auth/[...nextauth].ts  # NextAuth config
   src/types/next-auth.d.ts           # Custom types
   src/hooks/useRequireAuth.ts        # Protection hook
   ```

4. **Analyze Component Patterns** (30 mins)
   ```bash
   # Compare these similar pages:
   src/pages/admin/products/index.tsx   # Admin products page
   src/pages/admin/orders/index.tsx     # Admin orders page
   src/pages/admin/customers/index.tsx  # Admin customers page
   
   # Notice:
   - Common layout (AdminLayout)
   - Similar structure (filters, table, dialogs)
   - Reusable components (Button, Table, Dialog from shadcn)
   ```

**✅ Checkpoint**: You should be able to:
- Explain how data flows from database to UI
- Identify where to add new API endpoints
- Understand where authentication is checked

---

### 🛠️ Level 2: Modify Existing Code (Week 2)

**Goal**: Make small changes to understand how things work

**Project 1: Add New Field to Product**

```typescript
// Task: Add "manufacturer" field to products

// Step 1: Update Mongoose model
// File: src/models/Product.ts
export interface IProduct extends Document {
  name: string;
  // ... existing fields
  manufacturer: string; // ← Add this
}

const ProductSchema = new Schema({
  // ... existing fields
  manufacturer: {
    type: String,
    required: true,
  },
});

// Step 2: Update tRPC procedure (if needed)
// File: src/server/routers/products.ts
// No changes needed (getAll returns all fields)

// Step 3: Display in frontend
// File: src/pages/products/[slug].tsx
<div>
  <p className="text-gray-600">Brand: {product.brand}</p>
  <p className="text-gray-600">Manufacturer: {product.manufacturer}</p>
</div>
```

**Project 2: Add Filter by Stock Status**

```typescript
// Task: Filter products by in-stock vs out-of-stock

// Step 1: Add filter state
// File: src/pages/products/index.tsx
const [inStock, setInStock] = useState<boolean | undefined>();

// Step 2: Update tRPC query
const { data } = trpc.products.getAll.useQuery({
  category: selectedCategory,
  inStock: inStock, // ← Add this
});

// Step 3: Update backend procedure
// File: src/server/routers/products.ts
export const productsRouter = router({
  getAll: procedure
    .input(
      z.object({
        // ... existing fields
        inStock: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const query = {};
      
      if (input.inStock !== undefined) {
        query.stock = input.inStock ? { $gt: 0 } : 0;
      }
      
      return await Product.find(query);
    }),
});

// Step 4: Add checkbox filter in UI
<label>
  <input 
    type="checkbox" 
    checked={inStock || false}
    onChange={(e) => setInStock(e.target.checked ? true : undefined)}
  />
  In Stock Only
</label>
```

**Project 3: Create New tRPC Endpoint**

```typescript
// Task: Get product count by category

// Step 1: Add procedure to router
// File: src/server/routers/products.ts
export const productsRouter = router({
  // ... existing procedures
  
  getCountByCategory: procedure
    .query(async () => {
      const counts = await Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      
      return counts.map((item) => ({
        category: item._id,
        count: item.count,
      }));
    }),
});

// Step 2: Use in component
// File: src/pages/products/index.tsx
const { data: categoryCounts } = trpc.products.getCountByCategory.useQuery();

{categoryCounts?.map((item) => (
  <div key={item.category}>
    {item.category}: {item.count} products
  </div>
))}
```

**✅ Checkpoint**: You should be able to:
- Add new fields to database models
- Create new tRPC procedures
- Modify existing queries with filters
- Display data in UI components

---

### 🎨 Level 3: Build New Features (Week 3)

**Goal**: Create complete features from scratch

**Project 1: Build "Recently Viewed Products" Feature**

```typescript
// Step 1: Create client-side storage
// File: src/utils/recentlyViewed.ts
export const addToRecentlyViewed = (productId: string) => {
  const recent = getRecentlyViewed();
  const updated = [productId, ...recent.filter((id) => id !== productId)].slice(0, 10);
  localStorage.setItem('recentlyViewed', JSON.stringify(updated));
};

export const getRecentlyViewed = (): string[] => {
  const data = localStorage.getItem('recentlyViewed');
  return data ? JSON.parse(data) : [];
};

// Step 2: Track views in product detail
// File: src/pages/products/[slug].tsx
import { addToRecentlyViewed } from '@/utils/recentlyViewed';

export default function ProductDetailPage() {
  const { slug } = useRouter().query;
  const { data: product } = trpc.products.getBySlug.useQuery({ slug });
  
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product._id);
    }
  }, [product]);
  
  // ... rest of component
}

// Step 3: Create tRPC procedure to fetch by IDs
// File: src/server/routers/products.ts
getByIds: procedure
  .input(z.object({ ids: z.array(z.string()) }))
  .query(async ({ input }) => {
    const products = await Product.find({
      _id: { $in: input.ids },
    }).lean();
    
    // Maintain order from input
    const ordered = input.ids
      .map((id) => products.find((p) => String(p._id) === id))
      .filter(Boolean);
    
    return ordered;
  }),

// Step 4: Display in homepage
// File: src/pages/index.tsx
import { getRecentlyViewed } from '@/utils/recentlyViewed';
import { useState, useEffect } from 'react';

export default function Home() {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  
  useEffect(() => {
    setRecentIds(getRecentlyViewed());
  }, []);
  
  const { data: recentProducts } = trpc.products.getByIds.useQuery(
    { ids: recentIds },
    { enabled: recentIds.length > 0 }
  );
  
  return (
    <section>
      <h2>Recently Viewed</h2>
      {recentProducts?.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </section>
  );
}
```

**Project 2: Add Product Rating System**

```typescript
// Step 1: Update Product model
// File: src/models/Product.ts
interface IProduct {
  // ... existing fields
  reviews: Array<{
    userId: string;
    rating: number; // 1-5
    comment: string;
    createdAt: Date;
  }>;
  averageRating: number;
  totalReviews: number;
}

// Step 2: Create tRPC mutation
// File: src/server/routers/products.ts
addReview: procedure
  .input(
    z.object({
      productId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().min(10),
    })
  )
  .mutation(async ({ input, ctx }) => {
    // ctx.user would come from authentication middleware
    const product = await Product.findById(input.productId);
    
    product.reviews.push({
      userId: ctx.user.id,
      rating: input.rating,
      comment: input.comment,
      createdAt: new Date(),
    });
    
    // Recalculate average
    const total = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.averageRating = total / product.reviews.length;
    product.totalReviews = product.reviews.length;
    
    await product.save();
    return product;
  }),

// Step 3: Create review form component
// File: src/components/ReviewForm.tsx
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const addReviewMutation = trpc.products.addReview.useMutation({
    onSuccess: () => {
      onSuccess();
      setComment('');
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReviewMutation.mutate({ productId, rating, comment });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review..."
        minLength={10}
      />
      <Button type="submit" disabled={addReviewMutation.isLoading}>
        {addReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}

// Step 4: Add to product detail page
// File: src/pages/products/[slug].tsx
import { ReviewForm } from '@/components/ReviewForm';

export default function ProductDetailPage() {
  // ... existing code
  
  return (
    <div>
      {/* Product info */}
      
      <section>
        <h3>Customer Reviews</h3>
        <div>
          Average: {product.averageRating.toFixed(1)} ★
          ({product.totalReviews} reviews)
        </div>
        
        {product.reviews.map((review) => (
          <div key={review._id}>
            <p>{review.rating} ★</p>
            <p>{review.comment}</p>
            <p>{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
        
        <ReviewForm 
          productId={product._id} 
          onSuccess={() => {
            // Refetch product data
            router.reload();
          }}
        />
      </section>
    </div>
  );
}
```

**✅ Checkpoint**: You should be able to:
- Design and implement complete features
- Handle client-side state (localStorage)
- Create mutations with complex logic
- Build reusable components

---

### 🚀 Level 4: Advanced Patterns (Week 4)

**Goal**: Master advanced concepts

**Project 1: Implement Wishlist with Database**

```typescript
// Step 1: Create Wishlist model
// File: src/models/Wishlist.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IWishlist extends Document {
  userId: string;
  productIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  productIds: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);

// Step 2: Create tRPC router
// File: src/server/routers/wishlist.ts
import { router, procedure } from '../trpc';
import { z } from 'zod';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';

export const wishlistRouter = router({
  get: procedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      
      const wishlist = await Wishlist.findOne({ userId: ctx.user.id });
      if (!wishlist) return { products: [] };
      
      const products = await Product.find({
        _id: { $in: wishlist.productIds },
      }).lean();
      
      return { products };
    }),
    
  add: procedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      
      await Wishlist.findOneAndUpdate(
        { userId: ctx.user.id },
        { $addToSet: { productIds: input.productId } },
        { upsert: true }
      );
      
      return { success: true };
    }),
    
  remove: procedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      
      await Wishlist.findOneAndUpdate(
        { userId: ctx.user.id },
        { $pull: { productIds: input.productId } }
      );
      
      return { success: true };
    }),
});

// Step 3: Add to main router
// File: src/server/routers/_app.ts
import { wishlistRouter } from './wishlist';

export const appRouter = router({
  products: productsRouter,
  auth: authRouter,
  wishlist: wishlistRouter, // ← Add this
});

// Step 4: Create wishlist hook
// File: src/hooks/useWishlist.ts
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

export function useWishlist() {
  const utils = trpc.useContext();
  const { data } = trpc.wishlist.get.useQuery();
  
  const addMutation = trpc.wishlist.add.useMutation({
    onSuccess: () => {
      utils.wishlist.get.invalidate(); // Refetch
      toast.success('Added to wishlist');
    },
  });
  
  const removeMutation = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.get.invalidate();
      toast.success('Removed from wishlist');
    },
  });
  
  const isInWishlist = (productId: string) => {
    return data?.products.some((p) => p._id === productId) || false;
  };
  
  return {
    wishlist: data?.products || [],
    addToWishlist: addMutation.mutate,
    removeFromWishlist: removeMutation.mutate,
    isInWishlist,
    isLoading: addMutation.isLoading || removeMutation.isLoading,
  };
}

// Step 5: Use in component
// File: src/pages/products/[slug].tsx
import { useWishlist } from '@/hooks/useWishlist';
import { Heart } from 'lucide-react';

export default function ProductDetailPage() {
  const { data: product } = trpc.products.getBySlug.useQuery({ slug });
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(product._id);
  
  return (
    <div>
      <Button
        variant="outline"
        onClick={() => {
          if (inWishlist) {
            removeFromWishlist({ productId: product._id });
          } else {
            addToWishlist({ productId: product._id });
          }
        }}
      >
        <Heart className={inWishlist ? 'fill-red-500 text-red-500' : ''} />
        {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </Button>
    </div>
  );
}
```

**Project 2: Implement Search with Debounce**

```typescript
// Step 1: Create debounce hook
// File: src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// Step 2: Use in search component
// File: src/pages/products/index.tsx
import { useDebounce } from '@/hooks/useDebounce';
import { useState } from 'react';

export default function ProductsPage() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500); // Wait 500ms
  
  const { data } = trpc.products.getAll.useQuery({
    search: debouncedSearch, // Only queries after 500ms of no typing
  });
  
  return (
    <input
      type="text"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      placeholder="Search products..."
    />
  );
}
```

**✅ Checkpoint**: You should be able to:
- Design database schemas for complex features
- Implement authentication-protected endpoints
- Create custom React hooks
- Handle optimistic updates and cache invalidation
- Use advanced patterns (debounce, optimistic UI)

---

## Common Patterns

### 1. Form Handling with react-hook-form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Step 1: Define validation schema
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  age: z.number().min(18, 'Must be 18+'),
});

// Step 2: Infer TypeScript type from schema
type FormValues = z.infer<typeof schema>;

export default function MyForm() {
  // Step 3: Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      age: 18,
    },
  });
  
  // Step 4: Handle submit
  const onSubmit = (data: FormValues) => {
    console.log(data); // Type-safe data
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input {...field} type="email" />
              </FormControl>
              <FormMessage /> {/* Shows validation error */}
            </FormItem>
          )}
        />
        
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}
```

### 2. Conditional Rendering

```tsx
// Pattern 1: If/Else
{isLoading ? (
  <div>Loading...</div>
) : (
  <div>Content</div>
)}

// Pattern 2: Early Return
if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
return <div>Content</div>;

// Pattern 3: Logical AND
{isAuthenticated && <div>Welcome!</div>}

// Pattern 4: Optional Chaining
{user?.name || 'Guest'}
{products?.length > 0 && <ProductList />}
```

### 3. Loading States

```tsx
export default function Component() {
  const { data, isLoading, error } = trpc.products.getAll.useQuery();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded mt-2"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }
  
  return (
    <div>
      {data?.products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

### 4. Infinite Scroll / Pagination

```typescript
// Backend: Add pagination to tRPC procedure
getAll: procedure
  .input(
    z.object({
      limit: z.number().default(20),
      cursor: z.string().optional(), // Last product ID
    })
  )
  .query(async ({ input }) => {
    const query = {};
    if (input.cursor) {
      query._id = { $lt: input.cursor }; // Get products older than cursor
    }
    
    const products = await Product.find(query)
      .limit(input.limit + 1) // Fetch 1 extra to check if more exist
      .sort({ _id: -1 });
    
    let nextCursor: string | undefined;
    if (products.length > input.limit) {
      const nextItem = products.pop();
      nextCursor = String(nextItem!._id);
    }
    
    return {
      products,
      nextCursor,
    };
  }),

// Frontend: Use infinite query
import { trpc } from '@/utils/trpc';

export default function ProductsPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.products.getAll.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  
  const allProducts = data?.pages.flatMap((page) => page.products) || [];
  
  return (
    <div>
      {allProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

---

## Debugging Tips

### TypeScript Errors

**Problem**: `Property 'xxx' does not exist on type`
```typescript
// ❌ Wrong
const user = session.user;
console.log(user.customField); // Error!

// ✅ Fix: Extend types
// File: src/types/next-auth.d.ts
declare module 'next-auth' {
  interface User {
    customField: string;
  }
}
```

**Problem**: `Type 'xxx' is not assignable to type 'yyy'`
```typescript
// ❌ Wrong
const id: number = "123"; // Error!

// ✅ Fix: Convert types
const id: number = Number("123");
const id: string = String(123);
const id: string = user._id.toString();
```

### tRPC Errors

**Problem**: `TRPCClientError: No such procedure`
```typescript
// Check:
1. Is procedure exported in router? (server/routers/products.ts)
2. Is router added to appRouter? (server/routers/_app.ts)
3. Is dev server restarted? (npm run dev)

// File: src/server/routers/_app.ts
export const appRouter = router({
  products: productsRouter, // ← Must be here
});
```

**Problem**: `Input validation failed`
```typescript
// Check Zod schema matches your input
// Backend
.input(z.object({ id: z.string() }))

// Frontend
trpc.products.getById.useQuery({ id: "123" }); // ✅ String
trpc.products.getById.useQuery({ id: 123 });   // ❌ Number
```

### NextAuth Errors

**Problem**: `NEXTAUTH_SECRET environment variable not set`
```bash
# Fix: Add to .env.local
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**Problem**: `Redirect loop after login`
```typescript
// Check:
1. Is NEXTAUTH_URL correct?
2. Is session callback returning user data?
3. Are you redirecting to protected route before session loads?

// Fix: Wait for session
const { status } = useSession();
if (status === 'loading') return <div>Loading...</div>;
```

### MongoDB Errors

**Problem**: `MongooseError: Model not registered`
```typescript
// ❌ Wrong
const Product = mongoose.model('Product');

// ✅ Fix: Use || operator for hot reload
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
```

**Problem**: `Connection timeout`
```bash
# Check:
1. Is MongoDB running? (local: mongod, Atlas: check dashboard)
2. Is MONGODB_URI correct in .env.local?
3. Is IP whitelisted? (Atlas: Network Access)
```

---

## Next Steps

### After Completing This Guide

**1. Build a Complete Feature (Recommended)**
- Choose: Shopping Cart with Zustand state management
- Includes: Add/remove items, quantity updates, checkout flow
- Skills: State management, tRPC mutations, optimistic updates
- Time: 2-3 days

**2. Explore Advanced Topics**
- Server-Side Rendering (getServerSideProps)
- Middleware for route protection
- WebSocket with tRPC subscriptions
- File uploads with presigned URLs
- Email notifications with nodemailer

**3. Optimize Performance**
- React.memo for expensive components
- useMemo/useCallback for expensive calculations
- Code splitting with next/dynamic
- Image optimization strategies
- Database indexing

**4. Testing**
- Jest + React Testing Library (unit tests)
- Playwright (E2E tests)
- tRPC testing utilities

### Resources

**Official Docs (Must Read)**:
- Next.js: https://nextjs.org/docs
- tRPC: https://trpc.io/docs
- NextAuth: https://next-auth.js.org/
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/

**Video Tutorials**:
- Next.js Crash Course (Traversy Media - YouTube)
- tRPC + Next.js Tutorial (Theo - YouTube)
- TypeScript for React Developers (Jack Herrington - YouTube)

**Practice Projects**:
1. Blog with markdown files (Next.js + MDX)
2. Task manager (tRPC + authentication)
3. Real-time chat (tRPC subscriptions)

---

## 🎯 Your Learning Checklist

Copy this to track your progress:

```
Week 1: Foundations
[ ] Read entire GUIDE.md
[ ] Understand project structure
[ ] Trace data flow (frontend → backend → database)
[ ] Identify patterns in existing code

Week 2: Modifications
[ ] Add new field to Product model
[ ] Create new tRPC procedure
[ ] Add filter/sort to product list
[ ] Modify existing component

Week 3: New Features
[ ] Build Recently Viewed Products
[ ] Implement Product Ratings
[ ] Create Wishlist (localStorage)
[ ] Add search with debounce

Week 4: Advanced
[ ] Wishlist with database
[ ] Infinite scroll pagination
[ ] Optimistic UI updates
[ ] Custom authentication middleware

Mastery:
[ ] Build Shopping Cart (Zustand)
[ ] Implement Order System
[ ] Add Admin Dashboard features
[ ] Deploy to Vercel
```

---

## 💡 Tips for Success

1. **Don't Rush**: Spend time understanding before coding
2. **Type Everything**: Let TypeScript guide you
3. **Read Errors Carefully**: They usually tell you exactly what's wrong
4. **Use Console.log**: Debug data flow step by step
5. **Ask Questions**: Check official docs, GitHub issues, Discord communities

---

## 🆘 Getting Help

**Stuck? Here's what to do:**

1. **Check the error message** - Usually very descriptive
2. **Search this guide** - Ctrl+F is your friend
3. **Read official docs** - Links in Resources section
4. **Check existing code** - Similar features already implemented
5. **Use TypeScript hints** - Hover over functions in VS Code

**Common Search Keywords**:
- "Next.js [your question]"
- "tRPC [your issue]"
- "NextAuth [your problem]"
- "TypeScript [error message]"

---

**Happy Learning! 🚀**

_Last Updated: November 3, 2025_
