export interface ReferenceImage {
  id: string; // UUID v4
  originalPath: string; // Absolute file path
  displayName: string; // User-editable name
  originalFileName: string; // Original filename (read-only)
  thumbnailDataUrl?: string; // Base64 data URL for preview
  addedAt: number; // Timestamp
}
