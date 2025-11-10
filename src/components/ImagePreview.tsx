import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ImagePreviewProps {
  currentImage?: string; // Base64 or URL
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export default function ImagePreview({
  currentImage,
  onFileSelect,
  onRemove,
  disabled = false,
}: ImagePreviewProps) {
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setError('');
    onFileSelect(file);
  };

  const handleRemove = () => {
    setError('');
    onRemove();
  };

  return (
    <div className="space-y-4">
      {currentImage ? (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative w-full aspect-square max-w-xs mx-auto border-2 border-gray-200 rounded-lg overflow-hidden">
            <Image
              src={currentImage}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>

          {/* Remove Button */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Hapus Gambar
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <label htmlFor="image-upload" className="flex flex-col items-center cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Klik untuk upload gambar</p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP (max 5MB)</p>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
            />
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
