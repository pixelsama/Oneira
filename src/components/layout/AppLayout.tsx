import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Palette, Library, Image, Settings } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

export const AppLayout = () => {
  const { loadSettings } = useSettingsStore();

  // Load settings on app startup
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const navItems = [
    { to: '/', icon: Palette, label: 'Studio' },
    { to: '/library', icon: Library, label: 'Library' },
    { to: '/gallery', icon: Image, label: 'Gallery' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans">
      <aside className="w-16 flex flex-col items-center py-4 border-r border-neutral-800 space-y-4 bg-neutral-900">
        <div className="font-bold text-xl mb-4 text-purple-500">D</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) =>
              `p-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`
            }
          >
            <item.icon size={24} />
          </NavLink>
        ))}
      </aside>
      <main className="flex-1 overflow-hidden bg-neutral-950">
        <Outlet />
      </main>
    </div>
  );
};
