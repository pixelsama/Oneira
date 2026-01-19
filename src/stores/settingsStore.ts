import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export type ThemeMode = 'light' | 'dark' | 'system';

interface AppSettings {
  provider: string;
  openaiApiKey: string | null;
  doubaoApiKey: string | null;
  theme: ThemeMode;
}

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  saveSettings: (settings: AppSettings) => Promise<void>;
  loadSettings: () => Promise<void>;
  updateSetting: (key: keyof AppSettings, value: string | null) => void;
  setTheme: (theme: ThemeMode) => Promise<void>;
}

const applyThemeToDom = (theme: ThemeMode) => {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    provider: 'openai',
    openaiApiKey: null,
    doubaoApiKey: null,
    theme: 'system',
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
      // Ensure theme has a default value if missing from backend
      if (!settings.theme) {
        settings.theme = 'system';
      }

      set({ settings, isLoading: false });

      // Apply theme
      applyThemeToDom(settings.theme);
      // Sync to localStorage for FOUC prevention
      localStorage.setItem('theme-mode', settings.theme);
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
  setTheme: async (theme: ThemeMode) => {
    const { settings, saveSettings } = get();
    const newSettings = { ...settings, theme };

    // Optimistic update
    set({ settings: newSettings });
    applyThemeToDom(theme);
    localStorage.setItem('theme-mode', theme);

    await saveSettings(newSettings);
  },
}));
