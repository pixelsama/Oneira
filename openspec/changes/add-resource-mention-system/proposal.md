# Change: Add Resource @ Mention System

## Why

Currently, the @ mention system only supports referencing individual uploaded images. Users must manually load resources from the Resource Library to the studio, which is a two-step workflow. The Resource Library concept (image group + prompt template as a reusable asset) is underutilized because it cannot be directly referenced in the prompt input.

By extending the @ mention system to support resources, users can directly type `@` and select a resource, which automatically injects both the resource's prompt template and all associated images into the generation pipeline. This transforms the Resource Library into a true "asset pack" system.

## What Changes

- **Extended @ Mention Menu**: The mention menu now displays both individual images (📷) and resources (📦) in a unified list
- **Resource Reference Tags**: New tag type with distinct blue styling for resource references
- **Prompt Content Type Extension**: `PromptContent.type` gains a new value `resource-reference`
- **Generation Serialization**: When generating, resource references are expanded to include:
  - The resource's `promptTemplate` is embedded into the final prompt text
  - The resource's `images` array is merged into `reference_images` for the API
- **Resource Store Enhancement**: Add `getResourceById` and `getResourceByName` helper methods

## Impact

- Affected specs:
  - `prompt-mention-system` (MODIFIED - add resource reference support)
  - `resource-management` (ADDED - new capability for resource CRUD)
- Affected code:
  - `src/types/prompt.ts` - extend PromptContent type
  - `src/stores/resourceStore.ts` - add getter methods
  - `src/stores/generationStore.ts` - update serialization logic
  - `src/features/creative-studio/components/MentionMenu.tsx` - unified item list
  - `src/features/creative-studio/components/PromptInput.tsx` - resource tag handling

## Dependencies

This change builds upon the existing:

- `prompt-mention-system` spec (image reference tags)
- `image-to-image-generation` spec (reference_images parameter)
- Existing Resource CRUD backend commands (`create_resource`, `list_resources`, etc.)
