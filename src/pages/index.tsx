import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/layouts/MainLayout";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/utils/trpc";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

export default function Home() {
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  // Fetch featured products from backend using tRPC
  const { data: featuredProducts, isLoading } = trpc.products.getFeatured.useQuery();

  // Static data (will remain static)
  const carouselItems = [
    { id: 1, image: "/assets/carousels/carousel1.png" },
    { id: 2, image: "/assets/carousels/carousel2.png" },
    { id: 3, image: "/assets/carousels/carousel3.png" },
    { id: 4, image: "/assets/carousels/carousel4.png" },
    { id: 5, image: "/assets/carousels/carousel5.png" },
  ];

  const categories = [
    { name: "Semen", icon: "🧱" },
    { name: "Besi", icon: "⚙️" },
    { name: "Cat", icon: "🎨" },
    { name: "Pipa", icon: "🚰" },
    { name: "Keramik", icon: "⬜" },
    { name: "Kayu", icon: "🪵" },
    { name: "Atap", icon: "🏠" },
    { name: "Lainnya", icon: "📦" },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative text-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_image.png"
            alt="Hero Background"
            fill
            className="object-cover brightness-90"
            priority
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/60 to-primary/40"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
              Material Bangunan Berkualitas
            </h1>
            <p className="text-lg md:text-xl text-white/95 mb-8 max-w-2xl mx-auto drop-shadow-md">
              Solusi lengkap untuk kebutuhan konstruksi dan renovasi rumah Anda dengan harga terbaik
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" variant="secondary" className="text-lg px-8 shadow-lg">
                  Belanja Sekarang
                </Button>
              </Link>
              <Link href="/products?category=promo">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  Lihat Promo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Auto Carousel */}
      <section className="bg-white py-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={() => plugin.current.stop()}
            onMouseLeave={() => plugin.current.play()}
          >
            <CarouselContent>
              {carouselItems.map((item) => (
                <CarouselItem key={item.id}>
                  <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                    <Image
                      src={item.image}
                      alt={`Carousel ${item.id}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </section>

      {/* Promo Section - Only show if there are products with discount */}
      {(isLoading || (featuredProducts && featuredProducts.some((p) => p.discount && p.discount.percentage > 0))) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Promo Hari Ini</h2>
              <Link href="/products?filter=promo" className="text-primary hover:underline">
                Lihat Semua →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-9 bg-gray-200 rounded"></div>
                    </div>
                  </Card>
                ))
              ) : (
                featuredProducts
                  ?.filter((p) => p.discount && p.discount.percentage > 0) // Only products with discount
                  .slice(0, 4) // Show first 4 products with discount
                  .map((product) => (
                    <Link key={product._id} href={`/products/${product.slug}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                        <div className="relative h-48">
                          <Image
                            src={product.images[0] || "/images/dummy_image.jpg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          {product.discount && product.discount.percentage > 0 && (
                            <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                              -{product.discount.percentage}%
                            </Badge>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg font-bold text-primary">
                              Rp {product.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <Button className="w-full mt-auto" size="sm">
                            Lihat Detail
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Kategori Populer
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${category.name.toLowerCase()}`}
                className="group"
              >
                <Card className="p-6 text-center hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-medium text-gray-900 group-hover:text-primary">
                    {category.name}
                  </h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Produk Terlaris</h2>
            <Link href="/products?filter=bestseller" className="text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-9 bg-gray-200 rounded"></div>
                  </div>
                </Card>
              ))
            ) : (
              featuredProducts
                ?.slice(0, 4) // Show first 4 featured products
                .map((product) => (
                  <Link key={product._id} href={`/products/${product.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                      <div className="relative h-48">
                        <Image
                          src={product.images[0] || "/images/dummy_image.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        {product.discount && product.discount.percentage > 0 && (
                          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                            -{product.discount.percentage}%
                          </Badge>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                          {product.name}
                        </h3>
                        <div className="mb-3">
                          <span className="text-lg font-bold text-primary">
                            Rp {product.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <Button className="w-full mt-auto" size="sm" variant="outline">
                          Lihat Detail
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Partner Terpercaya
          </h2>
          
          {/* Partner Logos */}
          <div className="relative overflow-hidden">
            <div className="flex items-center justify-center gap-6 md:gap-15 flex-wrap">
              {/* Dulux */}
              <div className="transition-all duration-300 hover:scale-110">
                <Image
                  src="/images/partners/dulux_logo.png"
                  alt="Dulux"
                  width={80}
                  height={50}
                  className="h-8 md:h-10 w-auto max-w-[80px] md:max-w-[100px] object-contain"
                />
              </div>

              {/* Nippon Paint */}
              <div className="transition-all duration-300 hover:scale-110">
                <Image
                  src="/images/partners/nippon_logo.png"
                  alt="Nippon Paint"
                  width={80}
                  height={50}
                  className="h-8 md:h-10 w-auto max-w-[80px] md:max-w-[100px] object-contain"
                />
              </div>

              {/* Toto */}
              <div className="transition-all duration-300 hover:scale-110">
                <Image
                  src="/images/partners/toto_logo.png"
                  alt="Toto"
                  width={80}
                  height={50}
                  className="h-8 md:h-10 w-auto max-w-[80px] md:max-w-[100px] object-contain"
                />
              </div>

              {/* Platinum */}
              <div className="transition-all duration-300 hover:scale-110">
                <Image
                  src="/images/partners/platinum_logo.png"
                  alt="Platinum"
                  width={80}
                  height={50}
                  className="h-8 md:h-10 w-auto max-w-[80px] md:max-w-[100px] object-contain"
                />
              </div>

              {/* Roman */}
              <div className="transition-all duration-300 hover:scale-110">
                <Image
                  src="/images/partners/roman_logo.png"
                  alt="Roman"
                  width={80}
                  height={50}
                  className="h-8 md:h-10 w-auto max-w-[80px] md:max-w-[100px] object-contain"
                />
              </div>

              {/* Semen Gresik */}
              <div className="transition-all duration-300 hover:scale-110">
                <Image
                  src="/images/partners/semen_gresik_logo.png"
                  alt="Semen Gresik"
                  width={80}
                  height={50}
                  className="h-8 md:h-10 w-auto max-w-[80px] md:max-w-[100px] object-contain"
                />
              </div>

              {/* Semen Merdeka */}
              <div className="transition-all duration-300 hover:scale-110">
                <Image
                  src="/images/partners/semen_merdeka_logo.png"
                  alt="Semen Merdeka"
                  width={80}
                  height={50}
                  className="h-8 md:h-10 w-auto max-w-[80px] md:max-w-[100px] object-contain"
                />
              </div>

              {/* American Standard */}
              <div className="transition-all duration-300 hover:scale-110">
                <Image
                  src="/images/partners/american_standard_logo.png"
                  alt="American Standard"
                  width={80}
                  height={50}
                  className="h-8 md:h-10 w-auto max-w-[80px] md:max-w-[100px] object-contain"
                />
              </div>

              {/* Perwira Steel */}
              <div className="transition-all duration-300 hover:scale-110">
                <Image
                  src="/images/partners/perwira_steel_logo.jpg"
                  alt="Perwira Steel"
                  width={80}
                  height={50}
                  className="h-8 md:h-10 w-auto max-w-[80px] md:max-w-[100px] object-contain"
                />
              </div>

              {/* Juma */}
              <div className="transition-all duration-300 hover:scale-110">
                <Image
                  src="/images/partners/juma_logo.png"
                  alt="Juma"
                  width={80}
                  height={50}
                  className="h-8 md:h-10 w-auto max-w-[80px] md:max-w-[100px] object-contain"
                />
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-500 mt-8">
            Dan 670+ brand lainnya...
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Kenapa Belanja di Sini?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Produk Bergaransi</h3>
              <p className="text-gray-600">Semua produk dilengkapi garansi resmi</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Gratis Ongkir</h3>
              <p className="text-gray-600">Untuk pembelian di atas Rp 5 juta</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">COD Tersedia</h3>
              <p className="text-gray-600">Bayar di tempat untuk area tertentu</p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
