## MODIFIED Requirements

### Requirement: Prompt Content Serialization

The system SHALL serialize mixed prompt content for backend processing using prefixed image names for uniqueness.

#### Scenario: Serialize text and image references

- **WHEN** the user generates an image with references in the prompt
- **THEN** the prompt is serialized with image references converted to descriptive text

#### Scenario: Format image references for API with prefix

- **WHEN** serializing the prompt
- **THEN** image reference tags are replaced with formatted text using the image's prefixed name
- **AND** the format is `图片文件[{prefixedName}]` (e.g., `图片文件[s_a1b2_portrait]`)
- **AND** this ensures unique identification even when multiple images share the same display name

#### Scenario: Extract referenced image paths

- **WHEN** the prompt is serialized
- **THEN** a list of referenced image file paths is extracted for the backend

## ADDED Requirements

### Requirement: Reusable @Mention Editor Logic

The system SHALL provide reusable @mention editing logic for use in multiple contexts.

#### Scenario: Shared logic used in Creative Studio

- **WHEN** the Creative Studio prompt input needs @mention functionality
- **THEN** it uses the shared @mention editor logic
- **AND** the logic handles @ detection, menu display, filtering, and tag insertion

#### Scenario: Shared logic used in Resource Editor

- **WHEN** the Resource Editor prompt template input needs @mention functionality
- **THEN** it uses the same shared @mention editor logic
- **AND** the logic is configured with the appropriate image source (resource images only)

#### Scenario: Context-specific image filtering

- **WHEN** the @mention menu is displayed
- **THEN** the available images are filtered based on context:
  - Creative Studio: shows all session images AND all resources
  - Resource Editor: shows only the current resource's images
