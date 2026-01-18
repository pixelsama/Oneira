import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Resource } from './resourceStore';
import type { PromptContent } from '../types/prompt';
import { useReferenceImageStore } from './referenceImageStore';

interface GenerationState {
  prompt: string;
  promptContent: PromptContent[];
  negativePrompt: string;
  width: number;
  height: number;
  count: number;
  isGenerating: boolean;
  generatedImages: string[];
  setPrompt: (prompt: string) => void;
  setPromptContent: (content: PromptContent[]) => void;
  setNegativePrompt: (prompt: string) => void;
  setSize: (width: number, height: number) => void;
  setCount: (count: number) => void;
  loadResource: (resource: Resource) => void;
  generate: () => Promise<void>;
  getSerializedPrompt: () => string;
  getReferencedImagePaths: () => string[];
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  prompt: '',
  promptContent: [],
  negativePrompt: '',
  width: 1024,
  height: 1024,
  count: 1,
  isGenerating: false,
  generatedImages: [],
  setPrompt: (prompt) => set({ prompt }),
  setPromptContent: (promptContent) => set({ promptContent }),
  setNegativePrompt: (prompt) => set({ negativePrompt: prompt }),
  setSize: (width, height) => set({ width, height }),
  setCount: (count) => set({ count }),
  loadResource: (resource) =>
    set({
      prompt: resource.promptTemplate,
      promptContent: [{ type: 'text', value: resource.promptTemplate }],
    }),
  getSerializedPrompt: () => {
    const { prompt, promptContent } = get();
    // If promptContent is empty but prompt is set (legacy/text-only), return prompt
    if (promptContent.length === 0) return prompt;

    return promptContent
      .map((item) => {
        if (item.type === 'text') return item.value;
        const img = useReferenceImageStore.getState().getImageById(item.value);
        return img ? `图片文件[${img.displayName}]` : '';
      })
      .join('');
  },
  getReferencedImagePaths: () => {
    const { promptContent } = get();
    return promptContent
      .filter((item) => item.type === 'image-reference')
      .map((item) => {
        const img = useReferenceImageStore.getState().getImageById(item.value);
        return img ? img.originalPath : null;
      })
      .filter((path): path is string => path !== null);
  },
  generate: async () => {
    const { negativePrompt, width, height, count, getSerializedPrompt, getReferencedImagePaths } =
      get();
    const prompt = getSerializedPrompt();

    if (!prompt) return;

    set({ isGenerating: true });
    try {
      const referenceImages = getReferencedImagePaths();
      const images = await invoke<string[]>('generate_image', {
        payload: {
          prompt,
          negativePrompt: negativePrompt || null,
          width,
          height,
          count,
          referenceImages: referenceImages.length > 0 ? referenceImages : null,
        },
      });
      set({ generatedImages: images, isGenerating: false });
    } catch (e) {
      console.error('Generation failed', e);
      set({ isGenerating: false });
      throw e;
    }
  },
}));
