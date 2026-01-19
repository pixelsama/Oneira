import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface Resource {
  id: string;
  name: string;
  description?: string;
  promptTemplate: string;
  images: string[];
  createdAt: number;
  updatedAt: number;
}

interface ResourceState {
  resources: Resource[];
  isLoading: boolean;
  loadResources: () => Promise<void>;
  createResource: (payload: {
    name: string;
    description?: string;
    prompt: string;
    imagePaths: string[];
  }) => Promise<void>;
  updateResource: (payload: {
    id: string;
    name?: string;
    description?: string;
    prompt?: string;
    images?: string[];
  }) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  getResourceById: (id: string) => Resource | undefined;
  getResourceByName: (name: string) => Resource | undefined;
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  isLoading: false,
  loadResources: async () => {
    set({ isLoading: true });
    try {
      const resources = await invoke<Resource[]>('list_resources');
      set({ resources, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },
  createResource: async (payload) => {
    const resource = await invoke<Resource>('create_resource', { payload });
    set((state) => ({ resources: [...state.resources, resource] }));
  },
  updateResource: async (payload) => {
    const resource = await invoke<Resource>('update_resource', { payload });
    set((state) => ({
      resources: state.resources.map((r) => (r.id === resource.id ? resource : r)),
    }));
  },
  deleteResource: async (id) => {
    await invoke('delete_resource', { id });
    set((state) => ({
      resources: state.resources.filter((r) => r.id !== id),
    }));
  },
  getResourceById: (id: string) => {
    return get().resources.find((r) => r.id === id);
  },
  getResourceByName: (name: string) => {
    return get().resources.find((r) => r.name === name);
  },
}));
