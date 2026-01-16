import { useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { toast } from 'sonner';

export const Settings = () => {
  const { settings, isLoading, loadSettings, saveSettings, updateSetting } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    await saveSettings(settings);
    toast.success('Settings saved successfully');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-neutral-500">Loading settings...</div>;
  }

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto p-8 gap-8">
      <h1 className="text-3xl font-bold text-neutral-100">Settings</h1>
      
      {/* Provider Selection */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-neutral-200">AI Provider</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-400">Select Provider</label>
          <select
            value={settings.provider}
            onChange={(e) => updateSetting('provider', e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="openai">OpenAI (DALL-E 3)</option>
            <option value="doubao">Volcengine Doubao (Seedream)</option>
          </select>
        </div>
      </div>

      {/* Configuration */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-neutral-200">Configuration</h2>
        
        {settings.provider === 'openai' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-400">OpenAI API Key</label>
            <input
              type="password"
              value={settings.openaiApiKey || ''}
              onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
              placeholder="sk-..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder:text-neutral-600"
            />
            <p className="text-xs text-neutral-500">
              Your API key is stored locally on your device.
            </p>
          </div>
        )}

        {settings.provider === 'doubao' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-400">Doubao API Key</label>
            <input
              type="password"
              value={settings.doubaoApiKey || ''}
              onChange={(e) => updateSetting('doubaoApiKey', e.target.value)}
              placeholder="Your Volcengine API Key"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder:text-neutral-600"
            />
            <p className="text-xs text-neutral-500">
              Requires an API Key from Volcengine Console.
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
