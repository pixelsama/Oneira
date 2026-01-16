import type { Resource } from '../../../stores/resourceStore';
import { ResourceCard } from './ResourceCard';

interface Props {
  resources: Resource[];
  isLoading: boolean;
  onEdit: (r: Resource) => void;
  onDelete: (id: string) => void;
  onLoadToStudio?: (r: Resource) => void;
}

export const ResourceList = ({ resources, isLoading, onEdit, onDelete, onLoadToStudio }: Props) => {
  if (isLoading) {
    return <div className="text-neutral-500 p-8 text-center animate-pulse">Loading library...</div>;
  }

  if (resources.length === 0) {
    return (
      <div className="text-neutral-500 p-12 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
        <p>No resources found.</p>
        <p className="text-sm mt-2 opacity-60">Save your favorite prompts and styles here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
      {resources.map((r) => (
        <ResourceCard 
          key={r.id} 
          resource={r} 
          onEdit={onEdit} 
          onDelete={onDelete}
          onLoadToStudio={onLoadToStudio}
        />
      ))}
    </div>
  );
};
