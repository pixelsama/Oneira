# Design: Unified Image Uploader Component

## Context

Oneiria provides image upload functionality in two places:

1. **Creative Studio**: For uploading reference images used in image-to-image generation.
2. **Resource Editor**: For attaching reference images to saved Resource templates.

Both serve similar purposes (selecting local image files) but have diverged implementations. The Creative Studio version is more mature, with Tauri-native drag-drop events, visual feedback, and thumbnail generation. The Resource Editor version is simpler, dialog-only.

### Stakeholders

- End users: Expect consistent upload behavior across the app.
- Developers: Benefit from a single, well-tested component.

## Goals / Non-Goals

### Goals

- Create a single reusable `SharedImageUploader` component.
- Support both click-to-select and drag-drop upload.
- Provide consistent visual design (dashed border, icon, text, states).
- Allow consumers to control the image list externally (controlled component pattern).
- Extract file processing logic into a testable utility module.

### Non-Goals

- Cloud upload or remote storage.
- Image editing (crop, resize, etc.).
- Persisting images across sessions (out of scope for this change).

## Decisions

### Decision 1: Controlled Component Pattern

The `SharedImageUploader` will be a **controlled component** that receives `imagePaths` and `onImagesChange` props rather than maintaining its own internal state.

**Rationale**: Different consumers have different state management needs:

- Creative Studio uses `referenceImageStore` (Zustand) with rich metadata (UUIDs, thumbnails).
- Resource Editor uses local React state with simple string paths.

A controlled pattern allows each consumer to manage state as needed.

### Decision 2: Tauri Native Drag-Drop Events

The component will use Tauri's native `tauri://drag-drop`, `tauri://drag-enter`, and `tauri://drag-leave` events rather than Web Drag API.

**Rationale**: Web Drag API is unreliable in Tauri (paths may not be accessible). The native Tauri events provide reliable file paths and better UX.

### Decision 3: Optional Thumbnail Rendering

The component will accept an optional `renderThumbnails` prop. When true, it displays uploaded images in a grid below the drop zone.

**Rationale**: Creative Studio already has `UploadedImageCard` for rich display. Resource Editor needs inline grid display. Making thumbnails optional keeps the component flexible.

### Alternatives Considered

| Alternative                           | Why Rejected                              |
| ------------------------------------- | ----------------------------------------- |
| Duplicate code in both locations      | Maintenance burden, inconsistent UX       |
| Global event listeners only in parent | Scoping issues, harder to test            |
| Fully uncontrolled component          | Doesn't fit varied state management needs |

## Component Interface

```typescript
interface SharedImageUploaderProps {
  // Controlled: Current image paths
  imagePaths: string[];

  // Callback when images are added or removed
  onImagesChange: (paths: string[]) => void;

  // Optional: Maximum number of images (default: unlimited)
  maxImages?: number;

  // Optional: Whether to render thumbnails below drop zone
  showInlineThumbnails?: boolean;

  // Optional: Custom empty state text (i18n keys)
  emptyTextKey?: string;
  emptySubTextKey?: string;

  // Optional: Allow reordering via drag (for Resource Editor)
  allowReorder?: boolean;
}
```

## Risks / Trade-offs

| Risk                                       | Mitigation                                                          |
| ------------------------------------------ | ------------------------------------------------------------------- |
| Breaking existing Creative Studio behavior | Phased refactor: first extract, then replace, validate at each step |
| Event listener leaks                       | Cleanup in useEffect return, match existing pattern                 |
| CSS specificity conflicts                  | Use self-contained CSS variables, no global overrides               |

## Migration Plan

1. Create `SharedImageUploader` component and `imageUtils.ts`.
2. Validate component in isolation.
3. Refactor Creative Studio's `ImageUploader` to wrap `SharedImageUploader`.
4. Integrate into Resource Editor.
5. Delete duplicated code.

Rollback: If issues arise, revert to previous component files (git).

## Open Questions

- Should the maximum file size warning be configurable per-consumer?
  - **Answer**: Not in this iteration; use existing 10MB limit from `image-to-image-generation` spec.
