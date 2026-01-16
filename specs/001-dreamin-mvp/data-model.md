# Data Model

**Feature**: DreamIn MVP

## Entities

### 1. Resource (Resource Library)
*Stored in `resources.json`*

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | `string` (UUID) | Unique identifier | Required, unique |
| `name` | `string` | Display name of the resource | Required, max 50 chars |
| `description` | `string` | Optional description | Max 200 chars |
| `prompt_template` | `string` | The prompt text to inject | Required, max 2000 chars |
| `images` | `string[]` | List of relative file paths to reference images | Max 5 images |
| `created_at` | `number` (Timestamp) | Creation date | Required |
| `updated_at` | `number` (Timestamp) | Last modification date | Required |

### 2. GeneratedImage (Assets Gallery)
*Derived from file system scan of output directory*

| Field | Type | Description |
|-------|------|-------------|
| `filename` | `string` | Name of the file (e.g., `img_12345.png`) |
| `path` | `string` | Full system path |
| `created_at` | `number` | File creation timestamp |
| `metadata` | `object?` | Optional metadata parsed from file (if supported) |

### 3. AppSettings (Configuration)
*Stored via `tauri-plugin-store`*

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `api_url` | `string` | AI Service Endpoint | "https://api.openai.com/v1/images/generations" |
| `output_dir` | `string` | Custom output directory path | `~/Documents/DreamIn/Outputs` |
| `theme` | `string` | UI Theme | "system" |

### 4. GenerationRequest (Transient)
*Passed from Frontend to Rust Backend*

| Field | Type | Description |
|-------|------|-------------|
| `prompt` | `string` | Positive prompt |
| `negative_prompt` | `string?` | Optional negative prompt |
| `width` | `number` | Image width |
| `height` | `number` | Image height |
| `batch_size` | `number` | Number of images to generate |
| `ref_images` | `string[]?` | Paths to reference images (for Img2Img) |

## State Transitions

### Resource Lifecycle
1. **Created**: User saves current inputs as a Resource.
2. **Updated**: User modifies prompt or images of a Resource.
3. **Loaded**: Resource data is copied into the Active Generation State.
4. **Deleted**: Resource is removed from JSON; associated images are deleted from disk (optional/prompt).

### Generation Lifecycle
1. **Idle**: Waiting for user input.
2. **Generating**: Request sent to Rust backend -> API. UI shows loading spinner.
3. **Success**: Image received, saved to disk, added to Gallery view.
4. **Error**: API failure or network error. UI shows error toast.

## Persistence Schema (JSON)

```json
// resources.json
{
  "version": 1,
  "resources": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Cyberpunk Character",
      "description": "Base template for neon city characters",
      "prompt_template": "cyberpunk style, neon lights, high tech armor...",
      "images": ["resources/img_a.png", "resources/img_b.png"],
      "created_at": 1705421234567,
      "updated_at": 1705421234567
    }
  ]
}
```
