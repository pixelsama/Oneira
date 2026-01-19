# Implementation Tasks

## 1. Infrastructure Setup

- [x] 1.1 Install `@tauri-apps/plugin-dialog` frontend package
- [x] 1.2 Add `tauri-plugin-dialog = "2"` to `src-tauri/Cargo.toml`
- [x] 1.3 Register dialog plugin in `src-tauri/src/lib.rs`
- [x] 1.4 Add `"dialog:default"` permission to `capabilities/default.json`
- [x] 1.5 Create `src/types/referenceImage.ts` type definitions
- [x] 1.6 Create `src/stores/referenceImageStore.ts` with Zustand store

### ✅ Acceptance Criteria - Phase 1

- [x] `pnpm list @tauri-apps/plugin-dialog` shows package is installed
- [x] `cargo build` succeeds without errors after adding dialog plugin
- [x] App launches successfully with dialog plugin registered
- [x] `ReferenceImage` interface includes all required fields: `id`, `originalPath`, `displayName`, `originalFileName`, `thumbnailDataUrl?`, `addedAt`
- [x] `referenceImageStore` exports all required methods: `addImage`, `removeImage`, `updateDisplayName`, `clearAll`, `getImageById`, `getImageByName`
- [x] TypeScript compilation passes with no type errors

---

## 2. Image Upload Components

- [x] 2.1 Refactor `ImageUploader.tsx` to use native Tauri file dialog
- [x] 2.2 Add drag-and-drop support to `ImageUploader.tsx`
- [x] 2.3 Implement file type filtering (jpg, jpeg, png, webp, gif)
- [x] 2.4 Create `UploadedImageCard.tsx` component with thumbnail display
- [x] 2.5 Add editable name functionality to `UploadedImageCard`
- [x] 2.6 Add delete button to `UploadedImageCard`
- [x] 2.7 Generate Base64 thumbnails for preview display

### ✅ Acceptance Criteria - Phase 2

- [x] **File Dialog**: Clicking upload area opens native OS file picker
- [x] **File Filtering**: File dialog only shows image files (jpg, jpeg, png, webp, gif)
- [x] **Multi-Select**: User can select multiple files at once via Cmd/Ctrl+Click
- [x] **Drag Visual Feedback**: Border/background changes when dragging files over upload area
- [x] **Drop Success**: Dropping valid image files adds them to the upload list
- [x] **Invalid File Rejection**: Dropping non-image files shows error toast message
- [x] **Thumbnail Display**: Each uploaded image shows a preview (max 200x200px)
- [x] **Default Naming**: Images initially named with original filename (without extension)
- [x] **Name Editing**: Clicking edit icon makes name editable with input field
- [x] **Name Persistence**: Edited name is saved when user confirms (Enter or blur)
- [x] **Delete Action**: Clicking delete icon removes image from list immediately
- [x] **Grid Layout**: Multiple images display in responsive grid (2-4 columns depending on screen width)
- [x] **No Memory Leaks**: Removing images properly revokes thumbnail data URLs

---

## 3. @ Mention System

- [x] 3.1 Create `MentionMenu.tsx` dropdown component
- [x] 3.2 Implement image name search/filter in `MentionMenu`
- [x] 3.3 Add keyboard navigation (↑↓ arrow keys, Enter, Tab, Esc)
- [x] 3.4 Refactor `PromptInput.tsx` to detect @ character input
- [x] 3.5 Show/hide `MentionMenu` based on @ detection
- [x] 3.6 Implement image reference tag insertion
- [x] 3.7 Style image reference tags with visual pills/badges
- [x] 3.8 Support mixed text and image reference editing
- [x] 3.9 Implement prompt content serialization for backend

### ✅ Acceptance Criteria - Phase 3

- [x] **@ Detection**: Typing @ anywhere in prompt shows mention menu
- [x] **Menu Positioning**: Menu appears directly below @ character
- [x] **Empty State**: Menu shows "No reference images uploaded" when image list is empty
- [x] **Full List**: Menu shows all uploaded images when @ is first typed
- [x] **Search Filtering**: Typing after @ filters menu to matching image names (case-insensitive)
- [x] **No Matches**: Menu shows "No matches found" when search has no results
- [x] **Keyboard Navigation**:
  - [x] ↓ arrow highlights next item (wraps to first)
  - [x] ↑ arrow highlights previous item (wraps to last)
  - [x] Enter inserts highlighted image and closes menu
  - [x] Tab inserts first item and closes menu
  - [x] Esc closes menu without inserting
- [x] **Mouse Interaction**: Clicking an image in menu inserts it and closes menu
- [x] **Tag Insertion**: Selected image replaces @ and search text with visual tag
- [x] **Tag Styling**: Tags have purple background, rounded borders, camera icon prefix
- [x] **Tag Display**: Tag shows image display name clearly
- [x] **Mixed Editing**: User can type text before and after tags naturally
- [x] **Tag Deletion**: Backspace removes entire tag as single unit
- [x] **Multiple Tags**: Prompt can contain multiple image tags with text between them
- [x] **Serialization**: `getSerializedPrompt()` converts tags to "图片文件[DisplayName]" format
- [x] **Path Extraction**: `getReferencedImagePaths()` returns array of file paths in order
- [x] **Deleted Image Handling**: Tags for deleted images show error styling

---

## 4. Backend Image-to-Image Support

- [x] 4.1 Update `GeneratePayload` struct to include `reference_images: Option<Vec<String>>`
- [x] 4.2 Create `get_mime_type()` helper function in `generate.rs`
- [x] 4.3 Create `image_to_base64_uri()` function with file validation
- [x] 4.4 Add file size validation (< 10MB per image)
- [x] 4.5 Modify `generate_doubao()` to handle reference images
- [x] 4.6 Implement Base64 encoding and Data URI formatting
- [x] 4.7 Handle single vs multiple image API format differences

### ✅ Acceptance Criteria - Phase 4

- [x] **Payload Structure**: `GeneratePayload` deserializes correctly with optional `reference_images` field
- [x] **MIME Detection**: `get_mime_type()` returns correct MIME for jpg, jpeg, png, webp, gif
- [x] **Unsupported Format Error**: `get_mime_type()` returns error for other extensions
- [x] **File Existence Check**: Returns error with file path if image doesn't exist
- [x] **Size Validation**: Returns error with size in MB if image > 10MB
- [x] **Base64 Encoding**: Successfully reads file bytes and encodes to Base64
- [x] **Data URI Format**: Output format is `data:{mime};base64,{encoded_data}`
- [x] **Single Image API Format**: With 1 image, `image` field is a string
- [x] **Multiple Images API Format**: With >1 image, `image` field is an array
- [x] **Sequential Parameter**: `sequential_image_generation` set to "disabled" for count=1, "auto" for count>1
- [x] **Error Messages**: All errors include helpful details (file path, size, supported formats)
- [x] **Backward Compatibility**: Text-only generation still works when `reference_images` is None or empty
- [x] **Cargo Test**: All Rust tests pass including new validation tests
- [x] **Cargo Clippy**: No new warnings introduced

---

## 5. Frontend-Backend Integration

- [x] 5.1 Update `generationStore` to track prompted content structure
- [x] 5.2 Implement `getSerializedPrompt()` in generation store
- [x] 5.3 Implement `getReferencedImagePaths()` in generation store
- [x] 5.4 Pass reference image paths to `generate_image` Tauri command
- [x] 5.5 Handle API errors for unsupported formats or oversized images

### ✅ Acceptance Criteria - Phase 5

- [x] **Store Structure**: `generationStore` has `promptContent: PromptContent[]` field
- [x] **Content Tracking**: Store updates `promptContent` when tags are inserted/removed
- [x] **Serialization Works**: `getSerializedPrompt()` returns correct string for mixed content
- [x] **Path Extraction Works**: `getReferencedImagePaths()` returns correct file paths in order
- [x] **Tauri Command Call**: `invoke('generate_image')` includes `reference_images` parameter
- [x] **Empty Array Handling**: Call works correctly when no images are referenced
- [x] **Error Display**: Backend errors show user-friendly toast messages
- [x] **File Not Found Error**: Shows "Image file not found: {path}" to user
- [x] **Oversized Error**: Shows "Image too large: {size}MB (max 10MB)" to user
- [x] **Format Error**: Shows "Unsupported format. Supported: jpg, png, webp, gif" to user

---

## 6. Testing and Validation

- [x] 6.1 Test file upload via dialog with various image formats
- [x] 6.2 Test drag-and-drop upload functionality
- [x] 6.3 Test image naming and renaming
- [x] 6.4 Test image deletion
- [x] 6.5 Test @ mention autocomplete with keyboard navigation
- [x] 6.6 Test prompt serialization with mixed content
- [x] 6.7 End-to-end test: upload → name → mention → generate
- [x] 6.8 Test error handling for oversized images
- [x] 6.9 Test error handling for unsupported file formats
- [x] 6.10 Verify Base64 encoding correctness
- [x] 6.11 Test image-to-image generation with Doubao API

### ✅ Acceptance Criteria - Phase 6

- [x] **Format Testing**: Successfully upload jpg, jpeg, png, webp, gif files
- [x] **Upload Methods**: Both dialog and drag-and-drop work reliably
- [x] **Multi-Select**: Can upload 3+ images at once via dialog
- [x] **Rename Flow**: Edit → change name → save → verify name updated
- [x] **Delete Flow**: Delete image → verify removed from list → tags show error state
- [x] **Keyboard Menu**: All navigation keys (↑↓ Enter Tab Esc) work as expected
- [x] **Mouse Menu**: Click selection works correctly
- [x] **Mention Search**: Typing after @ filters correctly (case-insensitive)
- [x] **Tag Rendering**: Tags display with correct styling and icon
- [x] **Tag Deletion**: Backspace removes tag completely
- [x] **Serialization Test**: Verify "text [📷 Image] text [📷 Image2]" → "text 图片文件[Image] text 图片文件[Image2]"
- [x] **Path Extraction Test**: Verify paths array matches referenced images in order
- [x] **E2E Success Case**:
  1. Upload 2 test images
  2. Rename them to "Style A" and "Style B"
  3. Create prompt: "Apply style from @Style A to @Style B"
  4. Generate image successfully
  5. Verify generated image saved to gallery
- [x] **Oversized Image Test**: Upload 11MB image → verify error message shown
- [x] **Invalid Format Test**: Upload .txt file → verify error message shown
- [x] **Base64 Verification**: Manually verify one Data URI decodes to original image
- [x] **API Success**: Real Doubao API call completes and returns generated images
- [x] **API Error Handling**: Simulate/test various API errors show appropriate messages

---

## 7. Documentation and Polish

- [x] 7.1 Add user-facing error messages for upload failures
- [x] 7.2 Add loading states during image upload
- [x] 7.3 Add visual feedback for drag-over events
- [x] 7.4 Ensure responsive design for all new components
- [x] 7.5 Update any relevant inline code comments

### ✅ Acceptance Criteria - Phase 7

- [x] **Error Messages**: All error scenarios have clear, actionable messages in English or Chinese
- [x] **Upload Loading**: Spinner or loading indicator shows while processing large images
- [x] **Drag Feedback**: Border color/style changes during drag-over state
- [x] **Responsive Design**:
  - [x] Works on 1920px+ desktop
  - [x] Works on 1366px laptop
  - [x] Components don't break at minimum Tauri window size
- [x] **Code Comments**: All complex functions have JSDoc/rustdoc comments
- [x] **No Console Errors**: Browser console clean (no warnings or errors)
- [x] **Accessibility**: Keyboard navigation works for all interactive elements

---

## 🎯 Final Acceptance - Full Feature

### Must Pass Before Marking Complete

- [x] **Text-Only Generation**: Existing text-to-image still works without regression
- [x] **Single Image Generation**: Can generate with 1 reference image
- [x] **Multiple Image Generation**: Can generate with 2+ reference images
- [x] **Error Recovery**: All error cases handled gracefully without app crashes
- [x] **Performance**: Uploading and processing 5 images completes within 5 seconds
- [x] **Memory**: No memory leaks after uploading/deleting 20+ images
- [x] **Cross-Platform**: Tested on at least macOS (primary dev platform)
- [x] **Code Quality**: `pnpm lint` and `cargo clippy` pass with no warnings
- [x] **Type Safety**: `pnpm build` completes with no TypeScript errors
- [x] **Clean Git State**: All temporary files gitignored, no debug code committed

---

## Dependencies

- Tasks 2.x depend on 1.x (infrastructure must exist first)
- Tasks 3.x depend on 1.6 (need referenceImageStore)
- Tasks 4.x can be done in parallel with 2.x and 3.x
- Tasks 5.x depend on 2.x, 3.x, and 4.x completion
- Tasks 6.x are final validation after all implementation

## Parallelizable Work

- Sections 2 (Upload) and 3 (Mention) can be developed independently after Section 1
- Section 4 (Backend) can be developed in parallel with Sections 2 and 3
