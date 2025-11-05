import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  onClick?: () => void;
}

export default function StatsCard({ title, value, icon: Icon, onClick }: StatsCardProps) {
  return (
    <Card
      className={`p-6 ${onClick ? 'cursor-pointer hover-elevate active-elevate-2' : ''}`}
      onClick={onClick}
      data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-sm text-muted-foreground mb-1"
            data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-label`}
          >
            {title}
          </p>
          <h3
            className="text-3xl font-bold"
            data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-value`}
          >
            {value}
          </h3>
        </div>
        <div className="bg-primary text-primary-foreground p-3 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
