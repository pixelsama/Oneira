## 1. Data Model Extension

- [x] 1.1 Extend `ReferenceImage` type in `src/types/referenceImage.ts`:
  - Add `source: 'studio' | 'resource'` field
  - Add optional `resourceId?: string` field
  - **Acceptance**: Type compiles, existing usage unaffected

- [x] 1.2 Create `getPrefixedName(image: ReferenceImage): string` utility in `src/lib/imageUtils.ts`:
  - Studio images: return `s_{first4CharsOfId}_{displayName}`
  - Resource images: return `r_{first6CharsOfResourceId}_{displayName}`
  - **Acceptance**: Unit test covers both sources, edge cases (empty displayName, special chars)

- [x] 1.3 Create `generateShortId(): string` utility for studio uploads:
  - Generate 4-6 character unique identifier
  - **Acceptance**: Function returns alphanumeric string, low collision probability

## 2. Resource Editor Image Handling

- [x] 2.1 Refactor Resource Editor to use `ReferenceImage[]` instead of `string[]` for internal state:
  - On edit: transform `resource.images` (paths) to `ReferenceImage[]`
  - On save: transform back to `string[]` (paths only)
  - **Acceptance**: Editing existing resource loads images correctly, saving preserves paths

- [x] 2.2 Update Resource Editor image uploader to create `ReferenceImage` objects:
  - Set `source: 'resource'` and `resourceId` on upload
  - Generate thumbnails
  - **Acceptance**: Newly uploaded images appear with thumbnails and editable names

- [x] 2.3 Add image display name editing UI in Resource Editor:
  - Show editable name field per image (same UI pattern as Studio's `UploadedImageCard`)
  - **Acceptance**: User can click to edit name, changes reflected in state

- [x] 2.4 Add image removal functionality in Resource Editor:
  - Delete button removes image from list
  - **Acceptance**: Clicking delete removes image, UI updates immediately

## 3. @Mention in Resource Editor

- [x] 3.1 Extract reusable mention logic from `PromptInput.tsx`:
  - Create shared hook `useMentionEditor` or utility module
  - Handle: @ detection, filtering, keyboard nav, tag insertion
  - **Acceptance**: Logic can be imported by both Studio and Resource Editor

- [x] 3.2 Create `ResourcePromptInput` component (or refactor textarea in ResourceEditor):
  - Use contentEditable div (same pattern as Studio)
  - Integrate mention menu showing only the resource's own images
  - **Acceptance**: Typing @ shows menu with current resource's images

- [x] 3.3 Implement image reference tag rendering in Resource Editor:
  - Purple badge style consistent with Studio
  - Tags include image icon + displayName
  - **Acceptance**: Selecting image from menu inserts visual tag

- [x] 3.4 Implement prompt template serialization for resources:
  - Store prompt with image references in a structured format (or store as-is with reference syntax)
  - **Acceptance**: Saved resource retains @references, re-editing shows tags correctly

## 4. Generation Logic Update

- [x] 4.1 Update `getSerializedPrompt()` in `generationStore.ts`:
  - Use `getPrefixedName(image)` instead of `displayName` when serializing image references
  - **Acceptance**: Serialized prompt contains prefixed names like `图片文件[s_a1b2_portrait]`

- [x] 4.2 Update API payload construction:
  - Include mapping of prefixed names to file paths for backend
  - (Or if backend doesn't need this, ensure prompt text and image list are consistent)
  - **Acceptance**: Backend receives unambiguous image identifiers

- [x] 4.3 Update Studio image upload to set `source: 'studio'`:
  - Modify `ImageUploader` or shared uploader to set source field
  - **Acceptance**: All studio-uploaded images have `source: 'studio'`

## 5. UI Polish & Edge Cases

- [x] 5.1 Add duplicate displayName warning in Resource Editor:
  - Show soft warning when two images have same displayName
  - Allow save, but warn about potential confusion
  - **Acceptance**: Warning appears for duplicates, does not block save

- [x] 5.2 Handle resource images loaded without thumbnails:
  - Show placeholder while thumbnail generates
  - **Acceptance**: No broken images during load, thumbnails appear after generation

- [x] 5.3 Add i18n keys for new UI elements:
  - Resource Editor @mention related text
  - Duplicate name warning message
  - **Acceptance**: All new text has en/zh translations

## 6. Testing & Validation

- [x] 6.1 Manual test: Create resource with images, use @mention to reference them in template
- [x] 6.2 Manual test: Load resource to Studio, generate image, verify prefixed names in API call
- [x] 6.3 Manual test: Edit existing resource, verify images load with correct names
- [x] 6.4 Manual test: Verify no regressions in Studio @mention functionality
