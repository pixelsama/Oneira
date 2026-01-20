import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import type { GeneratedImage } from '../../../stores/galleryStore';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  images: GeneratedImage[];
  onOpen: (path: string) => void;
  isLoading: boolean;
}

export const ImageGrid = ({ images, onOpen, isLoading }: Props) => {
  const { t } = useTranslation();

  const handleDownload = async (e: React.MouseEvent, imagePath: string, filename: string) => {
    e.stopPropagation(); // Prevent opening the image
    try {
      // Call Rust backend command (bypasses fs plugin permission restrictions)
      const saved = await invoke<boolean>('download_image', {
        sourcePath: imagePath,
        defaultFilename: filename,
      });

      if (saved) {
        toast.success(t('common.downloadSuccess'));
      }
      // If not saved, user cancelled - no message needed
    } catch (err) {
      console.error('Download failed:', err);
      toast.error(t('common.downloadFailed'));
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-neutral-500 animate-pulse">{t('gallery.loading')}</div>
    );
  if (images.length === 0)
    return (
      <div className="p-8 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-lg bg-neutral-900/20">
        {t('gallery.empty')}
      </div>
    );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {images.map((img) => (
        <div
          key={img.path}
          onClick={() => onOpen(img.path)}
          className="aspect-square bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 hover:border-neutral-600 cursor-pointer group relative"
        >
          <img
            src={convertFileSrc(img.path)}
            alt={img.filename}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          {/* Download button - visible on hover */}
          <button
            onClick={(e) => handleDownload(e, img.path, img.filename)}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-white/10 cursor-pointer"
            title={t('common.download')}
          >
            <Download size={16} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
            <p className="text-xs text-neutral-300 truncate">{img.filename}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
