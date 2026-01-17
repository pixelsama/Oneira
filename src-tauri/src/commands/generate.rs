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
        .unwrap_or_else(|| "openai".to_string());

    let output_dir_str = store
        .get("output_dir")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .unwrap_or("DreamIn/Outputs".to_string());

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

    if provider == "doubao" {
        return generate_doubao(&store, &client, &output_path, payload).await;
    } else {
        return generate_openai(&store, &client, &output_path, payload).await;
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
    // For now passing explicit W*H if logic allows, but documentation example used "2K".
    // Let's try passing explicit resolution string "Width*Height" which is common.
    let size_str = format!("{}x{}", payload.width, payload.height);

    let body = json!({
        "model": model,
        "prompt": payload.prompt,
        "sequential_image_generation": "disabled",
        "response_format": "url",
        "size": size_str, // Trying explicit size first
        "stream": false,
        "watermark": false
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

async fn generate_openai(
    store: &tauri_plugin_store::Store<tauri::Wry>,
    client: &Client,
    output_path: &Path,
    payload: GeneratePayload,
) -> Result<Vec<String>, String> {
    let api_token = store
        .get("openai_api_key")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .or_else(|| {
            store
                .get("api_token")
                .and_then(|v| v.as_str().map(|s| s.to_string()))
        })
        .ok_or("OpenAI API Token not found. Please configure it in Settings.")?;

    let api_url = store
        .get("api_url")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .unwrap_or("https://api.openai.com/v1/images/generations".to_string());

    let model = "dall-e-3";

    let body = json!({
        "model": model,
        "prompt": payload.prompt,
        "n": payload.count,
        "size": format!("{}x{}", payload.width, payload.height),
        "response_format": "b64_json",
        "quality": "standard"
    });

    let res = client
        .post(&api_url)
        .header("Authorization", format!("Bearer {}", api_token))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        let err_text = res.text().await.unwrap_or_default();
        return Err(format!("OpenAI API Error: {}", err_text));
    }

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    let mut saved_paths = Vec::new();
    if let Some(data) = json.get("data").and_then(|d| d.as_array()) {
        for (i, item) in data.iter().enumerate() {
            if let Some(b64) = item.get("b64_json").and_then(|v| v.as_str()) {
                let bytes = BASE64_STANDARD.decode(b64).map_err(|e| e.to_string())?;
                let timestamp = chrono::Utc::now().timestamp_millis();
                let filename = format!("img_{}_{}.png", timestamp, i);
                let file_path = output_path.join(&filename);

                let mut file = fs::File::create(&file_path).map_err(|e| e.to_string())?;
                file.write_all(&bytes).map_err(|e| e.to_string())?;

                saved_paths.push(file_path.to_string_lossy().to_string());
            }
        }
    } else {
        return Err("No data in response".to_string());
    }

    Ok(saved_paths)
}
