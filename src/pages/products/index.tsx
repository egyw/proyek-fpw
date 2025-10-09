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

  const products = [
    {
      id: 1,
      name: "Semen Gresik 50kg",
      category: "Semen",
      price: 65000,
      originalPrice: 81250,
      discount: 20,
      stock: 150,
      sold: 234,
      rating: 4.8,
      image: "/images/dummy_image.jpg",
    },
    {
      id: 2,
      name: "Cat Tembok Avian 5kg Putih",
      category: "Cat",
      price: 180000,
      originalPrice: 211765,
      discount: 15,
      stock: 45,
      sold: 189,
      rating: 4.7,
      image: "/images/dummy_image.jpg",
    },
    {
      id: 3,
      name: "Besi Beton 10mm Panjang 12m",
      category: "Besi",
      price: 85000,
      originalPrice: 121429,
      discount: 30,
      stock: 8,
      sold: 156,
      rating: 4.9,
      image: "/images/dummy_image.jpg",
    },
    {
      id: 4,
      name: "Keramik Platinum 40x40 Glossy",
      category: "Keramik",
      price: 42000,
      originalPrice: 56000,
      discount: 25,
      stock: 200,
      sold: 423,
      rating: 4.6,
      image: "/images/dummy_image.jpg",
    },
    {
      id: 5,
      name: "Pipa PVC Rucika 3 inch",
      category: "Pipa",
      price: 45000,
      originalPrice: null,
      discount: 0,
      stock: 87,
      sold: 298,
      rating: 4.8,
      image: "/images/dummy_image.jpg",
    },
    {
      id: 6,
      name: "Semen Tiga Roda 50kg",
      category: "Semen",
      price: 62000,
      originalPrice: null,
      discount: 0,
      stock: 180,
      sold: 334,
      rating: 4.7,
      image: "/images/dummy_image.jpg",
    },
    {
      id: 7,
      name: "Genteng Metal Pasir Merah",
      category: "Atap",
      price: 35000,
      originalPrice: null,
      discount: 0,
      stock: 456,
      sold: 567,
      rating: 4.5,
      image: "/images/dummy_image.jpg",
    },
    {
      id: 8,
      name: "Triplek 9mm 122x244cm",
      category: "Kayu",
      price: 95000,
      originalPrice: null,
      discount: 0,
      stock: 76,
      sold: 234,
      rating: 4.6,
      image: "/images/dummy_image.jpg",
    },
    {
      id: 9,
      name: "Cat Dulux 5kg Warna Custom",
      category: "Cat",
      price: 195000,
      originalPrice: null,
      discount: 0,
      stock: 34,
      sold: 145,
      rating: 4.9,
      image: "/images/dummy_image.jpg",
    },
    {
      id: 10,
      name: "Besi Hollow 4x4cm Tebal 1.2mm",
      category: "Besi",
      price: 78000,
      originalPrice: null,
      discount: 0,
      stock: 123,
      sold: 189,
      rating: 4.7,
      image: "/images/dummy_image.jpg",
    },
    {
      id: 11,
      name: "Keramik Roman 30x30 Motif",
      category: "Keramik",
      price: 38000,
      originalPrice: null,
      discount: 0,
      stock: 234,
      sold: 345,
      rating: 4.6,
      image: "/images/dummy_image.jpg",
    },
    {
      id: 12,
      name: "Pipa Wavin 2 inch AW/D",
      category: "Pipa",
      price: 32000,
      originalPrice: null,
      discount: 0,
      stock: 156,
      sold: 267,
      rating: 4.8,
      image: "/images/dummy_image.jpg",
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

            {/* Products Container with Scroll - Match Sidebar Height */}
            <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
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
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discount > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                          -{product.discount}%
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
                          {product.rating}
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
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
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
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                        {product.discount > 0 && (
                          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                            -{product.discount}%
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
                                {product.rating}
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
                              Stok: {product.stock} pcs
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Tambah ke Keranjang
                          </Button>
                          <Button variant="outline" size="sm">
                            Lihat Detail
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              )}
              </div>
              {/* End Products Grid */}
            </div>
            {/* End Products Container */}

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
