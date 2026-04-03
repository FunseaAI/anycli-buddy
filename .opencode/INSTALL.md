# Installing anycli-buddy for OpenCode CLI

A coding companion that lives in your terminal — animated ASCII pet with context-aware reactions.

## Prerequisites
- Node.js >= 18
- tmux (`brew install tmux` on macOS, `apt install tmux` on Linux)
- Git

## Installation

1. **Clone the anycli-buddy repository:**
   ```bash
   git clone https://github.com/FunseaAI/anycli-buddy.git ~/.config/opencode/buddy-repo
   ```

2. **Create the buddy home directory and copy files:**
   ```bash
   mkdir -p ~/.config/opencode/buddy
   cp ~/.config/opencode/buddy-repo/types.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/sprites.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/companion.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/renderer.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/terminal.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/quips.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/index.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/package.json ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/codex-plugin/context-reactor.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/codex-plugin/buddy-panel.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/codex-plugin/hatch-animation.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/codex-plugin/hatch-flow.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/codex-plugin/storage.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/codex-plugin/user-profile.js ~/.config/opencode/buddy/
   cp ~/.config/opencode/buddy-repo/codex-plugin/prompt-inject.js ~/.config/opencode/buddy/
   ```

3. **Create the launcher script:**
   ```bash
   cat > ~/.config/opencode/buddy/opencode-buddy << 'LAUNCHER'
   #!/usr/bin/env bash
   # opencode-buddy: launch OpenCode with buddy companion (tmux split)
   BUDDY_HOME="$HOME/.config/opencode/buddy"
   SESSION="opencode-buddy"

   command -v tmux >/dev/null 2>&1 || { echo "需要 tmux: brew install tmux"; exit 1; }
   command -v node >/dev/null 2>&1 || { echo "需要 Node.js >= 18"; exit 1; }

   # First hatch: run before tmux (needs keyboard input)
   if [ ! -f "$BUDDY_HOME/companion.json" ]; then
       node "$BUDDY_HOME/hatch-flow.js"
       clear
   fi

   # Inject system prompt
   node "$BUDDY_HOME/prompt-inject.js" 2>/dev/null

   if [ -n "$TMUX" ]; then
       tmux split-window -v -l 6 "cd $BUDDY_HOME && node buddy-panel.js"
       opencode "$@"
       tmux kill-pane -t bottom 2>/dev/null
       exit 0
   fi

   tmux kill-session -t "$SESSION" 2>/dev/null
   OC_CMD="opencode $*; tmux kill-session -t $SESSION"
   tmux new-session -d -s "$SESSION" -x "$(tput cols)" -y "$(tput lines)" "$OC_CMD"
   tmux split-window -v -t "$SESSION" -l 6 "cd $BUDDY_HOME && node buddy-panel.js"
   tmux set-hook -t "$SESSION" after-resize-pane "resize-pane -t '$SESSION:0.1' -y 6"
   tmux select-pane -t "$SESSION:0.0"
   tmux attach -t "$SESSION"
   LAUNCHER
   chmod +x ~/.config/opencode/buddy/opencode-buddy
   ```

4. **Update prompt-inject.js to use OpenCode's instructions path:**
   ```bash
   sed -i.bak "s|\.codex|.config/opencode|g" ~/.config/opencode/buddy/prompt-inject.js
   rm -f ~/.config/opencode/buddy/prompt-inject.js.bak
   ```

## Verify

```bash
ls ~/.config/opencode/buddy/buddy-panel.js && echo "✓ buddy installed"
```

## Usage

Start OpenCode with the buddy companion:
```bash
~/.config/opencode/buddy/opencode-buddy
```

First run shows a hatching animation where you name your companion.

### Interaction:
- Buddy appears in a 6-row tmux bottom pane below OpenCode
- Animated idle sprite with fidget/blink cycles
- Reacts to coding context (errors, tests, deployments, etc.)

## Re-hatch (get a new companion)
```bash
rm ~/.config/opencode/buddy/companion.json
```

## Updating
```bash
cd ~/.config/opencode/buddy-repo && git pull
cp types.js sprites.js companion.js renderer.js terminal.js quips.js index.js package.json ~/.config/opencode/buddy/
cp codex-plugin/context-reactor.js codex-plugin/buddy-panel.js codex-plugin/hatch-animation.js ~/.config/opencode/buddy/
cp codex-plugin/hatch-flow.js codex-plugin/storage.js codex-plugin/user-profile.js ~/.config/opencode/buddy/
```

## Uninstalling
```bash
rm -rf ~/.config/opencode/buddy ~/.config/opencode/buddy-repo
```
