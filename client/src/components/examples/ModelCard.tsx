import ModelCard from '../ModelCard';

export default function ModelCardExample() {
  return (
    <div className="p-6 space-y-4 max-w-md">
      <ModelCard 
        id="1"
        name="Swift" 
        onEdit={() => console.log('Edit model clicked')}
      />
    </div>
  );
}
