use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;
use crate::models::{Resource, CreateResourcePayload, UpdateResourcePayload};
use uuid::Uuid;
use std::fs;
use std::path::PathBuf;
use chrono::Utc;

#[tauri::command]
pub async fn create_resource(app: AppHandle, payload: CreateResourcePayload) -> Result<Resource, String> {
    let id = Uuid::new_v4().to_string();
    let timestamp = Utc::now().timestamp_millis();
    
    let doc_dir = app.path().document_dir().map_err(|e| e.to_string())?;
    let resource_base_dir = doc_dir.join("DreamIn/Resources");
    let resource_dir = resource_base_dir.join(&id);
    
    if !resource_dir.exists() {
        fs::create_dir_all(&resource_dir).map_err(|e| e.to_string())?;
    }
    
    let mut stored_images = Vec::new();
    for img_path in payload.image_paths {
        let src = PathBuf::from(&img_path);
        if src.exists() {
            let filename = src.file_name().unwrap_or_default();
            let dest = resource_dir.join(filename);
            fs::copy(&src, &dest).map_err(|e| e.to_string())?;
            stored_images.push(dest.to_string_lossy().to_string());
        }
    }

    let resource = Resource {
        id: id.clone(),
        name: payload.name,
        description: payload.description,
        prompt_template: payload.prompt,
        images: stored_images,
        created_at: timestamp,
        updated_at: timestamp,
    };

    let store = app.store("resources.json").map_err(|e| e.to_string())?;
    
    let mut resources: Vec<Resource> = match store.get("resources") {
        Some(val) => serde_json::from_value(val.clone()).unwrap_or_default(),
        None => Vec::new(),
    };
    
    resources.push(resource.clone());
    
    store.set("resources", serde_json::json!(resources));
    store.save().map_err(|e| e.to_string())?;

    Ok(resource)
}

#[tauri::command]
pub async fn list_resources(app: AppHandle) -> Result<Vec<Resource>, String> {
    let store = app.store("resources.json").map_err(|e| e.to_string())?;
    match store.get("resources") {
        Some(val) => serde_json::from_value(val.clone()).map_err(|e| e.to_string()),
        None => Ok(Vec::new()),
    }
}

// Placeholder for update/delete to avoid unused imports if I added UpdateResourcePayload
#[tauri::command]
pub async fn update_resource(app: AppHandle, payload: UpdateResourcePayload) -> Result<Resource, String> {
    let store = app.store("resources.json").map_err(|e| e.to_string())?;
    let mut resources: Vec<Resource> = match store.get("resources") {
        Some(val) => serde_json::from_value(val.clone()).unwrap_or_default(),
        None => return Err("No resources found".to_string()),
    };

    if let Some(r) = resources.iter_mut().find(|r| r.id == payload.id) {
        if let Some(name) = payload.name { r.name = name; }
        if let Some(desc) = payload.description { r.description = Some(desc); }
        if let Some(prompt) = payload.prompt { r.prompt_template = prompt; }
        if let Some(images) = payload.images { r.images = images; }
        r.updated_at = Utc::now().timestamp_millis();
        
        let updated_resource = r.clone();
        
        store.set("resources", serde_json::json!(resources));
        store.save().map_err(|e| e.to_string())?;
        
        Ok(updated_resource)
    } else {
        Err("Resource not found".to_string())
    }
}

#[tauri::command]
pub async fn delete_resource(app: AppHandle, id: String) -> Result<(), String> {
    let store = app.store("resources.json").map_err(|e| e.to_string())?;
    let mut resources: Vec<Resource> = match store.get("resources") {
        Some(val) => serde_json::from_value(val.clone()).unwrap_or_default(),
        None => return Ok(()),
    };
    
    // Should also delete files?
    // "Delete Resource ... exclusive files".
    // We should delete the folder `DreamIn/Resources/{id}`.
    let doc_dir = app.path().document_dir().map_err(|e| e.to_string())?;
    let resource_dir = doc_dir.join("DreamIn/Resources").join(&id);
    if resource_dir.exists() {
        let _ = fs::remove_dir_all(resource_dir); // ignore error
    }

    resources.retain(|r| r.id != id);
    
    store.set("resources", serde_json::json!(resources));
    store.save().map_err(|e| e.to_string())?;
    
    Ok(())
}
