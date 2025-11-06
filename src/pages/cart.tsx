import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { trpc } from "@/utils/trpc";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Package,
} from "lucide-react";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number; // Price per original unit
  originalUnit: string; // Product's original unit (SAK, PCS, etc)
  selectedUnit: string; // User's selected unit (KG, M2, etc)
  quantity: number; // Quantity in selected unit
  stock: number; // Available stock in original unit
  category: string;
}

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  // Get cart from Zustand store (for guest users)
  const guestCartItems = useCartStore((state) => state.items);
  const updateGuestQuantity = useCartStore((state) => state.updateQuantity);
  const removeGuestItem = useCartStore((state) => state.removeItem);

  // Get cart from database (for logged-in users)
  const { data: dbCart, isLoading: isLoadingCart, refetch: refetchCart } = trpc.cart.getCart.useQuery(
    undefined,
    { enabled: isLoggedIn }
  );
  const updateDbQuantity = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      refetchCart();
      toast.success('Jumlah diperbarui');
    },
    onError: (error) => {
      toast.error('Gagal memperbarui jumlah', {
        description: error.message,
      });
    },
  });
  const removeDbItem = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      refetchCart();
      toast.success('Item dihapus');
    },
    onError: (error) => {
      toast.error('Gagal menghapus item', {
        description: error.message,
      });
    },
  });

  // Use database cart if logged in, otherwise use Zustand
  const cartItems = isLoggedIn && dbCart ? dbCart.items : guestCartItems;

  // Map cart items to match CartItem interface
  const mappedCartItems: CartItem[] = cartItems.map((item) => ({
    id: item.productId,
    productId: item.productId,
    name: item.name,
    slug: item.slug,
    image: item.image,
    price: item.price,
    originalUnit: item.unit,
    selectedUnit: item.unit,
    quantity: item.quantity,
    stock: item.stock,
    category: item.category,
  }));

  const handleQuantityChange = (itemId: string, type: "increment" | "decrement") => {
    const item = cartItems.find((i) => i.productId === itemId);
    if (!item) return;

    const newQuantity = type === "increment" ? item.quantity + 1 : item.quantity - 1;

    if (type === "increment" && item.quantity >= item.stock) return;
    if (type === "decrement" && item.quantity <= 1) return;

    if (isLoggedIn) {
      // Use tRPC mutation for logged-in users
      updateDbQuantity.mutate({ productId: itemId, quantity: newQuantity });
    } else {
      // Use Zustand for guest users
      updateGuestQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (isLoggedIn) {
      // Use tRPC mutation for logged-in users
      removeDbItem.mutate({ productId: itemId });
    } else {
      // Use Zustand for guest users
      removeGuestItem(itemId);
      toast.success('Item dihapus', {
        description: 'Item berhasil dihapus dari keranjang.',
      });
    }
  };

  const calculateItemTotal = (item: CartItem): number => {
    return item.price * item.quantity;
  };

  const calculateSubtotal = (): number => {
    return mappedCartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const shippingCost = 50000; // Flat shipping cost
  const grandTotal = calculateSubtotal() + shippingCost;

  // Validation: Cart must have items
  const canCheckout = mappedCartItems.length > 0;

  // Handle checkout - check authentication
  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error('Login Diperlukan', {
        description: 'Silakan login terlebih dahulu untuk melanjutkan checkout.',
      });
      router.push('/auth/login');
      return;
    }
    
    // Proceed to checkout (address selection will be in checkout page)
    router.push('/checkout');
  };

  // Show loading for logged-in users while fetching cart
  if (isLoggedIn && isLoadingCart) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat keranjang...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Keranjang Belanja
                </h1>
                <p className="text-gray-600 mt-1">
                  {mappedCartItems.length} item dalam keranjang
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {mappedCartItems.length === 0 ? (
            /* Empty Cart State */
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Keranjang Belanja Kosong
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Belum ada produk di keranjang Anda. Yuk, mulai belanja!
                  </p>
                  <Link href="/products">
                    <Button size="lg">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Mulai Belanja
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {mappedCartItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.slug}`}
                        className="shrink-0"
                      >
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Link
                              href={`/products/${item.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                {item.name}
                              </h3>
                            </Link>
                            <Badge variant="outline" className="mb-2">
                              {item.category}
                            </Badge>
                            <p className="text-sm text-gray-600">
                              Harga: Rp{" "}
                              {item.price.toLocaleString("id-ID")}/{item.originalUnit}
                            </p>
                            {item.selectedUnit !== item.originalUnit && (
                              <p className="text-xs text-primary mt-1">
                                Unit pilihan: {item.selectedUnit}
                              </p>
                            )}
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            aria-label="Hapus item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>

                        <Separator className="my-3" />

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                              Jumlah:
                            </span>
                            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleQuantityChange(item.id, "decrement")
                                }
                                disabled={item.quantity <= 1}
                                className="rounded-none h-10 w-10"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="px-4 font-semibold">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleQuantityChange(item.id, "increment")
                                }
                                disabled={item.quantity >= item.stock}
                                className="rounded-none h-10 w-10"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <span className="text-sm text-gray-600">
                              {item.selectedUnit}
                            </span>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Subtotal</p>
                            <p className="text-lg font-bold text-primary">
                              Rp{" "}
                              {calculateItemTotal(item).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Ringkasan Belanja
                  </h2>
                  <Separator className="mb-4" />

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal ({mappedCartItems.length} item)</span>
                      <span className="font-semibold">
                        Rp {calculateSubtotal().toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Ongkos Kirim
                      </span>
                      <span className="font-semibold">
                        Rp {shippingCost.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <Separator className="mb-4" />

                  <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                    <span>Total</span>
                    <span className="text-primary">
                      Rp {grandTotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full" 
                    disabled={!canCheckout}
                    onClick={handleCheckout}
                  >
                    Lanjut ke Checkout
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>

                  <Link href="/products">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full mt-3"
                    >
                      Lanjut Belanja
                    </Button>
                  </Link>

                  {/* Info Box */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>💡 Info:</strong> Alamat pengiriman dan metode pembayaran 
                      akan dipilih di halaman checkout.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
