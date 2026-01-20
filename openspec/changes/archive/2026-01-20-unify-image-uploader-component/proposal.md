# Change: Unify Image Uploader Component

## Why

Currently, Oneiria has two separate image upload implementations:

1. **Creative Studio (ImageUploader.tsx)**: A polished upload zone with click-to-select, Tauri-native drag-drop support, visual feedback (border highlight, loading spinner), and thumbnail generation.
2. **Resource Editor**: A basic grid with only a "+添加图片" button for file dialog, no drag-drop support, and minimal visual feedback.

This inconsistency creates a fragmented user experience. Users expect the same upload behavior and visual cues regardless of where they upload images in the application.

## What Changes

- **Refactor** the existing `ImageUploader.tsx` into a reusable `SharedImageUploader` component that can be consumed by both Creative Studio and Resource Editor.
- **Add** drag-drop upload support to the Resource Editor's image section.
- **Unify** the visual design: dashed border, upload icon, primary/secondary text, drag-over highlight, and loading spinner.
- **Extract** thumbnail generation and file processing logic into a shared utility.

## Impact

- Affected specs: `image-upload-management`
- Affected code:
  - `src/features/creative-studio/components/ImageUploader.tsx` → Refactored to use shared component
  - `src/features/resource-library/components/ResourceEditor.tsx` → Replace inline upload with shared component
  - NEW: `src/components/shared/SharedImageUploader.tsx` → Reusable upload component
  - NEW: `src/lib/imageUtils.ts` → Shared thumbnail/file processing utilities
