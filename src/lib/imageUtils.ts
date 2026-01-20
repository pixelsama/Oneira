import { readFile } from '@tauri-apps/plugin-fs';

export const MAX_THUMBNAIL_SIZE = 200;
export const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export const getMimeType = (extension: string): string => {
  const ext = extension.toLowerCase();
  return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
};

export const generateThumbnail = async (path: string, mimeType: string): Promise<string> => {
  try {
    const fileBytes = await readFile(path);
    const blob = new Blob([fileBytes], { type: mimeType });

    // CreateImageBitmap is available in modern browsers/WebView2/WKWebView
    const bitmap = await createImageBitmap(blob);

    let width = bitmap.width;
    let height = bitmap.height;

    if (width > MAX_THUMBNAIL_SIZE || height > MAX_THUMBNAIL_SIZE) {
      const ratio = Math.min(MAX_THUMBNAIL_SIZE / width, MAX_THUMBNAIL_SIZE / height);
      width *= ratio;
      height *= ratio;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    return ''; // Fallback to no preview
  }
};
