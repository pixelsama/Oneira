import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  // Use a key-based approach to reset selectedIndex when filterText changes
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevFilterText, setPrevFilterText] = useState(filterText);

  // Reset selected index when filter changes (using state update pattern to avoid effect)
  if (filterText !== prevFilterText) {
    setPrevFilterText(filterText);
    setSelectedIndex(0);
  }

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

  const menuContent = (
    <div
      className="fixed z-[9999] w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl overflow-hidden transition-colors duration-200"
      style={{ top: position.top, left: position.left }}
    >
      {filteredImages.length === 0 ? (
        <div className="p-3 text-sm text-[var(--text-secondary)] text-center">
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
                  ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
              }`}
            >
              {img.thumbnailDataUrl ? (
                <img
                  src={img.thumbnailDataUrl}
                  alt=""
                  className="w-6 h-6 rounded object-cover border border-[var(--border-color)]"
                />
              ) : (
                <div className="w-6 h-6 rounded bg-[var(--bg-primary)] flex items-center justify-center">
                  <ImageIcon size={14} className="text-[var(--text-secondary)]" />
                </div>
              )}
              <span className="truncate text-[var(--text-primary)]">{img.displayName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Use Portal to render menu at document.body level
  // This avoids being clipped by parent elements with overflow: hidden
  return createPortal(menuContent, document.body);
};
