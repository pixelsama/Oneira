use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GeneratePayload {
    pub prompt: String,
    pub negative_prompt: Option<String>,
    pub width: u32,
    pub height: u32,
    pub count: u32,
    pub reference_images: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GeneratedImage {
    pub filename: String,
    pub path: String,
    pub created_at: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Resource {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub prompt_template: String,
    pub images: Vec<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CreateResourcePayload {
    pub name: String,
    pub description: Option<String>,
    pub prompt: String,
    pub image_paths: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UpdateResourcePayload {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub prompt: Option<String>,
    pub images: Option<Vec<String>>,
}