import { useState, useRef, useEffect } from 'react';
import { X, Edit2, Check } from 'lucide-react';
import type { ReferenceImage } from '../../../types/referenceImage';
import { useReferenceImageStore } from '../../../stores/referenceImageStore';

interface UploadedImageCardProps {
  image: ReferenceImage;
}

export const UploadedImageCard = ({ image }: UploadedImageCardProps) => {
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
    if (editedName.trim()) {
      updateDisplayName(image.id, editedName.trim());
    } else {
      setEditedName(image.displayName); // Revert if empty
    }
    setIsEditing(false);
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
    <div className="relative group bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-neutral-600 transition-colors">
      <div className="aspect-square w-full relative bg-neutral-900">
        {image.thumbnailDataUrl ? (
          <img
            src={image.thumbnailDataUrl}
            alt={image.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">
            No Preview
          </div>
        )}

        <button
          onClick={() => removeImage(image.id)}
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
              className="w-full bg-neutral-900 border border-neutral-600 rounded px-1 py-0.5 text-xs text-neutral-200 focus:outline-none focus:border-purple-500"
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
              className="text-xs text-neutral-300 truncate font-medium"
              title={image.displayName}
            >
              {image.displayName}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-neutral-500 hover:text-white opacity-0 group-hover/name:opacity-100 transition-opacity"
            >
              <Edit2 size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
