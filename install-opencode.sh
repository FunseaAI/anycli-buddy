#!/usr/bin/env bash
# anycli-buddy installer for OpenCode CLI
# Usage: curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install-opencode.sh | bash

set -euo pipefail

REPO="https://github.com/FunseaAI/anycli-buddy.git"
BUDDY_HOME="$HOME/.config/opencode/buddy"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

info()  { echo -e "${CYAN}[anycli-buddy]${NC} $*"; }
ok()    { echo -e "${GREEN}[anycli-buddy]${NC} $*"; }
fail()  { echo -e "${RED}[anycli-buddy]${NC} $*"; exit 1; }

# ── Check prerequisites ─────────────────────────────────────────
command -v node >/dev/null 2>&1 || fail "Node.js >= 18 required. Install: https://nodejs.org"
command -v git  >/dev/null 2>&1 || fail "Git required."
command -v opencode >/dev/null 2>&1 || fail "OpenCode CLI not found. Install: https://github.com/opencode-ai/opencode"

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
[ "$NODE_VER" -ge 18 ] || fail "Node.js >= 18 required (found v$NODE_VER)"

if ! command -v tmux >/dev/null 2>&1; then
    info "tmux not found. Installing..."
    if command -v brew >/dev/null 2>&1; then
        brew install tmux
    elif command -v apt-get >/dev/null 2>&1; then
        sudo apt-get install -y tmux
    else
        fail "tmux required. Install manually: https://github.com/tmux/tmux"
    fi
fi

# ── Clone or update repo ────────────────────────────────────────
if [ -d "$BUDDY_HOME/repo" ]; then
    info "Updating existing installation..."
    cd "$BUDDY_HOME/repo" && git pull --quiet
else
    info "Cloning anycli-buddy..."
    mkdir -p "$BUDDY_HOME"
    git clone --quiet --depth 1 "$REPO" "$BUDDY_HOME/repo"
fi

# ── Copy files ──────────────────────────────────────────────────
info "Installing files..."
cd "$BUDDY_HOME/repo"

# Core
for f in types.js sprites.js companion.js renderer.js terminal.js quips.js index.js package.json; do
    cp "$f" "$BUDDY_HOME/"
done

# Plugin files
for f in codex-plugin/context-reactor.js codex-plugin/buddy-panel.js codex-plugin/hatch-animation.js codex-plugin/hatch-flow.js codex-plugin/storage.js codex-plugin/user-profile.js codex-plugin/prompt-inject.js; do
    cp "$f" "$BUDDY_HOME/"
done

# ── Create launcher ─────────────────────────────────────────────
cat > "$BUDDY_HOME/opencode-buddy" << 'LAUNCHER'
#!/usr/bin/env bash
BUDDY_HOME="$HOME/.config/opencode/buddy"
SESSION="opencode-buddy"
WORK_DIR="$(pwd)"

command -v tmux >/dev/null 2>&1 || { echo "需要 tmux: brew install tmux"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "需要 Node.js >= 18"; exit 1; }

if [ ! -f "$BUDDY_HOME/companion.json" ]; then
    node "$BUDDY_HOME/hatch-flow.js"
    clear
fi

if [ -n "$TMUX" ]; then
    tmux split-window -v -l 6 "cd $BUDDY_HOME && node buddy-panel.js"
    opencode "$@"
    tmux kill-pane -t bottom 2>/dev/null
    exit 0
fi

tmux kill-session -t "$SESSION" 2>/dev/null
OC_CMD="cd '$WORK_DIR' && opencode $*; tmux kill-session -t $SESSION"
tmux new-session -d -s "$SESSION" -x "$(tput cols)" -y "$(tput lines)" -c "$WORK_DIR" "$OC_CMD"
tmux split-window -v -t "$SESSION" -l 6 "cd $BUDDY_HOME && node buddy-panel.js"
tmux set-hook -t "$SESSION" after-resize-pane "resize-pane -t '$SESSION:0.1' -y 6"
tmux select-pane -t "$SESSION:0.0"
tmux attach -t "$SESSION"
LAUNCHER
chmod +x "$BUDDY_HOME/opencode-buddy"

# ── Create global command ────────────────────────────────────────
LINKED=false
for BINDIR in /usr/local/bin "$HOME/.local/bin"; do
    if [ -d "$BINDIR" ] || mkdir -p "$BINDIR" 2>/dev/null; then
        if ln -sf "$BUDDY_HOME/opencode-buddy" "$BINDIR/opencode-buddy" 2>/dev/null; then
            ok "Command: opencode-buddy → $BINDIR/"
            LINKED=true
            break
        fi
    fi
done
if [ "$LINKED" = false ]; then
    info "Could not create global command. Use: ~/.config/opencode/buddy/opencode-buddy"
fi

# ── Done ────────────────────────────────────────────────────────
echo ""
ok "=== anycli-buddy installed for OpenCode! ==="
echo ""
echo -e "  Start:      ${CYAN}opencode-buddy${NC}  (from any directory)"
echo -e "  Re-hatch:   ${DIM}rm ~/.config/opencode/buddy/companion.json && opencode-buddy${NC}"
echo -e "  Update:     ${DIM}curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install-opencode.sh | bash${NC}"
echo -e "  Uninstall:  ${DIM}rm -rf ~/.config/opencode/buddy && rm -f /usr/local/bin/opencode-buddy${NC}"
echo ""
