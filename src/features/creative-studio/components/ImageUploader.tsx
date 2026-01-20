import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useReferenceImageStore } from '../../../stores/referenceImageStore';
import { UploadedImageCard } from './UploadedImageCard';
import { toast } from 'sonner';
import { SharedImageUploader } from '../../../components/shared/SharedImageUploader';
import { generateThumbnail, ACCEPTED_EXTENSIONS } from '../../../lib/imageUtils';

export const ImageUploader = () => {
  const { images, addImage } = useReferenceImageStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const imagePaths = images.map((img) => img.originalPath);

  const handleImagesChange = useCallback(
    async (newPaths: string[]) => {
      const existingPaths = new Set(images.map((img) => img.originalPath));
      const addedPaths = newPaths.filter((p) => !existingPaths.has(p));

      if (addedPaths.length === 0) return;

      setIsProcessing(true);

      for (const path of addedPaths) {
        const filename = path.split(new RegExp('[\\/]')).pop() || 'image';
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
            source: 'studio',
          });
        } catch (error) {
          console.error(`Failed to process ${filename}:`, error);
          toast.error(`Failed to load ${filename}`);
        }
      }

      setIsProcessing(false);
    },
    [images, addImage]
  );

  return (
    <div className="flex flex-col gap-4">
      <SharedImageUploader
        imagePaths={imagePaths}
        onImagesChange={handleImagesChange}
        isProcessing={isProcessing}
        emptyTextKey="studio.upload.title"
        emptySubTextKey="studio.upload.subtitle"
      />

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
