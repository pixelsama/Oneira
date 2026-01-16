export interface Resolution {
  label: string;
  width: number;
  height: number;
  value?: string; // Optional specific value string for APIs that support keywords like "2k"
}

export interface ProviderCapability {
  name: string;
  resolutions: Resolution[];
}

export const PROVIDER_CAPABILITIES: Record<string, ProviderCapability> = {
  openai: {
    name: "OpenAI (DALL-E 3)",
    resolutions: [
      { label: "Square (1024x1024)", width: 1024, height: 1024 },
      { label: "Portrait (1024x1792)", width: 1024, height: 1792 },
      { label: "Landscape (1792x1024)", width: 1792, height: 1024 },
    ],
  },
  doubao: {
    name: "Volcengine Doubao",
    resolutions: [
      { label: "Default 2K (Square 2048x2048)", width: 2048, height: 2048 },
      { label: "2K Landscape (2560x1440)", width: 2560, height: 1440 },
      { label: "2K Portrait (1440x2560)", width: 1440, height: 2560 },
      { label: "4K Square (4096x4096)", width: 4096, height: 4096 },
    ],
  },
};

export const DEFAULT_PROVIDER = 'openai';

export const getCapabilities = (provider: string): ProviderCapability => {
  return PROVIDER_CAPABILITIES[provider] || PROVIDER_CAPABILITIES[DEFAULT_PROVIDER];
};
