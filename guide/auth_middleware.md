# 🔐 Authentication & Middleware Guide

> **Panduan lengkap sistem authentication menggunakan NextAuth.js dengan tRPC**
> 
> **Status**: ✅ Production-ready (November 2025)  
> **Tech Stack**: Next.js 15 + NextAuth.js + tRPC + MongoDB + bcryptjs

---

## 📑 Table of Contents

1. [Arsitektur Sistem](#arsitektur-sistem)
2. [Setup & Configuration](#setup--configuration)
3. [Registration Flow](#registration-flow)
4. [Login Flow](#login-flow)
5. [Session Management](#session-management)
6. [Middleware & Protection](#middleware--protection)
7. [Logout Flow](#logout-flow)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arsitektur Sistem

### Diagram Alur Authentication

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW (tRPC)                      │
└─────────────────────────────────────────────────────────────────┘

User Input → Form Validation (Zod) → tRPC Mutation → MongoDB
    ↓              ↓                       ↓              ↓
6 fields    Password match         Hash password    Save user
(no address)  Email format         (bcrypt 10x)     (role: user)
              Username unique                       (isActive: true)
              
Result: Toast success → Redirect to /auth/login

┌─────────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW (NextAuth)                       │
└─────────────────────────────────────────────────────────────────┘

User Input → Form Validation → NextAuth signIn() → CredentialsProvider
    ↓              ↓                   ↓                    ↓
Email +      Zod schema        redirect: false      MongoDB query
Password     (email format)                         (find by email)
                                                           ↓
                                                    Password verify
                                                    (bcrypt compare)
                                                           ↓
                                                    isActive check
                                                           ↓
                                                    Update lastLogin
                                                           ↓
JWT Callbacks ← Return user object ← Session created ← Generate JWT
    ↓                                                         
Inject custom fields (id, username, role, phone, address, isActive)
    ↓
Session object available globally via useSession()
    ↓
HTTP-only cookie stored (30 days, secure)

Result: Toast success → Redirect to /

┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE PROTECTION                         │
└─────────────────────────────────────────────────────────────────┘

3 Levels of Protection:

1. PAGE LEVEL (useRequireAuth)
   → Check session status
   → If unauthenticated → Toast + Redirect to /auth/login
   
2. ROLE LEVEL (useRequireRole)
   → Check session.user.role
   → If not in allowedRoles → Toast + Redirect to /
   
3. ACTION LEVEL (RequireAuth component)
   → Wrap buttons/links
   → If unauthenticated → Toast with "Login" button
   → If authenticated → Execute action
```

---

## ⚙️ Setup & Configuration

### 1. Environment Variables

**File**: `.env.local`

```bash
# MongoDB Connection (choose one)
# Option 1: Local
MONGODB_URI=mongodb://localhost:27017/proyekFPW

# Option 2: MongoDB Atlas (production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/proyekFPW

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
```

### 2. NextAuth Configuration

**File**: `src/pages/api/auth/[...nextauth].ts`

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('Email atau password salah');
        }

        if (!user.isActive) {
          throw new Error('Akun Anda tidak aktif. Hubungi administrator.');
        }

        const isValidPassword = await compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error('Email atau password salah');
        }

        // Update lastLogin
        user.lastLogin = new Date();
        await user.save();

        // Return user object (stored in JWT)
        return {
          id: String(user._id),
          email: user.email,
          name: user.fullName,
          username: user.username,
          role: user.role,
          phone: user.phone,
          address: user.address,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.phone = user.phone;
        token.address = user.address;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as 'admin' | 'staff' | 'user';
        session.user.phone = token.phone as string;
        session.user.address = token.address as {
          street: string;
          city: string;
          province: string;
          postalCode: string;
        };
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.JWT_SECRET,
};

export default NextAuth(authOptions);
```

### 3. Type Extensions

**File**: `src/types/next-auth.d.ts`

```typescript
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    role: 'admin' | 'staff' | 'user';
    phone: string;
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
    };
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      username: string;
      role: 'admin' | 'staff' | 'user';
      phone: string;
      address: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
      };
      isActive: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: 'admin' | 'staff' | 'user';
    phone: string;
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
    };
    isActive: boolean;
  }
}
```

### 4. SessionProvider Integration

**File**: `src/pages/_app.tsx`

```typescript
import { SessionProvider } from 'next-auth/react';
import type { AppType } from 'next/app';
import type { Session } from 'next-auth';

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps }) => {
  return (
    <SessionProvider session={pageProps.session}>
      {/* Your providers (tRPC, QueryClient, etc.) */}
      <Component {...pageProps} />
    </SessionProvider>
  );
};
```

---

## 📝 Registration Flow

### tRPC Registration Endpoint

**File**: `src/server/routers/auth.ts`

```typescript
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { TRPCError } from '@trpc/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const registerInputSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  fullName: z.string().min(3),
  phone: z.string().regex(/^08\d{8,11}$/),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    province: z.string().min(1),
    postalCode: z.string().regex(/^\d{5}$/),
  }),
});

export const authRouter = router({
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async ({ input }) => {
      if (input.password !== input.confirmPassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Password dan konfirmasi password tidak cocok',
        });
      }

      await connectDB();

      // Check duplicates
      const existingUsername = await User.findOne({ username: input.username });
      if (existingUsername) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Username sudah digunakan',
        });
      }

      const existingEmail = await User.findOne({ email: input.email });
      if (existingEmail) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email sudah terdaftar',
        });
      }

      // Hash password
      const hashedPassword = await hash(input.password, 10);

      // Create user
      const user = await User.create({
        username: input.username,
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        phone: input.phone,
        address: input.address,
        role: 'user',
        isActive: true,
      });

      return {
        success: true,
        message: 'Registrasi berhasil! Silakan login.',
        user: {
          id: String(user._id),
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
      };
    }),
});
```

### Registration Page

**File**: `src/pages/auth/register.tsx`

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

const registerSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().regex(/^08\d{8,11}$/, 'Format: 08XXXXXXXXXX'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success('Registrasi Berhasil!', {
        description: `Selamat datang ${data.user.fullName}! Silakan login.`,
      });
      setTimeout(() => router.push('/auth/login'), 1500);
    },
    onError: (error) => {
      toast.error('Registrasi Gagal', { description: error.message });
    },
  });

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data) => {
    // Add placeholder address (will be updated in profile/checkout)
    registerMutation.mutate({
      ...data,
      address: {
        street: '-',
        city: '-',
        province: '-',
        postalCode: '00000',
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <Button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Mendaftar...' : 'Daftar Sekarang'}
        </Button>
      </form>
    </Form>
  );
}
```

**Key Points**:
- ✅ **6 fields** (no address - added as placeholder)
- ✅ **Address placeholder**: `{ street: '-', city: '-', province: '-', postalCode: '00000' }`
- ✅ **Validation**: Username unique, email unique, password match
- ✅ **Success**: Toast + redirect to login after 1.5s

---

## 🔑 Login Flow

### Login Page

**File**: `src/pages/auth/login.tsx`

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Login Gagal', { description: result.error });
        setIsLoading(false);
        return;
      }

      toast.success('Login Berhasil!', {
        description: 'Selamat datang kembali!',
      });

      setTimeout(() => router.push('/'), 500);
    } catch {
      toast.error('Login Gagal', {
        description: 'Terjadi kesalahan saat login.',
      });
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>
    </Form>
  );
}
```

**Key Points**:
- ✅ **NextAuth signIn()** with `redirect: false`
- ✅ **Error handling**: Check `result?.error`
- ✅ **Success**: Toast + redirect to homepage after 500ms
- ✅ **Security**: HTTP-only cookies, CSRF protection

---

## 🔐 Session Management

### Get Current User (Any Component)

```typescript
import { useSession } from 'next-auth/react';

export default function MyComponent() {
  const { data: session, status } = useSession();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Phone: {user.phone}</p>
    </div>
  );
}
```

### Session Object Structure

```typescript
session = {
  user: {
    id: "68b82d09d2788dc4d9e60875",        // MongoDB _id
    name: "John Doe",                       // fullName from DB
    email: "john@example.com",
    username: "johndoe",
    role: "user",                           // 'admin' | 'staff' | 'user'
    phone: "081234567890",
    address: {
      street: "Jl. Merdeka No. 123",
      city: "Malang",
      province: "Jawa Timur",
      postalCode: "65141"
    },
    isActive: true
  },
  expires: "2025-12-02T10:30:00.000Z"      // 30 days from login
}
```

---

## 🛡️ Middleware & Protection

### Level 1: Page Protection (useRequireAuth)

**File**: `src/hooks/useRequireAuth.ts`

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Akses Ditolak', {
        description: 'Silakan login terlebih dahulu untuk mengakses halaman ini.',
      });
      router.push(redirectTo);
    }
  }, [status, router, redirectTo]);

  return { isAuthenticated, isLoading, session };
}
```

**Usage in Cart Page**:

```typescript
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function CartPage() {
  const { isAuthenticated, isLoading, session } = useRequireAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Cart content - only renders if authenticated */}
      <h1>Keranjang Belanja</h1>
      <p>User: {session?.user.name}</p>
    </div>
  );
}
```

### Level 2: Role-Based Protection (useRequireRole)

**File**: `src/hooks/useRequireAuth.ts` (same file)

```typescript
export function useRequireRole(allowedRoles: Array<'admin' | 'staff' | 'user'>) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (!allowedRoles.includes(session.user.role)) {
        toast.error('Akses Ditolak', {
          description: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
        });
        router.push('/');
      }
    }
  }, [session, status, router, allowedRoles]);

  return { user: session?.user, isAuthenticated, isLoading };
}
```

**Usage in Admin Page**:

```typescript
import { useRequireRole } from '@/hooks/useRequireAuth';

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useRequireRole(['admin']);
  
  // Automatically redirects if user is not admin
  
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin {user?.name}!</p>
    </div>
  );
}
```

**Role Examples**:
```typescript
// Admin only
useRequireRole(['admin']);

// Admin and Staff
useRequireRole(['admin', 'staff']);

// All authenticated users
useRequireRole(['admin', 'staff', 'user']);
```

### Level 3: Action Protection (RequireAuth Component)

**File**: `src/components/RequireAuth.tsx`

```typescript
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

interface RequireAuthProps {
  children: (props: { onClick: () => void }) => ReactNode;
  onAuthenticated: () => void;
  message?: string;
}

export function RequireAuth({ children, onAuthenticated, message }: RequireAuthProps) {
  const { status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error('Login Diperlukan', {
        description: message || 'Silakan login terlebih dahulu.',
        action: {
          label: 'Login',
          onClick: () => router.push('/auth/login'),
        },
      });
      return;
    }

    onAuthenticated();
  };

  return <>{children({ onClick: handleClick })}</>;
}
```

**Usage - Protect Add to Cart Button**:

```tsx
import { RequireAuth } from '@/components/RequireAuth';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductCard({ product }) {
  const handleAddToCart = () => {
    // Add to cart logic (only called if authenticated)
    console.log('Adding to cart:', product.id);
    toast.success('Produk ditambahkan ke keranjang!');
  };

  return (
    <Card>
      <h3>{product.name}</h3>
      <p>Rp {product.price.toLocaleString('id-ID')}</p>
      
      <RequireAuth 
        onAuthenticated={handleAddToCart}
        message="Silakan login untuk menambahkan produk ke keranjang."
      >
        {({ onClick }) => (
          <Button onClick={onClick}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Tambah ke Keranjang
          </Button>
        )}
      </RequireAuth>
    </Card>
  );
}
```

**Key Features**:
- ✅ Render props pattern for flexibility
- ✅ Toast notification with "Login" action button
- ✅ Custom message support
- ✅ Does NOT navigate away (better UX)

---

## 🚪 Logout Flow

### Navbar with Logout

**File**: `src/components/layouts/Navbar.tsx`

```tsx
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Package, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    toast.success('Berhasil logout', {
      description: 'Anda telah keluar dari akun.',
    });
  };

  return (
    <nav>
      {isLoggedIn && session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarFallback className="bg-primary text-white">
                {session.user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/orders">
                <Package className="mr-2 h-4 w-4" />
                Pesanan Saya
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Link href="/auth/login">
            <Button variant="outline">Masuk</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Daftar</Button>
          </Link>
        </>
      )}
    </nav>
  );
}
```

**Logout Flow**:
1. User clicks "Logout" in dropdown
2. `signOut({ callbackUrl: '/' })` called
3. Session cleared (HTTP-only cookie removed)
4. Toast notification displayed
5. User redirected to homepage
6. Navbar switches to "Masuk" and "Daftar" buttons

---

## 🔒 Security Best Practices

### 1. Password Security

```typescript
// Registration - Hash password
import { hash } from 'bcryptjs';
const hashedPassword = await hash(password, 10); // 10 rounds

// Login - Verify password
import { compare } from 'bcryptjs';
const isValid = await compare(inputPassword, user.password);
```

**Security Level**: 10 rounds of bcrypt = ~100ms per hash (secure against brute force)

### 2. Session Security

```typescript
// HTTP-only cookies (immune to XSS)
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days
}

// JWT signing with secret
secret: process.env.JWT_SECRET // Min 32 characters
```

**Why HTTP-only cookies?**
- ❌ localStorage: Vulnerable to XSS attacks
- ✅ HTTP-only cookies: Cannot be accessed by JavaScript
- ✅ CSRF protection: Built-in NextAuth middleware

### 3. Account Security

```typescript
// Check account status
if (!user.isActive) {
  throw new Error('Akun Anda tidak aktif. Hubungi administrator.');
}

// Track last login
user.lastLogin = new Date();
await user.save();
```

### 4. Error Messages (Security)

**Bad** (reveals information):
```typescript
// ❌ Don't do this
if (!user) throw new Error('User tidak ditemukan');
if (!isValid) throw new Error('Password salah');
```

**Good** (generic message):
```typescript
// ✅ Do this
if (!user || !isValid) {
  throw new Error('Email atau password salah');
}
```

### 5. Environment Variables

```bash
# .env.local (NEVER commit this file)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super-secret-min-32-chars

# .env.example (commit this as template)
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-min-32-characters
```

---

## 🐛 Troubleshooting

### Issue 1: Session not persisting after refresh

**Problem**: `useSession()` returns `status: 'unauthenticated'` after page refresh

**Solution**:
```typescript
// Check _app.tsx has SessionProvider
<SessionProvider session={pageProps.session}>
  <Component {...pageProps} />
</SessionProvider>

// Check AppType has proper typing
const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps }) => {
```

### Issue 2: CSRF Token error

**Problem**: `[next-auth][error][CSRF_TOKEN_MISMATCH]`

**Solution**:
```bash
# Clear cookies and restart dev server
1. Clear browser cookies for localhost:3000
2. Stop dev server (Ctrl+C)
3. Delete .next folder
4. npm run dev
```

### Issue 3: JWT_SECRET missing

**Problem**: `[next-auth][error][NO_SECRET]`

**Solution**:
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env.local
JWT_SECRET=generated-secret-here
```

### Issue 4: MongoDB connection error

**Problem**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:
```bash
# Check MongoDB is running
# Local:
mongod --version

# Atlas: Check connection string in .env.local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Issue 5: Role-based redirect loop

**Problem**: Infinite redirect when using `useRequireRole`

**Solution**:
```typescript
// Add status check before role check
useEffect(() => {
  if (status === 'authenticated' && session?.user) {
    // Only check role after authentication confirmed
    if (!allowedRoles.includes(session.user.role)) {
      router.push('/');
    }
  }
}, [session, status, router, allowedRoles]);
```

### Issue 6: Toast not showing on logout

**Problem**: Toast notification doesn't appear after logout

**Solution**:
```typescript
// Toast before signOut (signOut redirects immediately)
const handleLogout = async () => {
  toast.success('Berhasil logout');
  await signOut({ callbackUrl: '/' });
};
```

---

## 📚 Reference

### Quick Code Snippets

**Get current user**:
```typescript
const { data: session } = useSession();
const user = session?.user;
```

**Protect page**:
```typescript
const { isLoading } = useRequireAuth();
if (isLoading) return <div>Loading...</div>;
```

**Protect admin page**:
```typescript
const { user } = useRequireRole(['admin']);
```

**Protect button**:
```tsx
<RequireAuth onAuthenticated={handleAction}>
  {({ onClick }) => <Button onClick={onClick}>Action</Button>}
</RequireAuth>
```

**Logout**:
```typescript
import { signOut } from 'next-auth/react';
await signOut({ callbackUrl: '/' });
```

---

## 🎯 Testing Checklist

### Registration
- [ ] Form validation (empty fields, invalid email, short password)
- [ ] Password confirmation mismatch
- [ ] Username duplicate check
- [ ] Email duplicate check
- [ ] Success toast + redirect to login
- [ ] Database record created with hashed password

### Login
- [ ] Form validation (empty fields, invalid email)
- [ ] Wrong email shows error
- [ ] Wrong password shows error
- [ ] Inactive account blocked
- [ ] Success toast + redirect to homepage
- [ ] Session persists after page refresh
- [ ] HTTP-only cookie set in browser (check DevTools > Application > Cookies)

### Session Management
- [ ] `useSession()` returns correct user data
- [ ] Session available across all pages
- [ ] Session expires after 30 days
- [ ] Multiple tabs share same session

### Page Protection
- [ ] `/cart` redirects to login if not authenticated
- [ ] Protected page shows content after login
- [ ] Toast notification on redirect
- [ ] Admin pages check role correctly

### Action Protection
- [ ] Add to Cart button shows toast if not logged in
- [ ] Toast has "Login" action button
- [ ] Button works normally when logged in

### Logout
- [ ] Logout clears session
- [ ] Logout redirects to homepage
- [ ] Toast notification appears
- [ ] Navbar shows "Masuk" and "Daftar" after logout
- [ ] Cannot access protected pages after logout

---

## 📄 Related Files

```
src/
├── pages/
│   ├── api/auth/[...nextauth].ts       # NextAuth config
│   ├── auth/
│   │   ├── login.tsx                   # Login page
│   │   └── register.tsx                # Register page
│   ├── _app.tsx                        # SessionProvider wrapper
│   └── cart.tsx                        # Example protected page
├── components/
│   ├── RequireAuth.tsx                 # Action protection
│   └── layouts/Navbar.tsx              # User menu + logout
├── hooks/
│   └── useRequireAuth.ts               # Page & role protection
├── server/
│   └── routers/auth.ts                 # tRPC register endpoint
├── types/
│   └── next-auth.d.ts                  # Custom session types
├── models/
│   └── User.ts                         # Mongoose User model
└── lib/
    └── mongodb.ts                      # MongoDB connection
```

---

**Last Updated**: November 2, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
