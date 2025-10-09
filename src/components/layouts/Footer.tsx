import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image 
              src="/images/logo_4x1.png" 
              alt="Logo" 
              width={150}
              height={38}
              className="h-20 w-auto brightness-0 invert mb-4"
            />
            <p className="text-gray-400 text-sm">
              Solusi lengkap material bangunan berkualitas untuk kebutuhan konstruksi Anda.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Produk</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products?category=semen" className="hover:text-white transition-colors">Semen</Link></li>
              <li><Link href="/products?category=besi" className="hover:text-white transition-colors">Besi</Link></li>
              <li><Link href="/products?category=cat" className="hover:text-white transition-colors">Cat</Link></li>
              <li><Link href="/products?category=keramik" className="hover:text-white transition-colors">Keramik</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Kontak</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Pengiriman</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Pengembalian</Link></li>
              <li><Link href="/payment" className="hover:text-white transition-colors">Pembayaran</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Toko Bangunan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
