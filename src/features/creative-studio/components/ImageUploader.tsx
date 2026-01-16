import { Upload } from 'lucide-react';

export const ImageUploader = () => {
  return (
    <div className="border-2 border-dashed border-neutral-800 rounded-lg p-8 flex flex-col items-center justify-center text-neutral-500 hover:border-neutral-600 transition-colors cursor-pointer bg-neutral-900/50">
      <Upload size={32} className="mb-2" />
      <span className="text-sm">Upload Reference Image (Optional)</span>
    </div>
  );
};
