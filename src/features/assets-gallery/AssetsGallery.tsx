import { useEffect } from 'react';
import { useGalleryStore } from '../../stores/galleryStore';
import { ImageGrid } from './components/ImageGrid';
import { RefreshCw } from 'lucide-react';

export const AssetsGallery = () => {
  const { images, isLoading, loadImages, openImage } = useGalleryStore();

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  return (
    <div className="flex flex-col h-full p-8 gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-100">Assets Gallery</h1>
        <button
          onClick={() => loadImages()}
          className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <ImageGrid
        images={images}
        isLoading={isLoading}
        onOpen={openImage}
      />
    </div>
  );
};
