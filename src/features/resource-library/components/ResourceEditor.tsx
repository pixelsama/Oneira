import React, { useState, useEffect } from 'react';
import type { Resource } from '../../../stores/resourceStore';
import { X, Save } from 'lucide-react';

interface Props {
  initialData?: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string; prompt: string; imagePaths: string[] }) => Promise<void>;
}

export const ResourceEditor = ({ initialData, isOpen, onClose, onSave }: Props) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setPrompt(initialData.promptTemplate);
    } else {
      setName('');
      setDescription('');
      setPrompt('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !prompt) return;

    setIsSaving(true);
    try {
      await onSave({ name, description, prompt, imagePaths: [] }); // Images unimplemented in UI for now
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="font-semibold text-lg text-neutral-200">
            {initialData ? 'Edit Resource' : 'New Resource'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded text-neutral-400">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Name</label>
            <input 
              value={name} onChange={e => setName(e.target.value)} 
              className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 focus:ring-1 focus:ring-purple-600 text-neutral-100 placeholder:text-neutral-700"
              placeholder="My Awesome Style"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Description</label>
            <textarea 
              value={description} onChange={e => setDescription(e.target.value)} 
              className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 focus:ring-1 focus:ring-purple-600 text-neutral-100 h-20 resize-none placeholder:text-neutral-700"
              placeholder="Optional notes..."
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Prompt Template</label>
            <textarea 
              value={prompt} onChange={e => setPrompt(e.target.value)} 
              className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 focus:ring-1 focus:ring-purple-600 text-neutral-100 h-32 resize-none font-mono text-sm placeholder:text-neutral-700"
              placeholder="cyberpunk, neon..."
              required
            />
          </div>

          <div className="flex justify-end pt-4">
             <button 
               type="submit" 
               disabled={isSaving}
               className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 disabled:opacity-50 cursor-pointer"
             >
               <Save size={16} /> {isSaving ? 'Saving...' : 'Save Resource'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
