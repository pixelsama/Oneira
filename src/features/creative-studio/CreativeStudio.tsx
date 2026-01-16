import { PromptInput } from './components/PromptInput';
import { ImageUploader } from './components/ImageUploader';
import { GenerationSettings } from './components/GenerationSettings';
import { useGenerationStore } from '../../stores/generationStore';
import { convertFileSrc } from '@tauri-apps/api/core';

export const CreativeStudio = () => {
  const { generatedImages, isGenerating } = useGenerationStore();
  
  // Display latest image
  const latestImage = generatedImages.length > 0 ? generatedImages[generatedImages.length - 1] : null;

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col p-6 gap-6 relative">
        <div className="flex-1 bg-neutral-900 rounded-xl flex items-center justify-center overflow-hidden border border-neutral-800 relative">
           {isGenerating && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
               <div className="animate-pulse text-purple-400 font-medium">Synthesizing...</div>
             </div>
           )}
           {latestImage ? (
             <img 
               src={convertFileSrc(latestImage)} 
               alt="Generated Dream" 
               className="max-h-full max-w-full object-contain shadow-2xl"
             />
           ) : (
             <div className="text-neutral-700 text-lg">
               Your imagination is the limit.
             </div>
           )}
        </div>
        <PromptInput />
      </div>
      
      <div className="w-80 border-l border-neutral-800 p-6 flex flex-col gap-6 bg-neutral-900/30">
        <GenerationSettings />
        <ImageUploader />
      </div>
    </div>
  );
};
