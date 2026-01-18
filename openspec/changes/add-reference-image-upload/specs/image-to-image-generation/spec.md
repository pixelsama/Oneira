## ADDED Requirements

### Requirement: Reference Image Parameter Support

The system SHALL accept reference image paths as part of the generation payload.

#### Scenario: Payload includes reference images

- **WHEN** the frontend sends a generation request with reference images
- **THEN** the backend accepts an optional `reference_images` field containing file paths

#### Scenario: Payload without reference images

- **WHEN** the frontend sends a generation request without reference images
- **THEN** the backend processes it as a text-to-image request (existing behavior)

#### Scenario: Empty reference images array

- **WHEN** the `reference_images` field is an empty array
- **THEN** the backend treats it as a text-to-image request

### Requirement: Image File Validation

The system SHALL validate reference image files before processing.

#### Scenario: Validate file existence

- **WHEN** a reference image path is provided
- **THEN** the backend verifies the file exists at the specified path
- **AND** returns an error if the file is not found

#### Scenario: Validate file size

- **WHEN** processing a reference image
- **THEN** the backend verifies the file size is less than 10 MB
- **AND** returns an error if the file exceeds the limit

#### Scenario: Validate total request size

- **WHEN** multiple reference images are provided
- **THEN** the backend estimates the total Base64-encoded size
- **AND** returns an error if it would exceed 64 MB

#### Scenario: Validate file format

- **WHEN** processing a reference image
- **THEN** the backend verifies the file extension is jpg, jpeg, png, webp, or gif
- **AND** returns an error for unsupported formats

### Requirement: Image MIME Type Detection

The system SHALL determine the correct MIME type for each image file.

#### Scenario: JPEG files

- **WHEN** the file extension is .jpg or .jpeg
- **THEN** the MIME type is set to "image/jpeg"

#### Scenario: PNG files

- **WHEN** the file extension is .png
- **THEN** the MIME type is set to "image/png"

#### Scenario: WebP files

- **WHEN** the file extension is .webp
- **THEN** the MIME type is set to "image/webp"

#### Scenario: GIF files

- **WHEN** the file extension is .gif
- **THEN** the MIME type is set to "image/gif"

### Requirement: Base64 Encoding

The system SHALL encode reference images as Base64 Data URIs.

#### Scenario: Read and encode image

- **WHEN** processing a reference image
- **THEN** the file bytes are read from disk
- **AND** encoded using standard Base64 encoding

#### Scenario: Format as Data URI

- **WHEN** an image is encoded
- **THEN** it is formatted as `data:{mime_type};base64,{base64_data}`

#### Scenario: Encoding error handling

- **WHEN** file reading or encoding fails
- **THEN** a descriptive error is returned to the frontend

### Requirement: Doubao API Image Parameter Formatting

The system SHALL format image parameters according to Doubao API requirements.

#### Scenario: Single reference image

- **WHEN** exactly one reference image is provided
- **THEN** the `image` field is set to a single Data URI string

#### Scenario: Multiple reference images

- **WHEN** more than one reference image is provided
- **THEN** the `image` field is set to an array of Data URI strings

#### Scenario: Preserve other parameters

- **WHEN** reference images are included
- **THEN** all other generation parameters (prompt, size, model, etc.) are preserved

### Requirement: Sequential Generation Parameter

The system SHALL set the appropriate sequential generation parameter based on image count and output count.

#### Scenario: Single image input, single output

- **WHEN** one reference image and count=1
- **THEN** `sequential_image_generation` is set to "disabled"

#### Scenario: Single image input, multiple outputs

- **WHEN** one reference image and count>1
- **THEN** `sequential_image_generation` is set to "auto"

#### Scenario: Multiple image input, single output

- **WHEN** multiple reference images and count=1
- **THEN** `sequential_image_generation` is set to "disabled"

#### Scenario: Multiple image input, multiple outputs

- **WHEN** multiple reference images and count>1
- **THEN** `sequential_image_generation` is set to "auto"

### Requirement: Error Handling for Image Processing

The system SHALL provide descriptive error messages for image processing failures.

#### Scenario: File not found error

- **WHEN** a reference image file doesn't exist
- **THEN** an error message includes the specific file path that wasn't found

#### Scenario: File too large error

- **WHEN** an image exceeds the 10 MB limit
- **THEN** an error message includes the file size in MB and the path

#### Scenario: Unsupported format error

- **WHEN** an unsupported image format is encountered
- **THEN** an error message lists the supported formats (jpg, png, webp, gif)

#### Scenario: Total size exceeded error

- **WHEN** the total encoded size would exceed 64 MB
- **THEN** an error message indicates the request is too large
- **AND** suggests reducing the number or size of images

### Requirement: Doubao API Response Handling

The system SHALL handle image-to-image generation responses identically to text-to-image.

#### Scenario: Successful generation with reference images

- **WHEN** the Doubao API returns successfully
- **THEN** the generated images are saved to the gallery
- **AND** metadata includes the prompt (but not the reference image data)

#### Scenario: API error with reference images

- **WHEN** the Doubao API returns an error for an image-to-image request
- **THEN** the error is propagated to the frontend with full details

### Requirement: OpenAI DALL-E Incompatibility

The system SHALL not support reference images for the OpenAI provider in this version.

#### Scenario: OpenAI with reference images

- **WHEN** reference images are provided with provider set to OpenAI
- **THEN** an error message indicates image-to-image is only supported for Doubao
- **AND** suggests switching to the Doubao provider
