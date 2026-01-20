import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Resource } from '../../../stores/resourceStore';
import { X, Save, Info } from 'lucide-react';
import { ResourceCard } from './ResourceCard';
import { SharedImageUploader } from '../../../components/shared/SharedImageUploader';
import { useTranslation } from 'react-i18next';
import type { ReferenceImage } from '../../../types/referenceImage';
import type { PromptContent } from '../../../types/prompt';
import { generateThumbnail, ACCEPTED_EXTENSIONS } from '../../../lib/imageUtils';
import { UploadedImageCard } from '../../creative-studio/components/UploadedImageCard';
import { toast } from 'sonner';
import { MentionEditor } from '../../../components/shared/MentionEditor';

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
  const [promptContent, setPromptContent] = useState<PromptContent[]>([]);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const validationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadImagesAndPrompt = async () => {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');

        // Handle prompt JSON parsing
        try {
          const parsed = JSON.parse(initialData.promptTemplate);
          if (Array.isArray(parsed)) {
            setPromptContent(parsed);
          } else {
            setPromptContent([{ type: 'text', value: initialData.promptTemplate }]);
          }
        } catch {
          setPromptContent([{ type: 'text', value: initialData.promptTemplate }]);
        }

        if (initialData.images && initialData.images.length > 0) {
          setIsProcessingImages(true);
          const loadedImages: ReferenceImage[] = await Promise.all(
            initialData.images.map(async (path) => {
              const filename = path.split(new RegExp('[\\/]')).pop() || 'image';
              const extension = filename.split('.').pop()?.toLowerCase() || 'png';
              const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
              const thumbnail = await generateThumbnail(path, mimeType);

              return {
                id: path, // Use path as stable ID for resource images
                originalPath: path,
                displayName: filename.substring(0, filename.lastIndexOf('.')) || filename,
                originalFileName: filename,
                thumbnailDataUrl: thumbnail,
                addedAt: Date.now(),
                source: 'resource',
                resourceId: initialData.id,
              };
            })
          );
          setReferenceImages(loadedImages);
          setIsProcessingImages(false);
        } else {
          setReferenceImages([]);
        }
      } else {
        setName('');
        setDescription('');
        setPromptContent([]);
        setReferenceImages([]);
      }
    };

    if (isOpen) {
      loadImagesAndPrompt();
    }
  }, [initialData, isOpen]);

  const handleImagesChange = useCallback(
    async (newPaths: string[]) => {
      const existingPaths = new Set(referenceImages.map((img) => img.originalPath));
      const addedPaths = newPaths.filter((p) => !existingPaths.has(p));

      // Handle removals
      if (newPaths.length < referenceImages.length) {
        const pathSet = new Set(newPaths);
        setReferenceImages((prev) => prev.filter((img) => pathSet.has(img.originalPath)));
      }

      if (addedPaths.length === 0) return;

      setIsProcessingImages(true);

      const newImages: ReferenceImage[] = [];
      for (const path of addedPaths) {
        const filename = path.split(new RegExp('[\\/]')).pop() || 'image';
        const extension = filename.split('.').pop()?.toLowerCase();

        if (!extension || !ACCEPTED_EXTENSIONS.includes(extension)) {
          toast.error(`Skipped ${filename}: Unsupported format`);
          continue;
        }

        const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;

        try {
          const thumbnail = await generateThumbnail(path, mimeType);

          newImages.push({
            id: path, // Use path as ID
            originalPath: path,
            displayName: filename.substring(0, filename.lastIndexOf('.')) || filename,
            originalFileName: filename,
            thumbnailDataUrl: thumbnail,
            addedAt: Date.now(),
            source: 'resource',
            resourceId: initialData?.id,
          });
        } catch (error) {
          console.error(`Failed to process ${filename}:`, error);
          toast.error(`Failed to load ${filename}`);
        }
      }

      setReferenceImages((prev) => [...prev, ...newImages]);
      setIsProcessingImages(false);
    },
    [referenceImages, initialData?.id]
  );

  const handleUpdateImageName = (id: string, newName: string) => {
    setReferenceImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, displayName: newName } : img))
    );
  };

  const handleRemoveImage = (id: string) => {
    setReferenceImages((prev) => prev.filter((img) => img.id !== id));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || promptContent.length === 0) return;

    // Validate that all images are referenced in the prompt
    const referencedImageIds = new Set(
      promptContent.filter((item) => item.type === 'image-reference').map((item) => item.value)
    );

    const unusedImages = referenceImages.filter((img) => !referencedImageIds.has(img.id));

    if (unusedImages.length > 0 && validationInputRef.current) {
      validationInputRef.current.setCustomValidity(t('library.editor.unusedImagesWarning'));
      validationInputRef.current.reportValidity();
      return;
    }

    setIsSaving(true);
    try {
      const imagePaths = referenceImages.map((img) => img.originalPath);
      const prompt = JSON.stringify(promptContent);
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
    promptTemplate: JSON.stringify(promptContent),
    images: referenceImages.map((img) => img.originalPath),
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
                <div className="relative">
                  <input
                    ref={validationInputRef}
                    className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none"
                    required={false}
                    onInput={(e) => {
                      e.currentTarget.setCustomValidity('');
                    }}
                  />
                  <MentionEditor
                    content={promptContent}
                    onChange={setPromptContent}
                    mentionItems={referenceImages.map((img) => ({
                      id: img.id,
                      type: 'image',
                      displayName: img.displayName,
                      thumbnail: img.thumbnailDataUrl,
                      originalObject: img,
                    }))}
                    placeholder={t('library.editor.promptPlaceholder')}
                    disabled={isSaving}
                    getImageById={(id) => referenceImages.find((img) => img.id === id)}
                    className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-[var(--accent-color)]/50 outline-none text-[var(--text-primary)] min-h-[128px] max-h-[256px] overflow-y-auto whitespace-pre-wrap font-mono text-sm placeholder:text-[var(--text-secondary)] placeholder:opacity-50 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    {t('library.editor.referenceImages')}
                    <span className="ml-2 normal-case font-normal text-[var(--text-secondary)]">
                      ({referenceImages.length} / 5)
                    </span>
                  </label>
                </div>

                {new Set(referenceImages.map((img) => img.displayName)).size !==
                  referenceImages.length && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-600 dark:text-yellow-400 mb-2">
                    <Info size={14} />
                    {t('library.editor.duplicateNameWarning')}
                  </div>
                )}

                <SharedImageUploader
                  imagePaths={referenceImages.map((img) => img.originalPath)}
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                  showInlineThumbnails={false}
                  isProcessing={isProcessingImages}
                  emptyTextKey="library.editor.addReferenceImages"
                />

                {referenceImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {referenceImages.map((img) => (
                      <UploadedImageCard
                        key={img.id}
                        image={img}
                        onRemove={handleRemoveImage}
                        onUpdateName={handleUpdateImageName}
                      />
                    ))}
                  </div>
                )}
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
