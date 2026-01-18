import { useState, useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import { v4 as uuidv4 } from 'uuid';
import { useReferenceImageStore } from '../../../stores/referenceImageStore';
import { UploadedImageCard } from './UploadedImageCard';
import { toast } from 'sonner';

const MAX_THUMBNAIL_SIZE = 200;
const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export const ImageUploader = () => {
  const { images, addImage } = useReferenceImageStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const processFiles = async (paths: string[]) => {
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
  };

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
        // In Tauri v2, open returns null | string | string[].
        // But if multiple: true, it returns null | string[]. (Check types if unsure, but usually safe to cast or check)
        // Wait, plugin-dialog types: multiple: true -> string[] | null.
        // I will assume it works as array.
        await processFiles(paths);
      }
    } catch (err) {
      console.error('Failed to open dialog:', err);
      toast.error('Failed to open file dialog');
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // In Tauri, we need to check if we can get paths.
    // Standard web DragEvent files usually don't have paths unless Tauri injects them.
    // If not available, we might need a different approach or inform user to use the button.
    // However, for this implementation, we will try to access the path.
    // Note: This relies on Tauri's webview behavior.

    const files = Array.from(e.dataTransfer.files);
    const paths: string[] = [];

    for (const file of files) {
      // @ts-expect-error - Tauri injects path property
      if (file.path) {
        // @ts-expect-error - Tauri injects path property
        paths.push(file.path);
      } else {
        console.warn('File path not available via drag-and-drop');
      }
    }

    if (paths.length > 0) {
      await processFiles(paths);
    } else if (files.length > 0) {
      // Fallback or error if we can't get paths
      toast.error(
        'Drag and drop not supported for these files (path missing). Please use the upload button.'
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-4">
      <div
        onClick={handleClick}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center 
          transition-colors cursor-pointer bg-neutral-900/50 min-h-[120px]
          ${isDragging ? 'border-purple-500 bg-purple-900/10' : 'border-neutral-800 hover:border-neutral-600'}
        `}
      >
        {isProcessing ? (
          <Loader2 size={24} className="text-purple-500 animate-spin mb-2" />
        ) : (
          <Upload size={24} className="text-neutral-500 mb-2" />
        )}
        <span className="text-sm text-neutral-400 text-center">
          {isProcessing ? 'Processing images...' : 'Upload Reference Images'}
        </span>
        <span className="text-xs text-neutral-600 mt-1">Click or Drag & Drop</span>
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
