## MODIFIED Requirements

### Requirement: Mention Menu Display

The system SHALL display an autocomplete menu showing available reference images AND resources.

#### Scenario: Menu shows all images and resources initially

- **WHEN** the mention menu is triggered
- **THEN** all uploaded reference images are listed in the menu
- **AND** all saved resources are listed in the menu

#### Scenario: Menu positioned near cursor

- **WHEN** the mention menu appears
- **THEN** it is positioned below and aligned with the @ character

#### Scenario: Empty menu when no items

- **WHEN** the mention menu is triggered and no images or resources exist
- **THEN** a message indicates "No images or resources available" is shown

#### Scenario: Visual distinction between types

- **WHEN** images and resources are displayed in the menu
- **THEN** images are shown with a camera icon (📷) and purple accent
- **AND** resources are shown with a package icon (📦) and blue accent

#### Scenario: Resource item metadata display

- **WHEN** a resource is displayed in the menu
- **THEN** the resource name is shown
- **AND** the number of images in the resource is displayed
- **AND** a preview of the prompt template is shown (truncated)

### Requirement: Mention Search Filtering

The system SHALL filter mention suggestions based on user input after @, searching both images and resources.

#### Scenario: User types after @

- **WHEN** the user types characters after @
- **THEN** the menu filters to show only items (images or resources) whose names contain the typed text

#### Scenario: No matches found

- **WHEN** the typed text matches no image or resource names
- **THEN** the menu shows "No matches found"

#### Scenario: Case-insensitive search

- **WHEN** the user types text with different casing
- **THEN** the search matches item names case-insensitively

## ADDED Requirements

### Requirement: Resource Reference Tag Insertion

The system SHALL insert visual resource reference tags when a resource is selected from the mention menu.

#### Scenario: Resource tag inserted at cursor

- **WHEN** a resource is selected from the mention menu
- **THEN** a visual tag representing the resource is inserted at the cursor position
- **AND** the @ character and search text are replaced

#### Scenario: Resource tag displays resource name

- **WHEN** a resource reference tag is rendered
- **THEN** the tag displays the resource's name with a package icon (📦)

#### Scenario: Resource tag styled distinctly from image tags

- **WHEN** a resource reference tag is rendered
- **THEN** it has a blue color scheme (blue background, blue border)
- **AND** it is visually distinct from image reference tags (which are purple)

#### Scenario: Resource tag is atomic

- **WHEN** the user presses backspace with cursor after a resource tag
- **THEN** the entire resource tag is removed as a single unit

### Requirement: Resource Reference Serialization

The system SHALL expand resource references during prompt serialization for backend processing.

#### Scenario: Serialize resource reference to prompt text

- **WHEN** the user generates an image with resource references in the prompt
- **THEN** the resource's prompt template is embedded into the serialized prompt at the reference location

#### Scenario: Extract resource image paths

- **WHEN** the prompt is serialized
- **THEN** all images from referenced resources are included in the reference_images list

#### Scenario: Multiple resources expanded

- **WHEN** multiple resource references exist in the prompt
- **THEN** each resource's prompt template is embedded at its respective location
- **AND** all images from all referenced resources are collected

#### Scenario: Deleted resource handling

- **WHEN** a referenced resource no longer exists
- **THEN** the tag displays with a warning style indicating "Unknown Resource"
- **AND** the resource is skipped during serialization (no content injected)

### Requirement: Mixed Image and Resource Content

The system SHALL support prompts containing both image references and resource references.

#### Scenario: Both types in single prompt

- **WHEN** a prompt contains both image references and resource references
- **THEN** all tags are displayed correctly with appropriate styling
- **AND** both types are serialized correctly during generation

#### Scenario: Order preserved

- **WHEN** multiple references (images and resources) are inserted
- **THEN** their order in the prompt is maintained during serialization
