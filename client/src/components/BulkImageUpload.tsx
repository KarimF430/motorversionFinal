import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface UploadedImage {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface BulkImageUploadProps {
  onUploadComplete?: (imageUrls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
}

export default function BulkImageUpload({ 
  onUploadComplete,
  maxFiles = 20,
  acceptedTypes = "image/*"
}: BulkImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, maxFiles);
    
    // Create preview entries
    const newImages: UploadedImage[] = fileArray.map(file => ({
      url: URL.createObjectURL(file),
      filename: file.name,
      originalName: file.name,
      size: file.size,
      status: 'uploading' as const
    }));

    setImages(prev => [...prev, ...newImages]);
    setIsUploading(true);

    try {
      // Upload all files at once
      const formData = new FormData();
      fileArray.forEach(file => {
        formData.append('images', file);
      });

      console.log(`📤 Uploading ${fileArray.length} images...`);
      
      const response = await fetch('http://localhost:5001/api/upload/images/bulk', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Upload complete:`, result);

      // Update images with server URLs
      setImages(prev => prev.map((img, idx) => {
        const serverFile = result.files[idx];
        if (serverFile) {
          return {
            ...img,
            url: serverFile.url,
            filename: serverFile.filename,
            status: 'success' as const
          };
        }
        return { ...img, status: 'error' as const, error: 'Upload failed' };
      }));

      // Notify parent component
      if (onUploadComplete) {
        const uploadedUrls = result.files.map((f: any) => f.url);
        onUploadComplete(uploadedUrls);
      }

    } catch (error) {
      console.error('❌ Bulk upload error:', error);
      setImages(prev => prev.map(img => ({
        ...img,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Upload failed'
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setImages([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const successCount = images.filter(img => img.status === 'success').length;
  const errorCount = images.filter(img => img.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        <h3 className="text-lg font-semibold mb-2">
          Upload Multiple Images
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop images here, or click to browse
        </p>
        
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Select Images'}
        </Button>
        
        <p className="text-xs text-gray-500 mt-2">
          Maximum {maxFiles} images • Supported: JPG, PNG, WebP
        </p>
      </Card>

      {/* Upload Status */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">
              Uploaded Images ({images.length})
            </h4>
            <div className="flex items-center gap-2">
              {successCount > 0 && (
                <span className="text-sm text-green-600">
                  ✓ {successCount} success
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-sm text-red-600">
                  ✗ {errorCount} failed
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    {image.status === 'uploading' && (
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <p className="text-xs">Uploading...</p>
                      </div>
                    )}
                    {image.status === 'success' && (
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    )}
                    {image.status === 'error' && (
                      <AlertCircle className="w-12 h-12 text-red-500" />
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* File Info */}
                <div className="p-2 bg-white">
                  <p className="text-xs font-medium truncate">
                    {image.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(image.size)}
                  </p>
                  {image.error && (
                    <p className="text-xs text-red-600 mt-1">
                      {image.error}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
