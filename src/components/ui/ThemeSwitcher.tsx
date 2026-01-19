import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore, type ThemeMode } from '../../stores/settingsStore';

// Inline cn if it doesn't exist, but usually with shadcn-like setup it does.
// I'll check first, but to be safe I'll just define a local utility if I'm not sure.
// Let's assume standard shadcn pattern or just use clsx/twMerge directly.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const { settings, setTheme } = useSettingsStore();

  const themeOptions: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: t('settings.theme.light'), icon: Sun },
    { value: 'dark', label: t('settings.theme.dark'), icon: Moon },
    { value: 'system', label: t('settings.theme.system'), icon: Monitor },
  ];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTheme = settings.theme || 'system';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeChange = (theme: ThemeMode) => {
    setTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center p-2 rounded-lg transition-colors duration-200',
          'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          isOpen && 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
        )}
        title="Switch theme"
      >
        {currentTheme === 'light' && <Sun size={20} />}
        {currentTheme === 'dark' && <Moon size={20} />}
        {currentTheme === 'system' && <Palette size={20} />}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 p-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1 relative">
            {/* Sliding Indicator (could be enhanced, but simple active state is safer for MVP) */}
            {/* Actually, let's try a simple background approach for the active item instead of a separate slider for now to ensure robustness */}

            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-all duration-200 gap-1',
                  currentTheme === option.value
                    ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <option.icon size={16} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
