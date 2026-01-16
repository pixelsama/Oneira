# Implementation Plan: DreamIn MVP

**Branch**: `001-dreamin-mvp` | **Date**: 2026-01-16 | **Spec**: [specs/001-dreamin-mvp/spec.md](spec.md)
**Input**: Feature specification from `specs/001-dreamin-mvp/spec.md`

## Summary

The DreamIn MVP is a lightweight desktop AI client built with Tauri + React. It features a "Creative Studio" for image generation, a "Resource Library" for managing prompt/image templates, and an "Assets Gallery" for viewing local outputs. The architecture emphasizes security (zero-cloud token storage), local-first data, and an efficient Rust-driven network layer.

## Technical Context

**Language/Version**: Rust 1.75+ (Backend), TypeScript 5.0+ (Frontend)
**Primary Dependencies**: 
- **Core**: Tauri v2
- **Frontend**: React 18+, Vite, Tailwind CSS, shadcn/ui, Zustand
- **Backend**: reqwest (networking), tauri-plugin-store (settings), tauri-plugin-fs (file I/O)
**Storage**: 
- `resources.json` (Resource Library metadata)
- `store.bin` (User settings & encrypted tokens via Stronghold/Keyring)
- Local File System (Generated images & resource assets)
**Testing**: `cargo test` (Backend logic), `vitest` (Frontend logic)
**Target Platform**: Desktop (macOS, Windows, Linux)
**Project Type**: Monorepo (Tauri standard structure: src-tauri + src)
**Performance Goals**: <200ms app launch, <50ms UI response, <100MB RAM idle
**Constraints**: Offline-first (except generation), secure token handling, minimal bundle size
**Scale/Scope**: Single user, local file system limits, <1000 resources

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Project Identity**: ✅ Lightweight desktop client, no local inference.
- **Security & Privacy**: 
    - ✅ Zero Cloud Storage (Tokens stored locally).
    - ✅ Encrypted Storage (Using Tauri Store/Stronghold).
    - ✅ Transport Security (HTTPS via Rust `reqwest`).
- **Technical Architecture**: 
    - ✅ Tauri + React/Vite stack.
    - ✅ Network requests via Rust backend.
    - ✅ Lightweight distribution.
- **Collaboration**: 
    - ✅ Modular code structure (Feature-based).
    - ✅ Chinese comments for security/sensitive logic.
    - ✅ Robust error handling planned.

## Project Structure

### Documentation (this feature)

```text
specs/001-dreamin-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src-tauri/
├── src/
│   ├── lib.rs              # Main entry & command registration
│   ├── commands/           # Rust commands exposed to frontend
│   │   ├── generate.rs     # Network requests to AI API
│   │   ├── resources.rs    # File system ops for Resource Library
│   │   └── gallery.rs      # File system ops for Assets Gallery
│   ├── models/             # Rust structs for data exchange
│   └── utils/              # Security & helper functions
├── Cargo.toml
└── tauri.conf.json

src/ (Frontend)
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── layout/             # App shell
├── features/
│   ├── creative-studio/    # Generation UI & logic
│   ├── resource-library/   # CRUD & Injection logic
│   └── assets-gallery/     # Grid view & external open
├── stores/                 # Zustand state stores
├── lib/                    # Utilities
└── App.tsx
```

**Structure Decision**: Standard Tauri v2 layout with feature-based folder organization in the frontend to isolate domain logic (Studio vs. Library vs. Gallery).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (None) | N/A | Design adheres strictly to Constitution |