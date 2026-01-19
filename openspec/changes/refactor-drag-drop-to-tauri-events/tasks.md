# Tasks: Refactor Drag-and-Drop to Tauri Native Events

## 1. Frontend Implementation

- [x] 1.1 Add Tauri event type definitions for `DragDropEvent`
- [x] 1.2 Create `useEffect` hook to listen to Tauri drag events (`drag-enter`, `drag-over`, `drag-drop`, `drag-leave`)
- [x] 1.3 Update `isDragging` state to be controlled by Tauri events instead of React events
- [x] 1.4 Call existing `processFiles()` function from Tauri `drag-drop` event handler
- [x] 1.5 Remove React `onDragOver`, `onDragLeave`, `onDrop` handlers from the upload zone div
- [x] 1.6 Remove `@ts-expect-error` hacks and obsolete `handleDrop` function
- [x] 1.7 Add proper cleanup for Tauri event listeners in `useEffect` return

### 1. Implementation Acceptance Criteria

| Criterion           | Description                                                                              | How to Verify                                        |
| ------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Type Definition** | `DragDropEvent` interface defined with `paths: string[]` and `position: {x, y}`          | Code review: interface exists and matches Tauri spec |
| **Event Listeners** | All 4 Tauri events (`drag-enter`, `drag-over`, `drag-drop`, `drag-leave`) have listeners | Code review: `listen()` calls for all events         |
| **State Binding**   | `isDragging` state changes on `drag-enter` (true) and `drag-leave` (false)               | Manual test: border color changes when dragging      |
| **Path Extraction** | `event.payload.paths` is passed to `processFiles()`                                      | Console log / debugger in dev mode                   |
| **Handler Removal** | No `onDragOver`, `onDragLeave`, `onDrop` props on the upload div                         | Code review: props removed from JSX                  |
| **Type Safety**     | Zero `@ts-expect-error` comments in `ImageUploader.tsx`                                  | `grep "@ts-expect-error" src/` returns empty         |
| **Memory Safety**   | `useEffect` returns cleanup function calling all `unlisten()`                            | Code review: cleanup pattern verified                |

---

## 2. Validation

- [ ] 2.1 Test drag-and-drop upload on macOS
- [ ] 2.2 Verify file paths are correctly received in `processFiles()`
- [ ] 2.3 Verify visual feedback (isDragging state) works correctly
- [ ] 2.4 Verify click-to-upload still works (file dialog)
- [ ] 2.5 Verify error handling for unsupported file types
- [ ] 2.6 Verify multiple file drop works correctly

### 2. Validation Acceptance Criteria

| Test Case                   | Steps                                                                     | Expected Result                                                |
| --------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Single Image Drop**       | 1. Drag a .jpg file over app window<br>2. Drop the file                   | Image appears in reference list with thumbnail                 |
| **Multiple Images Drop**    | 1. Select 3 image files in Finder<br>2. Drag and drop all onto app        | All 3 images appear in reference list                          |
| **Invalid File Rejection**  | 1. Drag a .pdf file over app<br>2. Drop the file                          | Toast error: "Unsupported format"                              |
| **Visual Feedback - Enter** | 1. Drag file over app window<br>2. Observe upload zone                    | Border changes to accent color, background tint                |
| **Visual Feedback - Leave** | 1. Drag file over app window<br>2. Move file away without dropping        | Border returns to default color                                |
| **Click Upload Works**      | 1. Click on upload zone<br>2. Select file in dialog                       | Image added to reference list                                  |
| **Path Correctness**        | 1. Drop image<br>2. Check console or state                                | `originalPath` is absolute path (e.g., `/Users/.../image.jpg`) |
| **Component Unmount**       | 1. Navigate away from Creative Studio<br>2. Navigate back<br>3. Drop file | No errors, drag-drop still works                               |

---

## 3. Final Checklist

- [ ] **No Console Errors**: Dev tools console shows no errors during drag-drop operations
- [ ] **No "Path Missing" Toast**: The old fallback error message never appears
- [ ] **Parity with Previous**: Functionality equivalent to before (no regressions)
- [x] **Code Quality**: ESLint passes with no warnings on `ImageUploader.tsx`
- [x] **TypeScript**: `pnpm tsc --noEmit` passes with no errors
