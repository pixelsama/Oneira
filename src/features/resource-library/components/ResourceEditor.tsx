import React, { useState, useEffect } from 'react';
import type { Resource } from '../../../stores/resourceStore';
import { X, Save, Plus, Trash2, GripVertical, AlertTriangle, Info } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { convertFileSrc } from '@tauri-apps/api/core';
import { ResourceCard } from './ResourceCard';

interface Props {
  initialData?: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    prompt: string;
    imagePaths: string[];
  }) => Promise<void>;
}

export const ResourceEditor = ({ initialData, isOpen, onClose, onSave }: Props) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setPrompt(initialData.promptTemplate);
      setImagePaths(initialData.images || []);
    } else {
      setName('');
      setDescription('');
      setPrompt('');
      setImagePaths([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddImages = async () => {
    const selected = await open({
      multiple: true,
      filters: [{ name: 'Image', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
    });
    if (selected && Array.isArray(selected)) {
      setImagePaths([...imagePaths, ...selected]);
    } else if (selected) {
      setImagePaths([...imagePaths, selected as string]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePaths(imagePaths.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPaths = [...imagePaths];
    const draggedItem = newPaths[draggedIndex];
    newPaths.splice(draggedIndex, 1);
    newPaths.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setImagePaths(newPaths);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !prompt) return;

    setIsSaving(true);
    try {
      await onSave({ name, description, prompt, imagePaths });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const previewResource: Resource = {
    id: initialData?.id || 'preview',
    name: name || 'Untitled Resource',
    description: description,
    promptTemplate: prompt || 'No prompt template defined',
    images: imagePaths,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const isOverLimit = imagePaths.length > 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h2 className="font-semibold text-lg text-[var(--text-primary)]">
            {initialData ? 'Edit Resource' : 'New Resource'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--bg-primary)] rounded text-[var(--text-secondary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto border-r border-[var(--border-color)]"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--accent-color)]/50 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-50 transition-all duration-200"
                  placeholder="e.g. Cinematic Portrait Style"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Description
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--accent-color)]/50 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-50 transition-all duration-200"
                  placeholder="Optional notes about this resource..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Prompt Template
                  </label>
                  <span className="text-[10px] text-[var(--text-secondary)] opacity-60 flex items-center gap-1">
                    <Info size={10} /> Use @ to mention resources
                  </span>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--accent-color)]/50 outline-none text-[var(--text-primary)] h-32 resize-none font-mono text-sm placeholder:text-[var(--text-secondary)] placeholder:opacity-50 transition-all duration-200"
                  placeholder="Masterpiece, highly detailed, {prompt}..."
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Reference Images
                    <span
                      className={`ml-2 normal-case font-normal ${isOverLimit ? 'text-yellow-500' : 'text-[var(--text-secondary)]'}`}
                    >
                      ({imagePaths.length} / 5)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddImages}
                    className="flex items-center gap-1 text-xs text-[var(--accent-color)] hover:brightness-110 font-medium transition-all"
                  >
                    <Plus size={14} /> Add Images
                  </button>
                </div>

                {isOverLimit && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-600 dark:text-yellow-400">
                    <AlertTriangle size={14} />
                    Recommended: max 5 images per resource for optimal performance
                  </div>
                )}

                <div className="grid grid-cols-5 gap-2 min-h-[100px] p-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] border-dashed">
                  {imagePaths.map((path, idx) => (
                    <div
                      key={`${path}-${idx}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`relative aspect-square rounded overflow-hidden border border-[var(--border-color)] group cursor-move transition-all ${draggedIndex === idx ? 'opacity-40 scale-95' : 'opacity-100'}`}
                    >
                      <img
                        src={convertFileSrc(path)}
                        className="w-full h-full object-cover"
                        alt={`Resource img ${idx}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/100x100?text=Invalid+Path';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                        <GripVertical size={12} className="text-white/70" />
                      </div>
                    </div>
                  ))}
                  {imagePaths.length === 0 && (
                    <div className="col-span-5 flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-40 py-4">
                      <Plus size={24} />
                      <p className="text-xs mt-1">Add reference images</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto flex justify-end pt-4 border-t border-[var(--border-color)]">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[var(--accent-color)] hover:brightness-110 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all shadow-lg shadow-[var(--accent-color)]/20"
              >
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save Resource'}
              </button>
            </div>
          </form>

          <div className="w-80 bg-[var(--bg-primary)]/30 p-6 flex flex-col gap-4 overflow-y-auto">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Live Preview
            </h3>
            <div className="scale-90 origin-top">
              <ResourceCard resource={previewResource} onEdit={() => {}} onDelete={() => {}} />
            </div>
            <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
                <Info size={10} /> Usage Hint
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Refer to this resource in your prompt using{' '}
                <span className="text-[var(--accent-color)] font-mono font-bold">
                  @{name || 'name'}
                </span>
                . Templates can include{' '}
                <span className="font-mono text-[var(--text-primary)]">{'{prompt}'}</span> which
                will be replaced by your studio input.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
