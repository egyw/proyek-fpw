import AdminLayout from "@/components/layouts/AdminLayout";
import OrderStatusSummaryReportContent from "@/components/reports/OrderStatusSummaryReportContent";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function Report10Page() {
  return (
    <AdminLayout>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Laporan
        </Link>
      </div>

      {/* Report 10 Content - Laporan Ringkasan Status Pesanan */}
      <OrderStatusSummaryReportContent />
    </AdminLayout>
  );
}
