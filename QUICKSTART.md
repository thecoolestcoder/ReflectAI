# Quick Start Guide

## 🚀 Get ReflectAI Running in 2 Minutes

### Step 1: Install Rust (if needed)

Check if you have Rust:
```bash
rustc --version
```

If not, install it:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Step 2: Clone or Navigate to Project

```bash
cd ~/Documents/reflectAI
```

### Step 3: Run the App

**Development mode (with hot reload):**
```bash
cargo tauri dev
```

This will:
- Download and compile dependencies (first time: 2-3 minutes)
- Start the Tauri dev server
- Open the app window

**That's it!** You should see the ReflectAI UI with three panels:
- **Left**: Note list + search
- **Center**: Note editor
- **Right**: Analysis results

### Step 4: Try It Out

1. Click **"+ New"** to create a note
2. Type a title and some content
3. Click **"💾 Save"** (or `Ctrl+S`)
4. Paste a URL into the content area
5. Click **"📊 Analyze"** to extract keywords and summary
6. Use the search box to find notes

### Troubleshooting First Build

**Issue**: Build taking too long  
**Solution**: This is normal for the first build. Grab a coffee ☕

**Issue**: Command not found: `cargo`  
**Solution**: Rust wasn't added to PATH. Run:
```bash
source $HOME/.cargo/env
```

**Issue**: App won't open on Wayland  
**Solution**: Try explicitly using X11:
```bash
WAYLAND_DISPLAY= cargo tauri dev
```

**Issue**: "Could not find tauri in your PATH"  
**Solution**: Make sure you're in the project directory:
```bash
cd ~/Documents/reflectAI
cargo tauri dev
```

### Next Steps

- Read `README.md` for full documentation
- Try importing/exporting notes as JSON
- Customize the UI by editing `frontend/dist/index.html`
- Build a release binary with `cargo tauri build`

### Common Commands

```bash
# Development with auto-reload
cargo tauri dev

# Build production binary
cargo tauri build

# Run tests
cargo test

# Check code without building
cargo check

# Format code
cargo fmt

# Lint code
cargo clippy
```

### Data Storage

Your notes are automatically saved to:
- **Linux/macOS**: `~/.reflectai/notes.json`
- **Windows**: `%USERPROFILE%\.reflectai\notes.json`

You can manually backup or edit this file directly if needed.

### Questions?

See `README.md` for more detailed information, architecture overview, and contributing guidelines.

---

**Happy note-taking! 📝**