# prompt-mention-system Specification

## Purpose

TBD - created by archiving change add-reference-image-upload. Update Purpose after archive.

## Requirements

### Requirement: @ Mention Detection

The system SHALL detect when the user types the @ character in the prompt input.

#### Scenario: @ character triggers menu

- **WHEN** the user types @ in the prompt input
- **THEN** the mention autocomplete menu is displayed

#### Scenario: @ at start of prompt

- **WHEN** the user types @ at the beginning of the prompt
- **THEN** the mention menu appears with all available images

#### Scenario: @ in middle of text

- **WHEN** the user types @ after existing text
- **THEN** the mention menu appears at the cursor position

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

### Requirement: Keyboard Navigation in Mention Menu

The system SHALL support keyboard navigation within the mention menu.

#### Scenario: Arrow down selects next

- **WHEN** the user presses the down arrow key
- **THEN** the next image in the list is highlighted

#### Scenario: Arrow up selects previous

- **WHEN** the user presses the up arrow key
- **THEN** the previous image in the list is highlighted

#### Scenario: Enter confirms selection

- **WHEN** the user presses Enter
- **THEN** the highlighted image is inserted as a reference tag
- **AND** the mention menu is closed

#### Scenario: Tab quick-selects first

- **WHEN** the user presses Tab
- **THEN** the first image in the filtered list is inserted
- **AND** the mention menu is closed

#### Scenario: Escape cancels mention

- **WHEN** the user presses Escape
- **THEN** the mention menu is closed
- **AND** the @ character remains in the prompt as plain text

### Requirement: Image Reference Tag Insertion

The system SHALL insert visual image reference tags when an image is selected.

#### Scenario: Tag inserted at cursor

- **WHEN** an image is selected from the mention menu
- **THEN** a visual tag representing the image is inserted at the cursor position
- **AND** the @ character and search text are replaced

#### Scenario: Tag displays image name

- **WHEN** an image reference tag is rendered
- **THEN** the tag displays the image's display name with an icon

#### Scenario: Tag styled distinctly

- **WHEN** an image reference tag is rendered
- **THEN** it has a distinct visual style (purple background, rounded, badge-like)

### Requirement: Mixed Content Editing

The system SHALL support editing prompts containing both text and image reference tags.

#### Scenario: Cursor navigation around tags

- **WHEN** the user navigates with arrow keys
- **THEN** the cursor moves between text and tags naturally

#### Scenario: Backspace removes tag

- **WHEN** the user presses backspace with cursor after a tag
- **THEN** the entire tag is removed as a single unit

#### Scenario: Multiple tags in prompt

- **WHEN** multiple image references are inserted
- **THEN** all tags are displayed correctly alongside text

### Requirement: Prompt Content Serialization

The system SHALL serialize mixed prompt content for backend processing.

#### Scenario: Serialize text and image references

- **WHEN** the user generates an image with references in the prompt
- **THEN** the prompt is serialized with image references converted to descriptive text

#### Scenario: Format image references for API

- **WHEN** serializing the prompt
- **THEN** image reference tags are replaced with formatted text like "图片文件[Image Name]"

#### Scenario: Extract referenced image paths

- **WHEN** the prompt is serialized
- **THEN** a list of referenced image file paths is extracted for the backend

### Requirement: Mention Menu Mouse Interaction

The system SHALL support mouse-based interaction with the mention menu.

#### Scenario: Click selects image

- **WHEN** the user clicks an image in the mention menu
- **THEN** the image is inserted as a reference tag
- **AND** the mention menu is closed

#### Scenario: Hover highlights image

- **WHEN** the user hovers over an image in the menu
- **THEN** that image is highlighted

### Requirement: Tag Visual Feedback

The system SHALL provide visual distinction for image reference tags.

#### Scenario: Tag icon display

- **WHEN** an image reference tag is rendered
- **THEN** it includes a camera/image icon prefix

#### Scenario: Tag hover state

- **WHEN** the user hovers over an image reference tag
- **THEN** visual feedback indicates the tag is interactive

#### Scenario: Deleted image tag styling

- **WHEN** a referenced image has been deleted
- **THEN** the tag displays with an error or warning style
- **AND** includes an indicator that the image is missing

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
