import { PromptInput } from './components/PromptInput';
import { ImageUploader } from './components/ImageUploader';
import { GenerationSettings } from './components/GenerationSettings';
import { useGenerationStore } from '../../stores/generationStore';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export const CreativeStudio = () => {
  const { t } = useTranslation();
  const { generatedImages, isGenerating } = useGenerationStore();

  // Display latest image
  const latestImage =
    generatedImages.length > 0 ? generatedImages[generatedImages.length - 1] : null;

  const handleDownload = async (imagePath: string) => {
    try {
      // Extract filename from path
      const filename = imagePath.split('/').pop() || 'image.png';

      // Call Rust backend command (bypasses fs plugin permission restrictions)
      const saved = await invoke<boolean>('download_image', {
        sourcePath: imagePath,
        defaultFilename: filename,
      });

      if (saved) {
        toast.success(t('common.downloadSuccess'));
      }
      // If not saved, user cancelled - no message needed
    } catch (e) {
      console.error('Download failed:', e);
      toast.error(t('common.downloadFailed'));
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col p-6 gap-6 relative">
        <div className="flex-1 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center overflow-hidden border border-[var(--border-color)] relative transition-colors duration-300 group">
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="animate-pulse text-[var(--accent-color)] font-medium">
                {t('studio.synthesizing')}
              </div>
            </div>
          )}
          {latestImage ? (
            <>
              <img
                src={convertFileSrc(latestImage)}
                alt="Generated Dream"
                className="max-h-full max-w-full object-contain shadow-2xl"
              />
              {/* Download button - visible on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(latestImage);
                }}
                className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-white/10 cursor-pointer"
                title={t('common.download')}
              >
                <Download size={20} />
              </button>
            </>
          ) : (
            <div className="text-[var(--text-secondary)] text-lg">{t('studio.placeholder')}</div>
          )}
        </div>
        <PromptInput />
      </div>

      <div className="w-80 border-l border-[var(--border-color)] p-6 flex flex-col gap-6 bg-[var(--bg-sidebar)] transition-colors duration-300">
        <GenerationSettings />
        <ImageUploader />
      </div>
    </div>
  );
};
