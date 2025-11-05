import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ImageUploadProps {
  caption?: string;
  onCaptionChange?: (caption: string) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onImageChange?: (file: File | null, previewUrl: string) => void;
  initialImage?: string;
}

export default function ImageUpload({
  caption = '',
  onCaptionChange,
  onDelete,
  onEdit,
  onImageChange,
  initialImage,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(initialImage || '');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCurrentFile(file);
      onImageChange?.(file, url);
      console.log('Image uploaded/replaced:', file.name);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleEditImage = () => {
    // Trigger file input click to replace image
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteImage = () => {
    setPreviewUrl('');
    setCurrentFile(null);
    onImageChange?.(null, '');
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="relative group">
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-md" />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={handleEditImage}
                data-testid="button-edit-image"
                title="Replace this image"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={handleDeleteImage}
                data-testid="button-delete-image"
                title="Delete this image"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover-elevate active-elevate-2">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload image</span>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                data-testid="input-file-upload"
              />
            </label>
            {/* Always show delete button */}
            {onDelete && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 bg-red-500 hover:bg-red-600"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                  data-testid="button-delete-image"
                  title="Delete this image slot"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <Input
        placeholder="Image Caption text box"
        value={caption}
        onChange={(e) => onCaptionChange?.(e.target.value)}
        data-testid="input-image-caption"
      />
    </Card>
  );
}
