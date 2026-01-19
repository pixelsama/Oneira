import { useState, useEffect, useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import { listen } from '@tauri-apps/api/event';
import { v4 as uuidv4 } from 'uuid';
import { useReferenceImageStore } from '../../../stores/referenceImageStore';
import { UploadedImageCard } from './UploadedImageCard';
import { toast } from 'sonner';

const MAX_THUMBNAIL_SIZE = 200;
const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

interface DragDropEvent {
  paths: string[];
  position: { x: number; y: number };
}

// Helper function to generate thumbnail
const generateThumbnail = async (path: string, mimeType: string): Promise<string> => {
  try {
    const fileBytes = await readFile(path);
    const blob = new Blob([fileBytes], { type: mimeType });
    const bitmap = await createImageBitmap(blob);

    let width = bitmap.width;
    let height = bitmap.height;

    if (width > MAX_THUMBNAIL_SIZE || height > MAX_THUMBNAIL_SIZE) {
      const ratio = Math.min(MAX_THUMBNAIL_SIZE / width, MAX_THUMBNAIL_SIZE / height);
      width *= ratio;
      height *= ratio;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    return ''; // Fallback to no preview
  }
};

export const ImageUploader = () => {
  const { images, addImage } = useReferenceImageStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(
    async (paths: string[]) => {
      if (paths.length === 0) return;

      setIsProcessing(true);

      for (const path of paths) {
        // Extract filename and extension
        // Simple extraction handling forward/backward slashes
        const filename = path.split(/[/\\]/).pop() || 'image';
        const extension = filename.split('.').pop()?.toLowerCase();

        if (!extension || !ACCEPTED_EXTENSIONS.includes(extension)) {
          toast.error(`Skipped ${filename}: Unsupported format`);
          continue;
        }

        const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;

        try {
          const thumbnail = await generateThumbnail(path, mimeType);

          addImage({
            id: uuidv4(),
            originalPath: path,
            displayName: filename.substring(0, filename.lastIndexOf('.')) || filename,
            originalFileName: filename,
            thumbnailDataUrl: thumbnail,
            addedAt: Date.now(),
          });
        } catch (error) {
          console.error(`Failed to process ${filename}:`, error);
          toast.error(`Failed to load ${filename}`);
        }
      }

      setIsProcessing(false);
    },
    [addImage]
  );

  useEffect(() => {
    let unlisten: (() => void)[] = [];
    let unmounted = false;

    const setupListeners = async () => {
      const listeners = [
        await listen<DragDropEvent>('tauri://drag-drop', (event) => {
          setIsDragging(false);
          processFiles(event.payload.paths);
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
  }, [processFiles]);

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
        await processFiles(paths);
      }
    } catch (err) {
      console.error('Failed to open dialog:', err);
      toast.error('Failed to open file dialog');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
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
          {isProcessing ? 'Processing images...' : 'Upload Reference Images'}
        </span>
        <span className="text-xs text-[var(--text-secondary)] mt-1 opacity-70">
          Click or Drag & Drop
        </span>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img) => (
            <UploadedImageCard key={img.id} image={img} />
          ))}
        </div>
      )}
    </div>
  );
};
