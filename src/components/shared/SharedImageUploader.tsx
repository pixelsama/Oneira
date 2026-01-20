import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Loader2, Trash2, GripVertical, AlertTriangle } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { listen } from '@tauri-apps/api/event';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { ACCEPTED_EXTENSIONS } from '../../lib/imageUtils';
import { toast } from 'sonner';

interface SharedImageUploaderProps {
  imagePaths: string[];
  onImagesChange: (paths: string[]) => void;
  maxImages?: number;
  showInlineThumbnails?: boolean;
  emptyTextKey?: string;
  emptySubTextKey?: string;
  allowReorder?: boolean;
  isProcessing?: boolean;
}

interface DragDropEvent {
  paths: string[];
  position: { x: number; y: number };
}

export const SharedImageUploader = ({
  imagePaths,
  onImagesChange,
  maxImages,
  showInlineThumbnails = false,
  emptyTextKey = 'studio.upload.title',
  emptySubTextKey = 'studio.upload.subtitle',
  allowReorder = false,
  isProcessing = false,
}: SharedImageUploaderProps) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNewPaths = useCallback(
    (newPaths: string[]) => {
      // Validate paths
      const validPaths: string[] = [];
      for (const path of newPaths) {
        const filename = path.split(new RegExp('[\\/]')).pop() || 'image';
        const extension = filename.split('.').pop()?.toLowerCase();

        if (!extension || !ACCEPTED_EXTENSIONS.includes(extension)) {
          toast.error(`Skipped ${filename}: Unsupported format`);
          continue;
        }
        validPaths.push(path);
      }

      if (validPaths.length === 0) return;

      let updatedPaths = [...imagePaths, ...validPaths];

      if (maxImages && updatedPaths.length > maxImages) {
        toast.warning(t('library.editor.imageLimit') || `Max ${maxImages} images allowed`);
        updatedPaths = updatedPaths.slice(0, maxImages);
      }

      onImagesChange(updatedPaths);
    },
    [imagePaths, maxImages, onImagesChange, t]
  );

  useEffect(() => {
    let unlisten: (() => void)[] = [];
    let unmounted = false;

    const setupListeners = async () => {
      const listeners = [
        await listen<DragDropEvent>('tauri://drag-drop', (event) => {
          setIsDragging(false);
          const { x, y } = event.payload.position;
          const rect = containerRef.current?.getBoundingClientRect();

          if (rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            handleNewPaths(event.payload.paths);
          }
        }),
        await listen('tauri://drag-enter', () => {
          setIsDragging(true);
        }),
        await listen('tauri://drag-leave', () => {
          setIsDragging(false);
        }),
      ];

      if (unmounted) {
        listeners.forEach((fn) => fn());
      } else {
        unlisten = listeners;
      }
    };

    setupListeners();

    return () => {
      unmounted = true;
      unlisten.forEach((fn) => fn());
    };
  }, [handleNewPaths]);

  const handleClick = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [
          {
            name: 'Images',
            extensions: ACCEPTED_EXTENSIONS,
          },
        ],
      });

      if (selected) {
        const paths = Array.isArray(selected) ? selected : [selected];
        handleNewPaths(paths);
      }
    } catch (err) {
      console.error('Failed to open dialog:', err);
      toast.error('Failed to open file dialog');
    }
  };

  // Reordering handlers
  const handleDragStart = (index: number) => {
    if (!allowReorder) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!allowReorder || draggedIndex === null || draggedIndex === index) return;

    const newPaths = [...imagePaths];
    const draggedItem = newPaths[draggedIndex];
    newPaths.splice(draggedIndex, 1);
    newPaths.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    onImagesChange(newPaths);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemoveImage = (index: number) => {
    const newPaths = imagePaths.filter((_, i) => i !== index);
    onImagesChange(newPaths);
  };

  const isOverLimit = maxImages ? imagePaths.length > maxImages : false;

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center 
          transition-colors cursor-pointer bg-[var(--bg-secondary)] min-h-[120px] duration-200
          ${isDragging ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10' : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]'}
        `}
      >
        {isProcessing ? (
          <Loader2 size={24} className="text-[var(--accent-color)] animate-spin mb-2" />
        ) : (
          <Upload size={24} className="text-[var(--text-secondary)] mb-2" />
        )}
        <span className="text-sm text-[var(--text-secondary)] text-center">
          {isProcessing ? t('studio.upload.processing') : t(emptyTextKey)}
        </span>
        <span className="text-xs text-[var(--text-secondary)] mt-1 opacity-70">
          {t(emptySubTextKey)}
        </span>
      </div>

      {showInlineThumbnails && imagePaths.length > 0 && (
        <div className="flex flex-col gap-2">
          {isOverLimit && (
            <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-600 dark:text-yellow-400">
              <AlertTriangle size={14} />
              {t('library.editor.imageLimit') || 'Image limit reached'}
            </div>
          )}
          <div className="grid grid-cols-5 gap-2">
            {imagePaths.map((path, idx) => (
              <div
                key={`${path}-${idx}`}
                draggable={allowReorder}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`relative aspect-square rounded overflow-hidden border border-[var(--border-color)] group ${allowReorder ? 'cursor-move' : ''} transition-all ${draggedIndex === idx ? 'opacity-40 scale-95' : 'opacity-100'}`}
              >
                <img
                  src={convertFileSrc(path)}
                  className="w-full h-full object-cover"
                  alt={`Uploaded img ${idx}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/100x100?text=Invalid+Path';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                  {allowReorder && <GripVertical size={12} className="text-white/70" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
