import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Palette, Library, Image, Settings } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

export const AppLayout = () => {
  const { loadSettings, settings } = useSettingsStore();

  // Load settings on app startup
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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
    { to: '/', icon: Palette, label: 'Studio' },
    { to: '/library', icon: Library, label: 'Library' },
    { to: '/gallery', icon: Image, label: 'Gallery' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      <aside className="w-16 flex flex-col items-center py-4 border-r border-[var(--border-color)] space-y-4 bg-[var(--bg-sidebar)] transition-colors duration-300">
        <div className="font-bold text-xl mb-4 text-[var(--accent-color)]">D</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) =>
              `p-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`
            }
          >
            <item.icon size={24} />
          </NavLink>
        ))}

        <div className="mt-auto mb-2">
          <ThemeSwitcher />
        </div>
      </aside>
      <main className="flex-1 overflow-hidden bg-[var(--bg-primary)] transition-colors duration-300">
        <Outlet />
      </main>
    </div>
  );
};
