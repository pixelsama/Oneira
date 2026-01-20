---
description: 'Task list for Oneiria MVP'
---

# Tasks: Oneiria MVP

**Input**: Design documents from `/specs/001-oneiria-mvp/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/tauri-commands.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Tauri v2 + React/Vite project in `src-tauri` and `src`
- [x] T002 [P] Install frontend dependencies (Tailwind, shadcn/ui, Zustand, Lucide)
- [x] T003 [P] Configure rust backend dependencies (reqwest, tauri-plugin-store, tauri-plugin-fs)
- [x] T004 [P] Setup project folder structure (features/, components/, stores/, src-tauri/commands/)
- [x] T005 [P] Setup linting (ESLint/Prettier) and testing (Vitest) infrastructure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T006 Implement Settings Module (Rust): `set_api_token`, `get_api_token` in `src-tauri/src/commands/settings.rs`
- [x] T007 Implement Settings Store (Frontend): Zustand store for persisting local settings in `src/stores/settingsStore.ts`
- [x] T008 [P] Implement Basic App Layout (Sidebar/Nav) in `src/components/layout/AppLayout.tsx`
- [x] T009 [P] Configure Tauri capabilities and permissions (fs, shell, store) in `src-tauri/tauri.conf.json`

**Checkpoint**: App runs, navigates, and can save/load settings (API Key).

---

## Phase 3: User Story 1 - Creative Studio Generation (Priority: P1) 🎯 MVP

**Goal**: Users can generate images (Txt2Img/Img2Img) and see them auto-saved.

**Independent Test**: Configure token -> Enter Prompt -> Click Generate -> File appears in output folder -> UI shows image.

### Implementation for User Story 1

- [x] T010 [US1] Define `GeneratedImage` and `GeneratePayload` structs in `src-tauri/src/models/mod.rs`
- [x] T011 [US1] Implement `generate_image` command (API call + File Save) in `src-tauri/src/commands/generate.rs`
- [x] T012 [P] [US1] Create `GenerationStore` (Zustand) for handling prompt state and loading status in `src/stores/generationStore.ts`
- [x] T013 [P] [US1] Build `PromptInput` component in `src/features/creative-studio/components/PromptInput.tsx`
- [x] T014 [P] [US1] Build `ImageUploader` component (for Img2Img) in `src/features/creative-studio/components/ImageUploader.tsx`
- [x] T015 [P] [US1] Build `GenerationSettings` panel (width, height, count) in `src/features/creative-studio/components/GenerationSettings.tsx`
- [x] T016 [US1] Integrate components into `CreativeStudio` page and wire to `generate_image` command in `src/features/creative-studio/CreativeStudio.tsx`
- [x] T017 [US1] Implement error handling display (Toast/Alert) for generation failures

**Checkpoint**: User Story 1 functional. Can generate images.

---

## Phase 4: User Story 2 - Resource Library Management (Priority: P1)

**Goal**: Users can CRUD resources (prompt + images).

**Independent Test**: Create Resource -> Verify in List -> Update -> Verify Change -> Delete -> Verify Removal.

### Implementation for User Story 2

- [x] T018 [US2] Define `Resource` struct and JSON schema in `src-tauri/src/models/mod.rs`
- [x] T019 [US2] Implement `resources.rs` module: `create_resource`, `list_resources` (File/JSON I/O) in `src-tauri/src/commands/resources.rs`
- [x] T020 [US2] Implement `update_resource` and `delete_resource` commands in `src-tauri/src/commands/resources.rs`
- [x] T021 [P] [US2] Create `ResourceStore` (Zustand) for managing list state in `src/stores/resourceStore.ts`
- [x] T022 [P] [US2] Build `ResourceList` and `ResourceCard` components in `src/features/resource-library/components/`
- [x] T023 [P] [US2] Build `ResourceEditor` modal/form (Prompt + Image Upload) in `src/features/resource-library/components/ResourceEditor.tsx`
- [x] T024 [US2] Integrate Library page: View list, open editor, save/delete in `src/features/resource-library/ResourceLibrary.tsx`

**Checkpoint**: User Stories 1 & 2 functional.

---

## Phase 5: User Story 3 - Resource Injection (Priority: P1)

**Goal**: Load a Resource into the Studio to preset inputs.

**Independent Test**: Click "Load" on Resource -> Switch to Studio -> Verify Inputs populated.

### Implementation for User Story 3

- [x] T025 [US3] Add `loadResource` action to `GenerationStore` to accept a `Resource` object in `src/stores/generationStore.ts`
- [x] T026 [US3] Implement "Load to Studio" button logic in `ResourceCard` (navigates to Studio + presets state) in `src/features/resource-library/components/ResourceCard.tsx`
- [x] T027 [US3] Verify Studio correctly initializes with injected prompt and reference images (Img2Img)

**Checkpoint**: User Stories 1, 2, 3 functional. Full "Oneiria" workflow active.

---

## Phase 6: User Story 4 - Assets Gallery & External Viewing (Priority: P2)

**Goal**: View history and open in OS viewer.

**Independent Test**: Open Gallery -> See Grid -> Click Image -> Opens in Preview/Photos app.

### Implementation for User Story 4

- [x] T028 [US4] Implement `list_gallery_images` command (scan output dir) in `src-tauri/src/commands/gallery.rs`
- [x] T029 [US4] Implement `open_image_in_viewer` command (shell.open) in `src-tauri/src/commands/gallery.rs`
- [x] T030 [P] [US4] Create `GalleryStore` (Zustand) for caching image list in `src/stores/galleryStore.ts`
- [x] T031 [P] [US4] Build `ImageGrid` component with lazy loading/thumbnails in `src/features/assets-gallery/components/ImageGrid.tsx`
- [x] T032 [US4] Integrate Gallery page and wire click event to `open_image_in_viewer` in `src/features/assets-gallery/AssetsGallery.tsx`

**Checkpoint**: All features complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T033 [P] Apply "Oneiria" styling/theme (Tailwind) to all components globally
- [x] T034 Verify Chinese comments in all Rust/Security code (Constitution requirement)
- [x] T035 Clean up any temporary files or debug logs
- [x] T036 Run manual verification pass using `specs/001-oneiria-mvp/quickstart.md`

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: Independent.
- **Foundational (Phase 2)**: Depends on Setup. Blocks all US phases.
- **User Story 1**: Depends on Foundation.
- **User Story 2**: Depends on Foundation.
- **User Story 3**: Depends on US1 (Studio exists) and US2 (Resources exist).
- **User Story 4**: Depends on Foundation (technically independent of US1/2/3 but relies on images existing).

## Parallel Opportunities

- **Frontend/Backend Split**: Rust commands (T011, T019, T020, T028) can be built in parallel with React components (T013, T022, T031).
- **Component Work**: T013, T014, T015 can be built in parallel by different frontend devs.
- **Story Parallelism**: US4 (Gallery) can be built in parallel with US2 (Resources) once Foundation is done.

## Implementation Strategy

1. **MVP**: Complete Phases 1 -> 2 -> 3. (We have a working generator).
2. **Core Loop**: Add Phase 4 -> 5. (We have the Resource workflow).
3. **Full Scope**: Add Phase 6. (We have the Gallery).
