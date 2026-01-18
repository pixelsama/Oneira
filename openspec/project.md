# Project Context

## Purpose

Oneiria is a **modern, local-first AI creative studio application** built with Tauri v2. The project provides a seamless interface for generating, managing, and organizing AI-generated artwork with a strong focus on:

- **Privacy**: All data stored locally, no cloud dependencies
- **Performance**: Native desktop performance via Tauri/Rust backend
- **User Experience**: Intuitive interface for creative workflows

### Key Goals

- Provide a unified interface for multiple AI image generation providers
- Enable efficient management and organization of generated assets
- Maintain privacy through local-first architecture
- Deliver native desktop performance across Windows, macOS, and Linux

## Tech Stack

### Frontend

- **React** 19 - UI framework
- **TypeScript** 5.0+ - Type-safe development
- **Vite** 7 - Build tool and dev server
- **TailwindCSS** 4 - Utility-first styling
- **React Router** v7 - Client-side routing
- **Zustand** - Lightweight state management
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend/Desktop

- **Tauri** 2.9+ - Cross-platform desktop framework
- **Rust** 1.77.2+ - Native backend language
- **Tauri Plugins**:
  - `tauri-plugin-fs` - File system operations
  - `tauri-plugin-store` - Persistent key-value storage
  - `tauri-plugin-shell` - Shell command execution
  - `tauri-plugin-opener` - Opening files/URLs
  - `tauri-plugin-log` - Logging infrastructure

### Rust Dependencies

- **serde/serde_json** - Serialization
- **reqwest** - HTTP client for API calls
- **chrono** - Date/time handling
- **uuid** - UUID generation
- **base64** - Base64 encoding/decoding

### Development Tools

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **@testing-library/react** - React component testing
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **pnpm** - Package manager (preferred)

## Project Conventions

### Code Style

#### TypeScript/JavaScript

- **Formatting**: Prettier with the following rules:
  - Single quotes (`'`)
  - Semicolons required
  - Tab width: 2 spaces
  - Trailing commas: ES5
  - Print width: 100 characters
- **Linting**: ESLint with TypeScript, React Hooks, and React Refresh plugins
- **Naming Conventions**:
  - Components: PascalCase (e.g., `ImageGenerator.tsx`)
  - Files: kebab-case for utilities, PascalCase for components
  - Functions/Variables: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Interfaces/Types: PascalCase with descriptive names

#### Rust

- **Formatting**: `cargo fmt` (Rustfmt standard)
- **Linting**: `cargo clippy` with warnings as errors in CI
- **Naming Conventions**:
  - Modules: snake_case
  - Structs/Enums: PascalCase
  - Functions/Variables: snake_case
  - Constants: UPPER_SNAKE_CASE

### Architecture Patterns

#### Frontend Architecture

- **Feature-based folder structure**: Code organized by feature under `src/features/`
- **Component Structure**:
  - Shared UI components in `src/components/ui/`
  - Feature-specific components within feature folders
  - One component per file
- **State Management**:
  - Zustand stores for global state (located in `src/stores/`)
  - React hooks for local component state
  - Store files: `use[Feature]Store.ts` (e.g., `useGalleryStore.ts`)
- **API Integration**:
  - All backend calls via Tauri commands (invoke API)
  - Type-safe interfaces between frontend and backend

#### Backend Architecture (Rust/Tauri)

- **Command Pattern**: Tauri commands in `src-tauri/src/commands/`
- **Domain Models**: Structured data types in `src-tauri/src/models/`
- **Separation of Concerns**:
  - Commands handle communication with frontend
  - Business logic separated into dedicated modules
  - External API calls isolated and testable

#### Data Flow

1. User interaction in React components
2. Zustand store updates (if needed)
3. Tauri command invocation via `@tauri-apps/api`
4. Rust backend processing
5. Response back to frontend
6. UI update

### Testing Strategy

#### Frontend Testing

- **Unit Tests**: Vitest for utility functions and hooks
- **Component Tests**: React Testing Library for component behavior
- **Test Location**: Co-located with source files (e.g., `component.test.tsx`)
- **Commands**:
  - `pnpm test` - Run all tests
  - `pnpm test:watch` - Watch mode for development

#### Backend Testing

- **Unit Tests**: Rust's built-in test framework
- **Integration Tests**: In `src-tauri/tests/` directory
- **Commands**:
  - `cargo test` - Run all Rust tests
  - `cargo clippy` - Lint checks

#### CI/CD Testing

- Automated tests run on GitHub Actions for all PRs
- Frontend: ESLint, TypeScript check, Vitest
- Backend: Clippy, Rustfmt, Cargo test

### Git Workflow

#### Branching Strategy

- **Main branch**: `main` (or `master`) - production-ready code
- **Feature branches**: `feature/feature-name` - new features
- **Bugfix branches**: `bugfix/issue-description` - bug fixes
- **Release branches**: As needed for version tagging

#### Commit Conventions

- Use descriptive commit messages
- Recommended format: Conventional Commits
  - `feat: add image generation pause/resume`
  - `fix: resolve gallery loading issue`
  - `docs: update README with new features`
  - `chore: update dependencies`

#### Pre-commit Hooks

- **Husky** runs lint-staged on commit
- **JavaScript/TypeScript**: ESLint fix + Prettier format
- **Rust**: `cargo fmt` in `src-tauri/`
- **Other files** (JSON, MD, CSS): Prettier format

#### Pull Request Process

1. Create feature branch from main
2. Implement changes with tests
3. Ensure all CI checks pass
4. Submit PR with clear description
5. Code review and merge

## Domain Context

### AI Image Generation

- **Supported Providers**:
  - **Volcengine Doubao (Seedream)**: Supports 2K/4K resolutions
  - **OpenAI (DALL-E)**: Standard DALL-E resolutions
- **Generation Flow**:
  1. User enters prompt and selects settings
  2. Frontend sends request to Rust backend
  3. Backend makes API call to selected provider
  4. Response image saved locally to gallery
  5. UI updates to show new asset

### Asset Management

- **Storage**: All images stored locally in user's filesystem
- **Metadata**: Tracked via Tauri's persistent store
- **Gallery**: Grid view for browsing and managing generated images

### Local-First Architecture

- No external database dependencies
- All configuration and API keys stored locally using `tauri-plugin-store`
- User data never leaves the machine

## Important Constraints

### Technical Constraints

- **Minimum Rust Version**: 1.77.2 (enforced in Cargo.toml)
- **Node.js**: Recommended v20+
- **Browser**: No browser support - desktop-only application
- **Tauri v2 APIs**: Must use Tauri v2 patterns (differs from v1)

### Privacy Constraints

- **No telemetry**: No usage tracking or analytics
- **Local storage only**: All data remains on user's device
- **API keys**: Stored securely using Tauri's encrypted store

### Performance Constraints

- **Large Image Handling**: Must efficiently handle 4K images
- **Gallery Rendering**: Lazy loading for large asset collections
- **Async Operations**: Long-running operations must not block UI

### Platform Constraints

- **Cross-platform**: Must work on Windows, macOS, and Linux
- **File System Access**: Limited by Tauri's security model
- **Native Dependencies**: Must be compatible with Rust/Cargo ecosystem

## External Dependencies

### AI Image Generation APIs

- **Volcengine Doubao (Seedream)**
  - API endpoint: Volcengine cloud services
  - Authentication: API key-based
  - Rate limits: Per provider's policy
- **OpenAI DALL-E**
  - API endpoint: OpenAI platform
  - Authentication: API key-based
  - Rate limits: Per OpenAI's policy

### Development Services

- **GitHub Actions**: CI/CD pipeline for automated testing and builds
- **npm Registry**: Package dependencies via pnpm
- **crates.io**: Rust dependencies
