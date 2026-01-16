import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface GeneratedImage {
  filename: string;
  path: string;
  createdAt: number;
}

interface GalleryState {
  images: GeneratedImage[];
  isLoading: boolean;
  loadImages: () => Promise<void>;
  openImage: (path: string) => Promise<void>;
}

export const useGalleryStore = create<GalleryState>((set) => ({
  images: [],
  isLoading: false,
  loadImages: async () => {
    set({ isLoading: true });
    try {
      const images = await invoke<GeneratedImage[]>('list_gallery_images');
      set({ images, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },
  openImage: async (path) => {
    try {
      await invoke('open_image_in_viewer', { path });
    } catch (e) {
      console.error(e);
    }
  },
}));
