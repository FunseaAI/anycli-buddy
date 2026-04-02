#!/usr/bin/env bash
# One-command installer: adds terminal-buddy to OpenAI Codex CLI
# Usage: bash install-codex.sh [codex-repo-path]
#
# If no path given, clones openai/codex into ./codex/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUDDY_DIR="$SCRIPT_DIR"
CODEX_DIR="${1:-./codex}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[buddy]${NC} $*"; }
ok()    { echo -e "${GREEN}[buddy]${NC} $*"; }
warn()  { echo -e "${YELLOW}[buddy]${NC} $*"; }
fail()  { echo -e "${RED}[buddy]${NC} $*"; exit 1; }

# ── Prerequisites ───────────────────────────────────────────────
info "Checking prerequisites..."
command -v node  >/dev/null 2>&1 || fail "Node.js is required (>= 18)"
command -v cargo >/dev/null 2>&1 || fail "Rust/Cargo is required"
command -v git   >/dev/null 2>&1 || fail "Git is required"

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
[ "$NODE_VER" -ge 18 ] || fail "Node.js >= 18 required (found v$NODE_VER)"

# ── Clone or verify repo ───────────────────────────────────────
if [ ! -d "$CODEX_DIR" ]; then
    info "Cloning openai/codex..."
    git clone --depth 1 https://github.com/openai/codex.git "$CODEX_DIR"
fi
CODEX_DIR="$(cd "$CODEX_DIR" && pwd)"

# Verify it's the codex repo
[ -d "$CODEX_DIR/codex-rs" ] || fail "$CODEX_DIR doesn't look like the Codex repo (no codex-rs/)"

# ── Copy buddy bridge ──────────────────────────────────────────
info "Installing terminal-buddy bridge..."
BUDDY_DEST="$CODEX_DIR/codex-rs/tui/buddy"
mkdir -p "$BUDDY_DEST"

# Copy core JS files
for f in bridge.js companion.js renderer.js sprites.js types.js quips.js index.js terminal.js; do
    cp "$BUDDY_DIR/$f" "$BUDDY_DEST/"
done
cp "$BUDDY_DIR/package.json" "$BUDDY_DEST/"

ok "Bridge files copied to $BUDDY_DEST"

# ── Create Rust buddy module ───────────────────────────────────
info "Creating Rust buddy module..."

RUST_BUDDY="$CODEX_DIR/codex-rs/tui/src/buddy"
mkdir -p "$RUST_BUDDY"

cat > "$RUST_BUDDY/mod.rs" << 'RUSTEOF'
//! Terminal buddy companion — renders an animated ASCII sprite via a Node.js
//! bridge subprocess. Integrates with Ratatui as a stateful widget.

mod bridge;
mod widget;

pub use bridge::BuddyBridge;
pub use widget::BuddyWidget;
RUSTEOF

cat > "$RUST_BUDDY/bridge.rs" << 'RUSTEOF'
//! JSON-over-stdio bridge to the Node.js terminal-buddy package.

use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;

#[derive(Debug, Clone, Serialize)]
struct BridgeCmd {
    cmd: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    seed: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    stream: Option<bool>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct BridgeFrame {
    #[serde(default)]
    pub lines: Vec<String>,
    #[serde(default)]
    pub width: usize,
    #[serde(default)]
    pub height: usize,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CompanionInfo {
    pub name: String,
    pub species: String,
    pub rarity: String,
}

#[derive(Debug, Deserialize)]
struct BridgeMsg {
    #[serde(rename = "type")]
    msg_type: String,
    #[serde(flatten)]
    frame: Option<BridgeFrame>,
    companion: Option<CompanionInfo>,
}

pub struct BuddyBridge {
    child: Option<Child>,
    stdin: Option<std::process::ChildStdin>,
    current_frame: Arc<Mutex<BridgeFrame>>,
    companion: Arc<Mutex<Option<CompanionInfo>>>,
    bridge_path: String,
}

impl BuddyBridge {
    pub fn new(bridge_path: String) -> Self {
        Self {
            child: None,
            stdin: None,
            current_frame: Arc::new(Mutex::new(BridgeFrame {
                lines: vec![],
                width: 0,
                height: 0,
            })),
            companion: Arc::new(Mutex::new(None)),
            bridge_path,
        }
    }

    /// Start the bridge subprocess and hatch a companion.
    pub fn start(&mut self, seed: &str, name: Option<&str>) -> Result<(), String> {
        let mut child = Command::new("node")
            .arg(&self.bridge_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("Failed to start buddy bridge: {}", e))?;

        let stdout = child.stdout.take().ok_or("No stdout")?;
        self.stdin = child.stdin.take();
        self.child = Some(child);

        // Send hatch command
        let cmd = BridgeCmd {
            cmd: "hatch".into(),
            seed: Some(seed.into()),
            name: name.map(|s| s.into()),
            text: None,
            stream: Some(true),
        };
        self.send(&cmd)?;

        // Read frames in background thread
        let frame_ref = Arc::clone(&self.current_frame);
        let companion_ref = Arc::clone(&self.companion);
        thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                let Ok(line) = line else { break };
                let Ok(msg) = serde_json::from_str::<BridgeMsg>(&line) else {
                    continue;
                };
                match msg.msg_type.as_str() {
                    "hatched" => {
                        if let Some(c) = msg.companion {
                            *companion_ref.lock().unwrap() = Some(c);
                        }
                    }
                    "frame" => {
                        if let Some(f) = msg.frame {
                            *frame_ref.lock().unwrap() = f;
                        }
                    }
                    "stopped" => break,
                    _ => {}
                }
            }
        });

        Ok(())
    }

    fn send(&mut self, cmd: &BridgeCmd) -> Result<(), String> {
        let stdin = self.stdin.as_mut().ok_or("Bridge not running")?;
        let json = serde_json::to_string(cmd).map_err(|e| e.to_string())?;
        writeln!(stdin, "{}", json).map_err(|e| e.to_string())?;
        stdin.flush().map_err(|e| e.to_string())
    }

    /// Make the companion say something.
    pub fn say(&mut self, text: &str) -> Result<(), String> {
        self.send(&BridgeCmd {
            cmd: "say".into(),
            text: Some(text.into()),
            seed: None, name: None, stream: None,
        })
    }

    /// Pet the companion.
    pub fn pet(&mut self) -> Result<(), String> {
        self.send(&BridgeCmd {
            cmd: "pet".into(),
            seed: None, name: None, text: None, stream: None,
        })
    }

    /// Get the current frame lines (ANSI-colored strings).
    pub fn current_frame(&self) -> BridgeFrame {
        self.current_frame.lock().unwrap().clone()
    }

    /// Get companion info (available after hatch).
    pub fn companion_info(&self) -> Option<CompanionInfo> {
        self.companion.lock().unwrap().clone()
    }

    /// Stop the bridge subprocess.
    pub fn stop(&mut self) {
        let _ = self.send(&BridgeCmd {
            cmd: "stop".into(),
            seed: None, name: None, text: None, stream: None,
        });
        if let Some(ref mut child) = self.child {
            let _ = child.wait();
        }
    }
}

impl Drop for BuddyBridge {
    fn drop(&mut self) {
        self.stop();
    }
}
RUSTEOF

cat > "$RUST_BUDDY/widget.rs" << 'RUSTEOF'
//! Ratatui widget that renders the buddy sprite from bridge frames.

use ratatui::{
    buffer::Buf,
    layout::Rect,
    text::{Line, Span},
    widgets::{StatefulWidget, Widget},
};

use super::bridge::{BridgeFrame, BuddyBridge};

/// Ratatui widget for the buddy companion sprite.
pub struct BuddyWidget;

/// State for the buddy widget — holds the bridge handle.
pub struct BuddyState {
    pub bridge: BuddyBridge,
    pub visible: bool,
}

impl BuddyState {
    pub fn new(bridge: BuddyBridge) -> Self {
        Self {
            bridge,
            visible: true,
        }
    }

    pub fn toggle_visible(&mut self) {
        self.visible = !self.visible;
    }
}

impl StatefulWidget for BuddyWidget {
    type State = BuddyState;

    fn render(self, area: Rect, buf: &mut Buf, state: &mut Self::State) {
        if !state.visible || area.width == 0 || area.height == 0 {
            return;
        }

        let frame = state.bridge.current_frame();
        if frame.lines.is_empty() {
            return;
        }

        // Render each line of the sprite frame.
        // The bridge sends ANSI-colored strings; Ratatui's raw rendering
        // will pass them through to the terminal.
        let max_lines = area.height as usize;
        let start_y = if frame.lines.len() < max_lines {
            area.y + (max_lines - frame.lines.len()) as u16
        } else {
            area.y
        };

        for (i, line_text) in frame.lines.iter().enumerate() {
            if i >= max_lines {
                break;
            }
            let y = start_y + i as u16;
            // Write raw ANSI string — terminal handles color codes
            let x = area.x;
            // Use Ratatui's raw string writing
            let line = Line::from(Span::raw(strip_ansi(line_text)));
            let line_area = Rect::new(x, y, area.width, 1);
            Widget::render(line, line_area, buf);
        }
    }
}

/// Strip ANSI escape codes for width calculation.
fn strip_ansi(s: &str) -> String {
    let re = regex_lite::Regex::new(r"\x1b\[[0-9;]*m").unwrap();
    re.replace_all(s, "").to_string()
}
RUSTEOF

ok "Rust buddy module created at $RUST_BUDDY"

# ── Add regex-lite dependency ───────────────────────────────────
TUI_CARGO="$CODEX_DIR/codex-rs/tui/Cargo.toml"
if ! grep -q 'regex-lite' "$TUI_CARGO" 2>/dev/null; then
    info "Adding regex-lite dependency to Cargo.toml..."
    # Add under [dependencies]
    sed -i.bak '/^\[dependencies\]/a\
regex-lite = "0.1"' "$TUI_CARGO"
    rm -f "$TUI_CARGO.bak"
fi

# ── Add mod buddy to lib.rs ────────────────────────────────────
TUI_LIB="$CODEX_DIR/codex-rs/tui/src/lib.rs"
if [ -f "$TUI_LIB" ] && ! grep -q 'mod buddy' "$TUI_LIB"; then
    info "Adding buddy module to lib.rs..."
    echo 'mod buddy;' >> "$TUI_LIB"
fi

# ── Create integration example ──────────────────────────────────
cat > "$CODEX_DIR/codex-rs/tui/BUDDY_INTEGRATION.md" << 'MDEOF'
# Buddy Integration for Codex CLI

The buddy companion has been installed. To complete the integration:

## 1. Initialize the bridge in your App struct

In `src/app.rs`, add:

```rust
use crate::buddy::{BuddyBridge, BuddyWidget, BuddyState};

// In your App or main state struct:
let bridge_path = concat!(env!("CARGO_MANIFEST_DIR"), "/buddy/bridge.js");
let mut bridge = BuddyBridge::new(bridge_path.into());
bridge.start("your-user-seed", None).expect("buddy bridge");
let mut buddy_state = BuddyState::new(bridge);
```

## 2. Render the widget in your layout

In your `render` function or wherever you build the Ratatui layout:

```rust
// Reserve a column on the right for the buddy
let chunks = Layout::default()
    .direction(Direction::Horizontal)
    .constraints([Constraint::Min(0), Constraint::Length(16)])
    .split(area);

// Render main content in chunks[0], buddy in chunks[1]
StatefulWidget::render(BuddyWidget, chunks[1], buf, &mut buddy_state);
```

## 3. Handle events

```rust
// Toggle visibility with Ctrl+B
KeyCode::Char('b') if key.modifiers.contains(KeyModifiers::CONTROL) => {
    buddy_state.toggle_visible();
}

// React to agent events
buddy_state.bridge.say("working on it...");  // on tool start
buddy_state.bridge.say("done!");             // on tool complete
buddy_state.bridge.pet();                    // on /pet command
```

## 4. Build

```bash
cargo build --release
```

## Files installed

- `buddy/` — Node.js bridge files (bridge.js + terminal-buddy core)
- `src/buddy/` — Rust module (mod.rs, bridge.rs, widget.rs)
MDEOF

# ── Done ────────────────────────────────────────────────────────
echo ""
ok "=== terminal-buddy installed into Codex CLI ==="
ok ""
ok "Bridge files: $BUDDY_DEST/"
ok "Rust module:  $RUST_BUDDY/"
ok ""
ok "Next steps:"
ok "  1. Read $CODEX_DIR/codex-rs/tui/BUDDY_INTEGRATION.md"
ok "  2. Wire buddy into your app.rs render loop"
ok "  3. cargo build --release"
echo ""
