# resource-management Specification

## Purpose

TBD - created by archiving change add-resource-mention-system. Update Purpose after archive.

## Requirements

### Requirement: Resource Data Model

The system SHALL store resources with a defined data structure.

#### Scenario: Resource structure

- **WHEN** a resource is created
- **THEN** it contains an id, name, optional description, prompt template, images array, and timestamps

#### Scenario: Resource persistence

- **WHEN** a resource is created or modified
- **THEN** the changes are persisted to local storage via the backend

### Requirement: Resource Creation

The system SHALL allow users to create new resources with images and prompt templates.

#### Scenario: User creates new resource

- **WHEN** the user clicks "New Resource" in the Resource Library
- **THEN** a resource editor dialog is displayed
- **AND** the user can enter a name, description, prompt template, and upload images

#### Scenario: Resource saved successfully

- **WHEN** the user saves a valid resource (with name and at least prompt or images)
- **THEN** the resource is persisted
- **AND** a success notification is shown
- **AND** the resource appears in the resource list

#### Scenario: Required fields validation

- **WHEN** the user attempts to save a resource without a name
- **THEN** the save is prevented
- **AND** an error message indicates the name is required

### Requirement: Resource Editing

The system SHALL allow users to edit existing resources.

#### Scenario: User opens resource for editing

- **WHEN** the user clicks the edit button on a resource card
- **THEN** the resource editor dialog opens with the resource's current data pre-filled

#### Scenario: User updates resource

- **WHEN** the user modifies resource fields and saves
- **THEN** the resource is updated in storage
- **AND** a success notification is shown

#### Scenario: Resource update reflected immediately

- **WHEN** a resource is updated
- **THEN** any open @ mention menu shows the updated resource name

### Requirement: Resource Deletion

The system SHALL allow users to delete resources.

#### Scenario: User deletes resource

- **WHEN** the user clicks the delete button on a resource card
- **THEN** a confirmation dialog is shown

#### Scenario: Deletion confirmed

- **WHEN** the user confirms deletion
- **THEN** the resource is removed from storage
- **AND** a success notification is shown
- **AND** the resource is removed from the resource list

### Requirement: Resource Listing

The system SHALL display all resources in the Resource Library.

#### Scenario: Resources displayed in grid/list

- **WHEN** the user navigates to the Resource Library
- **THEN** all saved resources are displayed

#### Scenario: Resource card content

- **WHEN** a resource is displayed
- **THEN** the card shows the resource name
- **AND** shows a preview of the prompt template (truncated if long)
- **AND** shows thumbnails of associated images

#### Scenario: Loading state

- **WHEN** resources are being loaded
- **THEN** a loading indicator is displayed

#### Scenario: Empty state

- **WHEN** no resources exist
- **THEN** an empty state message is shown with guidance to create a resource

### Requirement: Resource Image Management

The system SHALL allow managing images within a resource.

#### Scenario: Upload images to resource

- **WHEN** the user is editing a resource
- **THEN** they can upload one or more images via file dialog or drag-and-drop

#### Scenario: Remove image from resource

- **WHEN** the user clicks remove on an image within the resource editor
- **THEN** the image is removed from the resource's image list

#### Scenario: Image count limit

- **WHEN** the resource contains the maximum allowed images (recommended: 5)
- **THEN** a warning is shown if attempting to add more

### Requirement: Resource Store Accessors

The system SHALL provide methods to access resources by ID or name.

#### Scenario: Get resource by ID

- **WHEN** calling getResourceById with a valid ID
- **THEN** the corresponding resource is returned

#### Scenario: Get resource by name

- **WHEN** calling getResourceByName with a valid name
- **THEN** the corresponding resource is returned

#### Scenario: Resource not found

- **WHEN** calling getResourceById or getResourceByName with invalid parameters
- **THEN** undefined is returned

### Requirement: Resource Card UI Enhancement

The system SHALL display resource cards with enhanced visual information.

#### Scenario: Card displays prompt preview with tooltip

- **WHEN** a resource card is displayed
- **THEN** the prompt template is shown truncated (2-3 lines max)
- **AND** hovering over the prompt area shows the full text in a tooltip

#### Scenario: Card displays image thumbnail grid

- **WHEN** a resource card is displayed with images
- **THEN** up to 4 image thumbnails are shown in a grid
- **AND** if more than 4 images exist, a "+N" indicator is shown

#### Scenario: Copy prompt to clipboard

- **WHEN** the user clicks the copy button on a resource card
- **THEN** the prompt template is copied to clipboard
- **AND** a success toast notification is shown

### Requirement: Image Path Validation

The system SHALL validate image paths and handle missing files gracefully.

#### Scenario: Display placeholder for missing images

- **WHEN** a resource references an image file that no longer exists
- **THEN** a placeholder image is displayed instead
- **AND** the placeholder indicates the image is missing

#### Scenario: Skip invalid paths during generation

- **WHEN** generating with a resource that has invalid image paths
- **THEN** invalid paths are skipped
- **AND** a warning is logged to the console
- **AND** generation proceeds with valid images only

#### Scenario: Handle resource with all invalid images

- **WHEN** all images in a resource are invalid
- **THEN** only the prompt template is injected during generation
- **AND** no images are sent to the API

### Requirement: Resource Image Count Limit

The system SHALL provide guidance on recommended image counts per resource.

#### Scenario: Soft limit warning

- **WHEN** a resource contains more than the recommended number of images (5)
- **THEN** a warning is displayed in the resource editor
- **AND** the warning explains the performance implications

#### Scenario: Image count display

- **WHEN** editing a resource
- **THEN** the current image count is displayed (e.g., "3 / 5 images")
- **AND** the count indicator shows warning styling when limit is exceeded

#### Scenario: No hard block

- **WHEN** the user attempts to add images beyond the soft limit
- **THEN** the images are still allowed to be added
- **AND** only a warning is shown, not an error

### Requirement: Resource Editor Live Preview

The system SHALL provide a live preview of the resource card while editing.

#### Scenario: Preview updates in real-time

- **WHEN** the user edits resource fields (name, description, prompt)
- **THEN** the preview area updates immediately to reflect changes

#### Scenario: Preview shows uploaded images

- **WHEN** images are added to the resource
- **THEN** the preview shows the image thumbnails as they would appear in the card

### Requirement: Resource Image Reordering

The system SHALL allow users to reorder images within a resource.

#### Scenario: Drag to reorder

- **WHEN** the user drags an image to a new position in the resource editor
- **THEN** the image order is updated accordingly

#### Scenario: Order persisted on save

- **WHEN** the user saves a resource after reordering images
- **THEN** the new image order is persisted
