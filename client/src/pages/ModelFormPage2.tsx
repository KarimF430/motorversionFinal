import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import FAQBuilder from "@/components/FAQBuilder";
import { useLocation } from "wouter";

interface EngineSummary {
  id: string;
  title: string;
  summary: string;
  transmission: string;
  power: string;
  torque: string;
  speed: string;
}

interface MileageData {
  id: string;
  engineName: string;
  companyClaimed: string;
  cityRealWorld: string;
  highwayRealWorld: string;
}

export default function ModelFormPage2() {
  const [, setLocation] = useLocation();
  const [engineSummaries, setEngineSummaries] = useState<EngineSummary[]>([
    { id: '1', title: '', summary: '', transmission: '', power: '', torque: '', speed: '' }
  ]);

  const [mileageData, setMileageData] = useState<MileageData[]>([
    { id: '1', engineName: '', companyClaimed: '', cityRealWorld: '', highwayRealWorld: '' }
  ]);

  const addEngineSummary = () => {
    setEngineSummaries([...engineSummaries, { 
      id: Date.now().toString(), 
      title: '', 
      summary: '', 
      transmission: '', 
      power: '', 
      torque: '', 
      speed: '' 
    }]);
  };

  const addMileageData = () => {
    setMileageData([...mileageData, { 
      id: Date.now().toString(), 
      engineName: '', 
      companyClaimed: '', 
      cityRealWorld: '', 
      highwayRealWorld: '' 
    }]);
  };

  return (
    <div className="p-8">
      <div className="space-y-6 max-w-6xl">
        <h2 className="text-xl font-semibold">Page 2</h2>

        <div className="space-y-6">
          <Label className="text-base font-semibold">Model Engine Summary</Label>
          
          {engineSummaries.map((engine, index) => (
            <div key={engine.id} className="space-y-4 p-6 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{index + 1}.Title Name</Label>
                  <Input placeholder="Engine Name" data-testid={`input-engine-title-${index}`} />
                </div>

                <div className="space-y-2">
                  <Label>Summary</Label>
                  <RichTextEditor
                    value={engine.summary}
                    onChange={(value) => {
                      const updated = [...engineSummaries];
                      updated[index].summary = value;
                      setEngineSummaries(updated);
                    }}
                    placeholder="Enter summary"
                    minHeight="min-h-24"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Spec's</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <select className="px-3 py-2 border rounded-md" data-testid={`select-transmission-${index}`}>
                    <option>Transmission Drop Down</option>
                    <option>Manual</option>
                    <option>Automatic</option>
                  </select>
                  <Input placeholder="Power figure text field" data-testid={`input-power-${index}`} />
                  <Input placeholder="Torque figure text field" data-testid={`input-torque-${index}`} />
                  <Input placeholder="Transmission speed text field" data-testid={`input-speed-${index}`} />
                </div>
              </div>
            </div>
          ))}

          <Button 
            variant="outline" 
            className="w-full"
            onClick={addEngineSummary}
            data-testid="button-add-engine-summary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add More Model Engine Summary
          </Button>
        </div>

        <div className="space-y-6">
          <Label className="text-base font-semibold">Model Mileage</Label>
          
          {mileageData.map((mileage, index) => (
            <div key={mileage.id} className="space-y-4 p-6 border rounded-lg">
              <div className="space-y-2">
                <Label>{index + 1}.Engine & Transmission Name</Label>
                <Input placeholder="Title" data-testid={`input-mileage-engine-${index}`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Company Claimed</Label>
                  <Input placeholder="Text Box" data-testid={`input-company-claimed-${index}`} />
                </div>
                <div className="space-y-2">
                  <Label>City Real World</Label>
                  <Input placeholder="Text Box" data-testid={`input-city-mileage-${index}`} />
                </div>
                <div className="space-y-2">
                  <Label>Highway Real World</Label>
                  <Input placeholder="Text Box" data-testid={`input-highway-mileage-${index}`} />
                </div>
              </div>
            </div>
          ))}

          <Button 
            variant="outline" 
            className="w-full"
            onClick={addMileageData}
            data-testid="button-add-mileage"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add More Model Mileage
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Model FAQ</Label>
          <FAQBuilder />
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline"
            onClick={() => setLocation('/models/new')}
            data-testid="button-previous-page"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>
          <Button onClick={() => setLocation('/models/new/page3')} data-testid="button-next-page">
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
