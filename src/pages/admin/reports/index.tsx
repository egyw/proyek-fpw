import AdminLayout from "@/components/layouts/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PeriodicSalesReport from "@/components/reports/PeriodicSalesReport";
import CategorySalesReport from "@/components/reports/CategorySalesReport";
import PaymentMethodReport from "@/components/reports/PaymentMethodReport";
import BestSellerReportContent from "@/components/reports/BestSellerReportContent";
import LowStockReportContent from "@/components/reports/LowStockReportContent";
import SlowMovingReportContent from "@/components/reports/SlowMovingReportContent";
import ReturnReportContent from "@/components/reports/ReturnReportContent";
import TopCustomersReportContent from "@/components/reports/TopCustomersReportContent";
import NewCustomersReportContent from "@/components/reports/NewCustomersReportContent";
import OrderStatusSummaryReportContent from "@/components/reports/OrderStatusSummaryReportContent";

export default function ReportsPage() {

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
        <p className="text-gray-600 mt-2">
          Akses berbagai laporan bisnis dan analisis performa
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="periodic" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-gray-100 p-2 rounded-lg">
          <TabsTrigger value="periodic" className="data-[state=active]:bg-white">
            Penjualan Periodik
          </TabsTrigger>
          <TabsTrigger value="category" className="data-[state=active]:bg-white">
            Per Kategori
          </TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-white">
            Metode Pembayaran
          </TabsTrigger>
          <TabsTrigger value="best-seller" className="data-[state=active]:bg-white">
            Produk Terlaris
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="data-[state=active]:bg-white">
            Stok Rendah
          </TabsTrigger>
          <TabsTrigger value="slow-moving" className="data-[state=active]:bg-white">
            Stok Kurang Laku
          </TabsTrigger>
          <TabsTrigger value="return" className="data-[state=active]:bg-white">
            Retur Barang
          </TabsTrigger>
          <TabsTrigger value="top-customers" className="data-[state=active]:bg-white">
            Pelanggan Teratas
          </TabsTrigger>
          <TabsTrigger value="new-customers" className="data-[state=active]:bg-white">
            Pelanggan Baru
          </TabsTrigger>
          <TabsTrigger value="order-status" className="data-[state=active]:bg-white">
            Status Pesanan
          </TabsTrigger>
        </TabsList>

        {/* Report 1: Periodic Sales */}
        <TabsContent value="periodic">
          <PeriodicSalesReport />
        </TabsContent>

        {/* Report 2: Category Sales */}
        <TabsContent value="category">
          <CategorySalesReport />
        </TabsContent>

        {/* Report 3: Payment Methods */}
        <TabsContent value="payment">
          <PaymentMethodReport />
        </TabsContent>

        {/* Report 4: Best Seller */}
        <TabsContent value="best-seller">
          <BestSellerReportContent />
        </TabsContent>

        {/* Report 5: Low Stock */}
        <TabsContent value="low-stock">
          <LowStockReportContent />
        </TabsContent>

        {/* Report 6: Slow-Moving */}
        <TabsContent value="slow-moving">
          <SlowMovingReportContent />
        </TabsContent>

        {/* Report 7: Return Report */}
        <TabsContent value="return">
          <ReturnReportContent />
        </TabsContent>

        {/* Report 8: Top Customers */}
        <TabsContent value="top-customers">
          <TopCustomersReportContent />
        </TabsContent>

        {/* Report 9: New Customers Registration */}
        <TabsContent value="new-customers">
          <NewCustomersReportContent />
        </TabsContent>

        {/* Report 10: Order Status Summary */}
        <TabsContent value="order-status">
          <OrderStatusSummaryReportContent />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
