import { create } from 'zustand';
import type { ReferenceImage } from '../types/referenceImage';

interface ReferenceImageState {
  images: ReferenceImage[];
  addImage: (image: ReferenceImage) => void;
  removeImage: (id: string) => void;
  updateDisplayName: (id: string, name: string) => void;
  clearAll: () => void;
  getImageById: (id: string) => ReferenceImage | undefined;
  getImageByName: (name: string) => ReferenceImage | undefined;
}

export const useReferenceImageStore = create<ReferenceImageState>((set, get) => ({
  images: [],
  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    })),
  updateDisplayName: (id, name) =>
    set((state) => ({
      images: state.images.map((img) => (img.id === id ? { ...img, displayName: name } : img)),
    })),
  clearAll: () => set({ images: [] }),
  getImageById: (id) => get().images.find((img) => img.id === id),
  getImageByName: (name) => get().images.find((img) => img.displayName === name),
}));
