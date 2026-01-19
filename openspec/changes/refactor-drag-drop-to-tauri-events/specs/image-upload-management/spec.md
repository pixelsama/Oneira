# image-upload-management Spec Delta

## MODIFIED Requirements

### Requirement: Drag and Drop Upload

The system SHALL support drag-and-drop image upload using Tauri native window events.

#### Scenario: User drags files over application window

- **WHEN** the user drags image files over the application window
- **THEN** visual feedback indicates the drop zone is active

#### Scenario: User drops valid images

- **WHEN** the user drops valid image files onto the application window
- **THEN** the images are added to the reference images list
- **AND** file paths are reliably obtained via Tauri's native drag-drop event

#### Scenario: User drops invalid files

- **WHEN** the user drops non-image files
- **THEN** an error message indicates only images are supported

#### Scenario: User drags files away from window

- **WHEN** the user drags files away from the application window without dropping
- **THEN** the visual feedback returns to the default state
