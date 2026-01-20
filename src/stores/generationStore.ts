import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { exists } from '@tauri-apps/plugin-fs';
import { useResourceStore, type Resource } from './resourceStore';
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
    set((state) => ({
      // Append a resource-reference tag to existing content (same as @ mention)
      promptContent: [...state.promptContent, { type: 'resource-reference', value: resource.id }],
    })),
  getSerializedPrompt: () => {
    const { prompt, promptContent } = get();
    // If promptContent is empty but prompt is set (legacy/text-only), return prompt
    if (promptContent.length === 0) return prompt;

    return promptContent
      .map((item) => {
        if (item.type === 'text') return item.value;
        if (item.type === 'image-reference') {
          const img = useReferenceImageStore.getState().getImageById(item.value);
          return img ? `图片文件[${img.displayName}]` : '';
        }
        if (item.type === 'resource-reference') {
          const res = useResourceStore.getState().getResourceById(item.value);
          if (!res) {
            console.warn(`Warning: Resource ${item.value} not found, skipping`);
            return '';
          }
          return res.promptTemplate;
        }
        return '';
      })
      .join('');
  },
  getReferencedImagePaths: () => {
    const { promptContent } = get();
    const paths = new Set<string>();

    promptContent.forEach((item) => {
      if (item.type === 'image-reference') {
        const img = useReferenceImageStore.getState().getImageById(item.value);
        if (img) paths.add(img.originalPath);
      } else if (item.type === 'resource-reference') {
        const res = useResourceStore.getState().getResourceById(item.value);
        if (res) {
          res.images.forEach((path) => paths.add(path));
        } else {
          console.warn(`Warning: Resource ${item.value} not found, skipping`);
        }
      }
    });

    return Array.from(paths);
  },
  generate: async () => {
    const { negativePrompt, width, height, count, getSerializedPrompt, getReferencedImagePaths } =
      get();
    const prompt = getSerializedPrompt();

    if (!prompt) return;

    set({ isGenerating: true });
    try {
      const referenceImages = getReferencedImagePaths();

      // Task 3.2: Validate image paths
      const validImages: string[] = [];
      for (const path of referenceImages) {
        try {
          const fileExists = await exists(path);
          if (fileExists) {
            validImages.push(path);
          } else {
            console.warn(`Warning: Image not found, skipping: ${path}`);
          }
        } catch (e) {
          console.warn(`Warning: Error checking image path, skipping: ${path}`, e);
        }
      }

      const images = await invoke<string[]>('generate_image', {
        payload: {
          prompt,
          negativePrompt: negativePrompt || null,
          width,
          height,
          count,
          referenceImages: validImages.length > 0 ? validImages : null,
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
