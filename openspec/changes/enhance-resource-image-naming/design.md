## Context

This change addresses two related but distinct concerns:

1. **Feature Parity**: The Resource Editor lacks the @mention capability available in Creative Studio, limiting users' ability to reference images within prompt templates.
2. **Name Collision Risk**: When generating images, the system concatenates images from multiple sources (direct uploads + resources). Without unique identification, files sharing the same `displayName` could confuse the AI model or make debugging difficult.

### Constraints

- **User Experience**: Prefix naming MUST be invisible to users; they only interact with `displayName`.
- **Backward Compatibility**: Existing resources storing `images: string[]` (paths only) must continue to work.
- **Performance**: Prefix generation must be fast (no async operations).

## Goals / Non-Goals

### Goals

- Enable @mention functionality in Resource Editor's prompt template input
- Resource images support editable display names (like Studio images)
- Implement a deterministic, collision-free naming scheme for API calls
- Maintain clean user-facing names while ensuring internal uniqueness

### Non-Goals

- Persisting `ReferenceImage` metadata in backend (images remain as paths in resources)
- Image organization or categorization features
- Renaming prefix format after implementation

## Decisions

### Decision 1: Prefix Format

**Format**: `{source}_{id}_{displayName}`

| Source   | Prefix            | Example             |
| -------- | ----------------- | ------------------- |
| Studio   | `s_{shortUUID}_`  | `s_a1b2_portrait`   |
| Resource | `r_{resourceId}_` | `r_abc123_portrait` |

**Rationale**:

- Single-character source prefix (`s_` / `r_`) is concise yet distinctive
- `shortUUID` (4-6 chars) for studio ensures uniqueness across sessions
- `resourceId` (already exists) for resources ensures cross-resource uniqueness
- Underscore separators are safe for most file systems and APIs

**Alternatives Considered**:

- UUID-only prefix: Loses semantic meaning (can't tell source at glance)
- Hash-based: Same drawback, plus determinism concerns
- Namespace colon format (`studio:portrait`): Potential issues with some APIs/filesystems

### Decision 2: Resource Image Data Model

**Approach**: Transform to `ReferenceImage[]` at runtime, store as `string[]` in backend.

When loading a resource for editing:

```typescript
const editorImages: ReferenceImage[] = resource.images.map((path) => ({
  id: crypto.randomUUID(),
  originalPath: path,
  displayName: extractFilename(path),
  originalFileName: extractFilename(path),
  source: 'resource',
  resourceId: resource.id,
  thumbnailDataUrl: await generateThumbnail(path),
  addedAt: Date.now(),
}));
```

When saving:

```typescript
const imagePaths: string[] = editorImages.map((img) => img.originalPath);
```

**Rationale**:

- No backend schema changes required
- Runtime transformation is lightweight
- Maintains backward compatibility with existing resources

### Decision 3: @Mention in Resource Editor

**Approach**: Create a reusable `MentionableTextarea` component (or extract logic from `PromptInput`).

The component will:

- Accept `availableImages: ReferenceImage[]` (the resource's own images only, NOT global images)
- Render image reference tags inline
- Expose serialized content via callback

**Why resource-scoped images only?**

- Resource prompt templates are self-contained
- Referencing another resource's images from within a resource would create circular dependencies
- Studio images are session-only and shouldn't be referenced in persisted resources

## Risks / Trade-offs

| Risk                                          | Impact             | Mitigation                                   |
| --------------------------------------------- | ------------------ | -------------------------------------------- |
| Prefix format change breaks existing prompts  | Low (new feature)  | N/A - no existing prompts use prefixes       |
| Resource images lack thumbnails on first load | UX delay           | Generate thumbnails lazily, show placeholder |
| @mention logic duplication                    | Maintenance burden | Extract shared logic to reusable module      |

## Migration Plan

No migration required - this is additive functionality:

- Existing resources remain unchanged (paths stored as-is)
- New UI features are opt-in (users can ignore @mention)
- Prefix naming only affects API requests, not stored data

## Open Questions

1. **Q**: Should we persist `displayName` overrides for resource images in backend?
   **A (Proposed)**: No, for simplicity. Users can rename on each edit session. Revisit if users request persistence.

2. **Q**: Should duplicate `displayName` within same resource trigger a warning?
   **A (Proposed)**: Yes, show soft warning. Allow save but warn about potential confusion.
