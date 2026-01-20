import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { CreativeStudio } from './features/creative-studio/CreativeStudio';

import { ResourceLibrary } from './features/resource-library/ResourceLibrary';

import { AssetsGallery } from './features/assets-gallery/AssetsGallery';
import { Settings } from './features/settings/Settings';
import { useSettingsStore } from './stores/settingsStore';

function App() {
  const { settings } = useSettingsStore();

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-center"
        theme={settings.theme}
        toastOptions={{
          style: { zIndex: 9999 },
          className: 'z-[9999]',
        }}
        style={{ zIndex: 9999 }}
      />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<CreativeStudio />} />
          <Route path="library" element={<ResourceLibrary />} />
          <Route path="gallery" element={<AssetsGallery />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
