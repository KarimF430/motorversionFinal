import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface ModelCardProps {
  id: string;
  name: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ModelCard({ id, name, onEdit, onDelete }: ModelCardProps) {
  return (
    <Card className="p-4 hover-elevate" data-testid={`card-model-${id}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium" data-testid={`text-model-name-${id}`}>
          {name}
        </span>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            data-testid={`button-edit-model-${id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            data-testid={`button-delete-model-${id}`}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
