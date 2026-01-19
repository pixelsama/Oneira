import { convertFileSrc } from '@tauri-apps/api/core';
import type { Resource } from '../../../stores/resourceStore';
import { Trash2, Edit, Play, Copy, Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Props {
  resource: Resource;
  onEdit: (r: Resource) => void;
  onDelete: (id: string) => void;
  onLoadToStudio?: (r: Resource) => void;
}

const ResourceImage = ({
  path,
  className,
  alt,
}: {
  path: string;
  className: string;
  alt: string;
}) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`${className} bg-[var(--bg-primary)] flex flex-col items-center justify-center text-red-500/50 border border-red-500/20`}
        title={`Image not found: ${path}`}
      >
        <X size={16} />
        <span className="text-[8px] mt-1 font-mono opacity-50">MISSING</span>
      </div>
    );
  }

  return (
    <img
      src={convertFileSrc(path)}
      className={className}
      alt={alt}
      onError={() => setError(true)}
    />
  );
};

export const ResourceCard = ({ resource, onEdit, onDelete, onLoadToStudio }: Props) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(resource.promptTemplate);
    setCopied(true);
    toast.success(t('library.card.promptCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const displayImages = resource.images.slice(0, 4);
  const remainingCount = resource.images.length - 4;

  const renderImageGrid = () => {
    if (resource.images.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] bg-[var(--bg-primary)]">
          <div className="text-4xl font-bold opacity-20">{resource.name[0]}</div>
        </div>
      );
    }

    if (resource.images.length === 1) {
      return (
        <ResourceImage
          path={resource.images[0]}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
          alt={resource.name}
        />
      );
    }

    return (
      <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5 p-0.5 bg-[var(--border-color)]/30">
        {displayImages.map((img, idx) => (
          <div
            key={idx}
            className="relative w-full h-full overflow-hidden bg-[var(--bg-secondary)]"
          >
            <ResourceImage
              path={img}
              className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
              alt={`${resource.name} ${idx + 1}`}
            />
            {idx === 3 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm">
                +{remainingCount}
              </div>
            )}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 4 - resource.images.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-[var(--bg-primary)]/50" />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden hover:border-[var(--accent-color)]/50 transition-all duration-200 group relative flex flex-col shadow-sm hover:shadow-md">
      <div className="h-40 bg-[var(--bg-primary)] overflow-hidden relative">
        {renderImageGrid()}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-1.5 rounded-lg backdrop-blur-md shadow-lg border border-white/10">
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-white/20 text-white rounded-md transition-colors"
            title={t('library.card.copyPrompt')}
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(resource);
            }}
            className="p-1.5 hover:bg-white/20 text-white rounded-md transition-colors"
            title={t('library.card.edit')}
          >
            <Edit size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(resource.id);
            }}
            className="p-1.5 hover:bg-red-500/80 text-white rounded-md transition-colors"
            title={t('library.card.delete')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col gap-2">
        <h4
          className="font-bold text-[var(--text-primary)] text-sm leading-tight line-clamp-1"
          title={resource.name}
        >
          {resource.name}
        </h4>

        <div className="relative group/prompt">
          <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-mono bg-[var(--bg-primary)]/50 p-2 rounded border border-[var(--border-color)]/50">
            {resource.promptTemplate}
          </p>
          <div className="invisible group-hover/prompt:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-2xl z-20 text-xs text-[var(--text-primary)] break-words font-mono whitespace-pre-wrap max-h-48 overflow-y-auto pointer-events-none">
            {resource.promptTemplate}
            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[var(--bg-secondary)] border-b border-r border-[var(--border-color)] rotate-45"></div>
          </div>
        </div>

        {onLoadToStudio && (
          <button
            onClick={() => onLoadToStudio(resource)}
            className="mt-1 w-full flex items-center justify-center gap-2 py-1.5 bg-[var(--bg-primary)] hover:bg-[var(--accent-color)] text-[var(--text-secondary)] hover:text-white text-xs font-medium rounded transition-all border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 cursor-pointer"
          >
            <Play size={12} fill="currentColor" /> {t('library.card.loadToStudio')}
          </button>
        )}
      </div>
    </div>
  );
};
