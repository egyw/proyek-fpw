import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Info } from "lucide-react";

interface PlaceholderReportProps {
  title: string;
  description: string;
}

export default function PlaceholderReport({ title, description }: PlaceholderReportProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Coming Soon</h3>
            <p className="text-gray-600">
              Laporan ini sedang dalam tahap pengembangan dan akan segera tersedia.
            </p>
          </div>
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 w-full text-left">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Anda akan dapat mengakses analisis lengkap, grafik interaktif, dan export data untuk laporan ini dalam waktu dekat.
            </p>
          </div>
          <Button disabled className="mt-4">
            Coming Soon
          </Button>
        </div>
      </Card>
    </div>
  );
}
