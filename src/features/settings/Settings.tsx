import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettingsStore } from '../../stores/settingsStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, isLoading, loadSettings, saveSettings, updateSetting } = useSettingsStore();

  // Track original settings snapshot as serialized string
  const [originalSettingsJson, setOriginalSettingsJson] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const pendingNavigationRef = useRef<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Store original settings when loaded
  useEffect(() => {
    if (!isLoading && originalSettingsJson === null) {
      // Use setTimeout to avoid setState in effect lint error
      const timeoutId = setTimeout(() => {
        setOriginalSettingsJson(JSON.stringify(settings));
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, settings, originalSettingsJson]);

  // Check if settings have changed
  const hasChanges =
    originalSettingsJson !== null && JSON.stringify(settings) !== originalSettingsJson;

  // Warn before browser/tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Intercept navigation clicks
  useEffect(() => {
    const handleNavClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const navLink = target.closest('a[href]') as HTMLAnchorElement;

      if (navLink && hasChanges) {
        const href = navLink.getAttribute('href');
        if (href && href.startsWith('/') && href !== location.pathname) {
          e.preventDefault();
          e.stopPropagation();
          pendingNavigationRef.current = href;
          setShowUnsavedDialog(true);
        }
      }
    };

    document.addEventListener('click', handleNavClick, true);
    return () => document.removeEventListener('click', handleNavClick, true);
  }, [hasChanges, location.pathname]);

  const handleSave = useCallback(async () => {
    await saveSettings(settings);
    setOriginalSettingsJson(JSON.stringify(settings));
    toast.success(t('settings.page.saveSuccess'));
  }, [saveSettings, settings, t]);

  const handleDiscardAndLeave = useCallback(() => {
    setShowUnsavedDialog(false);
    if (pendingNavigationRef.current) {
      navigate(pendingNavigationRef.current);
      pendingNavigationRef.current = null;
    }
  }, [navigate]);

  const handleSaveAndLeave = useCallback(async () => {
    await saveSettings(settings);
    setOriginalSettingsJson(JSON.stringify(settings));
    toast.success(t('settings.page.saveSuccess'));
    setShowUnsavedDialog(false);
    if (pendingNavigationRef.current) {
      navigate(pendingNavigationRef.current);
      pendingNavigationRef.current = null;
    }
  }, [saveSettings, settings, t, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
        {t('settings.page.loading')}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full w-full max-w-2xl mx-auto p-8 gap-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          {t('settings.page.title')}
        </h1>

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
              <option value="doubao">{t('settings.page.provider.doubao')}</option>
              <option value="zhipu">{t('settings.page.provider.zhipu')}</option>
            </select>
          </div>
        </div>

        {/* Configuration */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {t('settings.page.config.title')}
          </h2>

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

          {settings.provider === 'zhipu' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  {t('settings.page.config.zhipu.label')}
                </label>
                <input
                  type="password"
                  value={settings.zhipuApiKey || ''}
                  onChange={(e) => updateSetting('zhipuApiKey', e.target.value)}
                  placeholder={t('settings.page.config.zhipu.placeholder')}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] placeholder:text-[var(--text-secondary)] placeholder:opacity-70 transition-colors duration-200"
                />
                <p className="text-xs text-[var(--text-secondary)]">
                  {t('settings.page.config.zhipu.hint')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    {t('settings.page.config.zhipu.watermark.label')}
                  </label>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('settings.page.config.zhipu.watermark.hint')}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.zhipuWatermark}
                  onClick={() => updateSetting('zhipuWatermark', !settings.zhipuWatermark)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    settings.zhipuWatermark
                      ? 'bg-[var(--accent-color)]'
                      : 'bg-[var(--border-color)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      settings.zhipuWatermark ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              hasChanges
                ? 'bg-[var(--accent-color)] hover:brightness-110 text-white cursor-pointer'
                : 'bg-[var(--border-color)] text-[var(--text-secondary)] cursor-not-allowed opacity-60'
            }`}
          >
            {t('settings.page.save')}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <ConfirmDialog
        isOpen={showUnsavedDialog}
        title={t('settings.page.unsavedChanges.title')}
        message={t('settings.page.unsavedChanges.message')}
        confirmText={t('settings.page.unsavedChanges.save')}
        cancelText={t('settings.page.unsavedChanges.discard')}
        variant="warning"
        onConfirm={handleSaveAndLeave}
        onCancel={handleDiscardAndLeave}
      />
    </>
  );
};
