#!/usr/bin/env bash
# anycli-buddy one-line installer
# Usage: curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash

set -euo pipefail

REPO="https://github.com/FunseaAI/anycli-buddy.git"
BUDDY_HOME="$HOME/.codex/buddy"

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

# Plugin
for f in codex-plugin/*.js codex-plugin/buddy-hook.sh codex-plugin/codex-buddy; do
    cp "$f" "$BUDDY_HOME/"
done

chmod +x "$BUDDY_HOME/buddy-hook.sh" "$BUDDY_HOME/codex-buddy"

# ── Configure hooks ─────────────────────────────────────────────
HOOKS_FILE="$HOME/.codex/hooks.json"
if [ -f "$HOOKS_FILE" ]; then
    if grep -q "buddy" "$HOOKS_FILE" 2>/dev/null; then
        ok "Hooks already configured"
    else
        info "Backing up existing hooks.json → hooks.json.bak"
        cp "$HOOKS_FILE" "$HOOKS_FILE.bak"
        cp codex-plugin/hooks.json "$HOOKS_FILE"
        ok "Hooks configured (old config backed up)"
    fi
else
    cp codex-plugin/hooks.json "$HOOKS_FILE"
    ok "Hooks configured"
fi

# ── Enable codex_hooks feature ──────────────────────────────────
if command -v codex >/dev/null 2>&1; then
    codex features enable codex_hooks 2>/dev/null && ok "codex_hooks enabled" || true
fi

# ── Inject system prompt ────────────────────────────────────────
if [ -f "$BUDDY_HOME/companion.json" ]; then
    node "$BUDDY_HOME/prompt-inject.js" 2>/dev/null && ok "System prompt updated" || true
fi

# ── Done ────────────────────────────────────────────────────────
echo ""
ok "=== anycli-buddy installed! ==="
echo ""
echo -e "  Start:      ${CYAN}~/.codex/buddy/codex-buddy${NC}"
echo -e "  Re-hatch:   ${DIM}rm ~/.codex/buddy/companion.json${NC}"
echo -e "  Update:     ${DIM}curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash${NC}"
echo -e "  Uninstall:  ${DIM}rm -rf ~/.codex/buddy && rm ~/.codex/hooks.json${NC}"
echo ""
