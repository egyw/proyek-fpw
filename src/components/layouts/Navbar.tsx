import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <Image 
                src="/images/logo_4x1.png" 
                alt="Logo" 
                width={150}
                height={38}
                className="h-15 w-auto cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-gray-700 hover:text-primary transition-colors">
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
  );
}
