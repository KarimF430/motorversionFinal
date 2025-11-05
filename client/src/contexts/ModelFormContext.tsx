import { createContext, useContext, useState, ReactNode } from 'react';
import type { InsertModel } from '@shared/schema';

interface ModelFormContextType {
  formData: Partial<InsertModel>;
  updateFormData: (data: Partial<InsertModel>) => void;
  resetFormData: () => void;
}

const ModelFormContext = createContext<ModelFormContextType | undefined>(undefined);

const initialFormData: Partial<InsertModel> = {
  brandId: '',
  name: '',
  isPopular: false,
  isNew: false,
  popularRank: null,
  newRank: null,
  bodyType: null,
  subBodyType: null,
  launchDate: null,
  fuelTypes: [],
  transmissions: [],
  brochureUrl: null,
  status: 'active',
  headerSeo: null,
  pros: null,
  cons: null,
  description: null,
  exteriorDesign: null,
  comfortConvenience: null,
  engineSummaries: [],
  mileageData: [],
  faqs: [],
  heroImage: null,
  galleryImages: [],
  keyFeatureImages: [],
  spaceComfortImages: [],
  storageConvenienceImages: [],
  colorImages: [],
};

export function ModelFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<Partial<InsertModel>>(initialFormData);

  const updateFormData = (data: Partial<InsertModel>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  return (
    <ModelFormContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </ModelFormContext.Provider>
  );
}

export function useModelForm() {
  const context = useContext(ModelFormContext);
  if (!context) {
    throw new Error('useModelForm must be used within ModelFormProvider');
  }
  return context;
}
