import { convertFileSrc } from '@tauri-apps/api/core';
import type { Resource } from '../../../stores/resourceStore';
import { Trash2, Edit, Play } from 'lucide-react';

interface Props {
  resource: Resource;
  onEdit: (r: Resource) => void;
  onDelete: (id: string) => void;
  onLoadToStudio?: (r: Resource) => void;
}

export const ResourceCard = ({ resource, onEdit, onDelete, onLoadToStudio }: Props) => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-700 transition-colors group relative flex flex-col">
      <div className="h-40 bg-neutral-950 overflow-hidden relative">
        {resource.images.length > 0 ? (
          <img 
            src={convertFileSrc(resource.images[0])} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            alt={resource.name}
          />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-neutral-800 bg-neutral-950">
             <div className="text-4xl font-bold opacity-20">{resource.name[0]}</div>
           </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded backdrop-blur-sm">
           <button onClick={(e) => { e.stopPropagation(); onEdit(resource); }} className="p-1.5 hover:bg-neutral-700 text-neutral-300 rounded transition-colors" title="Edit"><Edit size={14}/></button>
           <button onClick={(e) => { e.stopPropagation(); onDelete(resource.id); }} className="p-1.5 hover:bg-red-900/80 text-neutral-300 hover:text-red-200 rounded transition-colors" title="Delete"><Trash2 size={14}/></button>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="font-semibold text-neutral-200 truncate">{resource.name}</h4>
        <p className="text-xs text-neutral-500 line-clamp-2 mt-1 flex-1">{resource.description || 'No description'}</p>
        
        {onLoadToStudio && (
          <button 
            onClick={() => onLoadToStudio(resource)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 bg-neutral-800 hover:bg-purple-900/30 hover:text-purple-300 text-neutral-400 text-xs font-medium rounded transition-colors border border-neutral-800 hover:border-purple-800/50"
          >
            <Play size={12} fill="currentColor" /> Load to Studio
          </button>
        )}
      </div>
    </div>
  );
};
