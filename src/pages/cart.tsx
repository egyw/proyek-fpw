import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Package,
  MapPin,
  Edit,
  CheckCircle2,
  AlertCircle,
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

interface Address {
  id: string;
  label: string; // e.g., "Rumah", "Kantor", "Gudang"
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  district: string; // Kecamatan
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
  isDefault: boolean;
  // For future Google Maps integration
  latitude?: number;
  longitude?: number;
}

// Zod schema for address validation
const addressSchema = z.object({
  label: z.string().min(1, "Label alamat harus diisi"),
  recipientName: z.string().min(3, "Nama penerima minimal 3 karakter"),
  phoneNumber: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^[0-9]+$/, "Nomor telepon hanya boleh angka"),
  fullAddress: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
  district: z.string().min(3, "Kecamatan harus diisi"),
  city: z.string().min(3, "Kota harus diisi"),
  province: z.string().min(3, "Provinsi harus diisi"),
  postalCode: z
    .string()
    .min(5, "Kode pos harus 5 digit")
    .max(5, "Kode pos harus 5 digit")
    .regex(/^[0-9]{5}$/, "Kode pos harus 5 digit angka"),
  notes: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function CartPage() {
  // TODO: Replace with cart context/state management
  // Expected: useCart() hook from CartContext
  // Functions: addItem, removeItem, updateQuantity, clearCart
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "cart-1",
      productId: "68b8340ed2788dc4d9e608b1",
      name: "Semen Gresik 50kg",
      slug: "semen-gresik-50kg",
      image: "/images/dummy_image.jpg",
      price: 65000,
      originalUnit: "SAK",
      selectedUnit: "SAK",
      quantity: 5,
      stock: 150,
      category: "Semen",
    },
    {
      id: "cart-2",
      productId: "68b8340ed2788dc4d9e608b3",
      name: "Besi Beton 10mm Panjang 12m",
      slug: "besi-beton-10mm-panjang-12m",
      image: "/images/dummy_image.jpg",
      price: 85000,
      originalUnit: "BATANG",
      selectedUnit: "BATANG",
      quantity: 10,
      stock: 200,
      category: "Besi",
    },
    {
      id: "cart-3",
      productId: "68b8340ed2788dc4d9e608b2",
      name: "Cat Tembok Avian 5kg Putih",
      slug: "cat-tembok-avian-5kg-putih",
      image: "/images/dummy_image.jpg",
      price: 180000,
      originalUnit: "KALENG",
      selectedUnit: "KALENG",
      quantity: 2,
      stock: 75,
      category: "Cat",
    },
  ]);

  const handleQuantityChange = (itemId: string, type: "increment" | "decrement") => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          if (type === "increment" && item.quantity < item.stock) {
            return { ...item, quantity: item.quantity + 1 };
          } else if (type === "decrement" && item.quantity > 1) {
            return { ...item, quantity: item.quantity - 1 };
          }
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const calculateItemTotal = (item: CartItem): number => {
    return item.price * item.quantity;
  };

  const calculateSubtotal = (): number => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  // TODO: Replace with user data from authentication/database
  // Expected API: trpc.user.getAddresses.useQuery()
  // Output: Address[]
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      label: "Rumah",
      recipientName: "John Doe",
      phoneNumber: "081234567890",
      fullAddress: "Jl. Merdeka No. 123, RT 01/RW 05",
      district: "Lowokwaru",
      city: "Malang",
      province: "Jawa Timur",
      postalCode: "65141",
      notes: "Rumah cat hijau, pagar putih",
      isDefault: true,
    },
    {
      id: "addr-2",
      label: "Kantor",
      recipientName: "John Doe",
      phoneNumber: "081234567890",
      fullAddress: "Jl. Soekarno Hatta No. 456, Gedung B Lantai 3",
      district: "Blimbing",
      city: "Malang",
      province: "Jawa Timur",
      postalCode: "65126",
      isDefault: false,
    },
  ]);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    addresses.find((addr) => addr.isDefault) || null
  );

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Address form with react-hook-form + Zod
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      recipientName: "",
      phoneNumber: "",
      fullAddress: "",
      district: "",
      city: "",
      province: "",
      postalCode: "",
      notes: "",
    },
  });

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsAddressDialogOpen(false);
  };

  const handleAddNewAddress = (data: AddressFormValues) => {
    // TODO: Implement save to database
    // Expected API: trpc.user.addAddress.useMutation()
    const address: Address = {
      id: `addr-${Date.now()}`,
      label: data.label,
      recipientName: data.recipientName,
      phoneNumber: data.phoneNumber,
      fullAddress: data.fullAddress,
      district: data.district,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      notes: data.notes || "",
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, address]);
    setSelectedAddress(address);
    setIsAddingNewAddress(false);
    setIsAddressDialogOpen(false);

    // Reset form
    addressForm.reset();
  };

  const shippingCost = 50000; // Flat shipping cost
  const grandTotal = calculateSubtotal() + shippingCost;

  // Validation: Cannot checkout without address
  const canCheckout = selectedAddress !== null && cartItems.length > 0;

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Keranjang Belanja
                </h1>
                <p className="text-gray-600 mt-1">
                  {cartItems.length} item dalam keranjang
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Shipping Address Section */}
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    Alamat Pengiriman
                  </h2>
                  {selectedAddress ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-semibold">
                          {selectedAddress.label}
                        </Badge>
                        {selectedAddress.isDefault && (
                          <Badge className="bg-primary text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedAddress.recipientName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedAddress.phoneNumber}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">
                        {selectedAddress.fullAddress}
                        <br />
                        {selectedAddress.district}, {selectedAddress.city},{" "}
                        {selectedAddress.province} {selectedAddress.postalCode}
                      </p>
                      {selectedAddress.notes && (
                        <p className="text-xs text-gray-500 italic">
                          Catatan: {selectedAddress.notes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        Anda belum memilih alamat pengiriman. Silakan pilih atau
                        tambah alamat terlebih dahulu.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Change Address Button */}
              <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    {selectedAddress ? "Ganti Alamat" : "Pilih Alamat"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {isAddingNewAddress ? "Tambah Alamat Baru" : "Pilih Alamat Pengiriman"}
                    </DialogTitle>
                    <DialogDescription>
                      {isAddingNewAddress
                        ? "Isi form di bawah untuk menambah alamat pengiriman baru"
                        : "Pilih alamat pengiriman atau tambah alamat baru"}
                    </DialogDescription>
                  </DialogHeader>

                  {!isAddingNewAddress ? (
                    <div className="space-y-4 mt-4">
                      {/* Address List */}
                      {addresses.map((address) => (
                        <Card
                          key={address.id}
                          className={`p-4 cursor-pointer transition-all ${
                            selectedAddress?.id === address.id
                              ? "border-2 border-primary bg-primary/5"
                              : "hover:border-gray-400"
                          }`}
                          onClick={() => handleSelectAddress(address)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-semibold">
                              {address.label}
                            </Badge>
                            {address.isDefault && (
                              <Badge className="bg-primary text-white text-xs">
                                Default
                              </Badge>
                            )}
                            {selectedAddress?.id === address.id && (
                              <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                            )}
                          </div>
                          <p className="font-semibold text-gray-900">
                            {address.recipientName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.phoneNumber}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {address.fullAddress}
                            <br />
                            {address.district}, {address.city}, {address.province}{" "}
                            {address.postalCode}
                          </p>
                        </Card>
                      ))}

                      {/* Add New Address Button */}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsAddingNewAddress(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Alamat Baru
                      </Button>
                    </div>
                  ) : (
                    /* New Address Form with react-hook-form + Zod */
                    <Form {...addressForm}>
                      <form
                        onSubmit={addressForm.handleSubmit(handleAddNewAddress)}
                        className="space-y-4 mt-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={addressForm.control}
                            name="label"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Label Alamat *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Rumah, Kantor, Gudang"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addressForm.control}
                            name="recipientName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nama Penerima *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nama lengkap" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={addressForm.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nomor Telepon *</FormLabel>
                              <FormControl>
                                <Input placeholder="08xxxxxxxxxx" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addressForm.control}
                          name="fullAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alamat Lengkap *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Jl. Nama Jalan No. XX, RT/RW"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                              {/* TODO: Google Maps API Integration */}
                              {/* <Button variant="outline" size="sm" className="mt-2">
                                <MapPin className="h-4 w-4 mr-2" />
                                Pilih dari Peta (Google Maps)
                              </Button> */}
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={addressForm.control}
                            name="district"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Kecamatan *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Kecamatan" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addressForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Kota *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Kota" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addressForm.control}
                            name="province"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Provinsi *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Provinsi" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={addressForm.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kode Pos *</FormLabel>
                              <FormControl>
                                <Input placeholder="12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addressForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Catatan (Opsional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Patokan atau ciri-ciri rumah"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setIsAddingNewAddress(false);
                              addressForm.reset();
                            }}
                          >
                            Batal
                          </Button>
                          <Button type="submit" className="flex-1">
                            Simpan Alamat
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          {cartItems.length === 0 ? (
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
                {cartItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.slug}`}
                        className="flex-shrink-0"
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
                      <span>Subtotal ({cartItems.length} item)</span>
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

                  <Link href="/checkout">
                    <Button size="lg" className="w-full" disabled={!canCheckout}>
                      Lanjut ke Pembayaran
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>

                  {!selectedAddress && cartItems.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 text-center">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        Pilih alamat pengiriman untuk melanjutkan checkout
                      </p>
                    </div>
                  )}

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
                      <strong>💡 Info:</strong> Ongkos kirim dihitung berdasarkan
                      jarak pengiriman. Biaya final akan dikonfirmasi saat checkout.
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
