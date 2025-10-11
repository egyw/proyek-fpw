import AdminLayout from "@/components/layouts/AdminLayout";
import PlaceholderReport from "@/components/reports/PlaceholderReport";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function Report5Page() {
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

      {/* Report 5 Content */}
      <PlaceholderReport
        title="Laporan 5"
        description="Konten laporan 5 sedang dalam pengembangan"
      />
    </AdminLayout>
  );
}
