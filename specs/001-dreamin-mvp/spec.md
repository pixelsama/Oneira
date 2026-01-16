# Feature Specification: DreamIn MVP (Core Features)

**Feature Branch**: `001-dreamin-mvp`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "入梦 (DreamIn) - 本地轻量化 AI 绘图客户端... 核心功能包括“创作工坊”、“资产管理”和“资源库”三大模块..."

## User Scenarios & Testing

### User Story 1 - Creative Studio Generation (Priority: P1)

Users can generate images using Text-to-Image or Image-to-Image modes, with results automatically saved to the local disk.

**Why this priority**: This is the fundamental value proposition of the application; without generation, other features are useless.

**Independent Test**: Can be tested by configuring a valid API token, entering a prompt, and verifying a new image file appears in the local output folder.

**Acceptance Scenarios**:

1. **Given** the application is open and a valid API configuration exists, **When** the user enters a prompt and clicks "Generate", **Then** the system requests an image from the API and displays the result.
2. **Given** a generated image is returned, **When** the process completes, **Then** the image is automatically saved to the local file system without user intervention.
3. **Given** Image-to-Image mode, **When** the user uploads a reference image and enters a prompt, **Then** the system includes the image in the API request.
4. **Given** the settings panel, **When** the user adjusts resolution or batch size, **Then** subsequent requests use these parameters.

---

### User Story 2 - Resource Library Management (Priority: P1)

Users can manage a library of "Resources" (reusable assets), where each resource consists of reference images and a prompt template.

**Why this priority**: This is the "core unique feature" defined by the user, differentiating the workflow from standard clients.

**Independent Test**: Can be tested by creating a new resource with a dummy image and text, then verifying it appears in the list and can be edited/deleted.

**Acceptance Scenarios**:

1. **Given** the Resource Library, **When** the user creates a new resource, **Then** they can upload reference images (e.g., character sheets) and define a prompt (e.g., feature descriptions).
2. **Given** an existing resource, **When** the user edits it, **Then** changes to the images or prompt are persisted.
3. **Given** an existing resource, **When** the user deletes it, **Then** it is removed from the library.

---

### User Story 3 - Resource Injection (Priority: P1)

Users can load a saved Resource into the Creative Studio to instantly set up the generation context.

**Why this priority**: Connects the Resource Library to the Creative Studio, completing the core efficiency loop.

**Independent Test**: Can be tested by loading a saved resource and verifying the Studio's input fields (prompt text and reference image area) are populated correctly.

**Acceptance Scenarios**:

1. **Given** a saved resource with images and text, **When** the user clicks "Load" on the resource, **Then** the resource's images are populated into the Studio's Image-to-Image upload area.
2. **Given** a saved resource, **When** loaded, **Then** the resource's prompt text is appended to or replaces the current Studio prompt input.

---

### User Story 4 - Assets Gallery & External Viewing (Priority: P2)

Users can browse their history of generated images and open them in their operating system's default viewer.

**Why this priority**: Essential for managing outputs, but generation and resource management are the primary creation workflows.

**Independent Test**: Can be tested by generating images (or manually placing images in the output folder) and verifying they appear in the grid and open externally.

**Acceptance Scenarios**:

1. **Given** the Assets Gallery, **When** opened, **Then** it displays a grid of all locally saved generated images.
2. **Given** an image in the gallery, **When** clicked, **Then** the file opens in the OS default image viewer (e.g., Preview on macOS, Photos on Windows) instead of an in-app modal.

### Edge Cases

- **Network Failure**: Handling API timeouts or connectivity loss during generation.
- **Invalid Token**: API returns 401/403 errors due to bad token.
- **Empty Resource**: Attempting to load a resource that has missing files (deleted externally).
- **FileSystem Permissions**: Failure to write auto-save images due to permission issues.

## Requirements

### Functional Requirements

#### Creative Studio
- **FR-001**: System MUST provide a text input area for generation prompts.
- **FR-002**: System MUST allow uploading/selecting a reference image for Image-to-Image generation.
- **FR-003**: System MUST provide configuration for API parameters (Resolution, Batch Size).
- **FR-004**: System MUST automatically save every successfully generated image to a local directory.
- **FR-005**: System MUST handle network errors and API errors (e.g., Invalid Token) with user-friendly messages.

#### Resource Library
- **FR-006**: System MUST allow users to define a "Resource" consisting of 1+ images and a text prompt.
- **FR-007**: System MUST provide CRUD (Create, Read, Update, Delete) operations for Resources.
- **FR-008**: System MUST persist Resource data locally.
- **FR-009**: System MUST allow "injecting" a Resource into the Creative Studio, populating the reference image and prompt inputs.

#### Assets Gallery
- **FR-010**: System MUST display a chronological grid of generated images from the local storage.
- **FR-011**: System MUST trigger the operating system's default file handler to open an image when clicked.

#### Security & Architecture (from Constitution)
- **FR-012**: System MUST store API Tokens using secure system storage (e.g., Keychain/Stronghold), NEVER in plaintext.
- **FR-013**: System MUST NOT send API Tokens to any server other than the AI Provider.
- **FR-014**: System MUST use HTTPS for all API communication.

### Assumptions & Dependencies

- **AI Provider**: The user possesses a valid API Key for a supported AI service provider.
- **Operating System**: The host OS has a configured default application for viewing image files (PNG/JPG).
- **Disk Space**: The user has sufficient local disk space to store generated assets.
- **Network**: An active internet connection is available for API calls.

### Key Entities

- **Resource**: A user-defined template containing:
    - `id`: Unique identifier
    - `name`: Display name
    - `images`: List of file paths to reference images
    - `prompt_template`: The text description associated with the assets
- **GeneratedImage**: An asset produced by the system:
    - `path`: Local file path
    - `timestamp`: Creation time
    - `metadata`: Generation params (prompt, seed, model) - *recommended for future proofing*
- **Settings**:
    - `api_endpoint`: URL of the AI service
    - `api_token`: Securely stored credential
    - `output_path`: Directory for auto-saves

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete a "Load Resource -> Generate" workflow in under 10 seconds (excluding API latency).
- **SC-002**: 100% of successfully generated images are persisted to disk even if the app crashes immediately after.
- **SC-003**: Clicking a gallery image launches the external viewer in under 2 seconds.
- **SC-004**: Resource Library supports managing at least 100 resources without UI lag.