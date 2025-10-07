import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import FAQBuilder from "@/components/FAQBuilder";

export default function BrandForm() {
  const [formData, setFormData] = useState({
    name: '',
    ranking: '1',
    status: 'active',
    id: 'BR' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    summary: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Brand form submitted:', formData);
  };

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Add New Brand</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-normal">id:</Label>
              <Input 
                value={formData.id}
                disabled
                className="w-40 font-mono text-sm bg-muted"
                data-testid="input-brand-id"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            type="button"
            variant={formData.status === 'active' ? 'default' : 'outline'}
            onClick={() => setFormData({ ...formData, status: 'active' })}
            data-testid="button-activate-brand"
          >
            activate Brand
          </Button>
          <Button 
            type="button"
            variant={formData.status === 'inactive' ? 'destructive' : 'outline'}
            onClick={() => setFormData({ ...formData, status: 'inactive' })}
            data-testid="button-deactivate-brand"
          >
            Deactivate Brand
          </Button>
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

          <div className="space-y-2">
            <Label htmlFor="brandRanking">Brand Ranking</Label>
            <select 
              id="brandRanking"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.ranking}
              onChange={(e) => setFormData({ ...formData, ranking: e.target.value })}
              data-testid="select-brand-ranking"
            >
              <option>Digit Dropdown</option>
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Brand Logo</Label>
            <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-md cursor-pointer hover-elevate active-elevate-2">
              <Upload className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Upload Logo</span>
              <input type="file" className="hidden" accept="image/*" data-testid="input-brand-logo" />
            </label>
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
            <FAQBuilder />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" data-testid="button-save-brand">
            Save Brand
          </Button>
          <Button type="button" variant="outline" data-testid="button-cancel">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
