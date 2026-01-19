# Change: Add Reference Image Upload and @ Mention System

## Why

Currently, users can only generate images from text prompts. To support image-to-image generation workflows (changing styles, compositions, or elements), users need the ability to upload reference images and mention them in prompts. This enables powerful creative workflows like "change the clothing in [image A] to the style of [image B]".

The feature request is fully documented in `docs/reference-image-feature-plan.md` and includes support for:

- Multi-image upload via native file dialog and drag-and-drop
- Custom naming for uploaded images
- @ mention autocomplete system for referencing images in prompts
- Backend integration with Volcengine Doubao (Seedream) image-to-image API

## What Changes

- **Frontend**: New reference image management system with upload, preview, naming, and deletion
- **Frontend**: Enhanced prompt input with @ mention autocomplete and visual image tag rendering
- **Frontend**: New Zustand store for managing reference image state
- **Backend**: Support for image-to-image generation via Base64 encoding to Doubao API
- **Dependencies**: Add `@tauri-apps/plugin-dialog` for native file selection

### Key Components

1. Image upload area with file dialog and drag-and-drop support
2. Uploaded image card component with thumbnail, editable name, and delete action
3. @ mention dropdown menu for autocomplete image selection
4. Enhanced prompt input supporting mixed text and image reference tags
5. Rust backend support for converting local images to Base64 Data URIs

## Impact

**Affected Specs:**

- `image-generation` (new capability) - Image upload and management
- `prompt-input` (new capability) - @ mention system
- `doubao-integration` (new capability) - Image-to-image API support

**Affected Code:**

- `src/features/creative-studio/components/ImageUploader.tsx` - Complete refactor
- `src/features/creative-studio/components/PromptInput.tsx` - Enhanced with @ mention support
- `src-tauri/src/commands/generate.rs` - Add Base64 image encoding
- `src-tauri/capabilities/default.json` - Add dialog plugin permissions
- New files:
  - `src/features/creative-studio/components/UploadedImageCard.tsx`
  - `src/features/creative-studio/components/MentionMenu.tsx`
  - `src/stores/referenceImageStore.ts`
  - `src/types/referenceImage.ts`

**Breaking Changes:** None - this is purely additive functionality
