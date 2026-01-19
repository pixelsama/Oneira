# image-upload-management Specification

## Purpose

TBD - created by archiving change add-reference-image-upload. Update Purpose after archive.

## Requirements

### Requirement: Reference Image Upload via File Dialog

The system SHALL allow users to upload reference images using a native OS file dialog.

#### Scenario: User opens file dialog

- **WHEN** the user clicks the upload area or upload button
- **THEN** a native file selection dialog opens

#### Scenario: User selects single image

- **WHEN** the user selects a single valid image file
- **THEN** the image is added to the reference images list with a generated UUID

#### Scenario: User selects multiple images

- **WHEN** the user selects multiple valid image files
- **THEN** all selected images are added to the reference images list with unique UUIDs

#### Scenario: User cancels file dialog

- **WHEN** the user cancels the file dialog without selecting files
- **THEN** no images are added and no error is shown

### Requirement: Image File Type Filtering

The system SHALL filter selectable files to supported image formats.

#### Scenario: File dialog shows only supported formats

- **WHEN** the file dialog is opened
- **THEN** only files with extensions jpg, jpeg, png, webp, and gif are selectable

#### Scenario: Unsupported format selected

- **WHEN** a user attempts to upload an unsupported file format
- **THEN** an error message is displayed indicating supported formats

### Requirement: Reference Image Display

The system SHALL display uploaded reference images as thumbnails with metadata.

#### Scenario: Image card shows thumbnail

- **WHEN** an image is successfully uploaded
- **THEN** a thumbnail preview (maximum 200x200 pixels) is displayed

#### Scenario: Image card shows display name

- **WHEN** an image is uploaded
- **THEN** the display name is shown (initially the original filename without extension)

#### Scenario: Multiple images displayed in grid

- **WHEN** multiple images are uploaded
- **THEN** all images are displayed in a responsive grid layout

### Requirement: Image Name Editing

The system SHALL allow users to rename uploaded reference images.

#### Scenario: User edits image name

- **WHEN** the user clicks the edit button on an image card
- **THEN** the display name becomes editable

#### Scenario: User saves new name

- **WHEN** the user enters a new name and confirms
- **THEN** the image display name is updated
- **AND** the image ID remains unchanged

#### Scenario: User cancels name edit

- **WHEN** the user cancels the name editing action
- **THEN** the original display name is retained

### Requirement: Image Deletion

The system SHALL allow users to remove uploaded reference images.

#### Scenario: User deletes single image

- **WHEN** the user clicks the delete button on an image card
- **THEN** the image is removed from the reference images list
- **AND** the image is no longer displayed

#### Scenario: Image references removed on deletion

- **WHEN** a referenced image is deleted
- **THEN** all mentions of that image in the prompt are removed or marked as invalid

### Requirement: Drag and Drop Upload

The system SHALL support drag-and-drop image upload.

#### Scenario: User drags files over upload area

- **WHEN** the user drags image files over the upload zone
- **THEN** visual feedback indicates the drop zone is active

#### Scenario: User drops valid images

- **WHEN** the user drops valid image files onto the upload zone
- **THEN** the images are added to the reference images list

#### Scenario: User drops invalid files

- **WHEN** the user drops non-image files
- **THEN** an error message indicates only images are supported

### Requirement: Image Metadata Persistence

The system SHALL maintain image metadata during the session.

#### Scenario: Image data retained in state

- **WHEN** images are uploaded
- **THEN** each image's ID, path, display name, original filename, and upload timestamp are stored

#### Scenario: Thumbnail generation

- **WHEN** an image is uploaded
- **THEN** a Base64-encoded thumbnail is generated for preview purposes

#### Scenario: Session-only storage

- **WHEN** the application is closed
- **THEN** uploaded images are cleared (not persisted across sessions in this version)
