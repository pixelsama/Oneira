## Purpose

Manage reusable resource assets that combine reference images with prompt templates. Resources can be created, edited, deleted, and referenced in the Creative Studio prompt input.

## ADDED Requirements

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
