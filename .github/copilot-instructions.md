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
- **Installed components**: button, input, label, card, badge, separator, form, carousel, table, dropdown-menu, avatar, select, dialog, sheet, tabs, textarea
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

### Frontend Development with Dummy Data (Current Phase)
**Project is currently using dummy/mock data** - Database not yet integrated.

**When creating frontend pages/components:**
1. **Use dummy data arrays** - Create mock data inline or in separate constants
2. **Add clear TODO comments** - Mark where backend integration is needed
3. **Structure for easy backend swap** - Design components to easily replace dummy data with tRPC hooks
4. **Comment pattern for AI assistance**:
   ```typescript
   // TODO: Replace with tRPC query
   // Expected API: trpc.products.getAll.useQuery()
   // Input: { categoryId?: number, search?: string }
   // Output: Product[]
   const dummyProducts: Product[] = [
     { 
       id: 1, 
       name: "Product 1", 
       price: 100000, 
       originalPrice: 120000,
       discount: { percentage: 15, validUntil: "2025-12-31" },
       stock: 50, 
       images: ["/images/dummy_image.jpg"],
       rating: { average: 4.5, count: 128 },
       sold: 245,
       category: "Category Name",
       // ... other fields
     },
   ];
   ```

**Backend Integration Pattern** (for future AI agents):
```typescript
// BEFORE (dummy data):
const products = dummyProducts;

// AFTER (with backend):
const { data: products, isLoading } = trpc.products.getAll.useQuery({ categoryId: 1 });
if (isLoading) return <Spinner />;
```

**Key principles:**
- Keep data structure consistent (same fields/types for dummy and real data)
- Use TypeScript interfaces for data shapes (even for dummy data)
- Comment expected tRPC procedure names and input/output schemas
- Design UI to handle loading states (even if not used with dummy data)

### Product Data Structure
**Complete product schema** for consistent dummy data across the project:

```typescript
interface Product {
  id: string;                    // MongoDB ObjectId or unique identifier
  name: string;                  // Product name
  slug: string;                  // URL-friendly name (e.g., "buana-tangki-air-650")
  category: string;              // Category name
  brand: string;                 // Brand name
  unit: string;                  // Unit (e.g., "SET", "PCS", "M2")
  
  // Pricing
  price: number;                 // Current selling price (after discount)
  originalPrice?: number;        // Original price (before discount)
  discount?: {
    percentage: number;          // Discount percentage (0-100)
    validUntil: string;          // ISO date string
  };
  
  // Stock
  stock: number;                 // Available stock quantity
  minStock?: number;             // Minimum stock for restock alert
  
  // Media
  images: string[];              // Array of image URLs/paths
  
  // Description
  description: string;           // Product description
  
  // Rating & Social Proof
  rating: {
    average: number;             // Average rating (0-5)
    count: number;               // Number of reviews
  };
  sold: number;                  // Total units sold
  views?: number;                // Product page views
  
  // Attributes (product specifications)
  attributes?: Record<string, string>; // e.g., { material: "Plastik HDPE", capacity: "650L" }
  
  // Status
  isActive: boolean;             // Product visibility
  isFeatured?: boolean;          // Featured product flag
  
  // Timestamps
  createdAt: string;             // ISO date string
  updatedAt: string;             // ISO date string
}
```

**Example dummy product:**
```typescript
{
  id: "68b8340ed2788dc4d9e608b5",
  name: "Buana Tangki Air Plastik 650 LTR",
  slug: "buana-tangki-air-plastik-650-ltr",
  category: "Tangki Air",
  brand: "Buana",
  unit: "SET",
  price: 552500,
  originalPrice: 650000,
  discount: { percentage: 15, validUntil: "2025-12-31T23:59:59Z" },
  stock: 150,
  minStock: 10,
  images: ["/images/products/tangki-air-1.jpg", "/images/products/tangki-air-2.jpg"],
  description: "Tangki air plastik merek Buana kapasitas 650 liter.",
  rating: { average: 4.5, count: 128 },
  sold: 245,
  views: 1250,
  attributes: { material: "Plastik HDPE", capacity: "650 Liter", color: "Biru" },
  isActive: true,
  isFeatured: false,
  createdAt: "2025-04-01T00:00:00Z",
  updatedAt: "2025-04-01T00:00:00Z"
}
```

**Important notes:**
- Always use this complete structure for product dummy data
- UI can display subset of fields (don't clutter interface)
- Price = final price after discount (originalPrice optional for comparison)
- Images should be array even if single image
- Rating & sold are key for social proof

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

### Orders Page Pattern
**Location**: `src/pages/orders/index.tsx`

**Features Implemented**:
- Filter by status (Select dropdown): all, processing, shipping, delivered, completed
- Order cards with expand/collapse (show 1 item by default, Button to show more)
- Return request Dialog with Textarea for reason input, validation (disabled if empty)
- Rating Dialog with 5 Star buttons (Button variant ghost), shows existing rating
- All shadcn components (verified no HTML primitives)

**Key Implementation**:
```tsx
// Expand/Collapse Orders
const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
const toggleExpand = (orderId: string) => {
  const newExpanded = new Set(expandedOrders);
  if (newExpanded.has(orderId)) {
    newExpanded.delete(orderId);
  } else {
    newExpanded.add(orderId);
  }
  setExpandedOrders(newExpanded);
};

// Show only 1 item by default
{expandedOrders.has(order.id) ? order.items : order.items.slice(0, 1)}
```

**Return Request Dialog**:
```tsx
const [returnReason, setReturnReason] = useState("");
<Dialog>
  <DialogContent>
    <Textarea 
      value={returnReason}
      onChange={(e) => setReturnReason(e.target.value)}
    />
    <Button disabled={!returnReason.trim()}>Ajukan Pengembalian</Button>
  </DialogContent>
</Dialog>
```

**Rating System**:
```tsx
// 5 star buttons with active state
{[1, 2, 3, 4, 5].map((star) => (
  <Button
    key={star}
    variant="ghost"
    size="sm"
    onClick={() => handleRate(star)}
  >
    <Star className={`h-5 w-5 ${star <= selectedRating ? 'fill-yellow-400' : ''}`} />
  </Button>
))}
```

### Admin Reports System
**Location**: `src/pages/admin/reports/`

**Architecture** - Hybrid Tabs + Components:
- **Main Hub** (`index.tsx`): Tabs navigation with 10 report tabs
- **Reusable Components** (`src/components/reports/`):
  - `SalesReportContent.tsx` - Full sales report with Recharts
  - `PlaceholderReport.tsx` - Coming Soon component for未实现 reports
- **Individual Routes**: Each report accessible via standalone route + breadcrumb

**File Structure**:
```
src/
├── components/
│   └── reports/
│       ├── SalesReportContent.tsx    (full sales report)
│       └── PlaceholderReport.tsx     (reusable placeholder)
└── pages/
    └── admin/
        └── reports/
            ├── index.tsx             (tabs navigation hub)
            ├── sales.tsx             (Laporan Penjualan - completed)
            ├── report2.tsx           (Laporan 2 - placeholder)
            ├── report3.tsx           (Laporan 3 - placeholder)
            ... (report4 - report10)
```

**Tabs Navigation** (`index.tsx`):
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesReportContent from "@/components/reports/SalesReportContent";
import PlaceholderReport from "@/components/reports/PlaceholderReport";

<Tabs defaultValue="sales">
  <TabsList>
    <TabsTrigger value="sales">Laporan Penjualan</TabsTrigger>
    <TabsTrigger value="report2">Laporan 2</TabsTrigger>
    ...
  </TabsList>
  <TabsContent value="sales">
    <SalesReportContent />
  </TabsContent>
  <TabsContent value="report2">
    <PlaceholderReport title="Laporan 2" description="..." />
  </TabsContent>
</Tabs>
```

**Sales Report Features** (`SalesReportContent.tsx`):
- 3 Stats cards with icons: Total Revenue (TrendingUp/Down), Total Orders, Products Sold
- Interactive Recharts: LineChart/BarChart toggle via Select
- Year filter (2025, 2024, 2023) with Select
- CustomTooltip component for chart hover details
- Export buttons (PDF, Excel - ready for backend)
- All using shadcn components (Card, Button, Select) + Recharts + Lucide icons

**Placeholder Component** (`PlaceholderReport.tsx`):
```tsx
interface PlaceholderReportProps {
  title: string;        // e.g., "Laporan 2"
  description: string;  // e.g., "Konten laporan 2 sedang dalam pengembangan"
}
// Shows: Package icon, "Coming Soon" heading, description, info box, disabled button
```

**Individual Routes Pattern**:
```tsx
// src/pages/admin/reports/sales.tsx
export default function SalesReportPage() {
  return (
    <AdminLayout>
      {/* Breadcrumb with ChevronLeft */}
      <Link href="/admin/reports">← Kembali ke Laporan</Link>
      {/* Import same component used in tabs */}
      <SalesReportContent />
    </AdminLayout>
  );
}
```

**Report Naming Convention**:
- **Laporan Penjualan** (sales.tsx) - Specific, completed report
- **Laporan 2-10** (report2.tsx - report10.tsx) - Generic placeholders
- Use generic names for未确定 reports for flexibility

**Benefits of Hybrid Approach**:
- ✅ Tabs UI for best UX (quick navigation between reports)
- ✅ Component reusability (1 component for tabs + standalone route)
- ✅ No code duplication (DRY principle)
- ✅ Individual route access with breadcrumb navigation
- ✅ Easy to add new reports (create component, import in both places)

### Admin Orders Management
**Location**: `src/pages/admin/orders/index.tsx`

**Purpose**: Complete order management system for admin to process, ship, and track customer orders.

**Key Features**:
- **4 Stats Cards** with Lucide icons:
  - Perlu Diproses (Paid - blue, ShoppingCart icon) - Orders that need to be processed
  - Sedang Diproses (Processing - yellow, Package icon) - Orders being prepared
  - Dalam Pengiriman (Shipped - purple, Truck icon) - Orders in delivery
  - Selesai (Completed - green, CheckCircle icon) - Completed orders
- **Filters**: Search input (order number/customer/phone) + Status Select dropdown
- **Orders Table**: 7 columns (No Order, Customer, Tanggal, Items, Total, Status badge, Actions)
- **Dynamic Action Buttons** based on order status:
  - Paid → "Proses" button (Eye icon for View + Ban for Cancel)
  - Processing → "Kirim" button (Eye + Ban)
  - Shipped/Delivered/Completed/Cancelled → View only
- **5 Dialog Types**:

**1. View Detail Dialog** (Read-only, max-w-3xl):
```tsx
// Full order information display
- Customer: name, phone, email
- Shipping Address: full address with city, province, postal
- Order Items: table with qty × price = subtotal
- Totals: subtotal + shipping = total
- Payment Method info
- Shipping Info (if shipped): courier, tracking number, date
- Cancel Reason (if cancelled)
```

**2. Process Order Dialog** (Confirmation):
```tsx
// Simple confirmation to change paid → processing
<DialogContent className="max-w-md">
  <p>Apakah Anda yakin ingin memproses pesanan ini?</p>
  <Button onClick={handleProcess}>Ya, Proses</Button>
</DialogContent>
```

**3. Ship Order Dialog** (Form with validation):
```tsx
// IMPORTANT: Form fields have space-y-2 for proper label-input spacing
<div className="space-y-4">
  <div className="space-y-2"> {/* Label-input gap */}
    <Label>Ekspedisi</Label>
    <Select> {/* JNE, J&T, SiCepat, Anteraja, IDExpress, Ninja */}
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="jne">JNE</SelectItem>
        ...
      </SelectContent>
    </Select>
  </div>
  <div className="space-y-2">
    <Label>Nomor Resi</Label>
    <Input placeholder="Contoh: JNE1234567890" />
  </div>
  <div className="space-y-2">
    <Label>Tanggal Kirim</Label>
    <Input type="date" />
  </div>
</div>
// Button disabled until all fields filled
<Button disabled={!courier || !trackingNumber || !shippingDate}>
  <Send className="mr-2 h-4 w-4" />
  Kirim Pesanan
</Button>
```

**4. Cancel Order Dialog** (Textarea validation):
```tsx
// Textarea for cancel reason with validation
<div className="space-y-2"> {/* Label-textarea gap */}
  <Label>Alasan Pembatalan</Label>
  <Textarea 
    rows={4}
    value={cancelReason}
    onChange={(e) => setCancelReason(e.target.value)}
    placeholder="Masukkan alasan pembatalan pesanan..."
  />
</div>
// Button disabled if reason empty
<Button disabled={!cancelReason.trim()}>
  <Ban className="mr-2 h-4 w-4" />
  Batalkan Pesanan
</Button>
```

**Order Interface** (18 fields):
```typescript
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderDate: string; // ISO date string
  status: "paid" | "processing" | "shipped" | "delivered" | "completed" | "cancelled";
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  discount?: { amount: number; code: string };
  shippingInfo?: {
    courier: string;
    trackingNumber: string;
    shippedDate: string;
  };
  cancelReason?: string;
  notes?: string;
}
```

**Status Configuration**:
```typescript
const statusConfig = {
  paid: { label: "Perlu Diproses", color: "bg-blue-500", icon: ShoppingCart },
  processing: { label: "Sedang Diproses", color: "bg-yellow-500", icon: Package },
  shipped: { label: "Dalam Pengiriman", color: "bg-purple-500", icon: Truck },
  delivered: { label: "Terkirim", color: "bg-indigo-500", icon: CheckCircle },
  completed: { label: "Selesai", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Dibatalkan", color: "bg-red-500", icon: XCircle },
};
```

**Important Patterns**:
- **Form Spacing**: ALWAYS use `space-y-2` in form field containers for 8px gap between label and input/select/textarea
- **Shadcn Components**: Dialog, Select, Input, Textarea, Badge, Table, Button (NO HTML primitives)
- **Button States**: Disable buttons until validation passes (courier + trackingNumber + date OR cancelReason)
- **Status-Based UI**: Show/hide action buttons based on order status
- **TODO Comments**: Ready for tRPC mutations (`updateOrderStatus`, `shipOrder`, `cancelOrder`)

### Admin Inventory Stock Movements
**Location**: `src/pages/admin/inventory/index.tsx`

**Purpose**: Track automatic stock movements (IN/OUT) from transactions without manual stock entry.

**Key Features**:
- **3 Stats Cards** with Lucide icons:
  - Total Masuk (green, ArrowUpCircle) - Sum of all stock IN movements
  - Total Keluar (red, ArrowDownCircle) - Sum of all stock OUT movements
  - Saldo Stok (blue, Package) - Net stock (IN - OUT)
- **Info Alert** at top:
  ```tsx
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <p className="text-sm text-blue-800">
      <strong>ℹ️ Info:</strong> Pergerakan stok dicatat otomatis dari transaksi...
    </p>
  </div>
  ```
- **Filters**: 
  - Search input (product name/code)
  - Type Select (Semua, Masuk, Keluar)
  - Date Input (type="date")
- **Movements Table**: 9 columns
  - Tanggal (formatted date)
  - Kode Produk
  - Nama Produk
  - Tipe (Badge: Masuk=green, Keluar=red)
  - Jumlah (number)
  - Satuan (unit)
  - Ref (transaction reference)
  - Keterangan (description)
  - Saldo (current balance after movement)

**Movement Interface**:
```typescript
interface StockMovement {
  id: string;
  date: string; // ISO date
  productCode: string;
  productName: string;
  type: "in" | "out";
  quantity: number;
  unit: string;
  reference: string; // e.g., "PO-2025-001", "INV-2025-123"
  description: string;
  balance: number; // Stock balance after this movement
}
```

**Important Notes**:
- **Automatic Recording**: Stock movements are NOT manually entered, they are generated from:
  - Stock IN → Purchase orders, returns from customers
  - Stock OUT → Sales orders, damaged/lost items
- **Read-Only Table**: No add/edit/delete actions (movements auto-created)
- **Route**: `/admin/inventory` (using index.tsx, NOT stock-movements.tsx)
- **AdminLayout Menu**: Icon 📋 between Pesanan and Pelanggan

### Admin Product Add Form
**Location**: `src/pages/admin/products/index.tsx`

**Purpose**: Comprehensive form to add new products with complete validation using react-hook-form + Zod.

**Dialog Configuration**:
- Size: `max-w-5xl` (1024px wide) + `max-h-95vh` (95% viewport height)
- Title: `text-2xl` for prominence
- Form: `space-y-8` for generous section separation

**Form Structure** (4 Sections with Visual Hierarchy):

**Section 1: Informasi Produk** (`space-y-5`, header with `border-b pb-2`):
```tsx
<div className="space-y-5">
  <h3 className="text-lg font-semibold border-b pb-2">Informasi Produk</h3>
  
  {/* Nama Produk */}
  <FormField name="name" render={...}>
    <Input placeholder="Contoh: Semen Gresik 50kg" />
  </FormField>
  
  {/* Kategori + Brand (Grid 2 columns) */}
  <div className="grid grid-cols-2 gap-4">
    <FormField name="category" render={...}>
      <Select> {/* 8 options: Semen, Besi, Cat, Pipa, Keramik, Kayu, Atap, Lainnya */}
    </FormField>
    <FormField name="brand" render={...}>
      <Input placeholder="Contoh: Gresik" />
    </FormField>
  </div>
  
  {/* Deskripsi */}
  <FormField name="description" render={...}>
    <Textarea rows={4} placeholder="Deskripsi produk..." />
  </FormField>
</div>
```

**Section 2: Harga & Stok** (`space-y-5`, `pt-6 border-t`, header with `border-b pb-2`):
```tsx
<div className="space-y-5 pt-6 border-t">
  <h3 className="text-lg font-semibold border-b pb-2">Harga & Stok</h3>
  
  {/* Harga Jual + Harga Asli (Grid 2) */}
  <div className="grid grid-cols-2 gap-4">
    <FormField name="price" render={...}>
      <Input type="number" placeholder="100000" />
      <FormDescription>Harga jual saat ini</FormDescription>
    </FormField>
    <FormField name="originalPrice" render={...}>
      <Input type="number" placeholder="120000" />
      <FormDescription>Harga sebelum diskon (opsional)</FormDescription>
    </FormField>
  </div>
  
  {/* Satuan + Stok + Stok Min (Grid 3) */}
  <div className="grid grid-cols-3 gap-4">
    <FormField name="unit" render={...}>
      <Select> {/* 10 options: PCS, SET, SAK, ZAK, TON, KG, LITER, M2, M3, BOX */}
    </FormField>
    <FormField name="stock" render={...}>
      <Input type="number" placeholder="0" />
    </FormField>
    <FormField name="minStock" render={...}>
      <Input type="number" placeholder="10" />
      <FormDescription>Untuk alert stok rendah</FormDescription>
    </FormField>
  </div>
  
  {/* Diskon */}
  <FormField name="discount" render={...}>
    <Input type="number" placeholder="15" />
    <FormDescription>Persentase diskon (0-100)</FormDescription>
  </FormField>
</div>
```

**Section 3: Gambar Produk** (`space-y-5`, `pt-6 border-t`, header with `border-b pb-2`):
```tsx
<div className="space-y-5 pt-6 border-t">
  <h3 className="text-lg font-semibold border-b pb-2">Gambar Produk</h3>
  
  <div className="border-2 border-dashed rounded-lg p-6">
    {imagePreview ? (
      <div className="space-y-4">
        <Image src={imagePreview} alt="Preview" width={200} height={200} />
        <Button type="button" variant="outline" onClick={removeImage}>
          Hapus Gambar
        </Button>
      </div>
    ) : (
      <label className="flex flex-col items-center cursor-pointer">
        <Upload className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Klik untuk upload gambar</p>
        <Input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleImageChange} 
        />
      </label>
    )}
  </div>
</div>
```

**Section 4: Status Produk** (`space-y-5`, `pt-6 border-t`, header with `border-b pb-2`):
```tsx
<div className="space-y-5 pt-6 border-t">
  <h3 className="text-lg font-semibold border-b pb-2">Status Produk</h3>
  
  {/* isActive Checkbox */}
  <FormField name="isActive" render={({ field }) => (
    <FormItem className="flex items-start space-x-3">
      <FormControl>
        <Checkbox 
          checked={field.value} 
          onCheckedChange={field.onChange} 
        />
      </FormControl>
      <div className="space-y-1">
        <FormLabel>Produk Aktif</FormLabel>
        <FormDescription>Produk akan ditampilkan di katalog</FormDescription>
      </div>
    </FormItem>
  )} />
  
  {/* isFeatured Checkbox */}
  <FormField name="isFeatured" render={({ field }) => (
    <FormItem className="flex items-start space-x-3">
      <FormControl>
        <Checkbox 
          checked={field.value} 
          onCheckedChange={field.onChange} 
        />
      </FormControl>
      <div className="space-y-1">
        <FormLabel>Produk Unggulan</FormLabel>
        <FormDescription>Tampilkan di section featured products</FormDescription>
      </div>
    </FormItem>
  )} />
</div>
```

**Zod Validation Schema**:
```typescript
const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  category: z.string().min(1, "Kategori harus dipilih"),
  brand: z.string().min(1, "Brand harus diisi"),
  unit: z.string().min(1, "Satuan harus dipilih"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Harga harus lebih dari 0",
  }),
  originalPrice: z.string().optional(),
  stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Stok tidak boleh negatif",
  }),
  minStock: z.string().optional(),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  discount: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});
```

**Image Upload Handler**:
```typescript
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};
```

**Critical Patterns**:
- **MUST use react-hook-form + Zod** for complex forms (12+ fields)
- **Shadcn Checkbox**: Use `<Checkbox checked={value} onCheckedChange={onChange} />` (NOT HTML `<input type="checkbox">`)
- **Checkbox Layout**: `flex items-start space-x-3` with label and description in separate div
- **Section Spacing**: `space-y-8` for form, `space-y-5` for sections, `pt-6 border-t` for visual separation
- **Section Headers**: `text-lg font-semibold border-b pb-2` for clear hierarchy
- **Grid Layouts**: `grid-cols-2` for related pairs, `grid-cols-3` for stock fields
- **FormDescription**: Use for hints and optional field notes
- **Dialog Size**: Use `max-w-5xl` for forms with 12+ fields (NOT max-w-3xl)
- **Image Preview**: FileReader + base64 for client-side preview before upload
- **TODO Comment**: Ready for tRPC mutation to create product

**Important for AI Agents**:
- When creating complex CRUD forms, ALWAYS follow this pattern (sections, spacing, validation)
- Check shadcn component availability BEFORE using HTML primitives (input, select, checkbox)
- For forms with 12+ fields, dialog MUST be max-w-5xl or larger
- Section headers with border-b improve visual hierarchy significantly

### Admin Customers Management
**Location**: `src/pages/admin/customers/index.tsx`

**Purpose**: Manage customer data, view customer information, and track customer activity.

**Key Features**:
- **4 Stats Cards** with Lucide icons:
  - Total Pelanggan (blue, UserCheck) - Total number of customers
  - Pelanggan Aktif (green, UserCheck) - Active customers who made recent orders
  - Pelanggan Tidak Aktif (gray, UserX) - Inactive customers
  - Total Revenue (orange, ShoppingBag) - Total revenue from all customers
- **Filters**:
  - Search Input (Search icon) - Search by name, email, or phone number
  - Status Select - Filter: Semua Status / Aktif / Tidak Aktif
- **Customers Table**: 7 columns
  - Nama (name + city)
  - Kontak (email + phone)
  - Tgl Registrasi (registration date)
  - Total Pesanan (total orders with ShoppingBag icon)
  - Total Belanja (total spent in currency format)
  - Status (Badge: Aktif=green, Tidak Aktif=gray)
  - Aksi (View Detail button with Eye icon)

**View Detail Dialog** (max-w-2xl):
Three sections with full customer information:

**1. Informasi Pelanggan** (Grid 2 columns):
```tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
    <p className="font-medium text-gray-900">{customer.name}</p>
  </div>
  <div>
    <p className="text-sm text-gray-600 mb-1">Status</p>
    <Badge className="bg-green-100 text-green-800">Aktif</Badge>
  </div>
  <div>
    <p className="text-sm text-gray-600 mb-1">Email</p>
    <p className="text-gray-900">{customer.email}</p>
  </div>
  <div>
    <p className="text-sm text-gray-600 mb-1">Nomor Telepon</p>
    <p className="text-gray-900">{customer.phone}</p>
  </div>
</div>
```

**2. Alamat Pengiriman**:
```tsx
<div>
  <p className="text-gray-900">{customer.address.street}</p>
  <p className="text-gray-900">{customer.address.city}, {customer.address.province}</p>
  <p className="text-gray-900">{customer.address.postalCode}</p>
</div>
```

**3. Statistik Pesanan** (Grid 2×2, colored cards):
```tsx
<div className="grid grid-cols-2 gap-4">
  {/* Total Pesanan - Blue */}
  <div className="bg-blue-50 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <ShoppingBag className="h-5 w-5 text-blue-600" />
      <p className="text-sm text-blue-600 font-medium">Total Pesanan</p>
    </div>
    <p className="text-2xl font-bold text-blue-900">{customer.totalOrders}</p>
  </div>
  
  {/* Total Belanja - Green */}
  <div className="bg-green-50 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <ShoppingBag className="h-5 w-5 text-green-600" />
      <p className="text-sm text-green-600 font-medium">Total Belanja</p>
    </div>
    <p className="text-2xl font-bold text-green-900">{formatCurrency(totalSpent)}</p>
  </div>
  
  {/* Tgl Registrasi - Purple */}
  <div className="bg-purple-50 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <Calendar className="h-5 w-5 text-purple-600" />
      <p className="text-sm text-purple-600 font-medium">Tgl Registrasi</p>
    </div>
    <p className="text-sm font-medium text-purple-900">{formatDate(registeredDate)}</p>
  </div>
  
  {/* Pesanan Terakhir - Orange */}
  <div className="bg-orange-50 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <Calendar className="h-5 w-5 text-orange-600" />
      <p className="text-sm text-orange-600 font-medium">Pesanan Terakhir</p>
    </div>
    <p className="text-sm font-medium text-orange-900">
      {lastOrderDate ? formatDate(lastOrderDate) : "Belum ada pesanan"}
    </p>
  </div>
</div>
```

**Customer Interface** (9 fields):
```typescript
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredDate: string; // ISO date
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  lastOrderDate?: string; // ISO date, optional
}
```

**Helper Functions**:
```typescript
// Format date to Indonesian locale
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Format currency to IDR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};
```

**Important Patterns**:
- **Lucide Icons Only**: UserCheck, UserX, ShoppingBag, Calendar, Search, Eye (NO emoji)
- **Shadcn Components**: Table, Dialog, Badge, Card, Button, Input, Select (NO HTML primitives)
- **Status Logic**: Active = has recent orders, Inactive = no orders or old orders
- **Search Filtering**: Case-insensitive search across name, email, and phone
- **Status Filtering**: Filter by all/active/inactive status
- **Empty State**: Show message when no customers found after filtering
- **Color Coding**: Blue (total), Green (active), Gray (inactive), Orange (revenue)
- **Stats Calculation**: Calculate totals dynamically from customer data
- **TODO Comment**: Ready for tRPC query (`trpc.customers.getAll.useQuery()`)

**Dialog Pattern**:
- Size: `max-w-2xl` for customer detail view (not too wide)
- Three distinct sections with headers (`border-b pb-2`)
- Grid layouts for organized information display
- Colored stat cards for visual appeal
- Single action button: "Tutup" (Close)

**Important for AI Agents**:
- When showing customer statistics, always use colored cards with icons
- Format currency with IDR locale (Intl.NumberFormat)
- Format dates with Indonesian locale (id-ID)
- Handle optional fields (lastOrderDate) with fallback text
- Use Lucide icons consistently (NO emoji icons in admin pages)

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

## UI/UX Patterns

### Product Catalog Layout
**Structure** (`src/pages/products/index.tsx`):
- **Sidebar Filters** (left): Categories, price range, stock status, discount - follows page scroll naturally
- **Products Area** (right): Scrollable container with `maxHeight: calc(100vh - 16rem)` - independent scroll
- **View Modes**: Grid (3 columns) and List layouts with toggle
- **Search & Sort**: Input with Lucide Search icon, Select for sorting

**Key Implementation**:
```tsx
<div className="flex flex-col lg:flex-row gap-8 lg:items-start">
  {/* Sidebar - follows page scroll */}
  <aside className="lg:w-64 flex-shrink-0">
    <div className="space-y-6">{/* Filters */}</div>
  </aside>
  
  {/* Products with independent scroll */}
  <main className="flex-1">
    <div style={{ maxHeight: 'calc(100vh - 16rem)' }} className="overflow-y-auto [&::-webkit-scrollbar]:...">
      {/* Product cards */}
    </div>
  </main>
</div>
```

### Icon Usage Guidelines
- **Prefer Lucide React icons** over emoji for professional appearance
- **Installed**: lucide-react package
- **Common icons**: Search, Grid3x3, List, ShoppingCart, Eye, Star, ChevronLeft/Right, RotateCcw, Calculator, Info
- **Import pattern**: `import { IconName } from "lucide-react"`
- **Size convention**: `className="h-4 w-4"` for buttons, `h-5 w-5` for larger elements
- **Avoid emoji icons** (🔍👁️🛒) - they look unprofessional and inconsistent across platforms

### Unit Converter Component
**Purpose**: Allow customers to purchase building materials in their preferred unit (e.g., buy cement in KG when product is sold per SAK)

**Location**: `src/components/UnitConverter.tsx`

**Features**:
- Real-time unit conversion calculator
- Price calculation in custom unit
- Stock availability check in selected unit
- Add to cart with custom unit selection
- Supports 7 product categories: Semen, Keramik, Cat, Besi, Pipa, Kayu, Atap

**Usage Pattern**:
```tsx
<UnitConverter 
  category={product.category}        // Product category (e.g., "Semen")
  productUnit={product.unit}         // Default unit (e.g., "SAK")
  productPrice={product.price}       // Price per unit
  productStock={product.stock}       // Available stock
  onAddToCart={(qty, unit, total) => {
    // Handle add to cart with custom unit
  }}
/>
```

**Base Unit System**:
- Each category has a base unit (e.g., Semen → kg, Keramik → pcs)
- Conversions defined as multiplier to base unit
- Example: 1 SAK = 50kg, 1 Zak = 40kg, 1 Ton = 1000kg

**Props Interface**:
```typescript
interface UnitConverterProps {
  category: string;              // Product category
  productUnit: string;           // Product's default unit
  productPrice: number;          // Price per productUnit
  productStock: number;          // Stock in productUnit
  onAddToCart?: (quantity: number, unit: string, totalPrice: number) => void;
}
```

**DO NOT use Form component** - UnitConverter uses simple `useState` for real-time calculation, NOT react-hook-form

### Form Validation Guidelines
**MUST use Form (react-hook-form + Zod + shadcn Form) for**:
- ✅ Login/Register pages - Email, password validation
- ✅ Checkout forms - Address, phone number validation
- ✅ Admin CRUD - Create/Edit product with multiple fields
- ✅ Contact forms - Email, message validation
- ✅ Profile settings - User information update

**DO NOT use Form for**:
- ❌ Real-time calculators (like UnitConverter) - Use `useState` instead
- ❌ Search inputs - Simple controlled input with `onChange`
- ❌ Quantity selectors - Just state with +/- buttons
- ❌ Filter dropdowns - Direct state management

**Pattern for Simple Inputs**:
```typescript
// ✅ Correct: Simple state for calculator/search
const [value, setValue] = useState("");
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (/^\d*\.?\d*$/.test(e.target.value)) { // Inline validation
    setValue(e.target.value);
  }
};

// ❌ Wrong: Using Form for simple calculator
const form = useForm({ ... }); // Overkill for real-time input
```

## External Dependencies
- **React Query**: Data fetching (via tRPC integration)
- **Zod**: Schema validation for tRPC inputs
- **Radix UI**: Accessible primitives for shadcn components
- **Lucide React**: Professional SVG icon library (1000+ icons)
- **Recharts**: React charting library for data visualization (LineChart, BarChart, etc.)

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
