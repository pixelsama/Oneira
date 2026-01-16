import React from 'react';
import { useGenerationStore } from '../../../stores/generationStore';
import { toast } from 'sonner';

export const PromptInput = () => {
  const { prompt, setPrompt, generate, isGenerating } = useGenerationStore();

  const handleGenerate = async () => {
    try {
      await generate();
      toast.success('Dream captured successfully.');
    } catch (e) {
      toast.error(`Generation failed: ${e}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-neutral-400">Prompt</label>
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your dream..."
          className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none placeholder:text-neutral-600"
          disabled={isGenerating}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
        >
          {isGenerating ? 'Dreaming...' : 'Generate'}
        </button>
      </div>
    </div>
  );
};