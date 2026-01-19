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

The system SHALL display an autocomplete menu showing available reference images.

#### Scenario: Menu shows all images initially

- **WHEN** the mention menu is triggered
- **THEN** all uploaded reference images are listed in the menu

#### Scenario: Menu positioned near cursor

- **WHEN** the mention menu appears
- **THEN** it is positioned below and aligned with the @ character

#### Scenario: Empty menu when no images

- **WHEN** the mention menu is triggered and no images are uploaded
- **THEN** a message indicates "No reference images uploaded" is shown

### Requirement: Mention Search Filtering

The system SHALL filter mention suggestions based on user input after @.

#### Scenario: User types after @

- **WHEN** the user types characters after @
- **THEN** the menu filters to show only images whose names contain the typed text

#### Scenario: No matches found

- **WHEN** the typed text matches no image names
- **THEN** the menu shows "No matches found"

#### Scenario: Case-insensitive search

- **WHEN** the user types text with different casing
- **THEN** the search matches image names case-insensitively

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
