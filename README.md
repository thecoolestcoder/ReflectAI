# ReflectAI - Your Local Second Brain

A lightweight, open-source desktop application built in **Rust** with **Tauri** that helps you store and retrieve information from text, URLs, and articles. Everything stays local on your machine—no cloud dependency, completely private.

## Features

✨ **Local Storage** - All notes stored as JSON files in `~/.reflectai/`  
🔍 **Full-Text Search** - Instantly search across all your notes  
📊 **Text Analysis** - Extract summaries and keywords from pasted content  
🌐 **URL Analysis** - Fetch and analyze web articles automatically  
💾 **Import/Export** - Backup and share notes as JSON  
🎨 **Dark Mode UI** - Beautiful, modern interface optimized for long reading sessions  
⚡ **No Dependencies** - Works completely offline, no API keys required (Gemini integration optional)  
🖥️ **Wayland Compatible** - Runs smoothly on modern Linux desktops  

## Installation

### Prerequisites

- **Rust 1.70+** - [Install from https://rustup.rs/](https://rustup.rs/)
- **Node.js 18+** (only if you want to modify the frontend)

### From Source

1. Clone or download the repository:
```bash
cd ~/Documents/reflectAI
```

2. Install Rust (if not already installed):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

3. Build and run:
```bash
cargo tauri dev
```

This will compile the app and open it in development mode. The first build may take 2-3 minutes.

### Building a Release Binary

```bash
cargo tauri build
```

The compiled binary will be in `src-tauri/target/release/`.

## Usage

### Make sure to set API key for gemini in /frontend/.env as 
```
VITE_GEMINI_API_KEY=urapikey
```

### Adding Notes

1. Click **"+ New"** or start typing in the title field
2. Add your note title and content
3. (Optional) Add comma-separated tags
4. Click **"💾 Save"** or press `Ctrl+S` (or `Cmd+S` on macOS)

### Analyzing Content

1. Paste text or a URL into the content area
2. Click **"📊 Analyze"**
3. View extracted summary and keywords in the right panel

### Searching Notes

1. Type a search term in the search box (top-left)
2. Click **"Go"** or press Enter
3. Results update in real-time

### Exporting Notes

1. Click **"💾 Export"**
2. A JSON file is downloaded with all your notes
3. Import later by opening that file with the app

## File Storage

All notes are stored locally in:
- **Linux/macOS**: `~/.reflectai/notes.json`
- **Windows**: `%USERPROFILE%\.reflectai\notes.json`

The JSON format is human-readable and can be edited manually or imported into other apps.

### Example Note Storage

```json
{
  "notes": [
    {
      "id": "abc123xyz",
      "title": "Rust Memory Safety",
      "content": "Rust guarantees memory safety without garbage collection...",
      "tags": ["rust", "programming"],
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "source": null
    }
  ]
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` or `Cmd+S` | Save current note |
| `Enter` (in search) | Search notes |

## Development

### Project Structure

```
reflectAI/
├── src/
│   ├── main.rs          # Tauri app entry point & IPC handlers
│   └── lib.rs           # Storage, analysis logic
├── frontend/dist/
│   └── index.html       # UI (embedded CSS + JS)
├── Cargo.toml           # Rust dependencies
├── tauri.conf.json      # Tauri configuration
└── build.rs             # Build script
```

### Building for Development

```bash
cargo tauri dev
```

Opens the app with hot-reload support (note: Rust backend changes require restart).

### Running Tests

```bash
cargo test
```

### Modifying the UI

Edit `frontend/dist/index.html` - CSS and JavaScript are embedded inline. Restart `cargo tauri dev` to see changes.

## Architecture

### Backend (Rust)

- **Storage**: Simple JSON file-based store with in-process locking
- **Analysis**: Local text summarizer and keyword extractor
- **IPC**: Tauri command handlers expose 9 commands to the frontend

### Frontend (HTML/CSS/JavaScript)

- **UI Framework**: Vanilla JavaScript (no build step needed)
- **Styling**: CSS Grid layout with dark theme
- **Communication**: Tauri invoke API calls the Rust backend

### Available Tauri Commands

```javascript
invoke('get_notes')                              // Fetch all notes
invoke('search_notes', { query })                // Search notes
invoke('add_note', { title, content, tags })    // Create note
invoke('update_note', { id, title, content })   // Update note
invoke('delete_note', { id })                   // Delete note
invoke('analyze_text', { text })                // Analyze text
invoke('analyze_url', { url })                  // Fetch & analyze URL
invoke('export_notes')                          // Export as JSON
invoke('import_notes', { json_str })            // Import from JSON
```

## Optional: Gemini AI Integration

To enable cloud-based AI analysis (requires Google Gemini API):

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/)
2. Create a `.env` file in the project root:
```
GEMINI_API_KEY=your_key_here
```
3. Rebuild: `cargo tauri build`

(Currently the local analyzer works without this; cloud integration is a planned enhancement)

## Troubleshooting

### App Won't Start on Wayland

Ensure you're using a recent version of Tauri (v2.0+). If issues persist, try:
```bash
WAYLAND_DISPLAY= cargo tauri dev  # Falls back to X11
```

### Cannot Find Rust Compiler

Make sure Rust is installed and in your PATH:
```bash
rustc --version
```

If not, run:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Slow First Build

Initial compilation takes 2-3 minutes. Subsequent builds are much faster. Consider using `mold` linker for faster builds:
```bash
# On Linux
export RUSTFLAGS="-C link-arg=-fuse-ld=mold"
cargo tauri dev
```

### UI Not Showing

If the window opens but shows no content:
1. Check that `frontend/dist/index.html` exists
2. Verify `tauri.conf.json` points to correct paths
3. Check console for errors: open DevTools with `F12`

## Contributing

Contributions welcome! Areas for improvement:

- [ ] Vector embeddings for semantic search
- [ ] Dark/light theme toggle
- [ ] Note encryption
- [ ] Sync between devices
- [ ] Better HTML extraction for URLs
- [ ] Integration with Gemini API
- [ ] Plugin system
- [ ] Offline embedding model support

## License

MIT - Free for personal and commercial use.

## FAQ

**Q: Is my data private?**  
A: Yes. All data stays on your machine. No cloud sync or telemetry.

**Q: Can I use this on multiple machines?**  
A: Manually export/import notes. Automatic sync is planned.

**Q: Why Rust instead of Electron?**  
A: Rust + Tauri is faster, uses less memory, and works better on Wayland.

**Q: Can I sync notes?**  
A: Not built-in yet, but JSON export lets you use tools like Syncthing.

**Q: Is there a web version?**  
A: Not currently. Desktop app only.

---

Made with ❤️ in Rust. Questions? Open an issue on GitHub!
