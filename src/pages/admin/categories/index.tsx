import { useState } from "react";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FolderTree,
  Plus,
  Edit,
  Power,
  Search,
  X,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Category interface
interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  productCount: number;
  order: number;
  availableUnits: Array<{
    value: string;
    label: string;
    conversionRate: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Zod schema for category validation
// Note: availableUnits is NOT in this schema because we handle it separately with unitInputs state
const categorySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan dash (-)"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  icon: z.string().optional(),
  image: z.string().optional(),
  order: z.number().min(1, "Order minimal 1").optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface UnitInput {
  value: string;
  label: string;
  conversionRate: string;
}

export default function AdminCategoriesPage() {
  // Role check
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  // State
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [unitInputs, setUnitInputs] = useState<UnitInput[]>([
    { value: "", label: "", conversionRate: "" },
  ]);

  // tRPC queries and mutations
  const { data: categoriesData, isLoading } =
    trpc.categories.getAdminAll.useQuery();
  const createMutation = trpc.categories.create.useMutation();
  const updateMutation = trpc.categories.update.useMutation();
  const toggleStatusMutation = trpc.categories.toggleStatus.useMutation();
  const utils = trpc.useContext();

  // Form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      image: "",
    },
  });

  // Filter categories
  const filteredCategories = (categoriesData?.categories as Category[] | undefined)?.filter((cat) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && cat.isActive) ||
      (statusFilter === "inactive" && !cat.isActive);

    const matchesSearch =
      searchQuery === "" ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    form.setValue("name", name);
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
    form.setValue("slug", slug);
  };

  // Add unit input
  const handleAddUnit = () => {
    setUnitInputs([
      ...unitInputs,
      { value: "", label: "", conversionRate: "" },
    ]);
  };

  // Remove unit input
  const handleRemoveUnit = (index: number) => {
    if (unitInputs.length === 1) {
      toast.error("Minimal 1 unit harus tersedia");
      return;
    }
    setUnitInputs(unitInputs.filter((_, i) => i !== index));
  };

  // Update unit input
  const handleUnitChange = (
    index: number,
    field: keyof UnitInput,
    value: string
  ) => {
    const newUnits = [...unitInputs];
    newUnits[index][field] = value;
    setUnitInputs(newUnits);
  };

  // Open add dialog
  const handleOpenAdd = () => {
    form.reset({
      name: "",
      slug: "",
      description: "",
      icon: "",
      image: "",
    });
    setUnitInputs([{ value: "", label: "", conversionRate: "" }]);
    setAddDialog(true);
  };

  // Open edit dialog
  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon || "",
      image: category.image || "",
      order: category.order,
    });

    // Set unit inputs
    if (category.availableUnits && category.availableUnits.length > 0) {
      setUnitInputs(
        category.availableUnits.map((unit) => ({
          value: unit.value,
          label: unit.label,
          conversionRate: unit.conversionRate.toString(),
        }))
      );
    } else {
      setUnitInputs([{ value: "", label: "", conversionRate: "" }]);
    }

    setEditDialog(true);
  };

  // Handle create
  const handleCreate = async (data: CategoryFormValues) => {
    try {
      // Convert unitInputs to availableUnits
      const availableUnits = unitInputs
        .filter((u) => u.value && u.label && u.conversionRate)
        .map((u) => ({
          value: u.value,
          label: u.label,
          conversionRate: parseFloat(u.conversionRate),
        }));

      if (availableUnits.length === 0) {
        toast.error("Gagal", {
          description: "Minimal 1 unit harus diisi lengkap",
        });
        return;
      }

      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon || "folder-tree",
        image: data.image || "",
        availableUnits,
      };

      // Create category with auto-generated order
      await createMutation.mutateAsync(payload);

      toast.success("Kategori Berhasil Ditambahkan!");
      setAddDialog(false);
      form.reset();
      setUnitInputs([{ value: "", label: "", conversionRate: "" }]);
      await utils.categories.getAdminAll.invalidate();
      await utils.categories.getAll.invalidate();
    } catch (error) {
      let errorMessage = "Terjadi kesalahan";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const err = error as { message?: string };
        errorMessage = err.message || JSON.stringify(error);
      }
      
      toast.error("Gagal menambahkan kategori", {
        description: errorMessage,
      });
    }
  };

  // Handle update
  const handleUpdate = async (data: CategoryFormValues) => {
    try {
      if (!selectedCategory) return;

      // Convert unitInputs to availableUnits
      const availableUnits = unitInputs
        .filter((u) => u.value && u.label && u.conversionRate)
        .map((u) => ({
          value: u.value,
          label: u.label,
          conversionRate: parseFloat(u.conversionRate),
        }));

      if (availableUnits.length === 0) {
        toast.error("Gagal", {
          description: "Minimal 1 unit harus diisi lengkap",
        });
        return;
      }

      // Update category with order swap if changed
      await updateMutation.mutateAsync({
        id: selectedCategory._id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon || "folder-tree",
        image: data.image || "",
        order: data.order,
        availableUnits,
      });

      toast.success("Kategori Berhasil Diperbarui!");
      setEditDialog(false);
      setSelectedCategory(null);
      await utils.categories.getAdminAll.invalidate();
      await utils.categories.getAll.invalidate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error("Gagal memperbarui kategori", {
        description: errorMessage,
      });
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (category: Category) => {
    try {
      await toggleStatusMutation.mutateAsync({ id: category._id });
      toast.success(
        category.isActive
          ? "Kategori dinonaktifkan"
          : "Kategori diaktifkan"
      );
      await utils.categories.getAdminAll.invalidate();
      await utils.categories.getAll.invalidate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error("Gagal mengubah status", {
        description: errorMessage,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kategori Produk</h1>
            <p className="text-gray-600 mt-1">
              Kelola kategori produk dan unit konversi
            </p>
          </div>
          {isAdmin && (
            <Button onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Kategori</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {categoriesData?.stats?.total || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FolderTree className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kategori Aktif</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {categoriesData?.stats?.active || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FolderTree className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tidak Aktif</p>
                <h3 className="text-2xl font-bold text-gray-600">
                  {categoriesData?.stats?.inactive || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FolderTree className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-2">Memuat data...</p>
            </div>
          ) : filteredCategories && filteredCategories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Jumlah Produk</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">
                      {category.order}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {category.name}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {category.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      {category.productCount || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {category.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          Tidak Aktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {isAdmin && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(category)}
                            >
                              <Power
                                className={`h-4 w-4 ${
                                  category.isActive ? "text-green-600" : "text-gray-400"
                                }`}
                              />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {!isAdmin && (
                          <span className="text-xs text-gray-500 italic">Hanya Admin</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-gray-600">
              Tidak ada kategori ditemukan
            </div>
          )}
        </Card>

        {/* Add Dialog */}
        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Tambah Kategori</DialogTitle>
              <DialogDescription>
                Buat kategori baru dengan unit konversi
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit(
                handleCreate,
                () => {
                  toast.error("Validasi Gagal", {
                    description: "Mohon periksa kembali data yang diisi",
                  });
                }
              )}
              className="space-y-6"
            >
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Informasi Dasar
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nama Kategori <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Contoh: Besi"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Slug <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="slug"
                      {...form.register("slug")}
                      placeholder="besi"
                      disabled
                    />
                    {form.formState.errors.slug && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.slug.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Deskripsi <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    rows={3}
                    placeholder="Deskripsi kategori..."
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon (Lucide)</Label>
                    <Input
                      id="icon"
                      {...form.register("icon")}
                      placeholder="Package"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      {...form.register("image")}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>ℹ️ Info:</strong> Order akan ditentukan otomatis berdasarkan kategori terakhir.
                  </p>
                </div>
              </div>

              {/* Unit System */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Unit System
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Available Units</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddUnit}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Unit
                    </Button>
                  </div>

                  {unitInputs.map((unit, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-start"
                    >
                      <div className="col-span-3">
                        <Input
                          placeholder="Value (e.g., sak)"
                          value={unit.value}
                          onChange={(e) =>
                            handleUnitChange(index, "value", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          placeholder="Label (e.g., Sak 50kg)"
                          value={unit.label}
                          onChange={(e) =>
                            handleUnitChange(index, "label", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="Rate (e.g., 50)"
                          value={unit.conversionRate}
                          onChange={(e) =>
                            handleUnitChange(
                              index,
                              "conversionRate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveUnit(index)}
                          disabled={unitInputs.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddDialog(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Kategori
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Kategori</DialogTitle>
              <DialogDescription>
                Perbarui informasi kategori dan unit konversi
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit(handleUpdate)}
              className="space-y-6"
            >
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Informasi Dasar
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">
                      Nama Kategori <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-name"
                      {...form.register("name")}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Contoh: Besi"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-slug">
                      Slug <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-slug"
                      {...form.register("slug")}
                      placeholder="besi"
                      disabled
                    />
                    {form.formState.errors.slug && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.slug.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">
                    Deskripsi <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="edit-description"
                    {...form.register("description")}
                    rows={3}
                    placeholder="Deskripsi kategori..."
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-icon">Icon (Lucide)</Label>
                    <Input
                      id="edit-icon"
                      {...form.register("icon")}
                      placeholder="Package"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-image">Image URL</Label>
                    <Input
                      id="edit-image"
                      {...form.register("image")}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-order">Order</Label>
                    <Input
                      id="edit-order"
                      type="number"
                      {...form.register("order", { valueAsNumber: true })}
                      min="1"
                    />
                    <p className="text-xs text-gray-600">
                      Jika order diubah ke order kategori lain, order akan di-swap otomatis
                    </p>
                  </div>
                </div>
              </div>

              {/* Unit System */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Unit System
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Available Units</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddUnit}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Unit
                    </Button>
                  </div>

                  {unitInputs.map((unit, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-start"
                    >
                      <div className="col-span-3">
                        <Input
                          placeholder="Value (e.g., sak)"
                          value={unit.value}
                          onChange={(e) =>
                            handleUnitChange(index, "value", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          placeholder="Label (e.g., Sak 50kg)"
                          value={unit.label}
                          onChange={(e) =>
                            handleUnitChange(index, "label", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="Rate (e.g., 50)"
                          value={unit.conversionRate}
                          onChange={(e) =>
                            handleUnitChange(
                              index,
                              "conversionRate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveUnit(index)}
                          disabled={unitInputs.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialog(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Kategori
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
