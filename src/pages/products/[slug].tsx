import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
// import { useRouter } from "next/router";
import { useState } from "react";
import {
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import UnitConverter from "@/components/UnitConverter";

export default function ProductDetailPage() {
  // const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // TODO: Get slug from URL for backend integration
  // const slug = router.query.slug as string;
  // const { data: product, isLoading } = trpc.products.getBySlug.useQuery({ slug });

  // TODO: Replace with tRPC query
  // Expected API: trpc.products.getBySlug.useQuery({ slug })
  // Output: Product
  const product = {
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
    images: [
      "/images/dummy_image.jpg",
      "/images/dummy_image.jpg",
      "/images/dummy_image.jpg",
    ],
    description:
      "Semen Portland Type I berkualitas tinggi dari PT Semen Gresik (Persero) Tbk. Cocok untuk berbagai jenis konstruksi bangunan seperti rumah tinggal, gedung bertingkat, jalan, jembatan, dan infrastruktur lainnya. Telah memenuhi standar SNI dan memiliki kekuatan tekan yang tinggi. Kemasan 50kg dalam karung yang kuat dan tahan air.",
    rating: { average: 4.8, count: 234 },
    sold: 234,
    views: 1250,
    attributes: {
      "Tipe": "Portland Type I",
      "Berat": "50kg",
      "Asal": "Indonesia",
      "Standar": "SNI",
      "Kekuatan Tekan": "≥ 320 kg/cm²",
      "Setting Time": "Initial: ≥ 60 menit, Final: ≤ 600 menit",
    },
    isActive: true,
    isFeatured: false,
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-04-01T00:00:00Z",
  };

  // Related products
  const relatedProducts = [
    {
      id: "68b8340ed2788dc4d9e608b6",
      name: "Semen Tiga Roda 50kg",
      slug: "semen-tiga-roda-50kg",
      price: 62000,
      originalPrice: undefined,
      rating: { average: 4.7, count: 334 },
      images: ["/images/dummy_image.jpg"],
      discount: undefined,
    },
    {
      id: "68b8340ed2788dc4d9e608b2",
      name: "Cat Tembok Avian 5kg Putih",
      slug: "cat-tembok-avian-5kg-putih",
      price: 180000,
      originalPrice: 211765,
      rating: { average: 4.7, count: 189 },
      images: ["/images/dummy_image.jpg"],
      discount: { percentage: 15 },
    },
    {
      id: "68b8340ed2788dc4d9e608b3",
      name: "Besi Beton 10mm Panjang 12m",
      slug: "besi-beton-10mm-panjang-12m",
      price: 85000,
      originalPrice: 121429,
      rating: { average: 4.9, count: 156 },
      images: ["/images/dummy_image.jpg"],
      discount: { percentage: 30 },
    },
    {
      id: "68b8340ed2788dc4d9e608b4",
      name: "Keramik Platinum 40x40 Glossy",
      slug: "keramik-platinum-40x40-glossy",
      price: 42000,
      originalPrice: 56000,
      rating: { average: 4.6, count: 423 },
      images: ["/images/dummy_image.jpg"],
      discount: { percentage: 25 },
    },
  ];

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment" && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

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
            <Link href="/products" className="text-gray-500 hover:text-primary">
              Produk
            </Link>
            <span className="text-gray-400">›</span>
            <Link
              href={`/products?category=${product.category}`}
              className="text-gray-500 hover:text-primary"
            >
              {product.category}
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Side - Images */}
          <div>
            {/* Main Image */}
            <Card className="mb-4 overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.discount && (
                  <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-base px-3 py-1">
                    -{product.discount.percentage}%
                  </Badge>
                )}
              </div>
            </Card>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div>
            {/* Category Badge */}
            <Badge variant="outline" className="mb-3">
              {product.category}
            </Badge>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {product.name}
            </h1>

            {/* Brand */}
            <p className="text-gray-600 mb-4">
              Brand: <span className="font-semibold">{product.brand}</span>
            </p>

            {/* Rating & Sold */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold text-gray-900">
                  {product.rating.average}
                </span>
                <span className="text-gray-500">
                  ({product.rating.count} ulasan)
                </span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-gray-600">
                <span className="font-semibold text-gray-900">
                  {product.sold}
                </span>{" "}
                Terjual
              </span>
            </div>

            <Separator className="my-6" />

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">
                  Rp {product.price.toLocaleString("id-ID")}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    Rp {product.originalPrice.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              {product.discount && (
                <p className="text-sm text-gray-600">
                  Hemat Rp{" "}
                  {(
                    product.originalPrice! - product.price
                  ).toLocaleString("id-ID")}{" "}
                  ({product.discount.percentage}%)
                </p>
              )}
            </div>

            <Separator className="my-6" />

            {/* Stock Info */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Ketersediaan Stok</p>
              <div className="flex items-center gap-2">
                {product.stock > 50 ? (
                  <Badge className="bg-green-100 text-green-800">
                    Stok Tersedia ({product.stock} {product.unit})
                  </Badge>
                ) : product.stock > 0 ? (
                  <Badge className="bg-orange-100 text-orange-800">
                    Stok Terbatas ({product.stock} {product.unit})
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Stok Habis</Badge>
                )}
              </div>
            </div>

            {/* Quantity Selector with Unit Converter */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Jumlah & Unit Pembelian</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange("decrement")}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange("increment")}
                      disabled={quantity >= product.stock}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.unit}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Stok tersedia: {product.stock} {product.unit}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                size="lg"
                className="flex-1 h-12"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Tambah ke Keranjang
              </Button>
              <Button size="lg" variant="outline" className="h-12">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-12">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    Pengiriman Cepat
                  </p>
                  <p className="text-gray-600">Estimasi 2-3 hari kerja</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    Produk Original
                  </p>
                  <p className="text-gray-600">Garansi keaslian 100%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <RotateCcw className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Mudah Return</p>
                  <p className="text-gray-600">Return dalam 7 hari</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Converter */}
        <div className="mb-12">
          <UnitConverter 
            category={product.category} 
            productUnit={product.unit}
            productPrice={product.price}
            productStock={product.stock}
            onAddToCart={(quantity, unit, totalPrice) => {
              // TODO: Implement cart functionality
              console.log(`Adding to cart: ${quantity} ${unit} = Rp ${totalPrice}`);
              alert(`Berhasil menambahkan ${quantity} ${unit} ke keranjang (Total: Rp ${totalPrice.toLocaleString("id-ID")})`);
            }}
          />
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Detail Produk
            </h2>
            <Separator className="mb-6" />

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Deskripsi
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Spesifikasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-600 min-w-[140px]">
                      {key}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Related Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Produk Terkait
            </h2>
            <Link
              href="/products"
              className="text-primary hover:underline font-medium"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.slug}`}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative aspect-square">
                    <Image
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {relatedProduct.discount && (
                      <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                        -{relatedProduct.discount.percentage}%
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-medium text-gray-900">
                        {relatedProduct.rating.average}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({relatedProduct.rating.count})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-primary">
                        Rp {relatedProduct.price.toLocaleString("id-ID")}
                      </span>
                      {relatedProduct.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          Rp{" "}
                          {relatedProduct.originalPrice.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
