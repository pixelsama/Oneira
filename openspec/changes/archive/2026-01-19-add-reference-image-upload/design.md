# Design: Reference Image Upload and @ Mention System

## Context

Oneiria currently only supports text-to-image generation. Users need image-to-image capabilities to enable creative workflows like style transfer, composition changes, and element swapping. The Volcengine Doubao (Seedream) API supports image-to-image generation but requires images to be sent as Base64-encoded Data URIs (file path uploads are only available in Python/Go SDKs).

### Constraints

- **Doubao API Limits**: Single image < 10MB, total request < 64MB
- **Tauri Security Model**: File system access is sandboxed; must use Tauri plugins for file dialogs
- **UX Requirement**: Users should be able to easily reference multiple images in prompts using natural @ mentions
- **Local-First**: All images stored locally; no cloud upload

### Stakeholders

- End users who want image-to-image generation workflows
- Doubao API integration (existing)
- Tauri frontend-backend communication layer

## Goals / Non-Goals

### Goals

1. Enable users to upload reference images via native file dialog and drag-and-drop
2. Allow users to name/rename images for easy identification
3. Provide intuitive @ mention autocomplete for referencing images in prompts
4. Convert and send local images to Doubao API as Base64 Data URIs
5. Support multiple reference images in a single prompt

### Non-Goals

- Image compression/resizing (future enhancement; recommended but not required for MVP)
- Persistence of uploaded images across app sessions (images are session-only in this version)
- Support for non-Doubao providers initially (DALL-E doesn't support image-to-image via their standard API)
- Advanced image editing or preview (just thumbnail display)

## Decisions

### Decision 1: Use Base64 Encoding Instead of File Paths

**Why**: Doubao API's file path upload is only supported in Python/Go SDKs. For the Rust backend calling REST API, we must use Base64 Data URI format.

**Alternatives Considered**:

- Upload to temporary cloud storage → Not local-first, adds complexity
- Use Doubao file path API → Not available for REST/Rust clients

**Implementation**:

- Read file bytes in Rust backend
- Encode to Base64 using `base64` crate
- Format as `data:{mime_type};base64,{base64_data}`

### Decision 2: @ Mention Pattern for Image References

**Why**: Familiar pattern from social media, easy to discover, non-intrusive

**Alternatives Considered**:

- Drag image thumbnails directly into prompt → More complex state management, unclear how to edit
- Button-based insertion → Less discoverable, requires extra clicks
- Markdown-style `![name]` → Less intuitive for non-technical users

**Implementation**:

- Detect `@` character in prompt input
- Show dropdown menu with filterable image names
- Insert visual tag component (not just plain text)
- Store structured content (text vs image-reference tokens)

### Decision 3: Session-Only Image Storage (No Persistence)

**Why**: Simplifies MVP; avoids database/file management complexity

**Alternatives Considered**:

- Persist images to local storage → Requires file management, cleanup logic, storage quota
- Store in Tauri plugin-store → Limited to small data; images would bloat the store

**Migration Path**: Future version can add persistence by:

1. Saving uploaded images to a dedicated app directory
2. Storing metadata (name, path) in Tauri store
3. Loading images on app startup

### Decision 4: Use contenteditable or Custom Token Editor

**Why**: Need to support mixed text and visual image reference tags

**Alternatives Considered**:

- Plain textarea with bracket syntax → No visual tags, poor UX
- Lexical/Slate rich text editor → Too heavy for this use case

**Implementation** (Option A - Recommended):

- Use controlled input with separate rendering for display
- Store prompt as array of `{type: 'text' | 'image-reference', value: string}`
- Render visual tags for image references
- Use hidden textarea for actual text serialization

**Implementation** (Option B):

- Use `contenteditable` div
- More complex cursor management
- Better visual integration

**Choice**: Start with Option A (simpler, more controlled)

### Decision 5: Tauri Dialog Plugin for File Selection

**Why**: Native OS file picker, better UX than web-based file input, multi-select support

**Alternatives Considered**:

- HTML `<input type="file">` → Works but less native feel
- Custom file browser → Too complex, reinventing the wheel

**Implementation**:

- Use `@tauri-apps/plugin-dialog`'s `open()` method
- Configure with file type filters
- Support multi-select

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐      ┌────────────────┐                 │
│  │ ImageUploader │──┬──▶│ File Dialog    │                 │
│  └───────────────┘  │   │ (Tauri Plugin) │                 │
│                     │   └────────────────┘                 │
│                     │                                        │
│                     └──▶ referenceImageStore                │
│                          (Zustand)                           │
│                          ├─ images: ReferenceImage[]         │
│                          ├─ addImage()                       │
│                          ├─ removeImage()                    │
│                          └─ updateDisplayName()              │
│                                │                             │
│  ┌───────────────┐            ▼                             │
│  │ PromptInput   │───────▶ MentionMenu                      │
│  │ + @ detection │         (Autocomplete)                   │
│  └───────────────┘                                          │
│         │                                                    │
│         ▼                                                    │
│  generationStore.generate()                                 │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          │ invoke('generate_image', {
          │   prompt: "Change [Image A] to style of [Image B]",
          │   reference_images: ["/path/a.png", "/path/b.png"]
          │ })
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Rust/Tauri)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  generate_doubao(payload)                                    │
│    ├─ Read image files from paths                           │
│    ├─ Validate file size (< 10MB each)                      │
│    ├─ Determine MIME type from extension                    │
│    ├─ Encode to Base64                                      │
│    ├─ Format as Data URI                                    │
│    └─ Build JSON with image parameter                       │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          │ POST /api/v3/images/generations
          │ {
          │   "model": "doubao-seedream-v1.2",
          │   "prompt": "...",
          │   "image": "data:image/png;base64,..." OR ["data:...", ...]
          │ }
          ▼
     Doubao API
```

## Data Models

### Frontend: ReferenceImage

```typescript
interface ReferenceImage {
  id: string; // UUID v4
  originalPath: string; // Absolute file path
  displayName: string; // User-editable name
  originalFileName: string; // Original filename (read-only)
  thumbnailDataUrl?: string; // Base64 data URL for preview
  addedAt: number; // Timestamp
}
```

### Frontend: Prompt Content

```typescript
interface PromptContent {
  type: 'text' | 'image-reference';
  value: string; // Text content or ReferenceImage.id
}
```

### Backend: GeneratePayload

```rust
#[derive(Debug, Deserialize)]
pub struct GeneratePayload {
    pub prompt: String,
    pub width: u32,
    pub height: u32,
    pub count: u32,
    pub reference_images: Option<Vec<String>>,  // Paths
}
```

## Risks / Trade-offs

### Risk 1: Base64 Size Bloat

**Impact**: 10MB image → ~13.3MB Base64 string; multiple images could exceed 64MB request limit

**Mitigation**:

- Validate file size before encoding (< 10MB per image)
- Add clear error messages if total exceeds limit
- Future: Add frontend image compression using Canvas API (resize to max 2048px, JPEG quality 0.8)

### Risk 2: contenteditable Complexity

**Impact**: Cursor management, selection handling, keyboard events are notoriously difficult

**Mitigation**:

- Start with simpler controlled input + visual rendering approach
- Can upgrade to contenteditable later if needed
- Test thoroughly on all target platforms (Windows, macOS, Linux)

### Risk 3: Drag-and-Drop Platform Differences

**Impact**: Tauri drag-and-drop might behave differently across OSes

**Mitigation**:

- Implement native file dialog as primary method
- Treat drag-and-drop as progressive enhancement
- Test on all platforms before release

### Risk 4: Memory Usage with Multiple Large Images

**Impact**: Storing Base64 thumbnails in React state could consume significant memory

**Mitigation**:

- Generate smaller thumbnails (max 200x200)
- Use lower quality JPEG for thumbnails
- Limit number of concurrent uploaded images (e.g., max 10)

### Trade-off: MVP vs Performance

**Decision**: Ship without image compression initially

**Reasoning**:

- Compression adds significant complexity (Canvas API, resize algorithms, quality tuning)
- Most users will upload reasonable-sized images (< 5MB)
- Can add compression in follow-up update based on user feedback

**Monitoring**: Track API errors related to image size to inform future prioritization

## Migration Plan

### Phase 1: Infrastructure (No User Impact)

1. Install dependencies
2. Create types and stores
3. Register Tauri plugins

### Phase 2: Image Upload (Isolated Feature)

1. Deploy image upload components
2. Users can upload and manage images (but not use them yet)
3. Test file dialogs and drag-and-drop

### Phase 3: @ Mention System (Isolated Feature)

1. Deploy mention menu and prompt enhancements
2. Users can mention images in prompts (but backend doesn't process them yet)
3. Test autocomplete and keyboard navigation

### Phase 4: Backend Integration (Full Feature)

1. Deploy Base64 encoding and API changes
2. End-to-end image-to-image generation works
3. Monitor API errors and performance

### Rollback Strategy

If critical issues arise:

- Phase 2/3: Can disable upload UI via feature flag (revert to original ImageUploader placeholder)
- Phase 4: Can strip reference_images from payload in backend, falling back to text-only generation
- No database migrations needed (all changes are additive and session-scoped)

## Open Questions

1. **Image compression**: Should we implement it in MVP or wait for user feedback?
   - **Recommendation**: Wait for v2; add clear error messages for oversized images in v1

2. **Image persistence**: Should uploaded images survive app restarts?
   - **Recommendation**: Not in MVP; add in v2 if users request it

3. **OpenAI DALL-E support**: Should we support image-to-image for DALL-E?
   - **Recommendation**: No; DALL-E's standard API doesn't support direct image input (only via image edits API which requires masks)

4. **Multi-image UI limits**: Should we cap the number of uploaded images?
   - **Recommendation**: Soft cap at 10 images; show warning if approaching request size limit

5. **Thumbnail generation**: Frontend (Canvas API) or backend (Rust image processing)?
   - **Recommendation**: Frontend via Canvas API for faster preview; backend doesn't need thumbnails
