import StatsCard from '../StatsCard';
import { Building2 } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="p-6 space-y-4">
      <StatsCard
        title="Total Brands"
        value={5}
        icon={Building2}
        onClick={() => console.log('Stats card clicked')}
      />
    </div>
  );
}
