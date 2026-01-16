import { convertFileSrc } from '@tauri-apps/api/core';
import type { GeneratedImage } from '../../../stores/galleryStore';

interface Props {
  images: GeneratedImage[];
  onOpen: (path: string) => void;
  isLoading: boolean;
}

export const ImageGrid = ({ images, onOpen, isLoading }: Props) => {
  if (isLoading) return <div className="p-8 text-center text-neutral-500 animate-pulse">Scanning assets...</div>;
  if (images.length === 0) return <div className="p-8 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-lg bg-neutral-900/20">No images generated yet. Go dream something!</div>;

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
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
            <p className="text-xs text-neutral-300 truncate">{img.filename}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
