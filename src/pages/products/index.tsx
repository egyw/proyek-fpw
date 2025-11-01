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
import { useState, useEffect } from "react";
import {
  Search,
  Grid3x3,
  List,
  ShoppingCart,
  Star,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

export default function ProductsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Read query parameters on mount (for deep linking with filters)
  useEffect(() => {
    if (router.isReady) {
      // Set category from URL query parameter
      if (router.query.category && typeof router.query.category === "string") {
        setSelectedCategory(router.query.category);
      }
      
      // Set discount filter from URL query parameter
      if (router.query.discount === "true") {
        setHasDiscount(true);
      }
      
      // Set search query from URL
      if (router.query.search && typeof router.query.search === "string") {
        setSearchQuery(router.query.search);
      }
      
      // Set sort option from URL
      if (router.query.sortBy && typeof router.query.sortBy === "string") {
        setSortBy(router.query.sortBy);
      }
    }
  }, [router.isReady, router.query]);

  const ITEMS_PER_PAGE = 20;

  // Fetch products from backend using tRPC
  const { data: productsData, isLoading } = trpc.products.getAll.useQuery({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    sortBy: sortBy || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    hasDiscount: hasDiscount || undefined,
    limit: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  // Extract products and total from response
  const products = productsData?.products || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // Reset all filters function
  const resetAllFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setHasDiscount(false);
    setCurrentPage(1); // Reset to page 1
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, minPrice, maxPrice, hasDiscount]);

  // Static categories from database schema
  const categories = [
    { name: "Semua Produk", slug: "" },
    { name: "Pipa", slug: "Pipa" },
    { name: "Besi", slug: "Besi" },
    { name: "Semen", slug: "Semen" },
    { name: "Triplek", slug: "Triplek" },
    { name: "Tangki Air", slug: "Tangki Air" },
    { name: "Kawat", slug: "Kawat" },
    { name: "Paku", slug: "Paku" },
    { name: "Baut", slug: "Baut" },
    { name: "Aspal", slug: "Aspal" },
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
                        onClick={() => {
                          setSelectedCategory(category.slug);
                          setCurrentPage(1); // Reset to page 1
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.slug
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {category.name}
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
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
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
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </Card>

              {/* Discount */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Diskon</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded cursor-pointer"
                      checked={hasDiscount}
                      onChange={(e) => setHasDiscount(e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">
                      Produk Diskon
                    </span>
                  </label>
                </div>
              </Card>

              {/* Reset All Filters Button - Bottom */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={resetAllFilters}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Semua Filter
              </Button>
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Terpopuler</SelectItem>
                      <SelectItem value="newest">Terbaru</SelectItem>
                      <SelectItem value="price-low">Harga Terendah</SelectItem>
                      <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                      <SelectItem value="name">Nama A-Z</SelectItem>
                      <SelectItem value="name-desc">Nama Z-A</SelectItem>
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
            {!isLoading && products && products.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Menampilkan{" "}
                  <span className="font-semibold">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)}
                  </span>{" "}
                  dari <span className="font-semibold">{totalProducts}</span> produk
                </p>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-9 bg-gray-200 rounded"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : !products || products.length === 0 ? (
              // Empty state
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Produk tidak ditemukan
                </h3>
                <p className="text-gray-600">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
              </div>
            ) : (
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
                  <Link href={`/products/${product.slug}`} key={product._id.toString()}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
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
                        {product.stock < 10 && product.stock > 0 && (
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
                          {product.discount && product.discount.percentage > 0 ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 line-through">
                                  Rp {product.price.toLocaleString("id-ID")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-primary">
                                  Rp {(product.price * (1 - product.discount.percentage / 100)).toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-primary">
                                Rp {product.price.toLocaleString("id-ID")}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            // TODO: Add to cart functionality
                            console.log('Add to cart:', product.name);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Tambah ke Keranjang
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ) : (
                  // List View
                  <Link href={`/products/${product.slug}`} key={product._id.toString()}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
                              {product.discount && product.discount.percentage > 0 ? (
                                <div>
                                  <div className="flex items-center justify-end gap-2 mb-1">
                                    <span className="text-sm text-gray-500 line-through">
                                      Rp {product.price.toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-end gap-2 mb-1">
                                    <span className="text-xl font-bold text-primary">
                                      Rp {(product.price * (1 - product.discount.percentage / 100)).toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xl font-bold text-primary">
                                    Rp {product.price.toLocaleString("id-ID")}
                                  </span>
                                </div>
                              )}
                              <p className="text-xs text-gray-500">
                                Stok: {product.stock} {product.unit.toLowerCase()}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              // TODO: Add to cart functionality
                              console.log('Add to cart:', product.name);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Tambah ke Keranjang
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
                )}
              </div>
            )}
            {/* End Products Grid */}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  if (!showPage) {
                    // Show ellipsis
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant="outline"
                      size="sm"
                      className={
                        currentPage === page ? "bg-primary text-white" : ""
                      }
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
