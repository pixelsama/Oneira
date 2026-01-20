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
  doubao: {
    name: 'Volcengine Doubao',
    resolutions: [
      { label: 'Default 2K (Square 2048x2048)', width: 2048, height: 2048 },
      { label: '2K Landscape (2560x1440)', width: 2560, height: 1440 },
      { label: '2K Portrait (1440x2560)', width: 1440, height: 2560 },
      { label: '4K Square (4096x4096)', width: 4096, height: 4096 },
    ],
  },
  zhipu: {
    name: 'Zhipu AI (GLM-Image)',
    resolutions: [
      { label: 'Square (1280x1280)', width: 1280, height: 1280 },
      { label: 'Landscape (1568x1056)', width: 1568, height: 1056 },
      { label: 'Portrait (1056x1568)', width: 1056, height: 1568 },
      { label: 'Landscape (1472x1088)', width: 1472, height: 1088 },
      { label: 'Portrait (1088x1472)', width: 1088, height: 1472 },
      { label: 'Widescreen (1728x960)', width: 1728, height: 960 },
      { label: 'Tall (960x1728)', width: 960, height: 1728 },
    ],
  },
};

export const DEFAULT_PROVIDER = 'doubao';

export const getCapabilities = (provider: string): ProviderCapability => {
  return PROVIDER_CAPABILITIES[provider] || PROVIDER_CAPABILITIES[DEFAULT_PROVIDER];
};
