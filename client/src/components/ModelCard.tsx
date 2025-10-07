import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface ModelCardProps {
  id: string;
  name: string;
  onEdit?: () => void;
}

export default function ModelCard({ id, name, onEdit }: ModelCardProps) {
  return (
    <Card className="p-4 hover-elevate" data-testid={`card-model-${id}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium" data-testid={`text-model-name-${id}`}>
          {name}
        </span>
        <Button 
          size="icon" 
          variant="ghost"
          onClick={onEdit}
          data-testid={`button-edit-model-${id}`}
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
