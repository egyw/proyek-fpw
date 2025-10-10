import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Search,
  Grid3x3,
  List,
  ShoppingCart,
  Eye,
  Star,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from "lucide-react";

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Dummy data - nanti akan diganti dengan tRPC
  const categories = [
    { name: "Semua Produk", count: 1234, slug: "all" },
    { name: "Semen", count: 156, slug: "semen" },
    { name: "Besi", count: 234, slug: "besi" },
    { name: "Cat", count: 189, slug: "cat" },
    { name: "Pipa", count: 145, slug: "pipa" },
    { name: "Keramik", count: 267, slug: "keramik" },
    { name: "Kayu", count: 98, slug: "kayu" },
    { name: "Atap", count: 145, slug: "atap" },
  ];

  // TODO: Replace with tRPC query
  // Expected API: trpc.products.getAll.useQuery()
  // Input: { categoryId?: string, search?: string, sortBy?: string, minPrice?: number, maxPrice?: number }
  // Output: Product[]
  const products = [
    {
      id: "68b8340ed2788dc4d9e608b1",
      name: "Semen Gresik 50kg",
      slug: "semen-gresik-50kg",
      category: "Semen",
      brand: "Gresik",
      unit: "SAK",
      price: 65000,
      originalPrice: 81250,
      discount: { percentage: 20, validUntil: "2025-12-31T23:59:59Z" },
      stock: 150,
      minStock: 20,
      images: ["/images/dummy_image.jpg"],
      description: "Semen Portland berkualitas tinggi untuk konstruksi bangunan.",
      rating: { average: 4.8, count: 234 },
      sold: 234,
      views: 1250,
      attributes: { type: "Portland Type I", weight: "50kg", origin: "Indonesia" },
      isActive: true,
      isFeatured: false,
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-04-01T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b2",
      name: "Cat Tembok Avian 5kg Putih",
      slug: "cat-tembok-avian-5kg-putih",
      category: "Cat",
      brand: "Avian",
      unit: "KALENG",
      price: 180000,
      originalPrice: 211765,
      discount: { percentage: 15, validUntil: "2025-11-30T23:59:59Z" },
      stock: 45,
      minStock: 10,
      images: ["/images/dummy_image.jpg"],
      description: "Cat tembok interior premium dengan daya tutup maksimal.",
      rating: { average: 4.7, count: 189 },
      sold: 189,
      views: 890,
      attributes: { color: "Putih", weight: "5kg", coverage: "8-10 m2/kg", finish: "Matte" },
      isActive: true,
      isFeatured: true,
      createdAt: "2025-02-10T00:00:00Z",
      updatedAt: "2025-04-05T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b3",
      name: "Besi Beton 10mm Panjang 12m",
      slug: "besi-beton-10mm-panjang-12m",
      category: "Besi",
      brand: "Krakatau Steel",
      unit: "BATANG",
      price: 85000,
      originalPrice: 121429,
      discount: { percentage: 30, validUntil: "2025-10-31T23:59:59Z" },
      stock: 8,
      minStock: 15,
      images: ["/images/dummy_image.jpg"],
      description: "Besi beton SNI untuk struktur bangunan yang kuat dan tahan lama.",
      rating: { average: 4.9, count: 156 },
      sold: 156,
      views: 678,
      attributes: { diameter: "10mm", length: "12m", standard: "SNI", grade: "BjTS 420" },
      isActive: true,
      isFeatured: false,
      createdAt: "2025-01-20T00:00:00Z",
      updatedAt: "2025-04-02T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b4",
      name: "Keramik Platinum 40x40 Glossy",
      slug: "keramik-platinum-40x40-glossy",
      category: "Keramik",
      brand: "Platinum",
      unit: "DUS",
      price: 42000,
      originalPrice: 56000,
      discount: { percentage: 25, validUntil: "2025-12-15T23:59:59Z" },
      stock: 200,
      minStock: 30,
      images: ["/images/dummy_image.jpg"],
      description: "Keramik lantai glossy dengan permukaan mengkilap dan tahan lama.",
      rating: { average: 4.6, count: 423 },
      sold: 423,
      views: 2100,
      attributes: { size: "40x40 cm", finish: "Glossy", pcs_per_box: "4", coverage: "0.64 m2/dus" },
      isActive: true,
      isFeatured: true,
      createdAt: "2025-01-05T00:00:00Z",
      updatedAt: "2025-04-08T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b5",
      name: "Pipa PVC Rucika 3 inch",
      slug: "pipa-pvc-rucika-3-inch",
      category: "Pipa",
      brand: "Rucika",
      unit: "BATANG",
      price: 45000,
      originalPrice: undefined,
      discount: undefined,
      stock: 87,
      minStock: 20,
      images: ["/images/dummy_image.jpg"],
      description: "Pipa PVC berkualitas untuk instalasi air bersih dan limbah.",
      rating: { average: 4.8, count: 298 },
      sold: 298,
      views: 1450,
      attributes: { diameter: "3 inch", length: "4m", type: "AW/D", standard: "SNI" },
      isActive: true,
      isFeatured: false,
      createdAt: "2025-02-20T00:00:00Z",
      updatedAt: "2025-04-01T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b6",
      name: "Semen Tiga Roda 50kg",
      slug: "semen-tiga-roda-50kg",
      category: "Semen",
      brand: "Tiga Roda",
      unit: "SAK",
      price: 62000,
      originalPrice: undefined,
      discount: undefined,
      stock: 180,
      minStock: 25,
      images: ["/images/dummy_image.jpg"],
      description: "Semen berkualitas untuk berbagai jenis konstruksi.",
      rating: { average: 4.7, count: 334 },
      sold: 334,
      views: 1680,
      attributes: { type: "Portland Type I", weight: "50kg", origin: "Indonesia" },
      isActive: true,
      isFeatured: false,
      createdAt: "2025-01-18T00:00:00Z",
      updatedAt: "2025-03-28T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b7",
      name: "Genteng Metal Pasir Merah",
      slug: "genteng-metal-pasir-merah",
      category: "Atap",
      brand: "Surya Roof",
      unit: "LEMBAR",
      price: 35000,
      originalPrice: undefined,
      discount: undefined,
      stock: 456,
      minStock: 50,
      images: ["/images/dummy_image.jpg"],
      description: "Genteng metal anti karat dengan coating pasir berkualitas.",
      rating: { average: 4.5, count: 567 },
      sold: 567,
      views: 2850,
      attributes: { color: "Merah", material: "Metal + Coating Pasir", length: "240cm", thickness: "0.3mm" },
      isActive: true,
      isFeatured: true,
      createdAt: "2025-01-10T00:00:00Z",
      updatedAt: "2025-04-06T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b8",
      name: "Triplek 9mm 122x244cm",
      slug: "triplek-9mm-122x244cm",
      category: "Kayu",
      brand: "Surabaya Plywood",
      unit: "LEMBAR",
      price: 95000,
      originalPrice: undefined,
      discount: undefined,
      stock: 76,
      minStock: 15,
      images: ["/images/dummy_image.jpg"],
      description: "Triplek berkualitas untuk furniture dan konstruksi interior.",
      rating: { average: 4.6, count: 234 },
      sold: 234,
      views: 980,
      attributes: { thickness: "9mm", size: "122x244 cm", grade: "Grade A", plies: "7 ply" },
      isActive: true,
      isFeatured: false,
      createdAt: "2025-02-05T00:00:00Z",
      updatedAt: "2025-04-03T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b9",
      name: "Cat Dulux 5kg Warna Custom",
      slug: "cat-dulux-5kg-warna-custom",
      category: "Cat",
      brand: "Dulux",
      unit: "KALENG",
      price: 195000,
      originalPrice: undefined,
      discount: undefined,
      stock: 34,
      minStock: 10,
      images: ["/images/dummy_image.jpg"],
      description: "Cat premium dengan ribuan pilihan warna custom sesuai keinginan.",
      rating: { average: 4.9, count: 145 },
      sold: 145,
      views: 720,
      attributes: { color: "Custom", weight: "5kg", coverage: "10-12 m2/kg", finish: "Satin" },
      isActive: true,
      isFeatured: true,
      createdAt: "2025-02-15T00:00:00Z",
      updatedAt: "2025-04-07T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608ba",
      name: "Besi Hollow 4x4cm Tebal 1.2mm",
      slug: "besi-hollow-4x4cm-tebal-1-2mm",
      category: "Besi",
      brand: "Gunung Garuda",
      unit: "BATANG",
      price: 78000,
      originalPrice: undefined,
      discount: undefined,
      stock: 123,
      minStock: 20,
      images: ["/images/dummy_image.jpg"],
      description: "Besi hollow untuk rangka pintu, jendela, dan konstruksi ringan.",
      rating: { average: 4.7, count: 189 },
      sold: 189,
      views: 890,
      attributes: { size: "4x4 cm", thickness: "1.2mm", length: "6m", standard: "SNI" },
      isActive: true,
      isFeatured: false,
      createdAt: "2025-01-25T00:00:00Z",
      updatedAt: "2025-04-04T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608bb",
      name: "Keramik Roman 30x30 Motif",
      slug: "keramik-roman-30x30-motif",
      category: "Keramik",
      brand: "Roman",
      unit: "DUS",
      price: 38000,
      originalPrice: undefined,
      discount: undefined,
      stock: 234,
      minStock: 30,
      images: ["/images/dummy_image.jpg"],
      description: "Keramik lantai dengan motif modern untuk ruangan elegan.",
      rating: { average: 4.6, count: 345 },
      sold: 345,
      views: 1450,
      attributes: { size: "30x30 cm", finish: "Matt", pcs_per_box: "11", coverage: "0.99 m2/dus" },
      isActive: true,
      isFeatured: false,
      createdAt: "2025-01-08T00:00:00Z",
      updatedAt: "2025-04-02T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608bc",
      name: "Pipa Wavin 2 inch AW/D",
      slug: "pipa-wavin-2-inch-aw-d",
      category: "Pipa",
      brand: "Wavin",
      unit: "BATANG",
      price: 32000,
      originalPrice: undefined,
      discount: undefined,
      stock: 156,
      minStock: 25,
      images: ["/images/dummy_image.jpg"],
      description: "Pipa PVC Wavin standar SNI untuk air bersih dan limbah.",
      rating: { average: 4.8, count: 267 },
      sold: 267,
      views: 1120,
      attributes: { diameter: "2 inch", length: "4m", type: "AW/D", standard: "SNI" },
      isActive: true,
      isFeatured: false,
      createdAt: "2025-02-18T00:00:00Z",
      updatedAt: "2025-03-30T00:00:00Z",
    },
  ];

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary">
              Beranda
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Produk</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="space-y-6" id="sidebar-filters">
              {/* Categories */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Kategori</h3>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          category.slug === "all"
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {category.name}
                          </span>
                          <span
                            className={`text-xs ${
                              category.slug === "all"
                                ? "text-white/80"
                                : "text-gray-500"
                            }`}
                          >
                            {category.count}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Price Range */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Range Harga
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Harga Minimum
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Harga Maximum
                    </label>
                    <Input
                      type="number"
                      placeholder="1000000"
                      className="w-full"
                    />
                  </div>
                  <Button className="w-full" size="sm">
                    Terapkan Filter
                  </Button>
                </div>
              </Card>

              {/* Stock Status */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Status Stok
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded"
                      defaultChecked
                    />
                    <span className="text-sm text-gray-700">
                      Tersedia (1,189)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Pre-Order (45)
                    </span>
                  </label>
                </div>
              </Card>

              {/* Discount */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Diskon</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Produk Diskon
                    </span>
                  </label>
                </div>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Katalog Produk
              </h1>
              <p className="text-gray-600">
                Temukan material bangunan berkualitas untuk kebutuhan Anda
              </p>
            </div>

            {/* Search & Sort Bar */}
            <Card className="p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari produk berdasarkan nama..."
                    className="w-full pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="popular">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Terpopuler</SelectItem>
                      <SelectItem value="newest">Terbaru</SelectItem>
                      <SelectItem value="price-low">Harga Terendah</SelectItem>
                      <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                      <SelectItem value="name">Nama A-Z</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 text-sm flex items-center gap-2 ${
                        viewMode === "grid"
                          ? "bg-primary text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Grid3x3 className="h-4 w-4" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-2 text-sm border-l border-gray-300 flex items-center gap-2 ${
                        viewMode === "list"
                          ? "bg-primary text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <List className="h-4 w-4" />
                      List
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold">1-12</span> dari{" "}
                <span className="font-semibold">1,234</span> produk
              </p>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Filter
              </Button>
            </div>

            {/* Products Grid */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {products.map((product) =>
                viewMode === "grid" ? (
                  // Grid View
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative h-48">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discount && product.discount.percentage > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                          -{product.discount.percentage}%
                        </Badge>
                      )}
                      {product.stock < 50 && product.stock > 0 && (
                        <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">
                          Stok Terbatas
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {product.category}
                      </Badge>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {product.rating.average}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({product.sold} terjual)
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            Rp {product.price.toLocaleString("id-ID")}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              Rp {product.originalPrice.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" size="sm">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Keranjang
                        </Button>
                        <Link href={`/products/${product.slug}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ) : (
                  // List View
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                        {product.discount && product.discount.percentage > 0 && (
                          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                            -{product.discount.percentage}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge variant="outline" className="mb-2 text-xs">
                              {product.category}
                            </Badge>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {product.rating.average}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({product.sold} terjual)
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl font-bold text-primary">
                                Rp {product.price.toLocaleString("id-ID")}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                  Rp{" "}
                                  {product.originalPrice.toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              Stok: {product.stock} {product.unit.toLowerCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Tambah ke Keranjang
                          </Button>
                          <Link href={`/products/${product.slug}`}>
                            <Button variant="outline" size="sm">
                              Lihat Detail
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              )}
            </div>
            {/* End Products Grid */}

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                4
              </Button>
              <Button variant="outline" size="sm">
                5
              </Button>
              <Button variant="outline" size="sm">
                Selanjutnya
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
