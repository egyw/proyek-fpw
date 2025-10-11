import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, Package, LogOut } from "lucide-react";

export default function Navbar() {
  // TODO: Replace with tRPC auth query
  // Expected: const { data: user } = trpc.auth.getCurrentUser.useQuery();
  // Expected: const isLoggedIn = !!user;
  // NOTE: Change `false` to `true` below to test logged-in state UI
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Toggle untuk testing UI
  const dummyUser = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "", // Empty = show initials
  };

  // TODO: Replace with cart context
  // Expected: const { items } = useCart();
  const cartItemCount = 3; // Dummy data - should come from cart context

  const handleLogout = () => {
    // TODO: Implement with tRPC
    // Expected: logoutMutation.mutate();
    setIsLoggedIn(false);
    console.log("Logout clicked");
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

            {/* Conditional: Show Login/Register OR Profile Dropdown */}
            {isLoggedIn ? (
              /* Profile Dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={dummyUser.avatar} alt={dummyUser.name} />
                      <AvatarFallback className="bg-primary text-white">
                        {dummyUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{dummyUser.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {dummyUser.email}
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
