import { useEffect } from 'react';
import { useGenerationStore } from '../../../stores/generationStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { getCapabilities } from '../../../config/modelCapabilities';

export const GenerationSettings = () => {
  const { width, height, count, setSize, setCount, isGenerating } = useGenerationStore();
  const { settings } = useSettingsStore();

  const capabilities = getCapabilities(settings.provider);
  const resolutions = capabilities.resolutions;

  // Ensure current size is valid for the provider, or reset to first option
  useEffect(() => {
    const isValid = resolutions.some(r => r.width === width && r.height === height);
    if (!isValid && resolutions.length > 0) {
      setSize(resolutions[0].width, resolutions[0].height);
    }
  }, [settings.provider, resolutions, width, height, setSize]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
      <h3 className="font-semibold text-neutral-300">Settings</h3>
      
      <div className="flex flex-col gap-2">
        <label className="text-xs text-neutral-500 uppercase">Dimensions ({capabilities.name})</label>
        <div className="flex gap-2">
          <select 
            value={`${width}x${height}`}
            onChange={(e) => {
              const [w, h] = e.target.value.split('x').map(Number);
              setSize(w, h);
            }}
            disabled={isGenerating}
            className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-purple-600 text-neutral-200"
          >
            {resolutions.map((res) => (
              <option key={`${res.width}x${res.height}`} value={`${res.width}x${res.height}`}>
                {res.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-neutral-500 uppercase">Batch Size</label>
        <input 
          type="number" 
          min={1} 
          max={4}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(4, Number(e.target.value))))}
          disabled={isGenerating}
          className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-purple-600 text-neutral-200"
        />
      </div>
    </div>
  );
};
