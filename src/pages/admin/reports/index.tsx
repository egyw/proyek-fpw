import AdminLayout from "@/components/layouts/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesReportContent from "@/components/reports/SalesReportContent";
import PlaceholderReport from "@/components/reports/PlaceholderReport";

export default function ReportsPage() {
  const placeholderReports = [
    {
      value: "report2",
      title: "Laporan 2",
      description: "Konten laporan 2 sedang dalam pengembangan",
    },
    {
      value: "report3",
      title: "Laporan 3",
      description: "Konten laporan 3 sedang dalam pengembangan",
    },
    {
      value: "report4",
      title: "Laporan 4",
      description: "Konten laporan 4 sedang dalam pengembangan",
    },
    {
      value: "report5",
      title: "Laporan 5",
      description: "Konten laporan 5 sedang dalam pengembangan",
    },
    {
      value: "report6",
      title: "Laporan 6",
      description: "Konten laporan 6 sedang dalam pengembangan",
    },
    {
      value: "report7",
      title: "Laporan 7",
      description: "Konten laporan 7 sedang dalam pengembangan",
    },
    {
      value: "report8",
      title: "Laporan 8",
      description: "Konten laporan 8 sedang dalam pengembangan",
    },
    {
      value: "report9",
      title: "Laporan 9",
      description: "Konten laporan 9 sedang dalam pengembangan",
    },
    {
      value: "report10",
      title: "Laporan 10",
      description: "Konten laporan 10 sedang dalam pengembangan",
    },
  ];

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
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-gray-100 p-2 rounded-lg">
          <TabsTrigger value="sales" className="data-[state=active]:bg-white">
            Laporan Penjualan
          </TabsTrigger>
          <TabsTrigger value="report2" className="data-[state=active]:bg-white">
            Laporan 2
          </TabsTrigger>
          <TabsTrigger value="report3" className="data-[state=active]:bg-white">
            Laporan 3
          </TabsTrigger>
          <TabsTrigger value="report4" className="data-[state=active]:bg-white">
            Laporan 4
          </TabsTrigger>
          <TabsTrigger value="report5" className="data-[state=active]:bg-white">
            Laporan 5
          </TabsTrigger>
          <TabsTrigger value="report6" className="data-[state=active]:bg-white">
            Laporan 6
          </TabsTrigger>
          <TabsTrigger value="report7" className="data-[state=active]:bg-white">
            Laporan 7
          </TabsTrigger>
          <TabsTrigger value="report8" className="data-[state=active]:bg-white">
            Laporan 8
          </TabsTrigger>
          <TabsTrigger value="report9" className="data-[state=active]:bg-white">
            Laporan 9
          </TabsTrigger>
          <TabsTrigger value="report10" className="data-[state=active]:bg-white">
            Laporan 10
          </TabsTrigger>
        </TabsList>

        {/* Sales Report Content */}
        <TabsContent value="sales">
          <SalesReportContent />
        </TabsContent>

        {/* Placeholder Reports */}
        {placeholderReports.map((report) => (
          <TabsContent key={report.value} value={report.value}>
            <PlaceholderReport title={report.title} description={report.description} />
          </TabsContent>
        ))}
      </Tabs>
    </AdminLayout>
  );
}
