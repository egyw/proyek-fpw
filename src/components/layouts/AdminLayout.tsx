import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import { useRequireRole } from "@/hooks/useRequireAuth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  Store,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Ticket,
  RotateCcw,
  MessageCircle,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  const {data: session, status } = useSession();
  
  // ✅ CENTRALIZED PROTECTION: Protect ALL admin pages for admin & staff roles
  const {user, isAuthenticated, isLoading } = useRequireRole(['admin', 'staff']);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or unauthorized, hook will redirect
  // Show loading spinner to prevent flash of admin content
  if (status === "unauthenticated" || !isAuthenticated || !user || !['admin', 'staff'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }
  
  const handleLogout = async() => {
    try {
      await signOut({
        callbackUrl: '/auth/login',
        redirect: true
      })
    }catch (error){
      console.error('Error Message : ', error);
      router.push('/')
    }
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: router.pathname === "/admin",
    },
    {
      title: "Produk",
      icon: Package,
      href: "/admin/products",
      active: router.pathname.startsWith("/admin/products"),
    },
    {
      title: "Pesanan",
      icon: ShoppingCart,
      href: "/admin/orders",
      active: router.pathname.startsWith("/admin/orders"),
    },
    {
      title: "Pengembalian",
      icon: RotateCcw,
      href: "/admin/returns",
      active: router.pathname.startsWith("/admin/returns"),
    },
    {
      title: "Inventory",
      icon: ClipboardList,
      href: "/admin/inventory",
      active: router.pathname.startsWith("/admin/inventory"),
    },
    {
      title: "Pelanggan",
      icon: Users,
      href: "/admin/customers",
      active: router.pathname.startsWith("/admin/customers"),
    },
    {
      title: "Live Chat",
      icon: MessageCircle,
      href: "/admin/chat",
      active: router.pathname.startsWith("/admin/chat"),
    },
    {
      title: "Voucher",
      icon: Ticket,
      href: "/admin/vouchers",
      active: router.pathname.startsWith("/admin/vouchers"),
    },
    {
      title: "Laporan",
      icon: BarChart3,
      href: "/admin/reports",
      active: router.pathname.startsWith("/admin/reports"),
    },
    {
      title: "Pengaturan",
      icon: Settings,
      href: "/admin/settings",
      active: router.pathname.startsWith("/admin/settings"),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <Link href="/admin" className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <div>
                <span className="text-lg font-bold text-primary">Admin</span>
                <span className="text-xs text-gray-500 block">Panel</span>
              </div>
            </Link>
          ) : (
            <Link href="/admin" className="flex items-center justify-center w-full">
              <Store className="h-6 w-6 text-primary" />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      item.active
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${!sidebarOpen ? "justify-center" : ""}`}
                  >
                    <IconComponent className="h-5 w-5 shrink-0" />
                    {sidebarOpen && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Toggle Button */}
        <div className="p-3 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Sembunyikan</span>
              </>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {menuItems.find((item) => item.active)?.title || "Admin Panel"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Menu with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 h-auto py-2">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-white font-semibold">
                      {(session?.user?.name || "U")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* View Store Link in Dropdown */}
                <DropdownMenuItem asChild>
                  <Link href="/" target="_blank" className="flex items-center cursor-pointer">
                    <Store className="mr-2 h-4 w-4" />
                    <span>Lihat Toko</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
