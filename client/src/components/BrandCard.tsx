import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface BrandCardProps {
  id: string;
  name: string;
  logo?: string;
  rank: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function BrandCard({ id, name, logo, rank, onEdit, onDelete }: BrandCardProps) {
  return (
    <Card className="p-4 hover-elevate" data-testid={`card-brand-${id}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold text-muted-foreground min-w-[2rem]" data-testid={`text-brand-rank-${id}`}>
          {rank}.
        </span>
        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
          {logo ? (
            <img src={logo} alt={name} className="w-full h-full object-contain rounded-md" />
          ) : (
            <div className="w-full h-full bg-muted rounded-md" />
          )}
        </div>
        <span className="flex-1 font-medium" data-testid={`text-brand-name-${id}`}>
          {name}
        </span>
        <div className="flex items-center gap-1">
          <Button 
            size="icon" 
            variant="ghost"
            onClick={onEdit}
            data-testid={`button-edit-brand-${id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            data-testid={`button-delete-brand-${id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
