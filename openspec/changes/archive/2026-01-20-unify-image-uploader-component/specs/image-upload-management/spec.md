## MODIFIED Requirements

### Requirement: Drag and Drop Upload

The system SHALL support drag-and-drop image upload in all image upload contexts (Creative Studio and Resource Editor) using Tauri-native events.

#### Scenario: User drags files over upload area in Creative Studio

- **WHEN** the user drags image files over the upload zone in Creative Studio
- **THEN** visual feedback indicates the drop zone is active (purple border, semi-transparent background)

#### Scenario: User drags files over upload area in Resource Editor

- **WHEN** the user drags image files over the upload zone in Resource Editor
- **THEN** visual feedback indicates the drop zone is active (purple border, semi-transparent background)

#### Scenario: User drops valid images in Creative Studio

- **WHEN** the user drops valid image files onto the Creative Studio upload zone
- **THEN** the images are added to the reference images list with generated UUIDs and thumbnails

#### Scenario: User drops valid images in Resource Editor

- **WHEN** the user drops valid image files onto the Resource Editor upload zone
- **THEN** the images are added to the resource's image paths array

#### Scenario: User drops invalid files

- **WHEN** the user drops non-image files
- **THEN** an error message indicates only images are supported

## ADDED Requirements

### Requirement: Unified Image Upload Component

The system SHALL provide a single reusable image upload component used across all upload contexts.

#### Scenario: Component renders drop zone UI

- **WHEN** the SharedImageUploader component is rendered
- **THEN** a dashed-border drop zone with upload icon and instructional text is displayed

#### Scenario: Component indicates loading state

- **WHEN** images are being processed after selection or drop
- **THEN** a spinner icon replaces the upload icon
- **AND** processing text is displayed

#### Scenario: Component indicates dragging state

- **WHEN** files are dragged over the drop zone
- **THEN** the border color changes to accent color
- **AND** background opacity increases

#### Scenario: Component supports controlled mode

- **WHEN** the component receives imagePaths and onImagesChange props
- **THEN** the component displays and modifies images according to external state

### Requirement: Shared Image Processing Utilities

The system SHALL provide shared utility functions for image processing reusable across components.

#### Scenario: Thumbnail generation utility

- **WHEN** generateThumbnail is called with a file path and MIME type
- **THEN** a Base64-encoded data URL of the resized image (max 200x200) is returned

#### Scenario: MIME type detection utility

- **WHEN** getMimeType is called with a file extension
- **THEN** the corresponding MIME type string is returned (e.g., "image/jpeg" for "jpg")

#### Scenario: Fallback for invalid image

- **WHEN** thumbnail generation fails
- **THEN** an empty string is returned without throwing an error
