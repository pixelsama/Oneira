## MODIFIED Requirements

### Requirement: Resource Image Management

The system SHALL allow managing images within a resource with editable display names.

#### Scenario: Upload images to resource

- **WHEN** the user is editing a resource
- **THEN** they can upload one or more images via file dialog or drag-and-drop
- **AND** each uploaded image is assigned an editable display name (initially the filename)

#### Scenario: Edit image display name in resource

- **WHEN** the user clicks the edit button on an image in the resource editor
- **THEN** the display name becomes editable
- **AND** the user can enter a new name and confirm

#### Scenario: Remove image from resource

- **WHEN** the user clicks remove on an image within the resource editor
- **THEN** the image is removed from the resource's image list

#### Scenario: Image count limit

- **WHEN** the resource contains the maximum allowed images (recommended: 5)
- **THEN** a warning is shown if attempting to add more

#### Scenario: Image displayed with thumbnail and name

- **WHEN** images are displayed in the resource editor
- **THEN** each image shows a thumbnail preview
- **AND** the editable display name is shown below the thumbnail

## ADDED Requirements

### Requirement: @Mention in Resource Prompt Template

The system SHALL support @mention for referencing images within the resource's prompt template.

#### Scenario: @ character triggers menu in resource editor

- **WHEN** the user types @ in the resource prompt template input
- **THEN** the @mention autocomplete menu is displayed
- **AND** the menu shows only images belonging to the current resource being edited

#### Scenario: Menu shows resource images only

- **WHEN** the @mention menu is triggered in the resource editor
- **THEN** only images uploaded to the current resource are listed
- **AND** global studio images are NOT shown (resources are self-contained)

#### Scenario: Image reference tag inserted in template

- **WHEN** the user selects an image from the @mention menu in the resource editor
- **THEN** a visual image reference tag is inserted at the cursor position
- **AND** the tag displays the image's display name with an icon

#### Scenario: Resource template with references persisted

- **WHEN** the user saves a resource containing @image references in the prompt template
- **THEN** the references are preserved in the stored prompt template
- **AND** re-editing the resource displays the reference tags correctly

#### Scenario: Keyboard navigation in resource @mention

- **WHEN** the @mention menu is open in the resource editor
- **THEN** arrow keys navigate the list
- **AND** Enter/Tab confirms selection
- **AND** Escape closes the menu

### Requirement: Duplicate Display Name Warning

The system SHALL warn users when multiple images in a resource share the same display name.

#### Scenario: Duplicate name detected

- **WHEN** two or more images in a resource have the same display name
- **THEN** a warning message is displayed in the resource editor
- **AND** the warning explains potential confusion during generation

#### Scenario: Duplicate warning does not block save

- **WHEN** a duplicate display name warning is shown
- **THEN** the user can still save the resource
- **AND** only a soft warning is displayed, not an error
