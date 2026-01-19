# Design: Refactor Drag-and-Drop to Tauri Native Events

## Context

The `ImageUploader` component currently uses React's `DragEvent` to handle file drops. In a Tauri WebView environment, the standard Web File API does not provide file system paths. Tauri may inject a `path` property, but this behavior is inconsistent.

Tauri 2.0 provides dedicated window-level events for drag-and-drop operations that reliably provide file paths:

| Event                | Payload                | Description                  |
| -------------------- | ---------------------- | ---------------------------- |
| `tauri://drag-enter` | `DragDropEvent`        | Files enter the window       |
| `tauri://drag-over`  | `{ position: [x, y] }` | Files moving over the window |
| `tauri://drag-drop`  | `DragDropEvent`        | Files dropped on the window  |
| `tauri://drag-leave` | `null`                 | Files leave the window       |

Where `DragDropEvent` contains:

```typescript
interface DragDropEvent {
  paths: string[]; // Absolute file paths
  position: { x: number; y: number };
}
```

## Goals

- **Reliability**: Guarantee file paths are available on all platforms
- **Type Safety**: Remove `@ts-expect-error` hacks
- **Minimal Change**: Keep existing file processing logic intact
- **UX Parity**: Maintain current visual feedback behavior

## Non-Goals

- Moving thumbnail generation to Rust (Phase 2)
- Adding per-zone drag detection (window-level is acceptable for current UI)
- Changing the file processing pipeline

## Decisions

### Decision 1: Use Tauri Event Listeners

**What**: Replace React `onDragOver`/`onDragLeave`/`onDrop` with Tauri's `listen()` API.

**Why**: Tauri events are the only reliable way to get file paths in a Tauri WebView.

**Alternatives Considered**:

- Fix the WebView path injection: Not possible, depends on WebView implementation
- Use Tauri's file dialog only: Would remove drag-and-drop as a feature

### Decision 2: Window-Level vs Zone-Level Detection

**What**: Listen to window-level drag events rather than element-level events.

**Why**:

- Tauri events are window-scoped, not element-scoped
- The upload zone is the primary drop target in the current UI
- Implementing zone detection would require calculating element bounds, adding complexity

**Trade-off**: If future UI adds multiple drop zones, additional logic will be needed.

### Decision 3: Keep File Processing in Frontend

**What**: Continue using the existing `processFiles()` function with Canvas-based thumbnail generation.

**Why**:

- Minimizes change scope (Phase 1)
- Existing logic works correctly once paths are available
- Rust-based processing is a separate optimization (Phase 2)

## Technical Approach

### Event Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Tauri Window Events                   │
│  tauri://drag-enter → setIsDragging(true)               │
│  tauri://drag-leave → setIsDragging(false)              │
│  tauri://drag-drop  → processFiles(paths)               │
└─────────────────────────────────────────────────────────┘
```

### Implementation Changes

1. **Add event listeners on component mount**:

   ```typescript
   useEffect(() => {
     const unlistenDrop = listen<DragDropEvent>('tauri://drag-drop', (event) => {
       processFiles(event.payload.paths);
     });
     // ... other listeners
     return () => {
       unlistenDrop.then((fn) => fn());
     };
   }, []);
   ```

2. **Remove obsolete React drag handlers**:
   - Remove `onDragOver`, `onDragLeave`, `onDrop` from the div
   - Keep `onClick` for file dialog functionality

3. **Update isDragging state** based on Tauri events instead of React events.

## Risks / Trade-offs

### Risk 1: Window-Level Drag Scope

**Risk**: Dragging files anywhere over the window will trigger visual feedback, not just over the upload zone.

**Mitigation**: Acceptable for current UI since the upload zone is prominent. Can be enhanced later if multiple drop zones are added.

### Risk 2: Event Listener Cleanup

**Risk**: Memory leaks if listeners are not properly cleaned up.

**Mitigation**: Use the cleanup function returned by `listen()` in the `useEffect` cleanup.

## Open Questions

None - this is a well-defined refactoring with clear Tauri documentation.
