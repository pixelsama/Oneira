## ADDED Requirements

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
