import React, { useMemo } from 'react';
import { useGenerationStore } from '../../../stores/generationStore';
import { useReferenceImageStore } from '../../../stores/referenceImageStore';
import { useResourceStore } from '../../../stores/resourceStore';
import { toast } from 'sonner';
import { type MentionItem } from './MentionMenu';
import { useTranslation } from 'react-i18next';
import { convertFileSrc } from '@tauri-apps/api/core';
import { MentionEditor } from '../../../components/shared/MentionEditor';

export const PromptInput = () => {
  const { t } = useTranslation();
  const { setPromptContent, generate, isGenerating, promptContent } = useGenerationStore();
  const { getImageById, images } = useReferenceImageStore();
  const { getResourceById, resources } = useResourceStore();

  const mentionItems = useMemo((): MentionItem[] => {
    const imageItems: MentionItem[] = images.map((img) => ({
      id: img.id,
      type: 'image',
      displayName: img.displayName,
      thumbnail: img.thumbnailDataUrl,
      originalObject: img,
    }));

    const resourceItems: MentionItem[] = resources.map((res) => ({
      id: res.id,
      type: 'resource',
      displayName: res.name,
      thumbnail: res.images.length > 0 ? convertFileSrc(res.images[0]) : undefined,
      imageCount: res.images.length,
      promptPreview: res.promptTemplate,
      originalObject: res,
    }));

    return [...imageItems, ...resourceItems];
  }, [images, resources]);

  const handleGenerate = async () => {
    try {
      await generate();
      toast.success(t('studio.toast.success'));
    } catch (e) {
      toast.error(`${t('studio.toast.fail')}${e}`);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        {t('studio.prompt.label')}
      </label>
      <div className="relative group">
        <MentionEditor
          content={promptContent}
          onChange={setPromptContent}
          mentionItems={mentionItems}
          placeholder={t('studio.prompt.placeholder')}
          disabled={isGenerating}
          onEnter={handleGenerate}
          getImageById={getImageById}
          getResourceById={getResourceById}
          className={`
            w-full min-h-[128px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-4 
            text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] 
            resize-none whitespace-pre-wrap overflow-y-auto max-h-[300px] transition-colors duration-200
            ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="absolute bottom-4 right-4 bg-[var(--accent-color)] hover:brightness-110 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium transition-colors cursor-pointer z-10"
        >
          {isGenerating ? t('studio.prompt.dreaming') : t('studio.prompt.generate')}
        </button>
      </div>
    </div>
  );
};
