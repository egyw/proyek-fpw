import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Plus,
  Home,
  ShoppingBag,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { trpc } from "@/utils/trpc";

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

// Zod schema for address form validation (same as checkout)
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
  latitude?: number;
  longitude?: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Login Diperlukan", {
        description: "Silakan login untuk mengakses halaman profil",
      });
      router.push("/auth/login");
    }
  }, [status, router]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
  });

  // Address State
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  // Address form with react-hook-form + Zod (same as checkout)
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

  // Password State
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Phone Notification State (show when phone not set)
  const [showPhoneNotification, setShowPhoneNotification] = useState(false);

  // Map location state (for AddressMapPicker)
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // tRPC Queries and Mutations
  const { data: profileData, refetch: refetchProfile } = trpc.user.getProfile.useQuery();
  const { data: addressesData, refetch: refetchAddresses } = trpc.user.getAddresses.useQuery();
  const { data: ordersData } = trpc.orders.getUserOrders.useQuery();
  
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success("Profil Berhasil Diperbarui!");
      setIsEditingProfile(false);
      // Refetch profile data from database
      const updatedProfile = await refetchProfile();
      // Update profileForm state with latest data
      if (updatedProfile.data?.profile) {
        setProfileForm({
          fullName: updatedProfile.data.profile.fullName || "",
          phone: updatedProfile.data.profile.phone || "",
        });
      }
      // Update NextAuth session to reflect changes in navbar/header
      // This will trigger a session refresh without page reload
      await fetch('/api/auth/session?update');
    },
    onError: (error) => {
      // Parse Zod error if it's in JSON format
      let errorMessage = error.message;
      
      // Zod validation errors come as stringified JSON array
      if (errorMessage.startsWith('[') && errorMessage.includes('"message"')) {
        try {
          const parsed = JSON.parse(errorMessage);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.message) {
            errorMessage = parsed[0].message;
          }
        } catch (e) {
          // If parsing fails, keep original message
          console.error('Error parsing validation message:', e);
        }
      }
      
      toast.error("Gagal Memperbarui Profil", {
        description: errorMessage,
      });
    },
  });

  const addAddressMutation = trpc.user.addAddress.useMutation({
    onSuccess: () => {
      toast.success("Alamat Berhasil Ditambahkan!");
      setShowAddressDialog(false);
      refetchAddresses();
    },
    onError: (error) => {
      toast.error("Gagal Menambahkan Alamat", {
        description: error.message,
      });
    },
  });

  const updateAddressMutation = trpc.user.updateAddress.useMutation({
    onSuccess: () => {
      toast.success("Alamat Berhasil Diperbarui!");
      setShowAddressDialog(false);
      refetchAddresses();
    },
    onError: (error) => {
      toast.error("Gagal Memperbarui Alamat", {
        description: error.message,
      });
    },
  });

  const deleteAddressMutation = trpc.user.deleteAddress.useMutation({
    onSuccess: () => {
      toast.success("Alamat Berhasil Dihapus!");
      refetchAddresses();
    },
    onError: (error) => {
      toast.error("Gagal Menghapus Alamat", {
        description: error.message,
      });
    },
  });

  const setDefaultAddressMutation = trpc.user.setDefaultAddress.useMutation({
    onSuccess: () => {
      toast.success("Alamat Default Berhasil Diubah!");
      refetchAddresses();
    },
    onError: (error) => {
      toast.error("Gagal Mengubah Alamat Default", {
        description: error.message,
      });
    },
  });

  const changePasswordMutation = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password Berhasil Diubah!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast.error("Gagal Mengubah Password", {
        description: error.message,
      });
    },
  });

  const addresses = addressesData?.addresses || [];

  // Order statistics
  const orders = ordersData?.orders || [];
  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (order) => order.orderStatus === 'completed'
  ).length;

  // Initialize profile form from tRPC data
  useEffect(() => {
    if (profileData?.profile) {
      setProfileForm({
        fullName: profileData.profile.fullName || "",
        phone: profileData.profile.phone || "",
      });
    }
  }, [profileData]);

  // Show phone notification popup setiap kali user buka profile (jika phone belum di-set)
  useEffect(() => {
    if (session?.user) {
      const phoneNotSet = !session.user.phone || session.user.phone === '0000000000';
      if (phoneNotSet) {
        setShowPhoneNotification(true);
      }
    }
  }, [session?.user]);

  // Handle location selection from map (same as checkout)
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

  // Handle Profile Update
  const handleUpdateProfile = () => {
    if (!profileForm.fullName.trim()) {
      toast.error("Nama Lengkap Wajib Diisi");
      return;
    }

    if (!profileForm.phone.trim() || profileForm.phone.length < 10) {
      toast.error("Nomor Telepon Tidak Valid", {
        description: "Masukkan nomor telepon minimal 10 digit",
      });
      return;
    }

    // Validate phone is numeric only
    if (!/^[0-9]+$/.test(profileForm.phone)) {
      toast.error("Nomor Telepon Tidak Valid", {
        description: "Nomor telepon hanya boleh berisi angka",
      });
      return;
    }

    updateProfileMutation.mutate({
      fullName: profileForm.fullName,
      phone: profileForm.phone,
    });
  };

  // Handle Address Dialog Open
  const handleAddNewAddress = () => {
    setEditingAddress(null);
    // Reset react-hook-form
    addressForm.reset({
      label: "",
      recipientName: "",
      phoneNumber: "",
      fullAddress: "",
      district: "",
      city: "",
      province: "",
      postalCode: "",
      notes: "",
    });
    setMapLocation(null);
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    // Populate react-hook-form
    addressForm.reset({
      label: address.label,
      recipientName: address.recipientName,
      phoneNumber: address.phoneNumber,
      fullAddress: address.fullAddress,
      district: address.district,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      notes: address.notes || "",
    });
    // Set map location if available
    if (address.latitude && address.longitude) {
      setMapLocation({
        lat: address.latitude,
        lng: address.longitude,
      });
    } else {
      setMapLocation(null);
    }
    setShowAddressDialog(true);
  };

  // Handle Save Address (react-hook-form handler)
  const handleSaveAddress = async (data: AddressFormValues) => {
    try {
      if (editingAddress) {
        await updateAddressMutation.mutateAsync({
          addressId: editingAddress.id,
          data: {
            ...data,
            latitude: mapLocation?.lat,
            longitude: mapLocation?.lng,
          },
        });
      } else {
        await addAddressMutation.mutateAsync({
          ...data,
          latitude: mapLocation?.lat,
          longitude: mapLocation?.lng,
        });
      }
      
      // Reset form and close dialog
      addressForm.reset();
      setMapLocation(null);
      setShowAddressDialog(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };



  // Handle Delete Address
  const handleDeleteAddress = (addressId: string) => {
    const address = addresses.find((a) => a.id === addressId);
    if (address?.isDefault) {
      toast.error("Tidak Dapat Menghapus Alamat Utama", {
        description: "Tetapkan alamat lain sebagai utama terlebih dahulu",
      });
      return;
    }

    if (addresses.length === 1) {
      toast.error("Tidak Dapat Menghapus", {
        description: "Minimal harus ada 1 alamat",
      });
      return;
    }

    deleteAddressMutation.mutate({ addressId });
  };

  // Handle Set Default Address
  const handleSetDefaultAddress = (addressId: string) => {
    setDefaultAddressMutation.mutate({ addressId });
  };

  // Handle Change Password
  const handleChangePassword = () => {
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Lengkapi Semua Field Password");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password Baru Minimal 8 Karakter");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Password Baru Tidak Cocok", {
        description: "Pastikan konfirmasi password sama",
      });
      return;
    }

    changePasswordMutation.mutate({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  if (status === "loading") {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <Card className="mb-8 border-0 shadow-sm">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                  <AvatarImage src="" alt={session.user.name || ""} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {session.user.name}
                  </h1>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-sm">{session.user.email}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm">@{session.user.username}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {session.user.phone && session.user.phone !== '0000000000' ? session.user.phone : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="flex lg:ml-auto gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center min-w-[120px] border border-blue-200">
                  <ShoppingBag className="h-7 w-7 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900 mb-1">{totalOrders || 0}</p>
                  <p className="text-xs text-blue-700 font-medium">Total Pesanan</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center min-w-[120px] border border-green-200">
                  <ShoppingBag className="h-7 w-7 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900 mb-1">{completedOrders || 0}</p>
                  <p className="text-xs text-green-700 font-medium">Selesai</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-100 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="addresses" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <MapPin className="h-4 w-4 mr-2" />
              Alamat
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Lock className="h-4 w-4 mr-2" />
              Keamanan
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Profile */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-sm">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Informasi Pribadi
                    </h2>
                    <p className="text-sm text-gray-500">
                      Kelola informasi profil Anda
                    </p>
                  </div>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingProfile(true);
                        // Set form values from latest profileData (not session - session might be stale)
                        if (profileData?.profile) {
                          setProfileForm({
                            fullName: profileData.profile.fullName || "",
                            phone: profileData.profile.phone || "",
                          });
                        }
                      }}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profil
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama Lengkap *</Label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, fullName: e.target.value })
                        }
                        disabled={!isEditingProfile}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>

                    {/* Username (read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={session.user.username || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={session.user.email || ""}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">
                        Email tidak dapat diubah
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon *</Label>
                      <Input
                        id="phone"
                        value={isEditingProfile ? profileForm.phone : (session?.user?.phone && session.user.phone !== '0000000000' ? session.user.phone : '')}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        disabled={!isEditingProfile}
                        placeholder={isEditingProfile ? "08xxxxxxxxxx" : (session?.user?.phone && session.user.phone !== '0000000000' ? session.user.phone : '-')}
                      />
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingProfile(false);
                          // Reset form
                          if (session?.user) {
                            setProfileForm({
                              fullName: session.user.name || "",
                              phone: session.user.phone && session.user.phone !== '0000000000' ? session.user.phone : "",
                            });
                          }
                        }}
                      >
                        Batal
                      </Button>
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab 2: Addresses */}
          <TabsContent value="addresses">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Alamat Pengiriman
                  </h2>
                  <p className="text-sm text-gray-500">
                    Kelola alamat pengiriman untuk pesanan Anda
                  </p>
                </div>
                <Button onClick={handleAddNewAddress} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Alamat
                </Button>
              </div>

              {addresses.length === 0 ? (
                <Card className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Belum ada alamat tersimpan</p>
                  <Button onClick={handleAddNewAddress}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Alamat Pertama
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <Card key={address.id} className="relative border-0 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-6">
                        {/* Address Label & Default Badge */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Home className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-gray-900">
                              {address.label}
                            </h3>
                          </div>
                          {address.isDefault && (
                            <Badge className="bg-green-100 text-green-800">
                              Utama
                            </Badge>
                          )}
                        </div>

                        {/* Recipient Info */}
                        <div className="space-y-2 mb-4">
                          <p className="font-medium text-gray-900">
                            {address.recipientName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.phoneNumber}
                          </p>
                          <Separator />
                          <p className="text-sm text-gray-700">
                            {address.fullAddress}
                          </p>
                          <p className="text-sm text-gray-700">
                            {address.district}, {address.city}
                          </p>
                          <p className="text-sm text-gray-700">
                            {address.province} {address.postalCode}
                          </p>
                          {address.notes && (
                            <p className="text-xs text-gray-500 italic">
                              Catatan: {address.notes}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {!address.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleSetDefaultAddress(address.id)}
                            >
                              Jadikan Utama
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 3: Security */}
          <TabsContent value="security">
            <Card className="border-0 shadow-sm">
              <div className="p-8">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Ubah Password
                    </h2>
                    <p className="text-sm text-gray-500">
                      Pastikan akun Anda aman dengan password yang kuat
                    </p>
                  </div>
                  <div className="space-y-5">
                    {/* Old Password */}
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Password Lama *</Label>
                      <div className="relative">
                        <Input
                          id="oldPassword"
                          type={showOldPassword ? "text" : "password"}
                          value={passwordForm.oldPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              oldPassword: e.target.value,
                            })
                          }
                          placeholder="Masukkan password lama"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onMouseDown={() => setShowOldPassword(true)}
                          onMouseUp={() => setShowOldPassword(false)}
                          onMouseLeave={() => setShowOldPassword(false)}
                          onTouchStart={() => setShowOldPassword(true)}
                          onTouchEnd={() => setShowOldPassword(false)}
                        >
                          {showOldPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Password Baru *</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Minimal 8 karakter"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onMouseDown={() => setShowNewPassword(true)}
                          onMouseUp={() => setShowNewPassword(false)}
                          onMouseLeave={() => setShowNewPassword(false)}
                          onTouchStart={() => setShowNewPassword(true)}
                          onTouchEnd={() => setShowNewPassword(false)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Konfirmasi Password Baru *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Ketik ulang password baru"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onMouseDown={() => setShowConfirmPassword(true)}
                          onMouseUp={() => setShowConfirmPassword(false)}
                          onMouseLeave={() => setShowConfirmPassword(false)}
                          onTouchStart={() => setShowConfirmPassword(true)}
                          onTouchEnd={() => setShowConfirmPassword(false)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        onClick={handleChangePassword} 
                        className="w-full"
                        disabled={changePasswordMutation.isPending}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {changePasswordMutation.isPending ? "Mengubah..." : "Ubah Password"}
                      </Button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 leading-relaxed">
                        <strong>Tips Keamanan:</strong> Gunakan kombinasi huruf
                        besar, huruf kecil, angka, dan simbol untuk password yang
                        lebih aman.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Phone Notification Dialog */}
      <Dialog open={showPhoneNotification} onOpenChange={setShowPhoneNotification}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Lengkapi Nomor Telepon Anda
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Nomor telepon diperlukan untuk menerima notifikasi pesanan dan konfirmasi pengiriman.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-semibold text-sm">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Edit Profil</p>
                  <p className="text-xs text-gray-600">Klik tombol &ldquo;Edit Profil&rdquo; di tab Profil</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-semibold text-sm">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Isi Nomor Telepon</p>
                  <p className="text-xs text-gray-600">Format: 08xxxxxxxxxx (10-13 digit)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-semibold text-sm">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Simpan Perubahan</p>
                  <p className="text-xs text-gray-600">Klik tombol &ldquo;Simpan Perubahan&rdquo; untuk menyimpan</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowPhoneNotification(false)}
              className="w-full sm:w-auto px-8"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Perbarui informasi alamat pengiriman"
                : "Isi form di bawah untuk menambah alamat pengiriman baru"}
            </DialogDescription>
          </DialogHeader>

          <Form {...addressForm}>
            <form
              onSubmit={addressForm.handleSubmit(handleSaveAddress)}
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
                        <Input placeholder="Rumah / Kantor / Gudang" {...field} />
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
                        <Input placeholder="Nama lengkap penerima" {...field} />
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
                      <Textarea
                        placeholder="Pilih lokasi dari peta untuk mengisi otomatis"
                        rows={3}
                        {...field}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 Alamat otomatis terisi dari peta
                    </p>
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
                        <Input 
                          placeholder="Otomatis dari peta" 
                          {...field} 
                          readOnly
                          className="bg-gray-50 cursor-not-allowed"
                        />
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
                        <Input 
                          placeholder="Otomatis dari peta" 
                          {...field} 
                          readOnly
                          className="bg-gray-50 cursor-not-allowed"
                        />
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
                          placeholder="Otomatis dari peta" 
                          {...field} 
                          readOnly
                          className="bg-gray-50 cursor-not-allowed"
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
                        <Input 
                          placeholder="Otomatis dari peta" 
                          maxLength={5} 
                          {...field} 
                          readOnly
                          className="bg-gray-50 cursor-not-allowed"
                        />
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
                      <Textarea
                        placeholder="Patokan atau ciri khusus (warna rumah, dekat landmark, dll)"
                        rows={2}
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
                    setShowAddressDialog(false);
                    setEditingAddress(null);
                    addressForm.reset();
                    setMapLocation(null);
                  }}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                >
                  {(addAddressMutation.isPending || updateAddressMutation.isPending)
                    ? "Menyimpan..."
                    : editingAddress
                      ? "Simpan Perubahan"
                      : "Tambah Alamat"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
