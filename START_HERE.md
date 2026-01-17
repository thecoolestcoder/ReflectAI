# 🚀 START HERE - ReflectAI Setup Guide

Welcome! You're about to run a Rust + Tauri desktop app that works like a second brain for storing and analyzing information locally.

## What You're Getting

A **local, private, open-source desktop app** that:
- ✅ Stores notes as JSON files (no database)
- ✅ Works completely offline (no cloud sync needed)
- ✅ Analyzes text and URLs to extract summaries and keywords
- ✅ Runs on Wayland (no UI issues!)
- ✅ Is written in Rust (fast, safe, memory-efficient)

## Prerequisites Check

Before starting, verify you have these installed:

```bash
# Check Rust
rustc --version

# Should output something like: rustc 1.70.0 (...)
# If not installed, see Step 1 below
```

## Step-by-Step Setup

### Step 1: Install Rust (if needed)

If `rustc --version` showed an error, install Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

Then verify:
```bash
rustc --version
cargo --version
```

### Step 2: Navigate to Project

```bash
cd ~/Documents/reflectAI
```

Verify you see these files:
```bash
ls -la
# You should see: src/, frontend/, Cargo.toml, build.rs, README.md, etc.
```

### Step 3: Run the App (Development Mode)

```bash
cargo tauri dev
```

**What happens:**
1. First run: Downloads and compiles Rust dependencies (2-3 minutes)
2. Subsequent runs: Much faster (~10-30 seconds)
3. A window opens with the ReflectAI UI
4. The terminal shows live logs

**Expected output:**
```
   Compiling reflect-ai v0.1.0
    Finished dev [unoptimized + debuginfo] target(s) in 2m 15s
      Running `target/debug/reflect-ai`
[Tauri] Window opened successfully
```

### Step 4: Try the App

Once the window opens:

1. **Create a note:**
   - Click "+ New" button
   - Type a title and some content
   - Click "💾 Save" (or press Ctrl+S)

2. **Analyze text:**
   - Paste some text or a URL into the content area
   - Click "📊 Analyze"
   - See extracted keywords and summary in the right panel

3. **Search:**
   - Type in the search box (top-left)
   - Press Enter or click "Go"
   - Results filter in real-time

4. **Export backup:**
   - Click "💾 Export"
   - A JSON file downloads with all your notes

## Troubleshooting

### Build takes forever
**This is normal!** First build: 2-3 minutes. Grab coffee ☕
Subsequent runs are much faster.

### Command not found: cargo
```bash
source $HOME/.cargo/env
```
Then try again.

### App won't open on Wayland
```bash
WAYLAND_DISPLAY= cargo tauri dev
```
(Falls back to X11)

### Can't find project directory
```bash
cd ~/Documents/reflectAI
ls -la
# Verify you see src/, frontend/, Cargo.toml
```

### "Failed to load frontend"
Make sure `frontend/dist/index.html` exists:
```bash
ls -la frontend/dist/index.html
```

### Window opens but shows blank screen
Press F12 to open DevTools and check for errors. Usually means path issues in `tauri.conf.json`.

## Understanding the Project

### How it works:

```
┌─────────────────────────────────────────────────┐
│ Tauri Window (HTML/CSS/JavaScript)              │
│ (frontend/dist/index.html)                      │
└──────────────────┬──────────────────────────────┘
                   │ invoke() IPC calls
                   ▼
┌─────────────────────────────────────────────────┐
│ Rust Backend (src/main.rs)                      │
│ - IPC handlers for 9 commands                   │
│ - Text analysis                                 │
│ - URL fetching                                  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ Local Storage (src/lib.rs)                      │
│ Saves notes as JSON to:                         │
│ ~/.reflectai/notes.json                         │
└─────────────────────────────────────────────────┘
```

### Key files:

- `src/main.rs` - Tauri app, 9 IPC handlers
- `src/lib.rs` - Note struct, storage, text analysis
- `frontend/dist/index.html` - Complete UI (HTML + CSS + JS all in one file)
- `Cargo.toml` - Rust dependencies
- `tauri.conf.json` - Tauri configuration

## Data Location

Your notes are automatically saved to:

```bash
# Check your notes
cat ~/.reflectai/notes.json

# Should output JSON like:
# {
#   "notes": [
#     {
#       "id": "abc123",
#       "title": "My Note",
#       "content": "..."
#     }
#   ]
# }
```

You can manually edit or backup this file anytime.

## Common Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+S` | Save current note |
| `Enter` (in search) | Search notes |
| `F12` | Open DevTools (debug mode) |

## Next: Building a Release

Once you're comfortable with the app, create a standalone executable:

```bash
cargo tauri build
```

This creates a distributable binary in `target/release/`.

## Learning More

- **Full docs**: Read `README.md`
- **Architecture**: Read `PROJECT_SUMMARY.md`
- **Code**: Explore `src/main.rs` and `src/lib.rs`

## Quick Reference: Commands

```bash
# Run in development mode
cargo tauri dev

# Build release binary
cargo tauri build

# Run tests
cargo test

# Check code without building
cargo check

# Format code
cargo fmt

# Lint
cargo clippy
```

## FAQ

**Q: Why does compilation take so long?**  
A: First build downloads and compiles Tauri, Tokio, and other dependencies. Future builds are much faster.

**Q: Where are my notes stored?**  
A: `~/.reflectai/notes.json` - plain JSON file, fully readable/editable.

**Q: Is there a web version?**  
A: Not yet. Desktop only (for now).

**Q: Can I use this on macOS/Windows?**  
A: Yes! Build with `cargo tauri build` on those systems.

**Q: Can I sync notes across devices?**  
A: Not built-in, but you can export/import JSON or use tools like Syncthing.

**Q: What about privacy?**  
A: 100% local. No cloud, no tracking, no telemetry. Open source so you can verify.

## You're Ready!

1. Run: `cargo tauri dev`
2. Wait for compilation
3. Create and save a note
4. Try the analyze feature
5. Export a backup

**That's it!** You now have a local second brain. 🧠

---

**Questions?** Check `README.md` or `PROJECT_SUMMARY.md`

**Ready to contribute?** See README.md for contribution guidelines.

Made with ❤️ in Rust.