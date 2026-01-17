use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;
use tauri_plugin_opener::OpenerExt;
use crate::models::GeneratedImage;
use std::fs;
use std::path::PathBuf;
use std::time::UNIX_EPOCH;

#[tauri::command]
pub async fn list_gallery_images(app: AppHandle) -> Result<Vec<GeneratedImage>, String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    let output_dir_str = store.get("output_dir").and_then(|v| v.as_str().map(|s| s.to_string()))
        .unwrap_or("DreamIn/Outputs".to_string());

    let output_path = if output_dir_str.starts_with('/') {
        PathBuf::from(output_dir_str)
    } else {
        app.path().document_dir().map_err(|e| e.to_string())?
            .join(output_dir_str)
    };

    if !output_path.exists() {
        return Ok(Vec::new());
    }

    let mut images = Vec::new();
    let entries = fs::read_dir(&output_path).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                if ["png", "jpg", "jpeg", "webp"].contains(&ext.to_lowercase().as_str()) {
                    let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
                    let created = metadata.created().unwrap_or(std::time::SystemTime::now())
                        .duration_since(UNIX_EPOCH).unwrap_or_default().as_millis() as u64;
                    
                    images.push(GeneratedImage {
                        filename: path.file_name().unwrap().to_string_lossy().to_string(),
                        path: path.to_string_lossy().to_string(),
                        created_at: created,
                    });
                }
            }
        }
    }
    
    // Sort by newest first
    images.sort_by(|a, b| b.created_at.cmp(&a.created_at));

    Ok(images)
}

#[tauri::command]
pub async fn open_image_in_viewer(app: AppHandle, path: String) -> Result<(), String> {
    app.opener().open_path(&path, None::<&str>).map_err(|e| e.to_string())?;
    Ok(())
}
