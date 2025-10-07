import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { useLocation } from "wouter";

export default function ModelFormPage3() {
  const [, setLocation] = useLocation();
  const [galleryImages, setGalleryImages] = useState([{ id: '1' }, { id: '2' }]);
  const [keyFeatures, setKeyFeatures] = useState([{ id: '1' }]);
  const [spaceComfort, setSpaceComfort] = useState([{ id: '1' }]);
  const [storageConvenience, setStorageConvenience] = useState([{ id: '1' }]);

  return (
    <div className="p-8">
      <div className="space-y-8 max-w-6xl">
        <h2 className="text-xl font-semibold">Page 3</h2>

        <div className="space-y-6">
          <Label className="text-base font-semibold">Hero image and Gallery</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Hero image</Label>
              <ImageUpload />
            </div>

            {galleryImages.map((img, index) => (
              <div key={img.id} className="space-y-2">
                <Label>Gallery Image {index + 1}</Label>
                <ImageUpload />
              </div>
            ))}

            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                onClick={() => setGalleryImages([...galleryImages, { id: Date.now().toString() }])}
                data-testid="button-add-gallery-image"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add more images
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Label className="text-base font-semibold">Model highlight images</Label>
          
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Key Features</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyFeatures.map((feature, index) => (
                  <ImageUpload key={feature.id} />
                ))}
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
                  <Button
                    variant="outline"
                    onClick={() => setKeyFeatures([...keyFeatures, { id: Date.now().toString() }])}
                    data-testid="button-add-key-feature"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add more Key Feature Images
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Space & Comfort</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spaceComfort.map((item, index) => (
                  <ImageUpload key={item.id} />
                ))}
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
                  <Button
                    variant="outline"
                    onClick={() => setSpaceComfort([...spaceComfort, { id: Date.now().toString() }])}
                    data-testid="button-add-space-comfort"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add more Space & Comfort Images
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Storage & convenience</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storageConvenience.map((item, index) => (
                  <ImageUpload key={item.id} />
                ))}
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
                  <Button
                    variant="outline"
                    onClick={() => setStorageConvenience([...storageConvenience, { id: Date.now().toString() }])}
                    data-testid="button-add-storage-convenience"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add more Storage & convenience images
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline"
            onClick={() => setLocation('/models/new/page2')}
            data-testid="button-previous-page"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>
          <Button onClick={() => setLocation('/models/new/page4')} data-testid="button-next-page">
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
