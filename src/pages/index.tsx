import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
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

  // Dummy data
  const carouselItems = [
    { id: 1, title: "Promo Semen 20%", subtitle: "Hemat hingga Rp 50.000" },
    { id: 2, title: "Diskon Cat 30%", subtitle: "Untuk pembelian 5 galon" },
    { id: 3, title: "Gratis Ongkir", subtitle: "Minimum pembelian Rp 5 juta" },
    { id: 4, title: "Keramik Murah", subtitle: "Mulai dari Rp 35.000/box" },
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

  const promoProducts = [
    { id: 1, name: "Semen Gresik 50kg", price: 65000, discount: 20, originalPrice: 81250 },
    { id: 2, name: "Cat Tembok Avian 5kg", price: 180000, discount: 15, originalPrice: 211765 },
    { id: 3, name: "Besi Beton 10mm", price: 85000, discount: 30, originalPrice: 121429 },
    { id: 4, name: "Keramik 40x40 Platinum", price: 42000, discount: 25, originalPrice: 56000 },
  ];

  const bestSellers = [
    { id: 5, name: "Pipa PVC 3 inch", price: 45000 },
    { id: 6, name: "Semen Tiga Roda 50kg", price: 62000 },
    { id: 7, name: "Genteng Metal Pasir", price: 35000 },
    { id: 8, name: "Triplek 9mm", price: 95000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image 
                src="/images/logo_4x1.png" 
                alt="Logo" 
                width={150}
                height={38}
                className="h-8 w-auto"
              />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/products" className="text-gray-700 hover:text-primary">
                Produk
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">Masuk</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Daftar</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
                      src="/images/dummy_image.jpg"
                      alt={item.title}
                      fill
                      className="object-cover brightness-75"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                      <h3 className="text-3xl md:text-4xl font-bold mb-2">{item.title}</h3>
                      <p className="text-lg md:text-xl text-white/90">{item.subtitle}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </section>

      {/* Promo Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">⚡ Promo Hari Ini</h2>
            <Link href="/products?filter=promo" className="text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {promoProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src="/images/dummy_image.jpg"
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                    -{product.discount}%
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-primary">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      Rp {product.originalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <Button className="w-full" size="sm">
                    Tambah ke Keranjang
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            📦 Kategori Populer
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
            <h2 className="text-3xl font-bold text-gray-900">🔥 Produk Terlaris</h2>
            <Link href="/products?filter=bestseller" className="text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src="/images/dummy_image.jpg"
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="mb-3">
                    <span className="text-lg font-bold text-primary">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <Button className="w-full" size="sm" variant="outline">
                    Lihat Detail
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            ✅ Kenapa Belanja di Sini?
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image 
                src="/images/logo_4x1.png" 
                alt="Logo" 
                width={150}
                height={38}
                className="h-8 w-auto brightness-0 invert mb-4"
              />
              <p className="text-gray-400 text-sm">
                Solusi lengkap material bangunan berkualitas untuk kebutuhan konstruksi Anda.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/products?category=semen" className="hover:text-white">Semen</Link></li>
                <li><Link href="/products?category=besi" className="hover:text-white">Besi</Link></li>
                <li><Link href="/products?category=cat" className="hover:text-white">Cat</Link></li>
                <li><Link href="/products?category=keramik" className="hover:text-white">Keramik</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">Tentang Kami</Link></li>
                <li><Link href="/contact" className="hover:text-white">Kontak</Link></li>
                <li><Link href="/terms" className="hover:text-white">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Kebijakan Privasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Pengiriman</Link></li>
                <li><Link href="/returns" className="hover:text-white">Pengembalian</Link></li>
                <li><Link href="/payment" className="hover:text-white">Pembayaran</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Toko Bangunan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
