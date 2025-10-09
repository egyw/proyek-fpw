# AI Agent Instructions for proyek-fpw

## Project Overview
Next.js 15 + TypeScript + tRPC application for a building materials e-commerce platform. Uses Pages Router (NOT App Router), shadcn/ui components, and Tailwind CSS v4.

## Architecture & Key Decisions

### tRPC Setup (Type-Safe API)
- **Server**: Define procedures in `src/server/routers/_app.ts` (single file, NOT multi-file routers)
- **Client**: Auto-generated hooks via `trpc.procedureName.useQuery()` or `.useMutation()`
- **DO NOT modify**: `_app.tsx`, `api/trpc/[trpc].ts`, `server/trpc.ts`, `utils/trpc.ts` (core setup)

Example API definition:
```typescript
// src/server/routers/_app.ts
export const appRouter = router({
  getUser: procedure
    .input(z.object({ id: z.number() }))
    .query(async (opts) => ({ id: opts.input.id, name: "Example" })),
});
```

### Pages Router (NOT App Router)
- Routes: `src/pages/` → file-based routing (e.g., `auth/login.tsx` = `/auth/login`)
- API routes: `src/pages/api/` (tRPC handler at `api/trpc/[trpc].ts`)
- **Critical**: This is Pages Router, NOT App Router. No `app/` directory exists.

### UI Components (shadcn/ui)
- Install via: `npx shadcn@latest add <component>` (use `cmd /c` on Windows if PowerShell blocks)
- Location: `src/components/ui/`
- **Installed components**: button, input, label, card, badge, separator, form, carousel, table, dropdown-menu, avatar, select, dialog, sheet
- **Always prefer shadcn components first** - Install missing shadcn components before creating custom ones
- **DO NOT use HTML elements** when shadcn equivalent exists:
  - ❌ `<table>` → ✅ Use shadcn `<Table>` component
  - ❌ `<select>` → ✅ Use shadcn `<Select>` component
  - ❌ Custom dropdown → ✅ Use shadcn `<DropdownMenu>` component
  - ❌ `<div>` for avatar → ✅ Use shadcn `<Avatar>` component
- **Form validation**: Use shadcn Form + react-hook-form + Zod (see auth pages)
- **Avoid `cn` utility**: Use template literals for conditional classNames instead of `cn()` function

### Layout Components
- **MainLayout**: Wrapper with Navbar + children + Footer (for public pages like homepage, products)
  - Usage: `<MainLayout>{content}</MainLayout>`
  - Located: `src/components/layouts/MainLayout.tsx`
- **AdminLayout**: Admin dashboard wrapper with sidebar navigation + header (for admin pages)
  - Features: Collapsible sidebar, user dropdown menu, notifications, breadcrumbs
  - Navigation: Dashboard, Produk, Pesanan, Pelanggan, Kategori, Laporan, Pengaturan
  - Usage: `<AdminLayout>{content}</AdminLayout>`
  - Located: `src/components/layouts/AdminLayout.tsx`
- **Navbar**: Sticky navigation bar for public pages (`src/components/layouts/Navbar.tsx`)
- **Footer**: Footer with links and branding (`src/components/layouts/Footer.tsx`)
- **Auth pages**: Login/Register pages do NOT use any layout (standalone design)

### Styling Conventions
- **Tailwind v4** with `@import "tailwindcss"` syntax (NOT CDN)
- **OKLCH colors** in CSS variables (e.g., `oklch(0.43 0.12 240)`)
- **Primary color**: #1a5fa4 (navy blue) - brand color for this building materials store
- **Theme file**: `src/styles/globals.css` with CSS custom properties
- **Responsive**: Mobile-first, hide desktop elements with `hidden lg:flex`

### Path Aliases
- `@/*` maps to `./src/*` (e.g., `@/components/ui/button`)
- Configured in `tsconfig.json` and `components.json`

## Development Workflow

### Commands (Windows)
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
```

### Adding New Features
1. **API**: Add procedure to `src/server/routers/_app.ts` with Zod input validation
2. **Page**: Create file in `src/pages/` (no registration needed)
3. **Component**: Use shadcn/ui or create in `src/components/`
4. **Types**: tRPC auto-generates types; export `AppRouter` type from `_app.ts`

### Static Assets
- Images: `public/images/` (e.g., logo at `public/images/logo_4x1.png`)
- Hero image: `public/images/hero_image.png`
- Dummy/placeholder: `public/images/dummy_image.jpg`
- Use Next.js `<Image>` component with relative paths: `src="/images/logo_4x1.png"`

## Project-Specific Patterns

### Auth Pages - Two Different Designs
**Register Page** (`src/pages/auth/register.tsx`):
- Split-screen layout: Benefits sidebar (left) + Form (right)
- Benefits hidden on mobile with `hidden lg:flex`
- Animated gradient background with patterns
- White card form with shadcn Form components
- 5 fields: fullName, email, phoneNumber, password, confirmPassword

**Login Page** (`src/pages/auth/login.tsx`):
- Centered card design (NOT split-screen)
- Gradient header with logo
- Animated background patterns (same as register)
- Social login (Google button)
- 2 fields: email, password
- "Lupa password?" link

**Shared Background Pattern**:
```tsx
// Animated gradient with geometric shapes, grid, and diagonal lines
<div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80">
  {/* Pulsing blur circles */}
  <div className="absolute ... bg-white/5 rounded-full blur-3xl animate-pulse"></div>
  {/* Grid pattern */}
  <div className="absolute inset-0 bg-[linear-gradient(...)] bg-[size:64px_64px]"></div>
  {/* Diagonal lines */}
  <div className="absolute ... bg-gradient-to-r from-transparent via-white to-transparent"></div>
</div>
```

### Form Validation Pattern (react-hook-form + Zod)
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

type FormValues = z.infer<typeof schema>;

export default function Page() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    // TODO: Implement with tRPC
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
                <Input placeholder="nama@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### tRPC Client Usage
```typescript
import { trpc } from '@/utils/trpc';

export default function Page() {
  const { data, isLoading } = trpc.getUser.useQuery({ id: 1 });
  const createMutation = trpc.createUser.useMutation();
  
  return <button onClick={() => createMutation.mutate({ name: "John" })}>Create</button>;
}
```

### Admin Dashboard Pattern
**AdminLayout Structure** (`src/components/layouts/AdminLayout.tsx`):
- Collapsible sidebar (toggle width between `w-64` and `w-20`)
- Navigation items with active state highlighting (bg-primary for active)
- Header with page title, notification bell, and user dropdown menu
- User menu uses shadcn DropdownMenu with Avatar component
- Mobile responsive (sidebar can be hidden on small screens)

**Admin Pages Structure**:
- All admin pages located in `src/pages/admin/`
- Always wrap content with `<AdminLayout>`
- Use shadcn Table for data display (NOT HTML `<table>`)
- Use shadcn Select for filters (NOT HTML `<select>`)
- Stats cards using shadcn Card component
- Badge component for status indicators

**Example Admin Page**:
```typescript
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPage() {
  return (
    <AdminLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Items</p>
          <h3 className="text-2xl font-bold">1,234</h3>
        </Card>
      </div>
      
      {/* Filters with shadcn Select */}
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Data Table with shadcn Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
```

## Critical Rules

1. **Never create App Router files** - This is Pages Router only (no `app/` directory)
2. **Use shadcn components first** - Install missing ones rather than creating custom components
3. **NO HTML primitives when shadcn exists** - Use Table, Select, Avatar, DropdownMenu from shadcn
4. **Form validation required** - Always use react-hook-form + Zod for forms (NOT plain HTML forms)
5. **Keep tRPC routers in single file** - `_app.ts` contains all procedures (not split into multiple files)
6. **Match brand colors** - Use #1a5fa4 primary color (navy blue) for building materials branding
7. **Consistent backgrounds** - Use animated gradient pattern for auth pages (see login/register)
8. **Clean UI preference** - User prefers minimal, clean designs without excessive decorations
9. **Indonesian language** - UI text and placeholders in Bahasa Indonesia
10. **Windows environment** - Use `cmd /c` for npx commands if PowerShell execution policy blocks
11. **Avoid `cn` utility** - Use template literals `${...}` for conditional classNames instead of `cn()` function

## External Dependencies
- **React Query**: Data fetching (via tRPC integration)
- **Zod**: Schema validation for tRPC inputs
- **Radix UI**: Accessible primitives for shadcn components
- **Lucide Icons**: Icon library (use lucide-react when needed)

## Testing & Debugging
- No test framework configured yet
- Dev mode: Check `http://localhost:3000`
- tRPC errors: Check Network tab for `/api/trpc` calls
- Type errors: Run `npm run build` to check TypeScript compilation

## Reference Files
- Architecture guide: `GUIDE.md` (quick reference for team)
- Component config: `components.json` (shadcn settings)
- Router setup: `src/server/routers/_app.ts` (API definitions)
- Entry point: `src/pages/_app.tsx` (tRPC + React Query providers)
