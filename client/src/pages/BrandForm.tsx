import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import FAQBuilder from "@/components/FAQBuilder";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Brand, InsertBrand } from "@shared/schema";

export default function BrandForm() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    ranking: 0, // Will be auto-assigned by backend
    status: 'active',
    summary: '',
    logo: '',
    faqs: [] as { question: string; answer: string }[],
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const { data: brand, isLoading, error } = useQuery<Brand>({
    queryKey: ['/api/brands', id],
    queryFn: async () => {
      console.log('Fetching brand with ID:', id);
      const data = await apiRequest('GET', `/api/brands/${id}`);
      console.log('Fetched brand data:', data);
      return data;
    },
    enabled: isEditing,
  });

  console.log('BrandForm state:', { id, isEditing, isLoading, hasBrand: !!brand, error });

  useEffect(() => {
    if (brand && isEditing && !isLoading) {
      console.log('Loading brand data:', brand);
      const brandFaqs = Array.isArray(brand.faqs) ? brand.faqs : [];
      setFormData({
        name: brand.name || '',
        ranking: brand.ranking || 0,
        status: brand.status || 'active',
        summary: brand.summary || '',
        logo: brand.logo || '',
        faqs: brandFaqs.map((faq: any, index: number) => ({ 
          question: faq.question || '', 
          answer: faq.answer || '',
          id: index.toString() 
        })),
      });
      if (brand.logo) {
        setLogoPreview(brand.logo);
      }
    }
  }, [brand, isEditing, isLoading]);

  const createBrand = useMutation({
    mutationFn: async (data: InsertBrand) => {
      return await apiRequest('POST', '/api/brands', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Brand created",
        description: "The brand has been successfully created.",
      });
      setLocation('/brands');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create brand.",
        variant: "destructive",
      });
    },
  });

  const updateBrand = useMutation({
    mutationFn: async (data: Partial<InsertBrand>) => {
      return await apiRequest('PATCH', `/api/brands/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      queryClient.invalidateQueries({ queryKey: ['/api/brands', id] });
      toast({
        title: "Brand updated",
        description: "The brand has been successfully updated.",
      });
      setLocation('/brands');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update brand.",
        variant: "destructive",
      });
    },
  });

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'image/png') {
      toast({
        title: "Invalid file type",
        description: "Only PNG files are allowed for brand logos.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo file must be smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return formData.logo || null;

    const formDataUpload = new FormData();
    formDataUpload.append('logo', logoFile);

    try {
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Upload logo if there's a new file
    let logoUrl = formData.logo;
    if (logoFile) {
      const uploadedUrl = await uploadLogo();
      if (!uploadedUrl) return; // Upload failed
      logoUrl = uploadedUrl;
    }

    // Convert FAQs back to database format (remove id field)
    // Remove ranking from submit data - it's auto-assigned by backend
    const { ranking, ...dataWithoutRanking } = formData;
    const submitData = {
      ...dataWithoutRanking,
      logo: logoUrl,
      faqs: formData.faqs.map(({ question, answer }) => ({ question, answer }))
    };
    
    if (isEditing) {
      updateBrand.mutate(submitData);
    } else {
      createBrand.mutate(submitData);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{isEditing ? 'Edit Brand' : 'Add New Brand'}</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button 
                type="button"
                className={`px-6 py-2 rounded-md font-medium ${
                  formData.status === 'active' 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                onClick={() => setFormData({ ...formData, status: 'active' })}
                data-testid="button-activate-brand"
              >
                activate Brand
              </Button>
              <Button 
                type="button"
                className={`px-6 py-2 rounded-md font-medium ${
                  formData.status === 'inactive' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                onClick={() => setFormData({ ...formData, status: 'inactive' })}
                data-testid="button-deactivate-brand"
              >
                Deactivate Brand
              </Button>
            </div>
            {isEditing && brand && (
              <div className="flex items-center gap-2">
                <Label className="text-sm font-normal">id:</Label>
                <Input 
                  value={brand.id}
                  disabled
                  className="w-32 font-mono text-sm bg-muted"
                  data-testid="input-brand-id"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="brandName">Brand Name</Label>
            <Input
              id="brandName"
              placeholder="Text field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="input-brand-name"
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="brandRanking">Brand Position (Auto-assigned)</Label>
              <input 
                id="brandRanking"
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-gray-100"
                value={`Position ${formData.ranking}`}
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500">Position is automatically assigned based on creation order</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Brand Logo</Label>
            {logoPreview ? (
              <div className="relative">
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="w-20 h-20 object-contain border rounded-md"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreview('');
                    setFormData({ ...formData, logo: '' });
                  }}
                >
                  Remove Logo
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Upload PNG Logo</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/png" 
                  onChange={handleLogoChange}
                  data-testid="input-brand-logo" 
                />
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Brand Summary</Label>
            <RichTextEditor
              value={formData.summary}
              onChange={(value) => setFormData({ ...formData, summary: value })}
              placeholder="Long Text Field"
              minHeight="min-h-64"
            />
          </div>

          <div className="space-y-2">
            <Label>Brand FAQ</Label>
            <FAQBuilder 
              items={formData.faqs}
              onChange={(faqs) => setFormData({ ...formData, faqs })}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button 
            type="submit" 
            data-testid="button-save-brand"
            disabled={createBrand.isPending || updateBrand.isPending}
          >
            {createBrand.isPending || updateBrand.isPending ? 'Saving...' : isEditing ? 'Update Brand' : 'Save Brand'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            data-testid="button-cancel"
            onClick={() => setLocation('/brands')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
