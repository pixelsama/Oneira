import { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '简体中文' },
];

interface LanguageSwitcherProps {
  showLabel?: boolean;
}

export const LanguageSwitcher = ({ showLabel = false }: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Helper to check if language matches
  const isCurrentLanguage = (langCode: string) => {
    if (!i18n.language) return false;
    return i18n.language.startsWith(langCode);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center rounded-xl transition-all duration-200',
          showLabel ? 'w-full justify-start px-4 py-3 gap-3' : 'justify-center p-3',
          'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          isOpen && 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
        )}
        title={t('common.language')}
      >
        <Globe size={24} className="shrink-0" />
        <span
          className={cn(
            'whitespace-nowrap overflow-hidden transition-all duration-300',
            showLabel ? 'w-auto opacity-100' : 'w-0 opacity-0'
          )}
        >
          {t('common.language')}
        </span>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-32 p-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col bg-[var(--bg-secondary)] rounded-lg p-1 relative gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  'flex items-center justify-start px-3 py-2 rounded-md text-xs font-medium transition-all duration-200',
                  isCurrentLanguage(lang.code)
                    ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
