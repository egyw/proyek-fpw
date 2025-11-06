import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
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
import { trpc } from "@/utils/trpc";
import { useCartStore } from "@/store/cartStore";

export default function ProductDetailPage() {
  const router = useRouter();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Cart store for guest users
  const addToGuestCart = useCartStore((state) => state.addItem);

  // Get slug from URL
  const slug = router.query.slug as string;

  // tRPC utils for cache invalidation
  const utils = trpc.useContext();

  // tRPC mutation for adding to cart (logged-in users)
  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: (data, variables) => {
      // Invalidate cart query to trigger re-fetch and update badge
      utils.cart.getCart.invalidate();
      
      toast.success("Berhasil!", {
        description: `${variables.name} (${variables.quantity} ${variables.unit.toUpperCase()}) ditambahkan ke keranjang.`,
      });
    },
    onError: (error) => {
      toast.error("Gagal menambahkan ke keranjang", {
        description: error.message,
      });
    },
  });

  // Handle share - copy URL to clipboard
  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Link berhasil disalin!", {
        description: "Link produk telah disalin ke clipboard",
      });
    } catch {
      toast.error("Gagal menyalin link", {
        description: "Terjadi kesalahan saat menyalin link",
      });
    }
  };

  // Handle add to cart
  const handleAddToCart = async (
    quantity: number,
    unit: string,
    price: number
  ) => {
    if (!product) return;

    // Check stock availability
    if (quantity > product.stock) {
      toast.error("Stok Tidak Cukup", {
        description: `Stok tersedia hanya ${product.stock} ${product.unit}`,
      });
      return;
    }

    const cartItem = {
      productId: product._id.toString(),
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: price,
      quantity: quantity,
      unit: unit,
      stock: product.stock,
      category: product.category,
    };

    if (isLoggedIn) {
      // Logged-in: Save to database via tRPC
      await addToCartMutation.mutateAsync(cartItem);
    } else {
      // Guest: Save to LocalStorage via Zustand
      addToGuestCart(cartItem);
      toast.success("Berhasil!", {
        description: `${cartItem.name} (${cartItem.quantity} ${cartItem.unit.toUpperCase()}) ditambahkan ke keranjang.`,
      });
    }
  };

  // Fetch product by slug from backend
  const { data: product, isLoading, error } = trpc.products.getBySlug.useQuery(
    { slug },
    { enabled: !!slug } // Only run query when slug is available
  );

  // Fetch related products (same category, exclude current product)
  const { data: relatedProductsData } = trpc.products.getAll.useQuery(
    {
      category: product?.category,
      limit: 4,
    },
    { enabled: !!product?.category }
  );

  // Loading state
  if (isLoading || !slug) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image skeleton */}
            <div className="space-y-4">
              <Card className="overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
              </Card>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            {/* Info skeleton */}
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error or not found
  if (error || !product) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Produk Tidak Ditemukan
            </h1>
            <p className="text-gray-600 mb-8">
              Produk yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <Link href="/products">
              <Button>Kembali ke Katalog</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Filter related products (exclude current product)
  const relatedProducts = relatedProductsData?.products
    ?.filter((p) => p._id.toString() !== product._id.toString())
    .slice(0, 4) || [];

  // Calculate discount price
  const discountPrice = product.discount && product.discount.percentage > 0
    ? product.price * (1 - product.discount.percentage / 100)
    : product.price;

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
                {product.discount && product.discount.percentage > 0 && (
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
              {product.discount && product.discount.percentage > 0 ? (
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-lg text-gray-500 line-through">
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-primary">
                      Rp {discountPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Hemat Rp{" "}
                    {(product.price - discountPrice).toLocaleString("id-ID")}{" "}
                    ({product.discount.percentage}%)
                  </p>
                </div>
              ) : (
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-primary">
                    Rp {product.price.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Stock Info */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Ketersediaan Stok</p>
              <div className="flex items-center gap-2">
                {product.stock > 50 ? (
                  <Badge className="bg-green-100 text-green-800">
                    Stok Tersedia ({product.stock})
                  </Badge>
                ) : product.stock > 0 ? (
                  <Badge className="bg-orange-100 text-orange-800">
                    Stok Terbatas ({product.stock})
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Stok Habis</Badge>
                )}
              </div>
            </div>

            {/* Quantity Selector with Unit Converter */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Jumlah & Unit Pembelian</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange("decrement")}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (value >= 1 && value <= product.stock) {
                        setQuantity(value);
                      }
                    }}
                    className="w-20 text-center font-semibold text-lg border-0 focus:outline-none focus:ring-0"
                  />
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                size="lg"
                className="flex-1 h-12"
                disabled={product.stock === 0}
                onClick={() => handleAddToCart(quantity, product.unit, discountPrice)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Tambah ke Keranjang
              </Button>
              <Button size="lg" variant="outline" className="h-12">
                <Heart className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Truck className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    Pengiriman Cepat
                  </p>
                  <p className="text-gray-600">Estimasi 2-3 hari kerja</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    Produk Original
                  </p>
                  <p className="text-gray-600">Garansi keaslian 100%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <RotateCcw className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Mudah Return</p>
                  <p className="text-gray-600">Return dalam 7 hari</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Converter - Beli dengan Custom Satuan */}
        <Card className="mb-12">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Beli dengan Satuan Lain
            </h2>
            <p className="text-gray-600 mb-6">
              Hitung dan beli produk ini dalam satuan yang Anda inginkan
            </p>
            <UnitConverter 
              category={product.category} 
              productUnit={product.unit}
              productPrice={discountPrice}
              productStock={product.stock}
              availableUnits={product.availableUnits || [product.unit]}
              productAttributes={product.attributes as Record<string, string | number>}
              onAddToCart={(quantityInUserUnit, userSelectedUnit, totalPrice) => {
                // UnitConverter now sends user's selected unit and quantity
                // e.g., user input "0.25 meter", receives (0.25, "meter", 2323)
                // NOT converted to supplier unit (batang)
                // Calculate price per user's unit for cart item
                const pricePerUnit = totalPrice / quantityInUserUnit;
                handleAddToCart(quantityInUserUnit, userSelectedUnit, pricePerUnit);
              }}
            />
          </div>
        </Card>

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
                {Object.entries(product.attributes || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-600 min-w-[140px]">
                      {key}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {String(value)}
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
            {relatedProducts.map((relatedProduct) => {
              const relatedDiscountPrice = relatedProduct.discount && relatedProduct.discount.percentage > 0
                ? relatedProduct.price * (1 - relatedProduct.discount.percentage / 100)
                : null;
              
              return (
                <Link
                  key={relatedProduct._id.toString()}
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
                      {relatedProduct.discount && relatedProduct.discount.percentage > 0 && (
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
                      {relatedDiscountPrice ? (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-400 line-through">
                            Rp {relatedProduct.price.toLocaleString("id-ID")}
                          </div>
                          <div className="text-base font-bold text-primary">
                            Rp {relatedDiscountPrice.toLocaleString("id-ID")}
                          </div>
                        </div>
                      ) : (
                        <div className="text-base font-bold text-primary">
                          Rp {relatedProduct.price.toLocaleString("id-ID")}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
