import { useState, useRef, useEffect } from 'react';
import { X, Edit2, Check } from 'lucide-react';
import type { ReferenceImage } from '../../../types/referenceImage';
import { useReferenceImageStore } from '../../../stores/referenceImageStore';

interface UploadedImageCardProps {
  image: ReferenceImage;
  onRemove?: (id: string) => void;
  onUpdateName?: (id: string, name: string) => void;
}

export const UploadedImageCard = ({ image, onRemove, onUpdateName }: UploadedImageCardProps) => {
  const { removeImage, updateDisplayName } = useReferenceImageStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(image.displayName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedName = editedName.trim();
    if (trimmedName) {
      if (onUpdateName) {
        onUpdateName(image.id, trimmedName);
      } else {
        updateDisplayName(image.id, trimmedName);
      }
    } else {
      setEditedName(image.displayName); // Revert if empty
    }
    setIsEditing(false);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(image.id);
    } else {
      removeImage(image.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedName(image.displayName);
      setIsEditing(false);
    }
  };

  return (
    <div className="relative group bg-[var(--bg-primary)] rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors duration-200">
      <div className="aspect-square w-full relative bg-[var(--bg-secondary)]">
        {image.thumbnailDataUrl ? (
          <img
            src={image.thumbnailDataUrl}
            alt={image.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] text-xs">
            No Preview
          </div>
        )}

        <button
          onClick={handleRemove}
          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-90 hover:scale-100"
          title="Remove image"
        >
          <X size={12} />
        </button>
      </div>

      <div className="p-2">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-1 py-0.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors duration-200"
            />
            <button
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
              onClick={handleSave}
              className="text-green-500 hover:text-green-400"
            >
              <Check size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between group/name">
            <span
              className="text-xs text-[var(--text-primary)] truncate font-medium"
              title={image.displayName}
            >
              {image.displayName}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-0 group-hover/name:opacity-100 transition-opacity"
            >
              <Edit2 size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
