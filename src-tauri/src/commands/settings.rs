use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub provider: String,
    pub openai_api_key: Option<String>,
    pub doubao_api_key: Option<String>,
    pub theme: Option<String>,
}

#[tauri::command]
pub async fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;

    store.set("provider", json!(settings.provider));

    if let Some(key) = settings.openai_api_key {
        store.set("openai_api_key", json!(key));
        // Backward compatibility
        store.set("api_token", json!(key));
    }

    if let Some(key) = settings.doubao_api_key {
        store.set("doubao_api_key", json!(key));
    }

    if let Some(theme) = settings.theme {
        store.set("theme", json!(theme));
    }

    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_settings(app: AppHandle) -> Result<AppSettings, String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;

    let provider = store
        .get("provider")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .unwrap_or_else(|| "openai".to_string());

    let openai_api_key = store
        .get("openai_api_key")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .or_else(|| {
            store
                .get("api_token")
                .and_then(|v| v.as_str().map(|s| s.to_string()))
        });

    let doubao_api_key = store
        .get("doubao_api_key")
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    let theme = store
        .get("theme")
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    Ok(AppSettings {
        provider,
        openai_api_key,
        doubao_api_key,
        theme,
    })
}
