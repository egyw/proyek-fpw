import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useCartStore } from "@/store/cartStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { calculateCartTotalWeight } from "@/lib/shippingHelpers";
import {
  ShoppingBag,
  MapPin,
  Truck,
  CreditCard,
  AlertCircle,
  ChevronLeft,
  Edit,
  CheckCircle2,
} from "lucide-react";

// Dynamic import for AddressMapPicker to avoid SSR issues with Leaflet
const DynamicAddressMapPicker = dynamic(
  () => import("@/components/AddressMapPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Memuat peta...</p>
      </div>
    ),
  }
);

// Dynamic import for ShippingCalculator
const DynamicShippingCalculator = dynamic(
  () => import("@/components/ShippingCalculator"),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
  }
);

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
  isDefault: boolean;
}

interface ShippingOption {
  courier: string;
  courierName: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

// Zod schema for address form validation
const addressSchema = z.object({
  label: z.string().min(1, "Label alamat harus diisi"),
  recipientName: z.string().min(1, "Nama penerima harus diisi"),
  phoneNumber: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit"),
  fullAddress: z.string().min(5, "Alamat lengkap minimal 5 karakter"),
  district: z.string().min(1, "Kecamatan harus diisi"),
  city: z.string().min(1, "Kota harus diisi"),
  province: z.string().min(1, "Provinsi harus diisi"),
  postalCode: z.string().min(5, "Kode pos minimal 5 digit"),
  notes: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

// Helper function: Map city name to RajaOngkir city ID (to skip API search)
// TODO: Ideally, store city ID in user address when they select city
function getCityIdFromName(cityName: string): string | undefined {
  // Common Indonesian cities mapping (RajaOngkir city IDs)
  const cityIdMap: Record<string, string> = {
    // DKI Jakarta
    'Jakarta': '151', // Jakarta Pusat
    'Jakarta Pusat': '151',
    'Jakarta Utara': '152',
    'Jakarta Barat': '153',
    'Jakarta Selatan': '154',
    'Jakarta Timur': '155',
    
    // Jawa Barat
    'Bandung': '23',
    'Bekasi': '24',
    'Bogor': '25',
    'Depok': '78',
    'Cimahi': '65',
    
    // Jawa Tengah
    'Semarang': '444',
    'Surakarta': '455',
    'Solo': '455',
    'Tegal': '464',
    'Magelang': '309',
    
    // DI Yogyakarta
    'Yogyakarta': '501',
    'Sleman': '419',
    'Bantul': '22',
    
    // Jawa Timur
    'Surabaya': '444',
    'Malang': '311',
    'Sidoarjo': '410',
    'Gresik': '155',
    
    // Bali
    'Denpasar': '75',
    'Badung': '17',
    'Gianyar': '119',
    
    // Sumatera
    'Medan': '324',
    'Palembang': '349',
    'Pekanbaru': '362',
    'Batam': '23',
    'Padang': '348',
    
    // Kalimantan
    'Balikpapan': '20',
    'Samarinda': '410',
    'Banjarmasin': '22',
    'Pontianak': '374',
    
    // Sulawesi
    'Makassar': '310',
    'Manado': '312',
    
    // Add more cities as needed...
  };
  
  return cityIdMap[cityName];
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export default function CheckoutPage() {
  const router = useRouter();
  
  // ✅ Protect page - redirect guest to login
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  // Cart store (for logged in users, we'll use tRPC cart)
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Get user data
  const { data: userAddresses, isLoading: addressesLoading, refetch: refetchAddresses } = trpc.user.getAddresses.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: cartData, isLoading: cartLoading } = trpc.cart.getCart.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Create order mutation
  const createOrderMutation = trpc.orders.createOrder.useMutation();

  // Add address mutation
  const addAddressMutation = trpc.user.addAddress.useMutation({
    onSuccess: () => {
      refetchAddresses();
      toast.success('Alamat Berhasil Ditambahkan', {
        description: 'Alamat pengiriman baru telah disimpan.',
      });
    },
    onError: (error) => {
      toast.error('Gagal Menambahkan Alamat', {
        description: error.message,
      });
    },
  });

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // ⭐ Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  // Determine cart items (from tRPC if logged in, from Zustand if guest)
  const items = isAuthenticated ? (cartData?.items || []) : cartItems;

  // ⭐ Fetch product attributes for accurate weight calculation
  // Get unique product IDs from cart
  const productIds = [...new Set(items.map(item => item.productId))];
  
  // Query products to get attributes (weight_kg, etc.)
  const { data: productsData } = trpc.products.getByIds.useQuery(
    { productIds },
    { enabled: productIds.length > 0 }
  );
  
  // Create map of productId → attributes for weight calculation
  const productsAttributesMap = productsData?.products.reduce((acc, product) => {
    acc[product._id] = product.attributes as Record<string, string | number | boolean>;
    return acc;
  }, {} as Record<string, Record<string, string | number | boolean>>) || {};

  // ⭐ Calculate total weight for shipping (WITH product attributes)
  const totalWeight = calculateCartTotalWeight(items, productsAttributesMap);

  // Set default address when addresses load
  useEffect(() => {
    if (userAddresses?.addresses && userAddresses.addresses.length > 0 && !selectedAddress) {
      const defaultAddr = userAddresses.addresses.find((addr) => addr.isDefault) || userAddresses.addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [userAddresses, selectedAddress]);

  // Calculate totals
  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingCost = selectedShipping?.cost || 0; // Dynamic shipping cost from RajaOngkir
  const total = subtotal + shippingCost;

  // Handle select shipping
  const handleSelectShipping = (option: ShippingOption) => {
    setSelectedShipping(option);
  };

  // Handle select address
  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsAddressDialogOpen(false);
  };

  // Handle location selection from map
  const handleLocationSelect = (
    location: { lat: number; lng: number },
    address: {
      fullAddress: string;
      district: string;
      city: string;
      province: string;
      postalCode: string;
    }
  ) => {
    setMapLocation(location);

    // Auto-fill form fields from map selection
    addressForm.setValue("fullAddress", address.fullAddress);
    addressForm.setValue("district", address.district);
    addressForm.setValue("city", address.city);
    addressForm.setValue("province", address.province);
    addressForm.setValue("postalCode", address.postalCode);

    toast.success("Lokasi Dipilih", {
      description: "Alamat berhasil diambil dari peta. Silakan periksa dan lengkapi data.",
    });
  };

  // Handle add new address
  const handleAddNewAddress = async (data: AddressFormValues) => {
    try {
      const result = await addAddressMutation.mutateAsync({
        label: data.label,
        recipientName: data.recipientName,
        phoneNumber: data.phoneNumber,
        fullAddress: data.fullAddress,
        district: data.district,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        notes: data.notes,
        latitude: mapLocation?.lat,
        longitude: mapLocation?.lng,
      });

      // Set as selected address
      if (result.address) {
        setSelectedAddress(result.address);
      }
      
      setIsAddingNewAddress(false);
      setIsAddressDialogOpen(false);

      // Reset form and map location
      addressForm.reset();
      setMapLocation(null);
    } catch (error) {
      // Error already handled by mutation onError
      console.error('Failed to add address:', error);
    }
  };

  // Handle place order (Create order and get Snap token)
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Alamat Belum Dipilih', {
        description: 'Silakan pilih alamat pengiriman terlebih dahulu.',
      });
      return;
    }

    if (!selectedShipping) {
      toast.error('Pengiriman Belum Dipilih', {
        description: 'Silakan pilih metode pengiriman terlebih dahulu.',
      });
      return;
    }

    if (items.length === 0) {
      toast.error('Keranjang Kosong', {
        description: 'Tidak ada produk di keranjang.',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // ⭐ Create order with Midtrans integration
      const result = await createOrderMutation.mutateAsync({
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
        })),
        shippingAddress: {
          recipientName: selectedAddress.recipientName,
          phoneNumber: selectedAddress.phoneNumber,
          fullAddress: selectedAddress.fullAddress,
          district: selectedAddress.district,
          city: selectedAddress.city,
          province: selectedAddress.province,
          postalCode: selectedAddress.postalCode,
          notes: selectedAddress.notes,
        },
        subtotal,
        shippingCost,
        total,
        paymentMethod: 'midtrans', // ⭐ Midtrans only
      });

      // ⭐ Save order ID and redirect to order detail page
      if (result.snapToken) {
        // ⭐ Clear cart immediately after order created
        // This prevents user from creating duplicate orders
        if (cartItems.length > 0) {
          clearCart(); // Clear Zustand store (frontend)
        }
        // Backend cart is already cleared by createOrder mutation

        // ⭐ Close dialog
        setShowConfirmDialog(false);

        toast.success('Pesanan Berhasil Dibuat!', {
          description: `Order ID: ${result.orderId}. Mengarahkan ke halaman pembayaran...`,
        });

        // ⭐ Redirect to order detail page with auto-pay flag
        // Order detail page will auto-open Midtrans popup
        setTimeout(() => {
          router.push(`/orders/${result.orderId}?auto_pay=true`);
        }, 500); // Small delay to show toast
      }
    } catch (error) {
      console.error('Place order error:', error);
      toast.error('Gagal Membuat Pesanan', {
        description: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading while checking auth
  if (authLoading || addressesLoading || cartLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat checkout...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Prevent flash of checkout page if not authenticated
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Mengalihkan ke login...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Check if cart is empty
  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Keranjang Kosong
            </h1>
            <p className="text-gray-600 mb-8">
              Anda belum memiliki produk di keranjang. Mulai belanja sekarang!
            </p>
            <Button size="lg" onClick={() => router.push('/products')}>
              Belanja Sekarang
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/cart')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Kembali ke Keranjang
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Lengkapi informasi pengiriman dan selesaikan pembayaran Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
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
                            <Badge className="bg-primary text-white text-xs">
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
                        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                        <p className="text-sm text-yellow-800">
                          Silakan pilih atau tambah alamat pengiriman.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Change Address Button with Dialog */}
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
                        {userAddresses?.addresses && userAddresses.addresses.length > 0 ? (
                          <>
                            <div className="space-y-3">
                              {userAddresses.addresses.map((address) => (
                                <button
                                  key={address.id}
                                  onClick={() => handleSelectAddress(address)}
                                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                    selectedAddress?.id === address.id
                                      ? "border-primary bg-primary/5"
                                      : "border-gray-200 hover:border-primary/50"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="font-semibold">
                                        {address.label}
                                      </Badge>
                                      {address.isDefault && (
                                        <Badge className="bg-primary text-white">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Default
                                        </Badge>
                                      )}
                                    </div>
                                    {selectedAddress?.id === address.id && (
                                      <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                                    )}
                                  </div>
                                  <p className="font-semibold text-gray-900 mb-1">
                                    {address.recipientName}
                                  </p>
                                  <p className="text-sm text-gray-600 mb-1">
                                    {address.phoneNumber}
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {address.fullAddress}
                                    <br />
                                    {address.district}, {address.city}, {address.province}{" "}
                                    {address.postalCode}
                                  </p>
                                  {address.notes && (
                                    <p className="text-xs text-gray-500 italic mt-1">
                                      Catatan: {address.notes}
                                    </p>
                                  )}
                                </button>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setIsAddingNewAddress(true)}
                            >
                              Tambah Alamat Baru
                            </Button>
                          </>
                        ) : (
                          /* Empty State */
                          <div className="text-center py-8 space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                              <MapPin className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-semibold text-gray-900">Belum Ada Alamat</h3>
                              <p className="text-sm text-gray-600 max-w-md mx-auto">
                                Anda belum memiliki alamat pengiriman tersimpan. Tambahkan alamat pertama Anda untuk melanjutkan checkout.
                              </p>
                            </div>
                            <Button
                              className="mt-4"
                              onClick={() => setIsAddingNewAddress(true)}
                            >
                              Tambah Alamat
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Add New Address Form */
                      <Form {...addressForm}>
                        <form
                          onSubmit={addressForm.handleSubmit(handleAddNewAddress)}
                          className="space-y-6 mt-4"
                        >
                          {/* Map Picker */}
                          <div className="space-y-2">
                            <DynamicAddressMapPicker
                              onLocationSelect={handleLocationSelect}
                              initialLocation={mapLocation || undefined}
                            />
                            <p className="text-xs text-gray-500">
                              Klik pada peta untuk memilih lokasi pengiriman
                            </p>
                          </div>

                          {/* Form Fields */}
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={addressForm.control}
                              name="label"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Label Alamat *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Rumah / Kantor / Gudang"
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
                                    <Input placeholder="John Doe" {...field} />
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
                                  <Input
                                    type="tel"
                                    placeholder="08123456789"
                                    {...field}
                                  />
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
                                    placeholder="Jl. Contoh No. 123"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={addressForm.control}
                              name="district"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Kecamatan *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Menteng" {...field} />
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
                                    <Input placeholder="Jakarta" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={addressForm.control}
                              name="province"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Provinsi *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="DKI Jakarta"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
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
                          </div>

                          <FormField
                            control={addressForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Catatan (Opsional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Patokan: Dekat warung Mak Jae"
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
                                setMapLocation(null);
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

            {/* Shipping Method - Dynamic with RajaOngkir */}
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <Truck className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Metode Pengiriman
                  </h2>
                  
                  {selectedAddress ? (
                    <DynamicShippingCalculator
                      destinationCity={selectedAddress.city}
                      destinationCityId={getCityIdFromName(selectedAddress.city)} // Pass city ID to skip search
                      destinationCountry="Indonesia" // Add country field to Address if needed for international
                      cartWeight={totalWeight}
                      rajaOngkirPlan="free" // Change to "all" if user has paid plan
                      onSelectShipping={handleSelectShipping}
                      selectedShipping={selectedShipping || undefined}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                      <p className="text-sm text-yellow-800">
                        Pilih alamat pengiriman untuk melihat opsi pengiriman.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <ShoppingBag className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">
                    Produk Pesanan ({items.length} item)
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <Badge variant="outline" className="mb-2 text-xs">
                        {item.category}
                      </Badge>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.unit} × Rp{' '}
                          {item.price.toLocaleString('id-ID')}
                        </p>
                        <p className="font-bold text-gray-900">
                          Rp{' '}
                          {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Ringkasan Pesanan
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} item)</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Biaya Pengiriman</span>
                  {selectedShipping ? (
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        Rp {shippingCost.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedShipping.courierName} - {selectedShipping.service}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm italic">Pilih pengiriman</span>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>

              {/* Create Order Button */}
              <Button
                className="w-full h-12 text-lg"
                onClick={() => setShowConfirmDialog(true)}
                disabled={!selectedAddress || !selectedShipping}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Buat Pesanan
              </Button>

              {!selectedShipping && selectedAddress && (
                <p className="text-xs text-yellow-600 text-center mt-2">
                  Pilih metode pengiriman untuk melanjutkan
                </p>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                Dengan melanjutkan, Anda menyetujui{' '}
                <span className="text-primary">Syarat & Ketentuan</span> kami
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Konfirmasi Pesanan</DialogTitle>
            <DialogDescription>
              Periksa kembali detail pesanan Anda sebelum melanjutkan ke pembayaran
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Alamat Pengiriman */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">
                Alamat Pengiriman
              </h3>
              {selectedAddress && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium">{selectedAddress.label}</p>
                  <p className="text-sm text-gray-700">
                    {selectedAddress.recipientName} ({selectedAddress.phoneNumber})
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.fullAddress}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.district}, {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}
                  </p>
                  {selectedAddress.notes && (
                    <p className="text-xs text-gray-500 italic">
                      Catatan: {selectedAddress.notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Metode Pengiriman */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">
                Metode Pengiriman
              </h3>
              {selectedShipping && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {selectedShipping.courierName} - {selectedShipping.service}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedShipping.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Estimasi: {selectedShipping.etd} hari
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      {formatCurrency(selectedShipping.cost)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Daftar Produk */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">
                Daftar Produk ({items.length} item)
              </h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.unit}`}
                    className="flex gap-4 bg-gray-50 p-3 rounded-lg"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} {item.unit.toUpperCase()} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ringkasan Pembayaran */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">
                Ringkasan Pembayaran
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal Produk</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Biaya Pengiriman</span>
                  <span className="font-medium">
                    {formatCurrency(shippingCost)}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-xl text-primary">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Metode Pembayaran */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Metode Pembayaran: Midtrans
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Setelah konfirmasi, Anda akan diarahkan ke halaman pembayaran Midtrans untuk menyelesaikan transaksi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isProcessing}
              className="min-w-[100px]"
            >
              Batal
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="min-w-[180px]"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Konfirmasi & Buat Pesanan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
