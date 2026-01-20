use crate::models::GeneratePayload;
use base64::prelude::*;
use reqwest::Client;
use serde_json::json;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn generate_image(
    app: AppHandle,
    payload: GeneratePayload,
) -> Result<Vec<String>, String> {
    // 1. Get Settings
    let store = app.store("settings.json").map_err(|e| e.to_string())?;

    let provider = store
        .get("provider")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .unwrap_or_else(|| "doubao".to_string());

    let output_dir_str = store
        .get("output_dir")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .unwrap_or("Oneiria/Outputs".to_string());

    // 2. Resolve Output Path
    let output_path = if output_dir_str.starts_with('/') {
        PathBuf::from(output_dir_str)
    } else {
        app.path()
            .document_dir()
            .map_err(|e| e.to_string())?
            .join(output_dir_str)
    };

    if !output_path.exists() {
        fs::create_dir_all(&output_path).map_err(|e| e.to_string())?;
    }

    let client = Client::new();

    match provider.as_str() {
        "zhipu" => generate_zhipu(&store, &client, &output_path, payload).await,
        _ => generate_doubao(&store, &client, &output_path, payload).await,
    }
}

async fn generate_doubao(
    store: &tauri_plugin_store::Store<tauri::Wry>,
    client: &Client,
    output_path: &Path,
    payload: GeneratePayload,
) -> Result<Vec<String>, String> {
    let api_token = store
        .get("doubao_api_key")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .ok_or("Doubao API Token not found. Please configure it in Settings.")?;

    let url = "https://ark.cn-beijing.volces.com/api/v3/images/generations";
    // Doubao recommended model from docs
    let model = "doubao-seedream-4-5-251128";

    // Map size or use 2K if not strictly defined.
    // Using explicit resolution if possible, otherwise default to user's choice or 2K.
    let size_str = format!("{}x{}", payload.width, payload.height);

    let mut body = json!({
        "model": model,
        "prompt": payload.prompt,
        "sequential_image_generation": if payload.count > 1 { "auto" } else { "disabled" },
        "response_format": "url",
        "size": size_str,
        "stream": false,
        "watermark": false
    });

    // Handle reference images
    if let Some(ref_images) = payload.reference_images {
        if !ref_images.is_empty() {
            let mut image_data_uris = Vec::new();
            for path_str in ref_images {
                let uri = image_to_base64_uri(&path_str)?;
                image_data_uris.push(uri);
            }

            if image_data_uris.len() == 1 {
                body.as_object_mut()
                    .unwrap()
                    .insert("image".to_string(), json!(image_data_uris[0]));
            } else {
                body.as_object_mut()
                    .unwrap()
                    .insert("image".to_string(), json!(image_data_uris));
            }
        }
    }

    let res = client
        .post(url)
        .header("Authorization", format!("Bearer {}", api_token))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        let err_text = res.text().await.unwrap_or_default();
        return Err(format!("Doubao API Error: {}", err_text));
    }

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    let mut saved_paths = Vec::new();
    if let Some(data) = json.get("data").and_then(|d| d.as_array()) {
        for (i, item) in data.iter().enumerate() {
            if let Some(image_url) = item.get("url").and_then(|v| v.as_str()) {
                let timestamp = chrono::Utc::now().timestamp_millis();
                let filename = format!("doubao_{}_{}.png", timestamp, i);
                let file_path = output_path.join(&filename);

                // Download image
                let img_bytes = client
                    .get(image_url)
                    .send()
                    .await
                    .map_err(|e| format!("Failed to download image: {}", e))?
                    .bytes()
                    .await
                    .map_err(|e| format!("Failed to read image bytes: {}", e))?;

                let mut file = fs::File::create(&file_path).map_err(|e| e.to_string())?;
                file.write_all(&img_bytes).map_err(|e| e.to_string())?;

                saved_paths.push(file_path.to_string_lossy().to_string());
            }
        }
    } else {
        return Err("No data in Doubao response".to_string());
    }

    Ok(saved_paths)
}

async fn generate_zhipu(
    store: &tauri_plugin_store::Store<tauri::Wry>,
    client: &Client,
    output_path: &Path,
    payload: GeneratePayload,
) -> Result<Vec<String>, String> {
    let api_token = store
        .get("zhipu_api_key")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .ok_or("Zhipu API Token not found. Please configure it in Settings.")?;

    let url = "https://open.bigmodel.cn/api/paas/v4/images/generations";
    let model = "glm-image";

    let size_str = format!("{}x{}", payload.width, payload.height);

    // Read watermark setting, default to true
    let watermark_enabled = store
        .get("zhipu_watermark")
        .and_then(|v| v.as_bool())
        .unwrap_or(true);

    // Zhipu only supports text-to-image, no reference images
    let body = json!({
        "model": model,
        "prompt": payload.prompt,
        "size": size_str,
        "watermark_enabled": watermark_enabled
    });

    let res = client
        .post(url)
        .header("Authorization", format!("Bearer {}", api_token))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        let err_text = res.text().await.unwrap_or_default();
        return Err(format!("Zhipu API Error: {}", err_text));
    }

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    let mut saved_paths = Vec::new();
    if let Some(data) = json.get("data").and_then(|d| d.as_array()) {
        for (i, item) in data.iter().enumerate() {
            if let Some(image_url) = item.get("url").and_then(|v| v.as_str()) {
                let timestamp = chrono::Utc::now().timestamp_millis();
                let filename = format!("zhipu_{}_{}.png", timestamp, i);
                let file_path = output_path.join(&filename);

                // Download image
                let img_bytes = client
                    .get(image_url)
                    .send()
                    .await
                    .map_err(|e| format!("Failed to download image: {}", e))?
                    .bytes()
                    .await
                    .map_err(|e| format!("Failed to read image bytes: {}", e))?;

                let mut file = fs::File::create(&file_path).map_err(|e| e.to_string())?;
                file.write_all(&img_bytes).map_err(|e| e.to_string())?;

                saved_paths.push(file_path.to_string_lossy().to_string());
            }
        }
    } else {
        return Err("No data in Zhipu response".to_string());
    }

    Ok(saved_paths)
}

fn get_mime_type(path: &Path) -> Result<String, String> {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .ok_or("File has no extension")?;

    match ext.as_str() {
        "jpg" | "jpeg" => Ok("image/jpeg".to_string()),
        "png" => Ok("image/png".to_string()),
        "webp" => Ok("image/webp".to_string()),
        "gif" => Ok("image/gif".to_string()),
        _ => Err(format!("Unsupported file extension: {}", ext)),
    }
}

fn image_to_base64_uri(path_str: &str) -> Result<String, String> {
    let path = Path::new(path_str);

    if !path.exists() {
        return Err(format!("Image file not found: {}", path_str));
    }

    let metadata = fs::metadata(path).map_err(|e| e.to_string())?;
    if metadata.len() > 10 * 1024 * 1024 {
        return Err(format!(
            "Image too large: {:.2}MB (max 10MB)",
            metadata.len() as f64 / (1024.0 * 1024.0)
        ));
    }

    let mime_type = get_mime_type(path)?;
    let bytes = fs::read(path).map_err(|e| e.to_string())?;
    let b64 = BASE64_STANDARD.encode(&bytes);

    Ok(format!("data:{};base64,{}", mime_type, b64))
}
