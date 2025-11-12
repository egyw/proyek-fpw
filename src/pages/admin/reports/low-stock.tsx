import AdminLayout from '@/components/layouts/AdminLayout';
import LowStockReportContent from '@/components/reports/LowStockReportContent';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LowStockReportPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/admin/reports">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Kembali ke Laporan
            </Button>
          </Link>
        </div>

        {/* Report Content */}
        <LowStockReportContent />
      </div>
    </AdminLayout>
  );
}
