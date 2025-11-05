import BrandCard from '../BrandCard';

export default function BrandCardExample() {
  return (
    <div className="p-6 space-y-4 max-w-md">
      <BrandCard
        id="1"
        name="Maruti Suzuki"
        rank={1}
        onEdit={() => console.log('Edit brand clicked')}
      />
    </div>
  );
}
