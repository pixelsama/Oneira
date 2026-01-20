# Tauri Command Interface (Rust Backend <-> Frontend)

This defines the interface for `tauri::command` functions.

## 1. Generation Module (`commands::generate`)

### `generate_image`

Initiates the AI generation process.

- **Input** (`GeneratePayload`):
  ```rust
  struct GeneratePayload {
      prompt: String,
      negative_prompt: Option<String>,
      width: u32,
      height: u32,
      count: u32,
      reference_images: Option<Vec<String>>, // Paths
  }
  ```
- **Output**: `Result<Vec<String>, String>`
  - Success: List of absolute file paths to the saved images.
  - Error: Error message string.

## 2. Resource Library Module (`commands::resources`)

### `create_resource`

Saves a new resource metadata and copies referenced images to the resource storage folder.

- **Input**:
  ```rust
  struct CreateResourcePayload {
      name: String,
      description: Option<String>,
      prompt: String,
      image_paths: Vec<String>, // Source paths to copy from
  }
  ```
- **Output**: `Result<Resource, String>` (The created resource object)

### `update_resource`

Updates an existing resource.

- **Input**:
  ```rust
  struct UpdateResourcePayload {
      id: String,
      name: Option<String>,
      prompt: Option<String>,
      // ... fields to update
  }
  ```
- **Output**: `Result<Resource, String>`

### `delete_resource`

Removes a resource and its exclusive files.

- **Input**: `id: String`
- **Output**: `Result<(), String>`

### `list_resources`

Retrieves all resources.

- **Input**: `()`
- **Output**: `Result<Vec<Resource>, String>`

## 3. Gallery Module (`commands::gallery`)

### `list_gallery_images`

Scans the output directory for images.

- **Input**: `()`
- **Output**: `Result<Vec<GeneratedImage>, String>`

### `open_image_in_viewer`

Opens a file in the OS default viewer.

- **Input**: `path: String`
- **Output**: `Result<(), String>`

## 4. Settings Module (`commands::settings`)

### `set_api_token`

Securely saves the API token.

- **Input**: `token: String`
- **Output**: `Result<(), String>` (Stored in Keychain/Stronghold)

### `get_api_token`

Retrieves the token (only for backend use ideally, but may be needed for validation).

- **Input**: `()`
- **Output**: `Result<String, String>`
