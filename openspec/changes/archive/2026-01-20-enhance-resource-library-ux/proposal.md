# Change: Enhance Resource Library UX

## Why

The current Resource Library implementation provides basic CRUD functionality but lacks polish in terms of user experience. Key improvements are needed to make the Resource Library more intuitive, visually informative, and robust. These include better resource card displays, image path validation, image count guidance, and editor enhancements like live preview and drag-to-reorder.

This change is a follow-up to `add-resource-mention-system`, focusing on UX refinements rather than core functionality.

## What Changes

- **Resource Card UI Enhancement**:
  - Prompt template shown with truncation and hover tooltip
  - Image thumbnail grid with "+N" indicator for overflow
  - "Copy to Clipboard" quick action for prompt templates

- **Resource Editor Enhancement**:
  - Live preview of resource card while editing
  - Drag-and-drop image reordering
  - (Optional) Prompt template variable hints

- **Image Path Validation**:
  - Display placeholder for missing/deleted image files
  - Skip invalid paths during generation without crashing
  - Optional: warn on save when resource has invalid paths

- **Resource Image Limit**:
  - Soft limit of 5 images per resource with warning
  - Image count display in editor (e.g., "3 / 5 images")
  - (Optional) Total image size validation before generation

## Impact

- Affected specs: `resource-management` (ADDED - new UX requirements)
- Affected code:
  - `src/features/resource-library/components/ResourceCard.tsx`
  - `src/features/resource-library/components/ResourceEditor.tsx`
  - `src/stores/generationStore.ts` (image path validation during generate)

## Dependencies

This change depends on:

- `add-resource-mention-system` (core resource @ mention functionality)
- Existing Resource CRUD backend commands
