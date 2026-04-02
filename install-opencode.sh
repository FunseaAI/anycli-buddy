#!/usr/bin/env bash
# One-command installer: adds terminal-buddy to OpenCode CLI
# Usage: bash install-opencode.sh [opencode-repo-path]
#
# If no path given, clones opencode-ai/opencode into ./opencode/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUDDY_DIR="$SCRIPT_DIR"
OC_DIR="${1:-./opencode}"

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
command -v node >/dev/null 2>&1 || fail "Node.js is required (>= 18)"
command -v go   >/dev/null 2>&1 || fail "Go is required (>= 1.22)"
command -v git  >/dev/null 2>&1 || fail "Git is required"

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
[ "$NODE_VER" -ge 18 ] || fail "Node.js >= 18 required (found v$NODE_VER)"

# ── Clone or verify repo ───────────────────────────────────────
if [ ! -d "$OC_DIR" ]; then
    info "Cloning opencode-ai/opencode..."
    git clone --depth 1 https://github.com/opencode-ai/opencode.git "$OC_DIR"
fi
OC_DIR="$(cd "$OC_DIR" && pwd)"

# Verify it's the opencode repo
[ -f "$OC_DIR/go.mod" ] || fail "$OC_DIR doesn't look like the OpenCode repo (no go.mod)"
grep -q 'opencode' "$OC_DIR/go.mod" || warn "go.mod doesn't mention opencode — proceeding anyway"

# ── Determine module path ──────────────────────────────────────
MODULE_PATH=$(head -1 "$OC_DIR/go.mod" | awk '{print $2}')
info "Module: $MODULE_PATH"

# ── Copy buddy bridge (Node.js files) ──────────────────────────
info "Installing terminal-buddy bridge..."
BRIDGE_DEST="$OC_DIR/internal/tui/buddy/bridge-files"
mkdir -p "$BRIDGE_DEST"

for f in bridge.js companion.js renderer.js sprites.js types.js quips.js index.js terminal.js; do
    cp "$BUDDY_DIR/$f" "$BRIDGE_DEST/"
done
cp "$BUDDY_DIR/package.json" "$BRIDGE_DEST/"

ok "Bridge JS files copied to $BRIDGE_DEST"

# ── Create Go buddy package ────────────────────────────────────
info "Creating Go buddy package..."
GO_BUDDY="$OC_DIR/internal/tui/buddy"

cat > "$GO_BUDDY/bridge.go" << 'GOEOF'
// Package buddy provides a terminal companion via a Node.js bridge subprocess.
package buddy

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"os/exec"
	"path/filepath"
	"runtime"
	"sync"
)

type Companion struct {
	Name    string         `json:"name"`
	Species string         `json:"species"`
	Rarity  string         `json:"rarity"`
	Eye     string         `json:"eye"`
	Hat     string         `json:"hat"`
	Shiny   bool           `json:"shiny"`
	Stats   map[string]int `json:"stats"`
}

type Frame struct {
	Lines  []string `json:"lines"`
	Width  int      `json:"width"`
	Height int      `json:"height"`
}

type bridgeMsg struct {
	Type      string     `json:"type"`
	Companion *Companion `json:"companion,omitempty"`
	Lines     []string   `json:"lines,omitempty"`
	Width     int        `json:"width,omitempty"`
	Height    int        `json:"height,omitempty"`
	Message   string     `json:"message,omitempty"`
}

type bridgeCmd struct {
	Cmd    string `json:"cmd"`
	Seed   string `json:"seed,omitempty"`
	Name   string `json:"name,omitempty"`
	Text   string `json:"text,omitempty"`
	Stream bool   `json:"stream,omitempty"`
}

type Bridge struct {
	cmd       *exec.Cmd
	stdin     io.WriteCloser
	mu        sync.Mutex
	frame     Frame
	companion *Companion
	frameCh   chan Frame
	running   bool
}

// bridgePath returns the path to bridge.js relative to this Go file.
func bridgePath() string {
	_, filename, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(filename), "bridge-files", "bridge.js")
}

func NewBridge() *Bridge {
	return &Bridge{
		frameCh: make(chan Frame, 8),
	}
}

func (b *Bridge) Start(seed, name string) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.running {
		return nil
	}

	bp := bridgePath()
	b.cmd = exec.Command("node", bp)
	var err error

	b.stdin, err = b.cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("buddy stdin: %w", err)
	}

	stdout, err := b.cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("buddy stdout: %w", err)
	}

	if err := b.cmd.Start(); err != nil {
		return fmt.Errorf("buddy start: %w", err)
	}
	b.running = true

	// Background reader
	go b.readLoop(stdout)

	// Send hatch
	return b.sendLocked(bridgeCmd{
		Cmd: "hatch", Seed: seed, Name: name, Stream: true,
	})
}

func (b *Bridge) readLoop(stdout io.Reader) {
	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		var msg bridgeMsg
		if json.Unmarshal(scanner.Bytes(), &msg) != nil {
			continue
		}
		switch msg.Type {
		case "hatched":
			b.mu.Lock()
			b.companion = msg.Companion
			b.mu.Unlock()
		case "frame":
			f := Frame{Lines: msg.Lines, Width: msg.Width, Height: msg.Height}
			b.mu.Lock()
			b.frame = f
			b.mu.Unlock()
			select {
			case b.frameCh <- f:
			default:
			}
		case "stopped":
			return
		}
	}
}

func (b *Bridge) sendLocked(cmd bridgeCmd) error {
	if b.stdin == nil {
		return fmt.Errorf("bridge not running")
	}
	data, _ := json.Marshal(cmd)
	_, err := fmt.Fprintf(b.stdin, "%s\n", data)
	return err
}

func (b *Bridge) send(cmd bridgeCmd) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.sendLocked(cmd)
}

func (b *Bridge) Say(text string) error {
	return b.send(bridgeCmd{Cmd: "say", Text: text})
}

func (b *Bridge) Pet() error {
	return b.send(bridgeCmd{Cmd: "pet"})
}

func (b *Bridge) CurrentFrame() Frame {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.frame
}

func (b *Bridge) Companion() *Companion {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.companion
}

func (b *Bridge) FrameChan() <-chan Frame {
	return b.frameCh
}

func (b *Bridge) Stop() {
	b.mu.Lock()
	if !b.running {
		b.mu.Unlock()
		return
	}
	b.running = false
	_ = b.sendLocked(bridgeCmd{Cmd: "stop"})
	b.mu.Unlock()
	if b.stdin != nil {
		b.stdin.Close()
	}
	if b.cmd != nil {
		b.cmd.Wait()
	}
}
GOEOF

cat > "$GO_BUDDY/model.go" << 'GOEOF'
package buddy

import (
	"math/rand"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// FrameMsg is a Bubble Tea message carrying a new frame.
type FrameMsg Frame

// Model is the Bubble Tea model for the buddy companion.
type Model struct {
	bridge  *Bridge
	frame   Frame
	visible bool
	width   int
	height  int
}

func New() Model {
	return Model{
		bridge:  NewBridge(),
		visible: true,
	}
}

// Init starts the bridge and begins listening for frames.
func (m Model) Init(seed, name string) tea.Cmd {
	return func() tea.Msg {
		if err := m.bridge.Start(seed, name); err != nil {
			return nil
		}
		// Wait for first frame
		f, ok := <-m.bridge.FrameChan()
		if !ok {
			return nil
		}
		return FrameMsg(f)
	}
}

func waitFrame(b *Bridge) tea.Cmd {
	return func() tea.Msg {
		f, ok := <-b.FrameChan()
		if !ok {
			return nil
		}
		return FrameMsg(f)
	}
}

func (m Model) Update(msg tea.Msg) (Model, tea.Cmd) {
	switch msg := msg.(type) {
	case FrameMsg:
		m.frame = Frame(msg)
		return m, waitFrame(m.bridge)

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

	case tea.KeyMsg:
		if msg.String() == "ctrl+b" {
			m.visible = !m.visible
		}
	}
	return m, nil
}

func (m Model) View() string {
	if !m.visible || len(m.frame.Lines) == 0 {
		return ""
	}
	return strings.Join(m.frame.Lines, "\n")
}

// Say makes the buddy speak.
func (m Model) Say(text string) {
	m.bridge.Say(text)
}

// Pet triggers the pet animation.
func (m Model) DoPet() {
	m.bridge.Pet()
	m.bridge.Say("purr~")
}

// React sends a random quip for the given event type.
func (m Model) React(event string) {
	quips := eventQuips[event]
	if len(quips) == 0 {
		return
	}
	m.bridge.Say(quips[rand.Intn(len(quips))])
}

// Visible returns visibility state.
func (m Model) Visible() bool { return m.visible }

// Stop cleans up the bridge subprocess.
func (m Model) Stop() { m.bridge.Stop() }

// Overlay renders the buddy in the bottom-right of the given content.
func (m Model) Overlay(content string, w, h int) string {
	if !m.visible || len(m.frame.Lines) == 0 {
		return content
	}
	return lipgloss.Place(w, h, lipgloss.Right, lipgloss.Bottom, m.View())
}

var eventQuips = map[string][]string{
	"tool_start":    {"working on it...", "let me see...", "hmm...", "on it!"},
	"tool_complete": {"done!", "got it!", "nice!", "nailed it!"},
	"error":         {"uh oh...", "oops!", "let's try again", "bugs happen!"},
	"idle":          {"*yawn*", "*stretch*", "snack break?", "you got this!"},
	"completion":    {"looks good!", "nice code!", "ship it!", "well done!"},
	"greeting":      {"hey!", "let's code!", "ready when you are", "bugs beware!"},
}
GOEOF

ok "Go buddy package created at $GO_BUDDY"

# ── Patch tui.go ────────────────────────────────────────────────
TUI_FILE="$OC_DIR/internal/tui/tui.go"

if [ -f "$TUI_FILE" ]; then
    info "Patching tui.go..."

    # Check if already patched
    if grep -q 'buddy\.' "$TUI_FILE"; then
        warn "tui.go already contains buddy references — skipping patch"
    else
        # Backup
        cp "$TUI_FILE" "$TUI_FILE.bak"

        # 1. Add buddy field to appModel struct
        sed -i.tmp 's/type appModel struct {/type appModel struct {\n\tbuddy buddy.Model/' "$TUI_FILE"

        # 2. Add import for buddy package
        # Find the import block and add our import
        BUDDY_IMPORT="${MODULE_PATH}/internal/tui/buddy"
        if ! grep -q "$BUDDY_IMPORT" "$TUI_FILE"; then
            sed -i.tmp "s|\"github.com/charmbracelet/bubbletea\"|\"github.com/charmbracelet/bubbletea\"\n\t\"${BUDDY_IMPORT}\"|" "$TUI_FILE"
        fi

        # 3. Add buddy init in the Init() function
        # Find "func (a appModel) Init()" and add buddy init after the first return/batch
        # This is tricky to do generically, so we create a helper file instead

        cat > "$GO_BUDDY/PATCH_MANUAL.md" << PATCHEOF
# Manual patch steps for tui.go

The installer added the buddy field and import. Complete these steps manually:

## In Init() function, add to the tea.Batch():

\`\`\`go
a.buddy.Init(os.Getenv("USER"), ""),
\`\`\`

## In Update() function, add this case:

\`\`\`go
case buddy.FrameMsg:
    var cmd tea.Cmd
    a.buddy, cmd = a.buddy.Update(msg)
    return a, cmd
\`\`\`

## In Update(), add event reactions where agent events are handled:

\`\`\`go
// After pubsub.Event[agent.AgentEvent]:
a.buddy.React("tool_start")    // when tool starts
a.buddy.React("tool_complete") // when tool completes
a.buddy.React("error")         // on errors
\`\`\`

## In View() function, wrap the final return:

\`\`\`go
// Replace: return appView
// With:
return a.buddy.Overlay(appView, a.width, a.height)
\`\`\`

## Add cleanup in shutdown:

\`\`\`go
a.buddy.Stop()
\`\`\`

## Add Ctrl+B handling in the key switch:

\`\`\`go
case key.Matches(msg, key.NewBinding(key.WithKeys("ctrl+b"))):
    a.buddy, _ = a.buddy.Update(msg)
    return a, nil
\`\`\`
PATCHEOF

        rm -f "$TUI_FILE.tmp"
        ok "tui.go patched (struct + import). See $GO_BUDDY/PATCH_MANUAL.md for remaining steps."
    fi
else
    warn "tui.go not found at expected path. You'll need to integrate manually."
    warn "See $GO_BUDDY/model.go for the Bubble Tea model API."
fi

# ── Verify Go compiles ─────────────────────────────────────────
info "Checking Go module..."
cd "$OC_DIR"

# Ensure bubbletea and lipgloss are available
go get github.com/charmbracelet/bubbletea@latest 2>/dev/null || true
go get github.com/charmbracelet/lipgloss@latest 2>/dev/null || true

# Try to compile the buddy package
if go build "./internal/tui/buddy/..." 2>/dev/null; then
    ok "Go buddy package compiles successfully"
else
    warn "Go buddy package has compile issues — check imports match your module structure"
fi

# ── Done ────────────────────────────────────────────────────────
echo ""
ok "=== terminal-buddy installed into OpenCode CLI ==="
ok ""
ok "Bridge files: $BRIDGE_DEST/"
ok "Go package:   $GO_BUDDY/"
ok ""
ok "Next steps:"
ok "  1. Complete manual patches: cat $GO_BUDDY/PATCH_MANUAL.md"
ok "  2. go build ./..."
ok "  3. Run opencode — buddy appears in bottom-right (Ctrl+B to toggle)"
echo ""
