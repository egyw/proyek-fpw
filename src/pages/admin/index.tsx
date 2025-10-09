import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  // Dummy data - nanti akan diganti dengan tRPC
  const stats = [
    {
      title: "Total Produk",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: "📦",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pesanan Hari Ini",
      value: "89",
      change: "+23%",
      trend: "up",
      icon: "🛒",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Total Pelanggan",
      value: "5,678",
      change: "+8%",
      trend: "up",
      icon: "👥",
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Revenue Bulan Ini",
      value: "Rp 125jt",
      change: "+15%",
      trend: "up",
      icon: "💰",
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "Ahmad Fauzi",
      product: "Semen Gresik 50kg",
      amount: "Rp 650.000",
      status: "pending",
      time: "5 menit lalu",
    },
    {
      id: "ORD-002",
      customer: "Siti Nurhaliza",
      product: "Cat Tembok Avian 5kg",
      amount: "Rp 1.800.000",
      status: "processing",
      time: "15 menit lalu",
    },
    {
      id: "ORD-003",
      customer: "Budi Santoso",
      product: "Besi Beton 10mm",
      amount: "Rp 4.250.000",
      status: "completed",
      time: "1 jam lalu",
    },
    {
      id: "ORD-004",
      customer: "Dewi Lestari",
      product: "Keramik Platinum 40x40",
      amount: "Rp 2.100.000",
      status: "completed",
      time: "2 jam lalu",
    },
  ];

  const lowStockProducts = [
    { name: "Semen Tiga Roda 50kg", stock: 12, min: 50, category: "Semen" },
    { name: "Pipa PVC 3 inch", stock: 8, min: 30, category: "Pipa" },
    { name: "Cat Dulux 5kg", stock: 15, min: 40, category: "Cat" },
    { name: "Genteng Metal", stock: 25, min: 100, category: "Atap" },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Menunggu", className: "bg-yellow-100 text-yellow-800" },
      processing: { label: "Diproses", className: "bg-blue-100 text-blue-800" },
      completed: { label: "Selesai", className: "bg-green-100 text-green-800" },
    };
    const variant = variants[status] || variants.pending;
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

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
                  <span className="text-green-600 text-sm font-medium">
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-xs">vs bulan lalu</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
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
            {recentOrders.map((order) => (
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
            ))}
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">⚠️</span>
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
                    {product.stock} pcs
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${(product.stock / product.min) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Min. stok: {product.min} pcs
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
          <Card className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105">
            <div className="text-center">
              <div className="text-3xl mb-2">➕</div>
              <p className="text-sm font-medium text-gray-900">Tambah Produk</p>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105">
            <div className="text-center">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm font-medium text-gray-900">Kelola Stok</p>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm font-medium text-gray-900">Lihat Laporan</p>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105">
            <div className="text-center">
              <div className="text-3xl mb-2">🏷️</div>
              <p className="text-sm font-medium text-gray-900">Atur Promo</p>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
