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
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden hover:border-[var(--text-secondary)] transition-colors duration-200 group relative flex flex-col">
      <div className="h-40 bg-[var(--bg-primary)] overflow-hidden relative">
        {resource.images.length > 0 ? (
          <img
            src={convertFileSrc(resource.images[0])}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            alt={resource.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] bg-[var(--bg-primary)]">
            <div className="text-4xl font-bold opacity-20">{resource.name[0]}</div>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded backdrop-blur-sm">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(resource);
            }}
            className="p-1.5 hover:bg-white/20 text-white rounded transition-colors"
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(resource.id);
            }}
            className="p-1.5 hover:bg-red-900/80 text-white hover:text-red-200 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="font-semibold text-[var(--text-primary)] truncate">{resource.name}</h4>
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1 flex-1">
          {resource.description || 'No description'}
        </p>

        {onLoadToStudio && (
          <button
            onClick={() => onLoadToStudio(resource)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 bg-[var(--bg-primary)] hover:bg-[var(--accent-color)]/20 hover:text-[var(--accent-color)] text-[var(--text-secondary)] text-xs font-medium rounded transition-colors border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 cursor-pointer"
          >
            <Play size={12} fill="currentColor" /> Load to Studio
          </button>
        )}
      </div>
    </div>
  );
};
