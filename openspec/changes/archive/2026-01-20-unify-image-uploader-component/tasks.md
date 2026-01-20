# Tasks: Unify Image Uploader Component

## 1. Foundation

- [x] 1.1 Create `src/lib/imageUtils.ts` with shared utility functions:
  - `generateThumbnail(path: string, mimeType: string): Promise<string>` - Generate Base64 thumbnail
  - `getMimeType(extension: string): string` - Map extension to MIME type
  - `ACCEPTED_EXTENSIONS` constant
  - `MAX_THUMBNAIL_SIZE` constant

- [x] 1.2 Create `src/components/shared/SharedImageUploader.tsx`:
  - Props interface: `imagePaths`, `onImagesChange`, `maxImages?`, `showInlineThumbnails?`, `emptyTextKey?`, `emptySubTextKey?`, `allowReorder?`
  - Drop zone UI: dashed border, upload icon, primary/secondary text
  - Click handler: opens Tauri file dialog
  - Tauri native drag-drop event listeners
  - Visual states: default, dragging, processing
  - Optional inline thumbnail grid

## 2. Integration - Creative Studio

- [x] 2.1 Refactor `ImageUploader.tsx` to use `SharedImageUploader`:
  - Import `SharedImageUploader` and `imageUtils`
  - Pass `referenceImageStore.images.map(img => img.originalPath)` as `imagePaths`
  - Handle `onImagesChange` to update store with full metadata
  - Preserve `UploadedImageCard` grid (set `showInlineThumbnails=false`, render cards separately)

- [x] 2.2 Verify Creative Studio upload still works:
  - Click to open file dialog
  - Drag and drop images
  - Thumbnail generation
  - Image removal

## 3. Integration - Resource Editor

- [x] 3.1 Replace inline image section in `ResourceEditor.tsx`:
  - Import `SharedImageUploader`
  - Remove current `handleAddImages`, `handleDragStart`, `handleDragOver`, `handleDragEnd` handlers
  - Pass `imagePaths` state and `setImagePaths` as props
  - Set `showInlineThumbnails=true` and `allowReorder=true`
  - Set `maxImages={5}`

- [x] 3.2 Verify Resource Editor upload works:
  - Click to open file dialog
  - Drag and drop images onto the drop zone
  - Thumbnail display in grid
  - Image removal
  - Image reordering (drag within grid)

## 4. Polish & Validation

- [x] 4.1 Add/verify i18n keys:
  - Ensure `studio.upload.title`, `studio.upload.subtitle`, `studio.upload.processing` exist
  - Add `library.editor.uploadDrop` if needed for Resource Editor context

- [x] 4.2 Manual testing:
  - Test both upload locations in dev mode (`pnpm tauri dev`)
  - Verify drag-drop highlight appears
  - Verify loader spinner during processing
  - Verify 5-image limit warning in Resource Editor

- [x] 4.3 Code cleanup:
  - Remove duplicated thumbnail generation code
  - Remove unused imports
  - Run `pnpm lint` and `cargo clippy`

## Dependencies

- Task 1.1 → Task 1.2 (utilities needed for component)
- Task 1.2 → Tasks 2.1, 3.1 (component needed for integration)
- Tasks 2.1, 3.1 can be parallelized after 1.2

## Acceptance Criteria

- [x] Both Creative Studio and Resource Editor use the same visual upload zone
- [x] Both support click-to-select and drag-drop upload
- [x] Visual feedback (border highlight, spinner) is consistent
- [x] No regression in existing upload functionality
- [x] Code passes linting checks
