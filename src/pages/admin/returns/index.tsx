import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import {
  RotateCcw,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  AlertCircle,
} from "lucide-react";

export default function AdminReturnsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const utils = trpc.useContext();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  // Auto-set status filter from query params (for notification clicks)
  useEffect(() => {
    if (router.isReady && router.query.status) {
      setStatusFilter(router.query.status as string);
    }
  }, [router.isReady, router.query.status]);
  const [currentPage, setCurrentPage] = useState(1);

  // Dialogs
  const [viewDialog, setViewDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [completeDialog, setCompleteDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch returns
  const { data: returnsData, isLoading } = trpc.returns.getAllReturns.useQuery({
    status: statusFilter as 'all' | 'pending' | 'approved' | 'rejected' | 'completed',
    search: searchQuery,
    page: currentPage,
    limit: 10,
  });

  // Mutations
  const approveMutation = trpc.returns.approveReturn.useMutation({
    onSuccess: () => {
      toast.success("Return Disetujui!", {
        description: "Return request berhasil disetujui.",
      });
      setApproveDialog(false);
      setSelectedReturn(null);
      utils.returns.getAllReturns.invalidate();
    },
    onError: (error) => {
      toast.error("Gagal Approve", {
        description: error.message,
      });
    },
  });

  const rejectMutation = trpc.returns.rejectReturn.useMutation({
    onSuccess: () => {
      toast.success("Return Ditolak!", {
        description: "Return request berhasil ditolak.",
      });
      setRejectDialog(false);
      setSelectedReturn(null);
      setRejectionReason("");
      utils.returns.getAllReturns.invalidate();
    },
    onError: (error) => {
      toast.error("Gagal Reject", {
        description: error.message,
      });
    },
  });

  const completeMutation = trpc.returns.completeReturn.useMutation({
    onSuccess: () => {
      toast.success("Return Selesai!", {
        description: "Return berhasil diselesaikan.",
      });
      setCompleteDialog(false);
      setSelectedReturn(null);
      utils.returns.getAllReturns.invalidate();
    },
    onError: (error) => {
      toast.error("Gagal Complete", {
        description: error.message,
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusConfig = {
    pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    approved: { label: "Disetujui", color: "bg-green-100 text-green-800", icon: CheckCircle },
    rejected: { label: "Ditolak", color: "bg-red-100 text-red-800", icon: XCircle },
    completed: { label: "Selesai", color: "bg-blue-100 text-blue-800", icon: Package },
  };

  const conditionLabels = {
    damaged: "Rusak/Cacat",
    defective: "Tidak Berfungsi",
    wrong_item: "Salah Kirim",
    not_as_described: "Tidak Sesuai Deskripsi",
    other: "Lainnya",
  };

  // Stats calculation
  const stats = {
    total: returnsData?.pagination.total || 0,
    pending: returnsData?.returns.filter((r) => r.status === "pending").length || 0,
    approved: returnsData?.returns.filter((r) => r.status === "approved").length || 0,
    rejected: returnsData?.returns.filter((r) => r.status === "rejected").length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengembalian Produk</h1>
          <p className="text-gray-600 mt-1">Kelola return request dari customer</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Return</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Menunggu</p>
                <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Disetujui</p>
                <h3 className="text-2xl font-bold text-green-600">{stats.approved}</h3>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ditolak</p>
                <h3 className="text-2xl font-bold text-red-600">{stats.rejected}</h3>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nomor return, order, atau customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Returns Table */}
        <Card>
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : returnsData?.returns.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada return request</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Return</TableHead>
                    <TableHead>No. Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnsData?.returns.map((returnItem) => {
                    const status = statusConfig[returnItem.status as keyof typeof statusConfig];
                    return (
                      <TableRow key={String(returnItem._id)}>
                        <TableCell className="font-medium">{returnItem.returnNumber}</TableCell>
                        <TableCell>{returnItem.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{returnItem.customerName}</p>
                            <p className="text-xs text-gray-500">{returnItem.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(returnItem.requestDate)}</TableCell>
                        <TableCell>{formatCurrency(returnItem.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReturn(returnItem);
                                setViewDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {returnItem.status === "pending" && (
                              <>
                                {/* Show approve/reject if admin OR return amount < 1jt */}
                                {(isAdmin || returnItem.totalAmount < 1000000) && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => {
                                        setSelectedReturn(returnItem);
                                        setApproveDialog(true);
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Setuju
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        setSelectedReturn(returnItem);
                                        setRejectDialog(true);
                                      }}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Tolak
                                    </Button>
                                  </>
                                )}
                                {/* Show info badge for staff on high-value returns */}
                                {!isAdmin && returnItem.totalAmount >= 1000000 && (
                                  <Badge variant="outline" className="text-xs text-orange-700 border-orange-300">
                                    Perlu Approval Admin
                                  </Badge>
                                )}
                              </>
                            )}
                            {returnItem.status === "approved" && (
                              <>
                                {(isAdmin || returnItem.totalAmount < 1000000) && (
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                      setSelectedReturn(returnItem);
                                      setCompleteDialog(true);
                                    }}
                                  >
                                    <Package className="h-4 w-4 mr-1" />
                                    Selesai
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {returnsData && returnsData.pagination.totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Menampilkan{" "}
                      {(returnsData.pagination.page - 1) * returnsData.pagination.limit + 1} -{" "}
                      {Math.min(
                        returnsData.pagination.page * returnsData.pagination.limit,
                        returnsData.pagination.total
                      )}{" "}
                      dari {returnsData.pagination.total} return
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= returnsData.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* View Detail Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Return Request</DialogTitle>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-6">
              {/* Return Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nomor Return</p>
                  <p className="font-semibold">{selectedReturn.returnNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nomor Order</p>
                  <p className="font-semibold">{selectedReturn.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <Badge className={statusConfig[selectedReturn.status as keyof typeof statusConfig].color}>
                    {statusConfig[selectedReturn.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tanggal Request</p>
                  <p className="font-semibold">{formatDate(selectedReturn.requestDate)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Informasi Customer</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nama</p>
                    <p className="font-medium">{selectedReturn.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium">{selectedReturn.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Telepon</p>
                    <p className="font-medium">{selectedReturn.customerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Produk Dikembalikan</h3>
                <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {selectedReturn?.items.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <p className="font-medium">{item.productName}</p>
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.quantity} item × {formatCurrency(item.price)}
                      </p>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-600 mb-1">Kondisi:</p>
                        <Badge variant="outline" className="text-xs">
                          {conditionLabels[item.condition as keyof typeof conditionLabels]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Alasan Pengembalian</h3>
                <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{selectedReturn.reason}</p>
              </div>

              {/* Rejection Reason if rejected */}
              {selectedReturn.status === "rejected" && selectedReturn.rejectionReason && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 text-red-700">Alasan Penolakan</h3>
                  <p className="text-sm text-red-600 bg-red-50 rounded p-3 border border-red-200">
                    {selectedReturn.rejectionReason}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">Total Pengembalian</p>
                  <p className="font-bold text-xl text-primary">
                    {formatCurrency(selectedReturn.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setujui Return Request</DialogTitle>
            <DialogDescription>
              Yakin ingin menyetujui return request ini?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(false)}>
              Batal
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (selectedReturn) {
                  approveMutation.mutate({ returnId: selectedReturn._id });
                }
              }}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Ya, Setujui
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak Return Request</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan return request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Alasan Penolakan *</Label>
            <Textarea
              id="rejection-reason"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Masukkan alasan penolakan... (minimal 10 karakter)"
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialog(false);
              setRejectionReason("");
            }}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedReturn && rejectionReason.trim().length >= 10) {
                  rejectMutation.mutate({
                    returnId: selectedReturn._id,
                    rejectionReason: rejectionReason,
                  });
                }
              }}
              disabled={rejectMutation.isPending || rejectionReason.trim().length < 10}
            >
              {rejectMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Ya, Tolak
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={completeDialog} onOpenChange={setCompleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selesaikan Return</DialogTitle>
            <DialogDescription>
              Yakin return sudah selesai diproses? Dana akan dikembalikan ke customer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialog(false)}>
              Batal
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (selectedReturn) {
                  completeMutation.mutate({ returnId: selectedReturn._id });
                }
              }}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Ya, Selesaikan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
