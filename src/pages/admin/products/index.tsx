import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import ImagePreview from "@/components/ImagePreview";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
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

// Category-specific units mapping (units available for each category)
const categoryUnitsMap: Record<string, Array<{ value: string; label: string }>> = {
  Semen: [
    { value: "sak", label: "Sak (50kg)" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "zak", label: "Zak (40kg)" },
    { value: "ton", label: "Ton (1000kg)" },
  ],
  Cat: [
    { value: "kaleng", label: "Kaleng (5L)" },
    { value: "liter", label: "Liter (L)" },
    { value: "galon", label: "Galon (20L)" },
    { value: "kg", label: "Kilogram (kg)" },
  ],
  Besi: [
    { value: "batang", label: "Batang (7.4kg)" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "ton", label: "Ton (1000kg)" },
    { value: "lonjor", label: "Lonjor (12m)" },
  ],
  Keramik: [
    { value: "dus", label: "Dus (11 pcs)" },
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "m2", label: "Meter Persegi (m²)" },
    { value: "box", label: "Box (6 pcs)" },
  ],
  Pipa: [
    { value: "batang", label: "Batang (4m)" },
    { value: "meter", label: "Meter (m)" },
    { value: "pcs", label: "Pieces (pcs)" },
  ],
  Kayu: [
    { value: "lembar", label: "Lembar" },
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "m3", label: "Meter Kubik (m³)" },
  ],
  Genteng: [
    { value: "lembar", label: "Lembar" },
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "m2", label: "Meter Persegi (m²)" },
  ],
  Triplek: [
    { value: "lembar", label: "Lembar" },
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "m2", label: "Meter Persegi (m²)" },
  ],
  "Tangki Air": [
    { value: "set", label: "Set" },
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "unit", label: "Unit" },
  ],
  Kawat: [
    { value: "gulung", label: "Gulung" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "ton", label: "Ton (1000kg)" },
    { value: "meter", label: "Meter (m)" },
  ],
  Paku: [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "pack", label: "Pack" },
  ],
  Baut: [
    { value: "set", label: "Set" },
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "kg", label: "Kilogram (kg)" },
  ],
  Aspal: [
    { value: "liter", label: "Liter (L)" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "drum", label: "Drum (200L)" },
  ],
};

// Form validation schema
const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  category: z.string().min(1, "Kategori harus dipilih"),
  brand: z.string().min(1, "Brand harus diisi"),
  unit: z.string().min(1, "Unit utama harus dipilih"),
  availableUnits: z.array(z.string()).min(1, "Minimal 1 unit harus dipilih untuk customer"),
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      brand: "",
      unit: "",
      availableUnits: [],
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

  // Watch category changes to show relevant units
  const watchedCategory = form.watch("category");
  // const watchedAvailableUnits = form.watch("availableUnits");

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  type ProductType = {
    _id: string | { $oid: string };
    name: string;
    brand: string;
    category: string;
    unit: string;
    price: number;
    originalPrice?: number;
    stock: number;
    minStock: number;
    discount?: { percentage: number; validUntil: string };
    images: string[];
    description: string;
    availableUnits?: string[];
    isActive: boolean;
    isFeatured: boolean;
    sold: number;
    [key: string]: unknown;
  };

  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductType | null>(null);

  // tRPC Queries
  const { data: productsData, isLoading, refetch } = trpc.products.getAdminAll.useQuery({
    search: searchQuery,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    status: statusFilter,
    sortBy: sortBy,
    page: currentPage,
    limit: itemsPerPage,
  });

  const createProductMutation = trpc.products.createProduct.useMutation({
    onSuccess: () => {
      toast.success("Produk berhasil ditambahkan!");
      refetch();
      setAddDialog(false);
      form.reset();
      setImagePreview("");
      setSelectedFile(null);
    },
    onError: (error) => {
      toast.error("Gagal menambahkan produk", {
        description: error.message,
      });
    },
  });

  const updateProductMutation = trpc.products.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Produk berhasil diupdate!");
      refetch();
      setEditDialog(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      toast.error("Gagal mengupdate produk", {
        description: error.message,
      });
    },
  });

  const deleteProductMutation = trpc.products.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Produk berhasil dihapus!");
      refetch();
      setDeleteDialog(false);
      setDeletingProduct(null);
    },
    onError: (error) => {
      toast.error("Gagal menghapus produk", {
        description: error.message,
      });
    },
  });

  // Handle file selection and create local preview
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    
    // Create base64 preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview("");
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      let imageUrl = "/images/dummy_image.jpg";

      // Upload image to Cloudinary first if file selected
      if (selectedFile) {
        // Map category to folder name
        const categoryFolderMap: Record<string, string> = {
          'Pipa': 'pipa-pvc',
          'Tangki Air': 'tangki-air',
          'Semen': 'semen',
          'Besi': 'besi',
          'Kawat': 'kawat',
          'Paku': 'paku',
          'Baut': 'baut',
          'Aspal': 'aspal',
          'Triplek': 'triplek',
        };

        const folderName = categoryFolderMap[data.category] || data.category.toLowerCase();
        const folder = `proyekFPW/product_assets/${folderName}`;

        // Get signature from backend
        const signResponse = await fetch('/api/cloudinary/sign-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder }),
        });

        if (!signResponse.ok) {
          throw new Error('Failed to get upload signature');
        }

        const { signature, timestamp, api_key, cloud_name } = await signResponse.json();

        // Upload to Cloudinary with signature
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', folder);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('api_key', api_key);

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.secure_url;
      }

      // Generate slug from name
      const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

      const productData = {
        name: data.name,
        slug: slug,
        category: data.category,
        brand: data.brand,
        unit: data.unit,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        discount: data.discount ? {
          percentage: Number(data.discount),
          validUntil: "",
        } : undefined,
        stock: Number(data.stock),
        minStock: data.minStock ? Number(data.minStock) : 10,
        availableUnits: data.availableUnits,
        images: [imageUrl],
        description: data.description,
        attributes: {},
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      };

      createProductMutation.mutate(productData);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Gagal menambahkan produk', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  };

  const handleEditProduct = (product: ProductType) => {
    setEditingProduct(product);
    setEditDialog(true);
    // Pre-populate form
    form.reset({
      name: product.name,
      category: product.category,
      brand: product.brand,
      unit: product.unit,
      availableUnits: product.availableUnits || [product.unit],
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      stock: String(product.stock),
      minStock: String(product.minStock),
      description: product.description,
      discount: product.discount?.percentage ? String(product.discount.percentage) : "",
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
  };

  const handleUpdateProduct = (data: ProductFormValues) => {
    if (!editingProduct) return;

    const productId = typeof editingProduct._id === 'string' 
      ? editingProduct._id 
      : editingProduct._id.$oid;

    const updateData = {
      id: productId,
      name: data.name,
      category: data.category,
      brand: data.brand,
      unit: data.unit,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      discount: data.discount ? {
        percentage: Number(data.discount),
        validUntil: editingProduct.discount?.validUntil || "",
      } : undefined,
      stock: Number(data.stock),
      minStock: data.minStock ? Number(data.minStock) : 10,
      availableUnits: data.availableUnits,
      description: data.description,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
    };

    updateProductMutation.mutate(updateData);
  };

  const handleDeleteProduct = (product: ProductType) => {
    setDeletingProduct(product);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      const productId = typeof deletingProduct._id === 'string' 
        ? deletingProduct._id 
        : deletingProduct._id.$oid;
      deleteProductMutation.mutate({ id: productId });
    }
  };

  // Handle Add Dialog close - reset form to empty
  const handleAddDialogClose = (open: boolean) => {
    setAddDialog(open);
    if (!open) {
      form.reset({
        name: "",
        category: "",
        brand: "",
        unit: "",
        availableUnits: [],
        price: "",
        originalPrice: "",
        stock: "",
        minStock: "",
        description: "",
        discount: "",
        isActive: true,
        isFeatured: false,
      });
      setImagePreview("");
      setSelectedFile(null);
    }
  };

  // Handle Edit Dialog close - reset form to empty
  const handleEditDialogClose = (open: boolean) => {
    setEditDialog(open);
    if (!open) {
      form.reset({
        name: "",
        category: "",
        brand: "",
        unit: "",
        availableUnits: [],
        price: "",
        originalPrice: "",
        stock: "",
        minStock: "",
        description: "",
        discount: "",
        isActive: true,
        isFeatured: false,
      });
      setEditingProduct(null);
      setImagePreview("");
    }
  };

  const products: ProductType[] = (productsData?.products as ProductType[]) || [];

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, sortBy]);

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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari produk berdasarkan nama atau brand..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="Semen">Semen</SelectItem>
                <SelectItem value="Besi">Besi</SelectItem>
                <SelectItem value="Cat">Cat</SelectItem>
                <SelectItem value="Pipa">Pipa</SelectItem>
                <SelectItem value="Keramik">Keramik</SelectItem>
                <SelectItem value="Triplek">Triplek</SelectItem>
                <SelectItem value="Tangki Air">Tangki Air</SelectItem>
                <SelectItem value="Kawat">Kawat</SelectItem>
                <SelectItem value="Paku">Paku</SelectItem>
                <SelectItem value="Baut">Baut</SelectItem>
                <SelectItem value="Aspal">Aspal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="name-asc">Nama A-Z</SelectItem>
                <SelectItem value="name-desc">Nama Z-A</SelectItem>
                <SelectItem value="price-low">Harga Terendah</SelectItem>
                <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                <SelectItem value="stock-low">Stok Terendah</SelectItem>
                <SelectItem value="stock-high">Stok Tertinggi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Produk</p>
          <p className="text-2xl font-bold text-gray-900">
            {productsData?.stats?.total || 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Produk Aktif</p>
          <p className="text-2xl font-bold text-green-600">
            {productsData?.stats?.active || 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Stok Rendah</p>
          <p className="text-2xl font-bold text-yellow-600">
            {productsData?.stats?.lowStock || 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Stok Habis</p>
          <p className="text-2xl font-bold text-red-600">
            {productsData?.stats?.outOfStock || 0}
          </p>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <p className="text-gray-600">Memuat produk...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-600">Tidak ada produk ditemukan</p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={typeof product._id === 'string' ? product._id : product._id.$oid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Rp {product.price.toLocaleString('id-ID')}
                        </p>
                        {product.discount?.percentage && product.discount.percentage > 0 && (
                          <p className="text-xs text-green-600">
                            Diskon {product.discount.percentage}%
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className={`font-medium ${
                        product.stock === 0 ? 'text-red-600' :
                        product.stock <= product.minStock ? 'text-yellow-600' :
                        'text-gray-900'
                      }`}>
                        {product.stock} {product.unit}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-600">{product.sold} pcs</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan{" "}
            <span className="font-medium">
              {productsData?.pagination 
                ? `${(productsData.pagination.currentPage - 1) * productsData.pagination.itemsPerPage + 1}-${Math.min(
                    productsData.pagination.currentPage * productsData.pagination.itemsPerPage,
                    productsData.pagination.totalItems
                  )}`
                : "0"
              }
            </span>{" "}
            dari <span className="font-medium">{productsData?.pagination?.totalItems || 0}</span> produk
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={!productsData?.pagination?.hasPrevPage}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Sebelumnya
            </Button>
            
            {/* Page numbers */}
            {productsData?.pagination && (() => {
              const totalPages = productsData.pagination.totalPages;
              const current = productsData.pagination.currentPage;
              const pages: (number | string)[] = [];
              
              if (totalPages <= 7) {
                // Show all pages if 7 or less
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // Always show first page
                pages.push(1);
                
                if (current > 3) {
                  pages.push('...');
                }
                
                // Show pages around current
                for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
                  pages.push(i);
                }
                
                if (current < totalPages - 2) {
                  pages.push('...');
                }
                
                // Always show last page
                pages.push(totalPages);
              }
              
              return pages.map((page, idx) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400">
                      ...
                    </span>
                  );
                }
                return (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    className={current === page ? 'bg-primary text-white' : ''}
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </Button>
                );
              });
            })()}
            
            <Button 
              variant="outline" 
              size="sm"
              disabled={!productsData?.pagination?.hasNextPage}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={addDialog} onOpenChange={handleAddDialogClose}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tambah Produk Baru</DialogTitle>
            <DialogDescription>
              Lengkapi informasi produk yang akan ditambahkan ke katalog
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form id="add-product-form" name="add-product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset unit fields when category changes
                            form.setValue("unit", "");
                            form.setValue("availableUnits", []);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Semen">Semen</SelectItem>
                            <SelectItem value="Besi">Besi</SelectItem>
                            <SelectItem value="Pipa">Pipa</SelectItem>
                            <SelectItem value="Triplek">Triplek</SelectItem>
                            <SelectItem value="Tangki Air">Tangki Air</SelectItem>
                            <SelectItem value="Kawat">Kawat</SelectItem>
                            <SelectItem value="Paku">Paku</SelectItem>
                            <SelectItem value="Baut">Baut</SelectItem>
                            <SelectItem value="Aspal">Aspal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Unit yang tersedia akan muncul setelah kategori dipilih
                        </FormDescription>
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
                        <FormLabel>Satuan Utama Supplier *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Auto-select this unit in availableUnits
                            const currentUnits = form.getValues("availableUnits");
                            if (!currentUnits.includes(value)) {
                              form.setValue("availableUnits", [...currentUnits, value]);
                            }
                          }} 
                          defaultValue={field.value}
                          disabled={!watchedCategory}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih unit utama" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {watchedCategory && categoryUnitsMap[watchedCategory]?.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Unit yang digunakan supplier</FormDescription>
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
                        <FormDescription>Dalam unit utama</FormDescription>
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
                        <FormDescription>Untuk alert stok rendah</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Available Units for Customers */}
                {watchedCategory && categoryUnitsMap[watchedCategory] && (
                  <FormField
                    control={form.control}
                    name="availableUnits"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Unit yang Tersedia untuk Customer *</FormLabel>
                          <FormDescription>
                            Pilih unit yang bisa dipilih customer saat checkout (unit utama otomatis terpilih)
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {categoryUnitsMap[watchedCategory].map((unit) => (
                            <FormField
                              key={unit.value}
                              control={form.control}
                              name="availableUnits"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={unit.value}
                                    className="flex items-start space-x-3 border rounded-lg p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(unit.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, unit.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== unit.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="font-medium cursor-pointer">
                                        {unit.label}
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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
                  <FormLabel>Upload Gambar *</FormLabel>
                  <ImagePreview
                    currentImage={imagePreview}
                    onFileSelect={handleFileSelect}
                    onRemove={handleRemoveImage}
                    disabled={createProductMutation.isPending}
                  />
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
                  onClick={() => handleAddDialogClose(false)}
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

      {/* Edit Product Dialog */}
      <Dialog open={editDialog} onOpenChange={handleEditDialogClose}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Produk</DialogTitle>
            <DialogDescription>
              Update informasi produk yang sudah ada
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form id="edit-product-form" name="edit-product-form" onSubmit={form.handleSubmit(handleUpdateProduct)} className="space-y-8">
              {/* Reuse the same form fields as Add Dialog */}
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Semen">Semen</SelectItem>
                            <SelectItem value="Besi">Besi</SelectItem>
                            <SelectItem value="Pipa">Pipa</SelectItem>
                            <SelectItem value="Triplek">Triplek</SelectItem>
                            <SelectItem value="Tangki Air">Tangki Air</SelectItem>
                            <SelectItem value="Kawat">Kawat</SelectItem>
                            <SelectItem value="Paku">Paku</SelectItem>
                            <SelectItem value="Baut">Baut</SelectItem>
                            <SelectItem value="Aspal">Aspal</SelectItem>
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
              </div>

              {/* Price & Stock Section */}
              <div className="space-y-5 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Harga & Stok</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Jual (Rp) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100000" {...field} />
                        </FormControl>
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
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleEditDialogClose(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={updateProductMutation.isPending}>
                  {updateProductMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          {deletingProduct && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={deletingProduct.images[0]}
                    alt={deletingProduct.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{deletingProduct.name}</p>
                  <p className="text-sm text-gray-600">{deletingProduct.brand}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialog(false);
                setDeletingProduct(null);
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Menghapus..." : "Hapus Produk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
