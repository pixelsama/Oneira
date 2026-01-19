import { useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const Settings = () => {
  const { t } = useTranslation();
  const { settings, isLoading, loadSettings, saveSettings, updateSetting } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    await saveSettings(settings);
    toast.success(t('settings.page.saveSuccess'));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
        {t('settings.page.loading')}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto p-8 gap-8">
      <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('settings.page.title')}</h1>

      {/* Provider Selection */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          {t('settings.page.provider.title')}
        </h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            {t('settings.page.provider.label')}
          </label>
          <select
            value={settings.provider}
            onChange={(e) => updateSetting('provider', e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-colors duration-200"
          >
            <option value="openai">{t('settings.page.provider.openai')}</option>
            <option value="doubao">{t('settings.page.provider.doubao')}</option>
          </select>
        </div>
      </div>

      {/* Configuration */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          {t('settings.page.config.title')}
        </h2>

        {settings.provider === 'openai' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              {t('settings.page.config.openai.label')}
            </label>
            <input
              type="password"
              value={settings.openaiApiKey || ''}
              onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
              placeholder={t('settings.page.config.openai.placeholder')}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] placeholder:text-[var(--text-secondary)] placeholder:opacity-70 transition-colors duration-200"
            />
            <p className="text-xs text-[var(--text-secondary)]">
              {t('settings.page.config.openai.hint')}
            </p>
          </div>
        )}

        {settings.provider === 'doubao' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              {t('settings.page.config.doubao.label')}
            </label>
            <input
              type="password"
              value={settings.doubaoApiKey || ''}
              onChange={(e) => updateSetting('doubaoApiKey', e.target.value)}
              placeholder={t('settings.page.config.doubao.placeholder')}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] placeholder:text-[var(--text-secondary)] placeholder:opacity-70 transition-colors duration-200"
            />
            <p className="text-xs text-[var(--text-secondary)]">
              {t('settings.page.config.doubao.hint')}
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="bg-[var(--accent-color)] hover:brightness-110 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          {t('settings.page.save')}
        </button>
      </div>
    </div>
  );
};
