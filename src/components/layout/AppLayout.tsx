import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Palette, Library, Image, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useResourceStore } from '../../stores/resourceStore';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export const AppLayout = () => {
  const { t } = useTranslation();
  const { loadSettings, settings } = useSettingsStore();
  const { loadResources } = useResourceStore();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Load settings and resources on app startup
  useEffect(() => {
    loadSettings();
    loadResources();
  }, [loadSettings, loadResources]);

  // Handle system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Apply initially to ensure correct state when switching to system
    handleChange();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const navItems = [
    { to: '/', icon: Palette, label: t('nav.studio') },
    { to: '/library', icon: Library, label: t('nav.library') },
    { to: '/gallery', icon: Image, label: t('nav.gallery') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      <aside
        className={`flex flex-col py-4 border-r border-[var(--border-color)] space-y-4 bg-[var(--bg-sidebar)] transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'w-64' : 'w-16 items-center'
        }`}
      >
        <div
          className={`font-bold text-xl mb-4 text-[var(--accent-color)] transition-all duration-300 whitespace-nowrap overflow-hidden ${
            isSidebarExpanded ? 'px-6' : 'px-0'
          }`}
        >
          {isSidebarExpanded ? 'Oneiria' : 'D'}
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isSidebarExpanded ? '' : item.label}
            className={({ isActive }) =>
              `flex items-center rounded-xl transition-all duration-300 mx-2 ${
                isSidebarExpanded ? 'justify-start px-4 py-3 gap-3' : 'justify-center p-3'
              } ${
                isActive
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`
            }
          >
            <item.icon size={24} className="shrink-0" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isSidebarExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
              }`}
            >
              {item.label}
            </span>
          </NavLink>
        ))}

        <div className="mt-auto flex flex-col gap-2 mx-2">
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`flex items-center rounded-xl transition-colors duration-200 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] ${
              isSidebarExpanded ? 'justify-start px-4 py-3 gap-3' : 'justify-center p-3'
            }`}
            title={isSidebarExpanded ? t('common.collapse') : t('common.expand')}
          >
            {isSidebarExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isSidebarExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
              }`}
            >
              {isSidebarExpanded ? t('common.collapse', 'Collapse') : ''}
            </span>
          </button>

          <div className="flex flex-col gap-2 w-full">
            <LanguageSwitcher showLabel={isSidebarExpanded} />
            <ThemeSwitcher showLabel={isSidebarExpanded} />
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-hidden bg-[var(--bg-primary)] transition-colors duration-300">
        <Outlet />
      </main>
    </div>
  );
};
