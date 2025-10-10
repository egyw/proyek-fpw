import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  // TODO: Replace with cart context
  // Expected: const { items } = useCart();
  const cartItemCount = 3; // Dummy data - should come from cart context

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
          <div className="flex items-center gap-6">
            <Link href="/products" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Produk
            </Link>
            
            {/* Cart Icon with Badge */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary hover:bg-primary"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
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
