import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCartStore } from "@/store/cartStore";
import { trpc } from "@/utils/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, Package, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  // Guest cart (Zustand)
  const guestCartItems = useCartStore((state) => state.items);

  // Database cart (tRPC) - only query if logged in
  const { data: dbCart } = trpc.cart.getCart.useQuery(
    undefined,
    { 
      enabled: isLoggedIn,
      refetchOnWindowFocus: true, // Refresh when user returns to tab
    }
  );

  // Fix hydration error: Only read cart count on client-side
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Calculate cart count based on authentication status
    if (isLoggedIn && dbCart) {
      // Logged in: use database cart
      const dbTotalItems = dbCart.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(dbTotalItems);
    } else {
      // Guest: use Zustand cart - compute directly from items
      const guestTotalItems = guestCartItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(guestTotalItems);
    }
  }, [isLoggedIn, dbCart, guestCartItems]); // Simplified: only depend on items array

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    toast.success("Berhasil logout", {
      description: "Anda telah keluar dari akun.",
    });
  };

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
            
            {/* Cart Icon with Badge - Show for all users (guest + logged in) */}
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

            {/* Conditional: Show Login/Register OR Profile Dropdown */}
            {isLoggedIn && session?.user ? (
              /* Profile Dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={session.user.name || "User"} />
                      <AvatarFallback className="bg-primary text-white">
                        {(session.user.name || "U")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Pesanan Saya</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Login & Register Buttons */
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Masuk</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Daftar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
