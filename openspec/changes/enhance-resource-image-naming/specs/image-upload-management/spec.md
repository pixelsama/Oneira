## MODIFIED Requirements

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

#### Scenario: Image metadata includes source tracking

- **WHEN** an image is uploaded
- **THEN** the image metadata includes a source field indicating origin ('studio' or 'resource')
- **AND** if the source is 'resource', a resourceId field is populated

## ADDED Requirements

### Requirement: Image Prefix Naming

The system SHALL generate unique prefixed names for images to prevent name collisions across sources.

#### Scenario: Studio image prefix generation

- **WHEN** an image is uploaded in the Creative Studio
- **THEN** the system generates a prefixed name in the format `s_{shortId}_{displayName}`
- **AND** the shortId is a 4-6 character unique identifier
- **AND** the prefixed name is used internally for API calls

#### Scenario: Resource image prefix generation

- **WHEN** an image belongs to a resource
- **THEN** the system generates a prefixed name in the format `r_{resourceIdPrefix}_{displayName}`
- **AND** the resourceIdPrefix is the first 6 characters of the resource's UUID
- **AND** the prefixed name is used internally for API calls

#### Scenario: User sees only display name

- **WHEN** an image is displayed in the UI (Studio, Resource Editor, @mention menu)
- **THEN** only the user-friendly displayName is shown
- **AND** the prefixed name is never visible to the user

#### Scenario: Prefixed name used in API

- **WHEN** the prompt is serialized for image generation
- **THEN** image references use the prefixed name format (e.g., `图片文件[s_a1b2_portrait]`)
- **AND** this ensures the AI model can distinguish images from different sources
