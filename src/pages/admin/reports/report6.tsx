import AdminLayout from "@/components/layouts/AdminLayout";
import PlaceholderReport from "@/components/reports/PlaceholderReport";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function Report6Page() {
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

      {/* Report 6 Content */}
      <PlaceholderReport
        title="Laporan 6"
        description="Konten laporan 6 sedang dalam pengembangan"
      />
    </AdminLayout>
  );
}
