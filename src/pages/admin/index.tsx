import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Plus, 
  PackageOpen, 
  BarChart3, 
  Ticket,
  AlertTriangle 
} from "lucide-react";
import {trpc} from "@/utils/trpc";
import { useRouter } from "next/router";

// Type for order from database
interface OrderData {
  orderId: string;
  userId: {
    _id: string;
    fullName?: string;
    name?: string;
  } | null;
  items: Array<{ name: string }>;
  total: number;
  orderStatus: string;
  createdAt: string | Date;
}

export default function AdminDashboard() {
  const router = useRouter();
  const {data: dashboardStats, isLoading: statsLoading} = trpc.products.getDashBoardStats.useQuery();
  console.log(dashboardStats);

  // Quick Action Handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-product":
        router.push("/admin/products"); // Go to products page where there's add button
        break;
      case "manage-stock":
        router.push("/admin/inventory"); // Go to inventory page
        break;
      case "view-reports":
        router.push("/admin/reports"); // Go to reports page
        break;
      case "manage-voucher":
        router.push("/admin/vouchers"); // Go to vouchers page
        break;
      default:
        break;
    }
  };

  const stats = [
    {
      title: "Total Produk",
      value: dashboardStats?.totalProducts || "0",
      change: "", // No growth percentage
      context: "produk aktif",
      trend: "neutral" as const,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pesanan Hari Ini",
      value: dashboardStats?.ordersToday?.toString() || "0",
      change: (() => {
        const growth = dashboardStats?.ordersGrowth || 0;
        if (growth === 999) {
          // Special case: new orders (yesterday was 0)
          return "Pesanan Baru!";
        } else if (growth === 0 && dashboardStats?.ordersToday === 0) {
          // Both days are 0
          return "";
        } else {
          // Normal growth calculation
          return `${growth >= 0 ? '+' : ''}${growth}%`;
        }
      })(),
      context: (() => {
        const growth = dashboardStats?.ordersGrowth || 0;
        if (growth === 999 || (growth === 0 && dashboardStats?.ordersToday === 0)) {
          return "pesanan hari ini";
        } else {
          return "vs hari kemarin";
        }
      })(),
      trend: (dashboardStats?.ordersGrowth || 0) >= 0 ? "up" : "down",
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Total Pelanggan",
      value: dashboardStats?.totalCustomer.thisMonth || "0",
      change: (() => {
        const growth = dashboardStats?.totalCustomer.growth || 0;
        return `${growth >= 0 ? '+' : ''}${growth}%`;
      })(),
      context: "vs bulan lalu",
      trend: dashboardStats?.totalCustomer.trend || "up",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Revenue Bulan Ini",
      value: dashboardStats?.totalRevenue.formatted || "Rp 0",
      change: (() => {
        const growth = dashboardStats?.totalRevenue.growth || 0;
        return `${growth >= 0 ? '+' : ''}${growth}%`;
      })(),
      context: "vs bulan lalu",
      trend: dashboardStats?.totalRevenue.trend || "up",
      icon: DollarSign,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  // Format time ago helper
  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Map real orders to display format
  const rawOrders = (dashboardStats?.recentOrders || []) as unknown as OrderData[];
  const recentOrders = rawOrders.map((order) => ({
    id: order.orderId || "N/A",
    customer: order.userId?.fullName || order.userId?.name || "Unknown",
    product: order.items && order.items.length > 1 
      ? `${order.items[0]?.name || "Produk"} +${order.items.length - 1} lainnya`
      : order.items?.[0]?.name || "Tidak ada produk",
    amount: formatCurrency(order.total || 0),
    status: order.orderStatus || "pending",
    time: getTimeAgo(order.createdAt || new Date()),
  }));

   const lowStockProducts = (dashboardStats?.lowStockProducts as Array<{
    name: string;
    stock: number;
    minStock: number;
    category: string;
    unit: string;
  }>) || [];

  // const lowStockProducts = [
  //   { name: "Semen Tiga Roda 50kg", stock: 12, min: 50, category: "Semen" },
  //   { name: "Pipa PVC 3 inch", stock: 8, min: 30, category: "Pipa" },
  //   { name: "Cat Dulux 5kg", stock: 15, min: 40, category: "Cat" },
  //   { name: "Genteng Metal", stock: 25, min: 100, category: "Atap" },
  // ];

      const now = new Date();
  console.log(new Date(now.getFullYear(), now.getMonth(), 1).toISOString());

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Menunggu Bayar", className: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Dibayar", className: "bg-blue-100 text-blue-800" },
      processing: { label: "Diproses", className: "bg-indigo-100 text-indigo-800" },
      shipped: { label: "Dikirim", className: "bg-purple-100 text-purple-800" },
      delivered: { label: "Terkirim", className: "bg-teal-100 text-teal-800" },
      completed: { label: "Selesai", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-800" },
    };
    const variant = variants[status] || variants.pending;
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  if(statsLoading){
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-gray-600">Memuat data dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Selamat Datang, Admin! 👋
        </h2>
        <p className="text-gray-600">
          Berikut adalah ringkasan aktivitas toko Anda hari ini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </h3>
                <div className="flex items-center gap-1">
                  {stat.change && (
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                  )}
                  <span className="text-gray-500 text-xs">{stat.context}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                {stat.icon && <stat.icon className="h-6 w-6" />}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Pesanan Terbaru
            </h3>
            <button className="text-primary hover:underline text-sm">
              Lihat Semua →
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">
                        {order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{order.customer}</p>
                    <p className="text-xs text-gray-500">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 mb-1">
                      {order.amount}
                    </p>
                    <p className="text-xs text-gray-500">{order.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada pesanan</p>
              </div>
            )}
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Stok Menipis
            </h3>
          </div>
          <div className="space-y-4">
            {lowStockProducts.map((product, index) => (
              <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm mb-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {product.stock} {product.unit}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${(product.stock / product.minStock) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Min. stok: {product.minStock} {product.unit}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Aksi Cepat
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            onClick={() => handleQuickAction("add-product")}
          >
            <div className="text-center">
              <Plus className="h-10 w-10 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-gray-900">Tambah Produk</p>
            </div>
          </Card>
          <Card 
            className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            onClick={() => handleQuickAction("manage-stock")}
          >
            <div className="text-center">
              <PackageOpen className="h-10 w-10 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-gray-900">Kelola Stok</p>
            </div>
          </Card>
          <Card 
            className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            onClick={() => handleQuickAction("view-reports")}
          >
            <div className="text-center">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-gray-900">Lihat Laporan</p>
            </div>
          </Card>
          <Card 
            className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            onClick={() => handleQuickAction("manage-voucher")}
          >
            <div className="text-center">
              <Ticket className="h-10 w-10 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-gray-900">Kelola Voucher</p>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
