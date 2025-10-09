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
- Installed: button, input, label, card, badge, separator, form, carousel
- **Always prefer shadcn components** over custom HTML/divs for consistency
- **Form validation**: Use shadcn Form + react-hook-form + Zod (see auth pages)

### Layout Components
- **MainLayout**: Wrapper with Navbar + children + Footer (for public pages)
- **Navbar**: Sticky navigation bar (`src/components/layouts/Navbar.tsx`)
- **Footer**: Footer with links and branding (`src/components/layouts/Footer.tsx`)
- **Usage**: Wrap page content with `<MainLayout>{content}</MainLayout>`
- **Auth pages**: Login/Register pages do NOT use MainLayout (standalone design)

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

## Critical Rules

1. **Never create App Router files** - This is Pages Router only (no `app/` directory)
2. **Use shadcn components** - Install missing ones rather than creating custom components
3. **Form validation required** - Always use react-hook-form + Zod for forms (NOT plain HTML forms)
4. **Keep tRPC routers in single file** - `_app.ts` contains all procedures (not split into multiple files)
5. **Match brand colors** - Use #1a5fa4 primary color (navy blue) for building materials branding
6. **Consistent backgrounds** - Use animated gradient pattern for auth pages (see login/register)
7. **Clean UI preference** - User prefers minimal, clean designs without excessive decorations
8. **Indonesian language** - UI text and placeholders in Bahasa Indonesia
9. **Windows environment** - Use `cmd /c` for npx commands if PowerShell execution policy blocks

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
