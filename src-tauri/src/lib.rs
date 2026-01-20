pub mod commands;
pub mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::settings::save_settings,
            commands::settings::get_settings,
            commands::generate::generate_image,
            commands::resources::create_resource,
            commands::resources::list_resources,
            commands::resources::update_resource,
            commands::resources::delete_resource,
            commands::gallery::list_gallery_images,
            commands::gallery::open_image_in_viewer,
            commands::gallery::download_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
