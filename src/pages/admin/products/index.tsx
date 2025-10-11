import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Plus, Upload } from "lucide-react";

// Form validation schema
const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  category: z.string().min(1, "Kategori harus dipilih"),
  brand: z.string().min(1, "Brand harus diisi"),
  unit: z.string().min(1, "Unit harus dipilih"),
  price: z.string().min(1, "Harga harus diisi").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Harga harus berupa angka positif",
  }),
  originalPrice: z.string().optional(),
  stock: z.string().min(1, "Stok harus diisi").refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Stok harus berupa angka positif atau 0",
  }),
  minStock: z.string().optional(),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  discount: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const [addDialog, setAddDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      brand: "",
      unit: "",
      price: "",
      originalPrice: "",
      stock: "",
      minStock: "",
      description: "",
      discount: "",
      isActive: true,
      isFeatured: false,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProductFormValues) => {
    // TODO: Call tRPC mutation to create product
    console.log("Create product:", data);
    setAddDialog(false);
    form.reset();
    setImagePreview("");
  };
  // TODO: Replace with tRPC query
  // Expected API: trpc.products.getAll.useQuery()
  // Output: Product[]
  const products = [
    {
      id: "68b8340ed2788dc4d9e608b1",
      name: "Semen Gresik 50kg",
      slug: "semen-gresik-50kg",
      category: "Semen",
      brand: "Gresik",
      unit: "SAK",
      price: 65000,
      originalPrice: 81250,
      discount: { percentage: 20, validUntil: "2025-12-31T23:59:59Z" },
      stock: 150,
      minStock: 20,
      images: ["/images/dummy_image.jpg"],
      description: "Semen Portland berkualitas tinggi untuk konstruksi bangunan.",
      rating: { average: 4.8, count: 234 },
      sold: 234,
      views: 1250,
      attributes: { type: "Portland Type I", weight: "50kg", origin: "Indonesia" },
      isActive: true,
      isFeatured: false,
      status: "active",
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-04-01T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b2",
      name: "Cat Tembok Avian 5kg",
      slug: "cat-tembok-avian-5kg-putih",
      category: "Cat",
      brand: "Avian",
      unit: "KALENG",
      price: 180000,
      originalPrice: 211765,
      discount: { percentage: 15, validUntil: "2025-11-30T23:59:59Z" },
      stock: 45,
      minStock: 10,
      images: ["/images/dummy_image.jpg"],
      description: "Cat tembok interior premium dengan daya tutup maksimal.",
      rating: { average: 4.7, count: 189 },
      sold: 189,
      views: 890,
      attributes: { color: "Putih", weight: "5kg", coverage: "8-10 m2/kg", finish: "Matte" },
      isActive: true,
      isFeatured: true,
      status: "active",
      createdAt: "2025-02-10T00:00:00Z",
      updatedAt: "2025-04-05T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b3",
      name: "Besi Beton 10mm",
      slug: "besi-beton-10mm-panjang-12m",
      category: "Besi",
      brand: "Krakatau Steel",
      unit: "BATANG",
      price: 85000,
      originalPrice: 121429,
      discount: { percentage: 30, validUntil: "2025-10-31T23:59:59Z" },
      stock: 8,
      minStock: 15,
      images: ["/images/dummy_image.jpg"],
      description: "Besi beton SNI untuk struktur bangunan yang kuat dan tahan lama.",
      rating: { average: 4.9, count: 156 },
      sold: 156,
      views: 678,
      attributes: { diameter: "10mm", length: "12m", standard: "SNI", grade: "BjTS 420" },
      isActive: true,
      isFeatured: false,
      status: "low_stock",
      createdAt: "2025-01-20T00:00:00Z",
      updatedAt: "2025-04-02T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b4",
      name: "Keramik 40x40 Platinum",
      slug: "keramik-platinum-40x40-glossy",
      category: "Keramik",
      brand: "Platinum",
      unit: "DUS",
      price: 42000,
      originalPrice: 56000,
      discount: { percentage: 25, validUntil: "2025-12-15T23:59:59Z" },
      stock: 0,
      minStock: 30,
      images: ["/images/dummy_image.jpg"],
      description: "Keramik lantai glossy dengan permukaan mengkilap dan tahan lama.",
      rating: { average: 4.6, count: 423 },
      sold: 423,
      views: 2100,
      attributes: { size: "40x40 cm", finish: "Glossy", pcs_per_box: "4", coverage: "0.64 m2/dus" },
      isActive: false,
      isFeatured: true,
      status: "out_of_stock",
      createdAt: "2025-01-05T00:00:00Z",
      updatedAt: "2025-04-08T00:00:00Z",
    },
    {
      id: "68b8340ed2788dc4d9e608b5",
      name: "Pipa PVC 3 inch",
      slug: "pipa-pvc-rucika-3-inch",
      category: "Pipa",
      brand: "Rucika",
      unit: "BATANG",
      price: 45000,
      originalPrice: undefined,
      discount: undefined,
      stock: 87,
      minStock: 20,
      images: ["/images/dummy_image.jpg"],
      description: "Pipa PVC berkualitas untuk instalasi air bersih dan limbah.",
      rating: { average: 4.8, count: 298 },
      sold: 298,
      views: 1450,
      attributes: { diameter: "3 inch", length: "4m", type: "AW/D", standard: "SNI" },
      isActive: true,
      isFeatured: false,
      status: "active",
      createdAt: "2025-02-20T00:00:00Z",
      updatedAt: "2025-04-01T00:00:00Z",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: "Aktif", className: "bg-green-100 text-green-800" },
      low_stock: { label: "Stok Rendah", className: "bg-yellow-100 text-yellow-800" },
      out_of_stock: { label: "Habis", className: "bg-red-100 text-red-800" },
    };
    const variant = variants[status] || variants.active;
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Produk</h2>
          <p className="text-gray-600 mt-1">
            Manage dan update katalog produk Anda
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddDialog(true)}>
          <Plus className="h-4 w-4" />
          Tambah Produk Baru
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="🔍 Cari produk berdasarkan nama atau kategori..."
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="semen">Semen</SelectItem>
                <SelectItem value="cat">Cat</SelectItem>
                <SelectItem value="besi">Besi</SelectItem>
                <SelectItem value="keramik">Keramik</SelectItem>
                <SelectItem value="pipa">Pipa</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="low_stock">Stok Rendah</SelectItem>
                <SelectItem value="out_of_stock">Habis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Produk</p>
          <p className="text-2xl font-bold text-gray-900">1,234</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Produk Aktif</p>
          <p className="text-2xl font-bold text-green-600">1,189</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Stok Rendah</p>
          <p className="text-2xl font-bold text-yellow-600">23</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Stok Habis</p>
          <p className="text-2xl font-bold text-red-600">22</p>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Terjual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">ID: {product.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-gray-900">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-900">{product.stock} pcs</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-600">{product.sold} pcs</p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(product.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                        ✏️
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        🗑️
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-medium">1-5</span> dari{" "}
            <span className="font-medium">1,234</span> produk
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-white">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Selanjutnya
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tambah Produk Baru</DialogTitle>
            <DialogDescription>
              Lengkapi informasi produk yang akan ditambahkan ke katalog
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Product Info Section */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informasi Produk</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Produk *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Semen Gresik 50kg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Semen">Semen</SelectItem>
                            <SelectItem value="Cat">Cat</SelectItem>
                            <SelectItem value="Besi">Besi</SelectItem>
                            <SelectItem value="Pipa">Pipa</SelectItem>
                            <SelectItem value="Keramik">Keramik</SelectItem>
                            <SelectItem value="Genteng">Genteng</SelectItem>
                            <SelectItem value="Pasir">Pasir</SelectItem>
                            <SelectItem value="Kayu">Kayu</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand *</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Gresik" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Deskripsi produk..." 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pricing Section */}
              <div className="space-y-5 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Harga & Stok</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Jual *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="65000" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>Harga dalam Rupiah</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Asli (Opsional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="80000" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>Untuk menampilkan diskon</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Satuan *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Satuan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PCS">PCS</SelectItem>
                            <SelectItem value="SET">SET</SelectItem>
                            <SelectItem value="SAK">SAK</SelectItem>
                            <SelectItem value="BATANG">BATANG</SelectItem>
                            <SelectItem value="LEMBAR">LEMBAR</SelectItem>
                            <SelectItem value="M2">M2</SelectItem>
                            <SelectItem value="M3">M3</SelectItem>
                            <SelectItem value="KALENG">KALENG</SelectItem>
                            <SelectItem value="GALON">GALON</SelectItem>
                            <SelectItem value="KG">KG</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stok *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stok Min (Opsional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diskon (Opsional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Persentase diskon (0-100)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-5 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Gambar Produk</h3>
                
                <div className="space-y-2">
                  <FormLabel>Upload Gambar</FormLabel>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setImagePreview("")}
                        >
                          Hapus Gambar
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-primary hover:underline">Upload file</span>
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-5 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Status Produk</h3>
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Produk Aktif</FormLabel>
                        <FormDescription>
                          Produk akan ditampilkan di katalog
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Produk Unggulan</FormLabel>
                        <FormDescription>
                          Tampilkan di section featured products
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddDialog(false);
                    form.reset();
                    setImagePreview("");
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Produk
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
