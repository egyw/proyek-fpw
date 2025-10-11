import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package } from "lucide-react";

// TODO: Replace with tRPC query
interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
  products: number;
}

interface StatsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

const dummyMonthlyData: MonthlyData[] = [
  { month: "Jan", revenue: 45000000, orders: 120, products: 850 },
  { month: "Feb", revenue: 52000000, orders: 145, products: 920 },
  { month: "Mar", revenue: 48000000, orders: 135, products: 880 },
  { month: "Apr", revenue: 61000000, orders: 168, products: 1050 },
  { month: "Mei", revenue: 55000000, orders: 152, products: 980 },
  { month: "Jun", revenue: 67000000, orders: 185, products: 1150 },
  { month: "Jul", revenue: 72000000, orders: 198, products: 1280 },
  { month: "Ags", revenue: 69000000, orders: 192, products: 1220 },
  { month: "Sep", revenue: 78000000, orders: 215, products: 1350 },
  { month: "Okt", revenue: 82000000, orders: 228, products: 1420 },
  { month: "Nov", revenue: 0, orders: 0, products: 0 },
  { month: "Des", revenue: 0, orders: 0, products: 0 },
];

const dummyStats: StatsData = {
  totalRevenue: 629000000,
  totalOrders: 1738,
  totalProducts: 11100,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
};

export default function SalesReportContent() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const filteredData = dummyMonthlyData.filter((item) => item.revenue > 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
          <p className="text-sm text-gray-600">
            Revenue: <span className="font-semibold text-primary">{formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Pesanan: <span className="font-semibold">{formatNumber(payload[0].payload.orders)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Produk Terjual: <span className="font-semibold">{formatNumber(payload[0].payload.products)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Laporan Penjualan</h2>
          <p className="text-gray-600 mt-1">
            Analisis performa penjualan dan revenue bisnis Anda
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={(value: "line" | "bar") => setChartType(value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Tipe Chart" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(dummyStats.totalRevenue)}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{dummyStats.revenueGrowth}%
                </span>
                <span className="text-sm text-gray-600">vs bulan lalu</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(dummyStats.totalOrders)}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{dummyStats.ordersGrowth}%
                </span>
                <span className="text-sm text-gray-600">vs bulan lalu</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produk Terjual</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(dummyStats.totalProducts)}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">-2.4%</span>
                <span className="text-sm text-gray-600">vs bulan lalu</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Grafik Penjualan Bulanan {selectedYear}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Menampilkan revenue per bulan dalam bentuk {chartType === "line" ? "line chart" : "bar chart"}
          </p>
        </div>

        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "14px" }} iconType="line" />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (Rp)"
                  stroke="#1a5fa4"
                  strokeWidth={3}
                  dot={{ fill: "#1a5fa4", r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "14px" }} iconType="rect" />
                <Bar
                  dataKey="revenue"
                  name="Revenue (Rp)"
                  fill="#1a5fa4"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Export Actions */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Export Laporan</h3>
            <p className="text-sm text-gray-600 mt-1">
              Download laporan penjualan dalam format PDF atau Excel
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Export PDF</Button>
            <Button>Export Excel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
