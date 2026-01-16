import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

interface AppSettings {
  provider: string;
  openaiApiKey: string | null;
  doubaoApiKey: string | null;
}

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  saveSettings: (settings: AppSettings) => Promise<void>;
  loadSettings: () => Promise<void>;
  updateSetting: (key: keyof AppSettings, value: string | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    provider: 'openai',
    openaiApiKey: null,
    doubaoApiKey: null,
  },
  isLoading: true,
  saveSettings: async (newSettings: AppSettings) => {
    try {
      await invoke('save_settings', { settings: newSettings });
      set({ settings: newSettings });
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },
  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await invoke<AppSettings>('get_settings');
      set({ settings, isLoading: false });
    } catch (e) {
      console.error('Failed to load settings', e);
      set({ isLoading: false });
    }
  },
  updateSetting: (key, value) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
  },
}));