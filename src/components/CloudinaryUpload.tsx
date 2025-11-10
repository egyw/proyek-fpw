import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  currentImage?: string;
  onRemove?: () => void;
  category?: string; // Optional: untuk dynamic folder berdasarkan kategori
}

export default function CloudinaryUpload({
  onUploadSuccess,
  currentImage,
  onRemove,
  category,
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>("");

  // Extract public_id from Cloudinary URL
  const getPublicIdFromUrl = (url: string): string | null => {
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      
      let pathAfterUpload = parts[1];
      // Remove version (v1234567890) if exists
      pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
      // Remove file extension
      const publicId = pathAfterUpload.replace(/\.[^.]+$/, '');
      
      return publicId;
    } catch {
      return null;
    }
  };

  const handleDelete = async () => {
    if (!currentImage) return;

    const publicId = getPublicIdFromUrl(currentImage);
    if (!publicId) {
      setError("Invalid image URL");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }
      
      if (data.success) {
        if (onRemove) onRemove();
      } else {
        throw new Error(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Gagal menghapus gambar dari Cloudinary');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Mapping kategori ke nama folder Cloudinary
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
      
      // Full path ke folder tujuan
      const folderSlug = category ? categoryFolderMap[category] || category.toLowerCase() : '';
      const folderName = folderSlug 
        ? `proyekFPW/product_assets/${folderSlug}` 
        : "proyekFPW/product_assets";
      
      // Get signature from backend (signed upload)
      const signResponse = await fetch('/api/cloudinary/sign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: folderName }),
      });

      if (!signResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const signData = await signResponse.json();
      
      // Upload to Cloudinary with signature
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.api_key);
      formData.append("timestamp", signData.timestamp);
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Upload gagal");
      }

      const data = await uploadResponse.json();
      onUploadSuccess(data.secure_url);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload gagal. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {currentImage ? (
        <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          <Image
            src={currentImage}
            alt="Product preview"
            fill
            className="object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors">
          <label className="flex flex-col items-center cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-2" />
                <p className="text-sm text-gray-600">Mengupload gambar...</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Klik untuk upload gambar
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG (max 5MB)
                </p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
