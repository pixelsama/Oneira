# Change: Refactor Drag-and-Drop to use Tauri Native Events

## Why

The current drag-and-drop implementation relies on the standard Web `DragEvent` API and a Tauri-injected `file.path` property on `File` objects. This approach is unreliable because:

1. **Platform inconsistency**: The `file.path` injection behavior varies across WebView implementations and Tauri versions
2. **Silent failures**: When path injection fails, users see a confusing error message asking them to use the upload button instead
3. **Type unsafety**: The code uses `@ts-expect-error` hacks to access the non-standard `path` property

Tauri 2.0 provides a robust native event system (`tauri://drag-drop`) that guarantees file paths are available across all platforms.

## What Changes

- **Replace Web DragEvent with Tauri events**: Use `listen('tauri://drag-drop')` from `@tauri-apps/api/event`
- **Add Tauri drag state events**: Handle `tauri://drag-enter`, `tauri://drag-over`, `tauri://drag-leave` for visual feedback
- **Maintain existing file processing logic**: Keep the `processFiles()` function unchanged
- **Remove @ts-expect-error hacks**: Clean up type-unsafe code

## Impact

- Affected specs: `image-upload-management` (modifies Drag and Drop Upload requirement)
- Affected code:
  - `src/features/creative-studio/components/ImageUploader.tsx` (primary change)
- No breaking changes to user-facing behavior
- Improves reliability and cross-platform consistency
