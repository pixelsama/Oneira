# Change: Enhance Resource Editor with @Mention and Image Prefix Naming

## Why

Currently, the Resource Editor in the Resource Library only supports uploading images as raw file paths without editable display names or the @mention referencing system. This creates two problems:

1. **Inconsistency**: The Creative Studio supports @mention for images in prompts, but the Resource Editor's prompt template textarea does not, limiting expressiveness.
2. **Name collisions**: When generating images, multiple sources (Studio uploads vs Resource images, or images from different resources) may share the same filename (e.g., `portrait.jpg`), causing potential model confusion and debugging difficulties.

## What Changes

### Feature 1: @Mention and Editable Image Names in Resource Editor

- Migrate the @mention menu logic from Creative Studio's `PromptInput` to Resource Editor's prompt template textarea
- Change Resource Editor's image uploader to use `ReferenceImage` structure with editable `displayName` (same as Studio)
- Allow users to reference uploaded images in the prompt template via @mentions

### Feature 2: Hidden Prefix Naming System

- Extend `ReferenceImage` type with `source` field (`'studio'` | `'resource'`) and optional `resourceId`
- Implement a `getPrefixedName()` utility to generate globally unique internal names:
  - Studio uploads: `s_{shortUUID}_{displayName}` (e.g., `s_a1b2_portrait`)
  - Resource uploads: `r_{resourceId}_{displayName}` (e.g., `r_abc123_portrait`)
- Update `getSerializedPrompt()` and API calls to use `prefixedName` instead of `displayName` for model clarity
- Users only see/edit `displayName`; prefixed names are internal-only

## Impact

- Affected specs:
  - `resource-management` - Resource Editor now supports @mention and ReferenceImage structure for images
  - `image-upload-management` - ReferenceImage type extended with source tracking
  - `prompt-mention-system` - @mention system extended to work in Resource Editor context
- Affected code:
  - `src/types/referenceImage.ts` - Type extension
  - `src/lib/imageUtils.ts` - New utility functions
  - `src/features/resource-library/components/ResourceEditor.tsx` - Major refactor
  - `src/stores/resourceStore.ts` - Data model update
  - `src/stores/generationStore.ts` - Serialization logic update
