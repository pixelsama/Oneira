import React, { useState, useEffect } from 'react';
import type { Resource } from '../../../stores/resourceStore';
import { X, Save, Info } from 'lucide-react';
import { ResourceCard } from './ResourceCard';
import { SharedImageUploader } from '../../../components/shared/SharedImageUploader';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
    name: name || t('library.editor.titleNew'),
    description: description,
    promptTemplate: prompt || 'No prompt template defined',
    images: imagePaths,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h2 className="font-semibold text-lg text-[var(--text-primary)]">
            {initialData ? t('library.editor.titleEdit') : t('library.editor.titleNew')}
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
                  {t('library.editor.name')}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--accent-color)]/50 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-50 transition-all duration-200"
                  placeholder={t('library.editor.namePlaceholder')}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t('library.editor.description')}
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--accent-color)]/50 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-50 transition-all duration-200"
                  placeholder={t('library.editor.descriptionPlaceholder')}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    {t('library.editor.promptTemplate')}
                  </label>
                  <span className="text-[10px] text-[var(--text-secondary)] opacity-60 flex items-center gap-1">
                    <Info size={10} /> {t('library.editor.promptHint')}
                  </span>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--accent-color)]/50 outline-none text-[var(--text-primary)] h-32 resize-none font-mono text-sm placeholder:text-[var(--text-secondary)] placeholder:opacity-50 transition-all duration-200"
                  placeholder={t('library.editor.promptPlaceholder')}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    {t('library.editor.referenceImages')}
                    <span className="ml-2 normal-case font-normal text-[var(--text-secondary)]">
                      ({imagePaths.length} / 5)
                    </span>
                  </label>
                </div>

                <SharedImageUploader
                  imagePaths={imagePaths}
                  onImagesChange={setImagePaths}
                  maxImages={5}
                  showInlineThumbnails={true}
                  allowReorder={true}
                  emptyTextKey="library.editor.addReferenceImages"
                />
              </div>
            </div>

            <div className="mt-auto flex justify-end pt-4 border-t border-[var(--border-color)]">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[var(--accent-color)] hover:brightness-110 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all shadow-lg shadow-[var(--accent-color)]/20"
              >
                <Save size={18} />{' '}
                {isSaving ? t('library.editor.saving') : t('library.editor.save')}
              </button>
            </div>
          </form>

          <div className="w-80 bg-[var(--bg-primary)]/30 p-6 flex flex-col gap-4 overflow-y-auto">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {t('library.editor.livePreview')}
            </h3>
            <div className="scale-90 origin-top">
              <ResourceCard resource={previewResource} onEdit={() => {}} onDelete={() => {}} />
            </div>
            <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
                <Info size={10} /> {t('library.editor.usageHint')}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('library.editor.usageText1')}{' '}
                <span className="text-[var(--accent-color)] font-mono font-bold">@{name}</span>.{' '}
                {t('library.editor.usageText2')}{' '}
                <span className="font-mono text-[var(--text-primary)]">{'{prompt}'}</span>{' '}
                {t('library.editor.usageText3')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
