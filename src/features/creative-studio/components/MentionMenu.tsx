import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReferenceImage } from '../../../types/referenceImage';
import { type Resource } from '../../../stores/resourceStore';
import { Image as ImageIcon, Package } from 'lucide-react';

export interface MentionItem {
  id: string;
  type: 'image' | 'resource';
  displayName: string;
  thumbnail?: string;
  imageCount?: number;
  promptPreview?: string;
  originalObject: ReferenceImage | Resource;
}

interface MentionMenuProps {
  items: MentionItem[];
  isOpen: boolean;
  filterText: string;
  onSelect: (item: MentionItem) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export const MentionMenu = ({
  items,
  isOpen,
  filterText,
  onSelect,
  onClose,
  position,
}: MentionMenuProps) => {
  // Use a key-based approach to reset selectedIndex when filterText changes
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevFilterText, setPrevFilterText] = useState(filterText);

  // Reset selected index when filter changes (using state update pattern to avoid effect)
  if (filterText !== prevFilterText) {
    setPrevFilterText(filterText);
    setSelectedIndex(0);
  }

  const filteredItems = items.filter((item) =>
    item.displayName.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredItems.length > 0) {
          onSelect(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  const menuContent = (
    <div
      className="fixed z-[9999] w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl overflow-hidden transition-colors duration-200"
      style={{ top: position.top, left: position.left }}
    >
      {filteredItems.length === 0 ? (
        <div className="p-3 text-sm text-[var(--text-secondary)] text-center">
          {items.length === 0 ? 'No items found' : 'No matches found'}
        </div>
      ) : (
        <ul className="max-h-64 overflow-y-auto">
          {filteredItems.map((item, index) => (
            <li
              key={`${item.type}-${item.id}`}
              onClick={() => onSelect(item)}
              className={`flex items-center gap-2 p-2 cursor-pointer text-sm transition-colors ${
                index === selectedIndex
                  ? item.type === 'resource'
                    ? 'bg-blue-900/30 text-blue-200'
                    : 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
              }`}
            >
              <div className="relative shrink-0">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className={`w-8 h-8 rounded object-cover border ${
                      item.type === 'resource' ? 'border-blue-700' : 'border-[var(--border-color)]'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      item.type === 'resource' ? 'bg-blue-900/30' : 'bg-[var(--bg-primary)]'
                    }`}
                  >
                    {item.type === 'resource' ? (
                      <Package size={16} className="text-blue-400" />
                    ) : (
                      <ImageIcon size={16} className="text-[var(--text-secondary)]" />
                    )}
                  </div>
                )}
                {item.type === 'resource' && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-900 rounded-full p-0.5 border border-blue-700">
                    <Package size={8} className="text-blue-200" />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex justify-between items-center">
                  <span className="truncate font-medium">{item.displayName}</span>
                  {item.type === 'resource' && item.imageCount !== undefined && (
                    <span className="text-[10px] opacity-70 ml-1 whitespace-nowrap">
                      {item.imageCount} imgs
                    </span>
                  )}
                </div>
                {item.type === 'resource' && item.promptPreview && (
                  <span className="text-xs opacity-60 truncate w-full block">
                    {item.promptPreview}
                  </span>
                )}
              </div>
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
