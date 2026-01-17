use anyhow::Result;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

/// A note stored in ReflectAI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub source: Option<String>,
}

impl Note {
    pub fn new(title: String, content: String, tags: Vec<String>) -> Self {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();
        Self {
            id,
            title,
            content,
            tags,
            created_at: now,
            updated_at: now,
            source: None,
        }
    }
}

/// Storage for notes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NoteStore {
    pub notes: Vec<Note>,
}

impl NoteStore {
    pub fn new() -> Self {
        Self { notes: Vec::new() }
    }

    pub fn add_note(&mut self, note: Note) -> String {
        let id = note.id.clone();
        self.notes.push(note);
        id
    }

    pub fn update_note(
        &mut self,
        id: &str,
        title: String,
        content: String,
        tags: Vec<String>,
    ) -> Result<Note> {
        let note = self
            .notes
            .iter_mut()
            .find(|n| n.id == id)
            .ok_or_else(|| anyhow::anyhow!("Note not found"))?;

        note.title = title;
        note.content = content;
        note.tags = tags;
        note.updated_at = Utc::now();

        Ok(note.clone())
    }

    pub fn delete_note(&mut self, id: &str) -> Result<()> {
        let index = self
            .notes
            .iter()
            .position(|n| n.id == id)
            .ok_or_else(|| anyhow::anyhow!("Note not found"))?;
        self.notes.remove(index);
        Ok(())
    }

    pub fn get_note(&self, id: &str) -> Option<Note> {
        self.notes.iter().find(|n| n.id == id).cloned()
    }

    pub fn list_notes(&self) -> Vec<Note> {
        self.notes.clone()
    }

    pub fn search_notes(&self, query: &str) -> Vec<Note> {
        let query = query.to_lowercase();
        self.notes
            .iter()
            .filter(|note| {
                note.title.to_lowercase().contains(&query)
                    || note.content.to_lowercase().contains(&query)
                    || note
                        .tags
                        .iter()
                        .any(|tag| tag.to_lowercase().contains(&query))
            })
            .cloned()
            .collect()
    }
}

impl Default for NoteStore {
    fn default() -> Self {
        Self::new()
    }
}

/// Storage manager for persisting notes
pub struct StorageManager {
    storage_path: PathBuf,
}

impl StorageManager {
    pub fn new() -> Result<Self> {
        let storage_path = dirs::data_dir()
            .ok_or_else(|| anyhow::anyhow!("Could not determine data directory"))?
            .join("reflect-ai");

        fs::create_dir_all(&storage_path)?;

        Ok(Self { storage_path })
    }

    pub fn load(&self) -> Result<NoteStore> {
        let file_path = self.storage_path.join("notes.json");

        if file_path.exists() {
            let content = fs::read_to_string(&file_path)?;
            let store: NoteStore = serde_json::from_str(&content)?;
            Ok(store)
        } else {
            Ok(NoteStore::new())
        }
    }

    pub fn save(&self, store: &NoteStore) -> Result<()> {
        let file_path = self.storage_path.join("notes.json");
        let json = serde_json::to_string_pretty(store)?;
        fs::write(&file_path, json)?;
        Ok(())
    }

    pub fn export_json(&self) -> Result<String> {
        let store = self.load()?;
        Ok(serde_json::to_string_pretty(&store)?)
    }

    pub fn import_json(&self, json_str: &str) -> Result<()> {
        let store: NoteStore = serde_json::from_str(json_str)?;
        self.save(&store)?;
        Ok(())
    }
}

/// Text analysis utilities
pub struct TextAnalyzer;

impl TextAnalyzer {
    /// Extract keywords from text (simple frequency-based approach)
    pub fn extract_keywords(text: &str, count: usize) -> Vec<String> {
        let stopwords = [
            "the", "and", "is", "in", "to", "of", "a", "that", "it", "on", "for", "as", "are",
            "with", "was", "this", "by", "an", "be", "or", "from", "at", "which", "has", "have",
            "had", "do", "does", "did", "will", "would", "could", "should",
        ];

        let mut word_freq: std::collections::HashMap<String, usize> =
            std::collections::HashMap::new();

        for word in text.split_whitespace() {
            let clean = word
                .to_lowercase()
                .chars()
                .filter(|c| c.is_alphanumeric())
                .collect::<String>();

            if !clean.is_empty() && !stopwords.contains(&clean.as_str()) {
                *word_freq.entry(clean).or_insert(0) += 1;
            }
        }

        let mut words: Vec<_> = word_freq.into_iter().collect();
        words.sort_by(|a, b| b.1.cmp(&a.1));

        words
            .into_iter()
            .take(count)
            .map(|(word, _)| word)
            .collect()
    }

    /// Summarize text by extracting key sentences
    pub fn summarize(text: &str, sentences_count: usize) -> String {
        let sentences: Vec<&str> = text.split('.').collect();

        sentences
            .iter()
            .take(sentences_count)
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect::<Vec<_>>()
            .join(". ")
    }

    /// Extract domain from URL
    pub fn extract_domain(url: &str) -> String {
        if let Ok(parsed_url) = url::Url::parse(url) {
            parsed_url.host_str().unwrap_or("unknown").to_string()
        } else {
            "unknown".to_string()
        }
    }
}
