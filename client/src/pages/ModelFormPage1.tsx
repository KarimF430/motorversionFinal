import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { useLocation } from "wouter";

export default function ModelFormPage1() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    brand: 'Honda',
    modelName: 'City',
    modelId: 'HOCI0001',
    isPopular: false,
    isNew: false,
    popularRank: '1',
    newRank: '1',
    bodyType: '',
    subBodyType: '',
    launchDate: '',
    fuelType: [] as string[],
    transmission: [] as string[],
    headerSeo: '',
    pros: '',
    cons: '',
    description: '',
    exteriorDesign: '',
    comfortConvenience: '',
  });

  return (
    <div className="p-8">
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Add New Model</h1>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-normal">Model Id</Label>
            <Input 
              value={formData.modelId}
              disabled
              className="w-32 font-mono text-sm bg-muted"
              data-testid="input-model-id"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            type="button"
            variant="default"
            data-testid="button-activate-model"
          >
            activate Model
          </Button>
          <Button 
            type="button"
            variant="outline"
            data-testid="button-deactivate-model"
          >
            Deactivate Model
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Select Brand</Label>
            <select 
              className="w-full px-3 py-2 border rounded-md"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              data-testid="select-brand"
            >
              <option>Honda</option>
              <option>Maruti Suzuki</option>
              <option>Toyota</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPopular"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="w-4 h-4"
                data-testid="checkbox-is-popular"
              />
              <Label htmlFor="isPopular" className="font-normal">Is Model Popular</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isNew"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="w-4 h-4"
                data-testid="checkbox-is-new"
              />
              <Label htmlFor="isNew" className="font-normal">Is Model New</Label>
            </div>
          </div>
        </div>

        {formData.isPopular && (
          <div className="space-y-2">
            <Label>Popular Model Ranking (1-20)</Label>
            <select className="w-full md:w-48 px-3 py-2 border rounded-md" data-testid="select-popular-rank">
              <option>Digit list 1-20</option>
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
        )}

        {formData.isNew && (
          <div className="space-y-2">
            <Label>New Model Ranking (1-20)</Label>
            <select className="w-full md:w-48 px-3 py-2 border rounded-md" data-testid="select-new-rank">
              <option>Digit list 1-20</option>
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Body Type</Label>
            <select className="w-full px-3 py-2 border rounded-md" data-testid="select-body-type">
              <option>List</option>
              <option>Sedan</option>
              <option>SUV</option>
              <option>Hatchback</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Subbody Type</Label>
            <select className="w-full px-3 py-2 border rounded-md" data-testid="select-subbody-type">
              <option>List</option>
              <option>Compact</option>
              <option>Mid-size</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Model Name</Label>
            <Input placeholder="Text field" data-testid="input-model-name" />
          </div>

          <div className="space-y-2">
            <Label>Launched time line</Label>
            <Input type="month" placeholder="Calendar popup" data-testid="input-launch-date" />
          </div>

          <div className="space-y-2">
            <Label>Upload Brochure</Label>
            <label className="flex items-center justify-center h-10 border-2 border-dashed rounded-md cursor-pointer hover-elevate active-elevate-2">
              <Upload className="w-4 h-4 mr-2" />
              <span className="text-sm">Upload PDF</span>
              <input type="file" className="hidden" accept=".pdf" data-testid="input-brochure" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Model Fuel Type</Label>
            <select className="w-full px-3 py-2 border rounded-md" data-testid="select-fuel-type">
              <option>Multiple Select Fuel Drop down</option>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Electric</option>
              <option>Hybrid</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Model Transmission</Label>
            <select className="w-full px-3 py-2 border rounded-md" data-testid="select-transmission">
              <option>Multiple Select Transmission Drop down</option>
              <option>Manual</option>
              <option>Automatic</option>
              <option>CVT</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Model Header SEO text</Label>
          <RichTextEditor
            value={formData.headerSeo}
            onChange={(value) => setFormData({ ...formData, headerSeo: value })}
            placeholder="Long Text Field"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Model Pro's & Cons</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Pro's</Label>
              <RichTextEditor
                value={formData.pros}
                onChange={(value) => setFormData({ ...formData, pros: value })}
                placeholder="Long Text Field"
              />
            </div>
            <div className="space-y-2">
              <Label>Con's</Label>
              <RichTextEditor
                value={formData.cons}
                onChange={(value) => setFormData({ ...formData, cons: value })}
                placeholder="Long Text Field"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Model Summary</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Long Text Field"
              />
            </div>
            <div className="space-y-2">
              <Label>Exterior Design</Label>
              <RichTextEditor
                value={formData.exteriorDesign}
                onChange={(value) => setFormData({ ...formData, exteriorDesign: value })}
                placeholder="Long Text Field"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Comfort & Convenience</Label>
            <RichTextEditor
              value={formData.comfortConvenience}
              onChange={(value) => setFormData({ ...formData, comfortConvenience: value })}
              placeholder="Long Text Field"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => setLocation('/models/new/page2')} data-testid="button-next-page">
            Next Page
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
