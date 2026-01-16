import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Resource } from './resourceStore';

interface GenerationState {
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
  count: number;
  isGenerating: boolean;
  generatedImages: string[];
  setPrompt: (prompt: string) => void;
  setNegativePrompt: (prompt: string) => void;
  setSize: (width: number, height: number) => void;
  setCount: (count: number) => void;
  loadResource: (resource: Resource) => void;
  generate: () => Promise<void>;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  prompt: '',
  negativePrompt: '',
  width: 1024,
  height: 1024,
  count: 1,
  isGenerating: false,
  generatedImages: [],
  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (prompt) => set({ negativePrompt: prompt }),
  setSize: (width, height) => set({ width, height }),
  setCount: (count) => set({ count }),
  loadResource: (resource) => set({ prompt: resource.promptTemplate }),
  generate: async () => {
    const { prompt, negativePrompt, width, height, count } = get();
    if (!prompt) return;
    
    set({ isGenerating: true });
    try {
      const images = await invoke<string[]>('generate_image', {
        payload: {
          prompt,
          negativePrompt: negativePrompt || null,
          width,
          height,
          count,
          referenceImages: null
        }
      });
      set({ generatedImages: images, isGenerating: false });
    } catch (e) {
      console.error('Generation failed', e);
      set({ isGenerating: false });
      throw e;
    }
  },
}));