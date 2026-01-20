use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub provider: String,
    pub doubao_api_key: Option<String>,
    pub zhipu_api_key: Option<String>,
    pub zhipu_watermark: Option<bool>,
    pub theme: Option<String>,
}

#[tauri::command]
pub async fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;

    store.set("provider", json!(settings.provider));

    if let Some(key) = settings.doubao_api_key {
        store.set("doubao_api_key", json!(key));
    }

    if let Some(key) = settings.zhipu_api_key {
        store.set("zhipu_api_key", json!(key));
    }

    if let Some(watermark) = settings.zhipu_watermark {
        store.set("zhipu_watermark", json!(watermark));
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
        .unwrap_or_else(|| "doubao".to_string());

    let doubao_api_key = store
        .get("doubao_api_key")
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    let zhipu_api_key = store
        .get("zhipu_api_key")
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    let zhipu_watermark = store.get("zhipu_watermark").and_then(|v| v.as_bool());

    let theme = store
        .get("theme")
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    Ok(AppSettings {
        provider,
        doubao_api_key,
        zhipu_api_key,
        zhipu_watermark,
        theme,
    })
}
