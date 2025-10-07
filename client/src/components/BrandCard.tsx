import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface BrandCardProps {
  id: string;
  name: string;
  logo?: string;
  rank: number;
  onEdit?: () => void;
}

export default function BrandCard({ id, name, logo, rank, onEdit }: BrandCardProps) {
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
        <Button 
          size="icon" 
          variant="ghost"
          onClick={onEdit}
          data-testid={`button-edit-brand-${id}`}
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
