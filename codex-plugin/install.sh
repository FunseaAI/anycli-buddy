#!/usr/bin/env bash
# One-command installer: terminal-buddy plugin for Codex CLI
# Usage: bash install.sh
#
# What it does:
#   1. Copies buddy files to ~/.codex/buddy/
#   2. Creates hooks config at ~/.codex/hooks.json
#   3. That's it — next time you run `codex`, the buddy appears

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUDDY_SRC="$SCRIPT_DIR/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

info()  { echo -e "${CYAN}[buddy]${NC} $*"; }
ok()    { echo -e "${GREEN}[buddy]${NC} $*"; }
fail()  { echo -e "${RED}[buddy]${NC} $*"; exit 1; }

# ── Prerequisites ───────────────────────────────────────────────
command -v node >/dev/null 2>&1 || fail "Node.js >= 18 is required"
NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
[ "$NODE_VER" -ge 18 ] || fail "Node.js >= 18 required (found v$NODE_VER)"

# ── Install buddy files ────────────────────────────────────────
BUDDY_HOME="$HOME/.codex/buddy"
info "Installing to $BUDDY_HOME ..."
mkdir -p "$BUDDY_HOME"

for f in bridge.js companion.js renderer.js sprites.js types.js quips.js index.js terminal.js package.json; do
    cp "$BUDDY_SRC/$f" "$BUDDY_HOME/"
done

# Copy hook script, panel, and launcher
cp "$SCRIPT_DIR/buddy-hook.sh" "$BUDDY_HOME/"
cp "$SCRIPT_DIR/buddy-panel.js" "$BUDDY_HOME/"
cp "$SCRIPT_DIR/codex-buddy" "$BUDDY_HOME/"
chmod +x "$BUDDY_HOME/buddy-hook.sh" "$BUDDY_HOME/codex-buddy"

# Symlink launcher to a PATH location
if [ -d /usr/local/bin ]; then
    ln -sf "$BUDDY_HOME/codex-buddy" /usr/local/bin/codex-buddy 2>/dev/null || true
fi

ok "Buddy files installed"

# ── Configure hooks ─────────────────────────────────────────────
HOOKS_FILE="$HOME/.codex/hooks.json"
info "Configuring Codex hooks..."

if [ -f "$HOOKS_FILE" ]; then
    # Check if already configured
    if grep -q "buddy" "$HOOKS_FILE" 2>/dev/null; then
        ok "Hooks already configured — skipping"
    else
        info "Existing hooks.json found — backing up to hooks.json.bak"
        cp "$HOOKS_FILE" "$HOOKS_FILE.bak"
        # We'll need to merge. For safety, just warn.
        echo -e "${RED}[buddy]${NC} Please manually merge buddy hooks into $HOOKS_FILE"
        echo -e "${DIM}See $BUDDY_HOME/hooks-example.json for what to add${NC}"
        cp "$SCRIPT_DIR/hooks.json" "$BUDDY_HOME/hooks-example.json"
    fi
else
    cp "$SCRIPT_DIR/hooks.json" "$HOOKS_FILE"
    ok "Hooks configured at $HOOKS_FILE"
fi

# ── Enable codex_hooks feature ──────────────────────────────────
info "Enabling codex_hooks feature..."
codex features enable codex_hooks 2>/dev/null && ok "codex_hooks enabled" || warn "Could not enable codex_hooks — run: codex features enable codex_hooks"

# ── Done ────────────────────────────────────────────────────────
echo ""
ok "=== terminal-buddy plugin installed for Codex CLI ==="
echo ""
echo -e "  The buddy companion will appear when you run ${CYAN}codex${NC}."
echo -e "  It reacts to your coding session events automatically."
echo ""
echo -e "  ${DIM}Files: $BUDDY_HOME/${NC}"
echo -e "  ${DIM}Hooks: $HOOKS_FILE${NC}"
echo ""
echo -e "  To uninstall: ${DIM}rm -rf ~/.codex/buddy && rm ~/.codex/hooks.json${NC}"
echo ""
