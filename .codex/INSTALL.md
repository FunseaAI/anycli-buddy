# Installing anycli-buddy for Codex CLI

A coding companion that lives in your terminal — animated ASCII pet with context-aware reactions.

## Prerequisites
- Node.js >= 18
- tmux (`brew install tmux` on macOS)
- Git

## Installation

1. **Clone the anycli-buddy repository:**
   ```bash
   git clone https://github.com/FunseaAI/anycli-buddy.git ~/.codex/buddy-repo
   ```

2. **Create the buddy home directory and copy files:**
   ```bash
   mkdir -p ~/.codex/buddy
   cp ~/.codex/buddy-repo/types.js ~/.codex/buddy/
   cp ~/.codex/buddy-repo/sprites.js ~/.codex/buddy/
   cp ~/.codex/buddy-repo/companion.js ~/.codex/buddy/
   cp ~/.codex/buddy-repo/renderer.js ~/.codex/buddy/
   cp ~/.codex/buddy-repo/terminal.js ~/.codex/buddy/
   cp ~/.codex/buddy-repo/quips.js ~/.codex/buddy/
   cp ~/.codex/buddy-repo/index.js ~/.codex/buddy/
   cp ~/.codex/buddy-repo/package.json ~/.codex/buddy/
   cp ~/.codex/buddy-repo/codex-plugin/*.js ~/.codex/buddy/
   cp ~/.codex/buddy-repo/codex-plugin/codex-buddy ~/.codex/buddy/
   cp ~/.codex/buddy-repo/codex-plugin/buddy-hook.sh ~/.codex/buddy/
   chmod +x ~/.codex/buddy/buddy-hook.sh ~/.codex/buddy/codex-buddy
   ```

3. **Configure Codex hooks:**
   ```bash
   cp ~/.codex/buddy-repo/codex-plugin/hooks.json ~/.codex/hooks.json
   ```
   If you already have a `~/.codex/hooks.json`, manually merge the hooks from `~/.codex/buddy-repo/codex-plugin/hooks.json` into your existing file.

4. **Enable the codex_hooks feature:**
   ```bash
   codex features enable codex_hooks
   ```

5. **Inject companion system prompt:**
   ```bash
   node ~/.codex/buddy/prompt-inject.js
   ```

## Verify

```bash
ls ~/.codex/buddy/buddy-panel.js && echo "✓ buddy installed"
```

## Usage

Start Codex with the buddy companion:
```bash
~/.codex/buddy/codex-buddy
```

First run will show a hatching animation where you name your companion.

### Commands (type in Codex prompt):
- `buddy` or `buddy stats` — show companion stats panel
- `buddy pet` or `pet` — pet your companion
- `buddy rename <name>` — rename your companion

### Controls:
- Buddy appears in a 6-row tmux bottom pane
- Reacts to your coding context after each AI turn
- Idle animation when nothing is happening

## Re-hatch (get a new companion)
```bash
rm ~/.codex/buddy/companion.json
```
Next time you run `codex-buddy`, the hatching animation will play again.

## Updating
```bash
cd ~/.codex/buddy-repo && git pull
cp types.js sprites.js companion.js renderer.js terminal.js quips.js index.js package.json ~/.codex/buddy/
cp codex-plugin/*.js codex-plugin/buddy-hook.sh codex-plugin/codex-buddy ~/.codex/buddy/
chmod +x ~/.codex/buddy/buddy-hook.sh ~/.codex/buddy/codex-buddy
```

## Uninstalling
```bash
rm -rf ~/.codex/buddy ~/.codex/buddy-repo ~/.codex/hooks.json
codex features disable codex_hooks
```
