import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ImageUploadProps {
  caption?: string;
  onCaptionChange?: (caption: string) => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function ImageUpload({ 
  caption = '', 
  onCaptionChange,
  onDelete,
  onEdit
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      console.log('Image uploaded:', file.name);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="relative group">
        {previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-md"
            />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="icon" 
                variant="secondary" 
                className="h-8 w-8"
                onClick={onEdit}
                data-testid="button-edit-image"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="destructive" 
                className="h-8 w-8"
                onClick={onDelete}
                data-testid="button-delete-image"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover-elevate active-elevate-2">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Click to upload image</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
              data-testid="input-file-upload"
            />
          </label>
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
