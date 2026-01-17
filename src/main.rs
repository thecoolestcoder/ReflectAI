use std::sync::Mutex;
use tauri_plugin_http::reqwest;

use reflect_ai::{Note, NoteStore, StorageManager, TextAnalyzer};

// State for the app
pub struct AppState {
    store: Mutex<NoteStore>,
    storage_manager: StorageManager,
}

#[tauri::command]
fn get_notes(state: tauri::State<AppState>) -> Result<Vec<Note>, String> {
    let store = state.store.lock().map_err(|e| e.to_string())?;
    Ok(store.list_notes())
}

#[tauri::command]
fn search_notes(query: String, state: tauri::State<AppState>) -> Result<Vec<Note>, String> {
    let store = state.store.lock().map_err(|e| e.to_string())?;
    Ok(store.search_notes(&query))
}

#[tauri::command]
fn add_note(
    title: String,
    content: String,
    tags: Vec<String>,
    state: tauri::State<AppState>,
) -> Result<Note, String> {
    let mut store = state.store.lock().map_err(|e| e.to_string())?;
    let note = Note::new(title, content, tags);
    store.add_note(note.clone());
    state
        .storage_manager
        .save(&store)
        .map_err(|e| e.to_string())?;
    Ok(note)
}

#[tauri::command]
fn update_note(
    id: String,
    title: String,
    content: String,
    tags: Vec<String>,
    state: tauri::State<AppState>,
) -> Result<Note, String> {
    let mut store = state.store.lock().map_err(|e| e.to_string())?;
    let updated = store
        .update_note(&id, title, content, tags)
        .map_err(|e| e.to_string())?;
    state
        .storage_manager
        .save(&store)
        .map_err(|e| e.to_string())?;
    Ok(updated)
}

#[tauri::command]
fn delete_note(id: String, state: tauri::State<AppState>) -> Result<(), String> {
    let mut store = state.store.lock().map_err(|e| e.to_string())?;
    store.delete_note(&id).map_err(|e| e.to_string())?;
    state
        .storage_manager
        .save(&store)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn analyze_text(text: String) -> Result<serde_json::Value, String> {
    let keywords = TextAnalyzer::extract_keywords(&text, 8);
    let summary = TextAnalyzer::summarize(&text, 4);

    Ok(serde_json::json!({
        "summary": summary,
        "keywords": keywords,
        "word_count": text.split_whitespace().count(),
    }))
}

#[tauri::command]
async fn analyze_url(url: String) -> Result<serde_json::Value, String> {
    // Fetch and extract text from URL
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch URL: {}", e))?;

    let html = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    // Simple HTML stripping
    let text = strip_html(&html);

    let keywords = TextAnalyzer::extract_keywords(&text, 8);
    let summary = TextAnalyzer::summarize(&text, 4);
    let domain = TextAnalyzer::extract_domain(&url);

    Ok(serde_json::json!({
        "summary": summary,
        "keywords": keywords,
        "domain": domain,
        "word_count": text.split_whitespace().count(),
        "url": url,
    }))
}

#[tauri::command]
fn export_notes(state: tauri::State<AppState>) -> Result<String, String> {
    state
        .storage_manager
        .export_json()
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn import_notes(json_str: String, state: tauri::State<AppState>) -> Result<(), String> {
    state
        .storage_manager
        .import_json(&json_str)
        .map_err(|e| e.to_string())?;

    // Reload the store
    let new_store = state.storage_manager.load().map_err(|e| e.to_string())?;
    let mut store = state.store.lock().map_err(|e| e.to_string())?;
    *store = new_store;

    Ok(())
}

fn strip_html(html: &str) -> String {
    let mut result = String::new();
    let mut in_tag = false;
    let mut in_script = false;
    let mut in_style = false;

    let lower = html.to_lowercase();
    let bytes = html.as_bytes();

    for (i, &byte) in bytes.iter().enumerate() {
        let remaining = &lower[i..];

        if remaining.starts_with("<script") {
            in_script = true;
            in_tag = true;
        } else if remaining.starts_with("</script") {
            in_script = false;
        } else if remaining.starts_with("<style") {
            in_style = true;
            in_tag = true;
        } else if remaining.starts_with("</style") {
            in_style = false;
        }

        if byte == b'<' {
            in_tag = true;
        } else if byte == b'>' {
            in_tag = false;
            if !in_script && !in_style {
                result.push(' ');
            }
        } else if !in_tag && !in_script && !in_style {
            if byte == b'\n' || byte == b'\r' || byte == b'\t' {
                result.push(' ');
            } else {
                result.push(byte as char);
            }
        }
    }

    // Clean up multiple spaces
    result.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn main() {
    let storage_manager = StorageManager::new().expect("Failed to initialize storage");
    let initial_store = storage_manager.load().expect("Failed to load notes");

    let app_state = AppState {
        store: Mutex::new(initial_store),
        storage_manager,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_notes,
            search_notes,
            add_note,
            update_note,
            delete_note,
            analyze_text,
            analyze_url,
            export_notes,
            import_notes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
