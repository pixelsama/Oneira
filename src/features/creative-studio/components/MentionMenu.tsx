import { useEffect, useState } from 'react';
import type { ReferenceImage } from '../../../types/referenceImage';
import { useReferenceImageStore } from '../../../stores/referenceImageStore';
import { Image as ImageIcon } from 'lucide-react';

interface MentionMenuProps {
  isOpen: boolean;
  filterText: string;
  onSelect: (image: ReferenceImage) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export const MentionMenu = ({
  isOpen,
  filterText,
  onSelect,
  onClose,
  position,
}: MentionMenuProps) => {
  const { images } = useReferenceImageStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredImages = images.filter((img) =>
    img.displayName.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredImages.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredImages.length > 0) {
          onSelect(filteredImages[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredImages, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute z-50 w-64 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      {filteredImages.length === 0 ? (
        <div className="p-3 text-sm text-neutral-500 text-center">
          {images.length === 0 ? 'No uploaded images' : 'No matches found'}
        </div>
      ) : (
        <ul className="max-h-48 overflow-y-auto">
          {filteredImages.map((img, index) => (
            <li
              key={img.id}
              onClick={() => onSelect(img)}
              className={`flex items-center gap-2 p-2 cursor-pointer text-sm transition-colors ${
                index === selectedIndex
                  ? 'bg-purple-600/20 text-purple-200'
                  : 'text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {img.thumbnailDataUrl ? (
                <img
                  src={img.thumbnailDataUrl}
                  alt=""
                  className="w-6 h-6 rounded object-cover border border-neutral-600"
                />
              ) : (
                <div className="w-6 h-6 rounded bg-neutral-700 flex items-center justify-center">
                  <ImageIcon size={14} className="text-neutral-500" />
                </div>
              )}
              <span className="truncate">{img.displayName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
