# Design: Add Resource @ Mention System

## Context

The Oneiria application has two separate systems for handling reference materials:

1. **Reference Images** (`referenceImageStore`): Session-only uploaded images that can be referenced via `@` in prompts
2. **Resources** (`resourceStore`): Persistent named collections of images + prompt templates, managed in the Resource Library page

These systems are currently disconnected. Resources can only be "loaded" to the studio (which replaces the prompt entirely), while the @ mention system only works with reference images.

**Stakeholders**: End users who want to build and reuse "style packs" or "asset bundles" efficiently.

## Goals / Non-Goals

### Goals

- Unify the @ mention experience to include both images and resources
- Allow seamless resource reference directly in the prompt input
- Automatically expand resource content (prompt + images) at generation time
- Maintain visual distinction between image references (purple) and resource references (blue)

### Non-Goals

- Nested resource references (resources containing other resources)
- Resource import/export functionality
- Resource tagging or categorization
- Real-time resource sync across sessions

## Decisions

### Decision 1: Unified Mention Item Model

**What**: Create a unified `MentionItem` interface that abstracts both images and resources for the menu.

**Why**: Simplifies the MentionMenu component logic and enables consistent filtering/navigation.

```typescript
interface MentionItem {
  id: string;
  type: 'image' | 'resource';
  displayName: string;
  thumbnail?: string;
  imageCount?: number; // resource only
  promptPreview?: string; // resource only
}
```

**Alternatives considered**:

- Two separate menus (rejected: poor UX, harder to discover resources)
- Tabbed menu interface (rejected: adds complexity, slower to navigate)

### Decision 2: Parallel Tag Types

**What**: Extend `PromptContent.type` with `resource-reference` value, parallel to existing `image-reference`.

**Why**: Maintains separation of concerns and allows different serialization logic per type.

```typescript
type PromptContent = {
  type: 'text' | 'image-reference' | 'resource-reference';
  value: string;
};
```

**Alternatives considered**:

- Single `reference` type with subtype field (rejected: breaks existing code, more complex)
- Expand resources inline at insertion time (rejected: loses resource identity, can't update if resource changes)

### Decision 3: Expand-on-Generate Strategy

**What**: Resources are stored as references in `promptContent` but expanded at generation time.

**Why**:

- Keeps prompt editing responsive (no heavy operations on insert)
- Allows resources to be updated independently
- Retains visual identity of the resource in the editor

**Expansion logic**:

```typescript
getSerializedPrompt: () => {
  return promptContent
    .map((item) => {
      if (item.type === 'resource-reference') {
        const res = getResourceById(item.value);
        return res?.promptTemplate ?? '';
      }
      // ... handle other types
    })
    .join('');
};

getReferencedImagePaths: () => {
  const paths = [];
  promptContent.forEach((item) => {
    if (item.type === 'resource-reference') {
      const res = getResourceById(item.value);
      if (res) paths.push(...res.images);
    }
    // ... handle image-reference
  });
  return paths;
};
```

### Decision 4: Visual Distinction

**What**: Resource tags use blue color scheme (`bg-blue-900/50`, `border-blue-700`) with 📦 icon.

**Why**: Clear visual separation helps users understand what they're referencing at a glance.

| Type     | Icon | Background      | Border       | Text         |
| -------- | ---- | --------------- | ------------ | ------------ |
| Image    | 📷   | `purple-900/50` | `purple-700` | `purple-200` |
| Resource | 📦   | `blue-900/50`   | `blue-700`   | `blue-200`   |

## Risks / Trade-offs

### Risk: Deleted Resource Handling

**Risk**: User references a resource, then deletes it from Resource Library.

**Mitigation**:

- Display tag with warning style: `[📦 Unknown Resource]`
- Skip resource during serialization (no prompt/images injected)
- Consider: warn user before deleting resources that are referenced

### Risk: Large Resource Images

**Risk**: Resources with many images may exceed API limits (64MB total for Doubao).

**Mitigation**:

- Document limit in resource editor UI
- Frontend validation before generation
- Consider: soft limit of 5 images per resource

### Risk: Stale Resource Content

**Risk**: User edits resource after referencing it; generation uses new content.

**Mitigation**: This is actually desired behavior (latest resource content is used). Document this behavior clearly.

## Migration Plan

No migration needed - this is additive functionality:

1. Existing image references continue to work unchanged
2. New resource references are opt-in via @ menu
3. No schema changes to backend storage

## Open Questions

1. ~Should we show a preview tooltip on resource tag hover?~ (Deferred to future enhancement)
2. ~Should resources be searchable by prompt content, not just name?~ (Deferred - name-only for now)
