# Installing terminal-buddy for Claude Code

A coding companion that lives in your terminal — the same buddy system built into Claude Code, now installable as a standalone enhancement.

## Prerequisites
- Node.js >= 18
- Git

## Installation

1. **Clone the terminal-buddy repository:**
   ```bash
   git clone https://github.com/anthropics/terminal-buddy.git ~/.claude/buddy-repo
   ```

2. **Try the companion standalone:**
   ```bash
   cd ~/.claude/buddy-repo
   node cli.js gallery     # see all 18 species
   node cli.js hatch $USER # generate your companion
   node cli.js animate     # live animation demo
   ```

3. **Run the interactive demo:**
   ```bash
   node demo.js
   ```
   Commands: `say <text>`, `pet`, `info`, `gallery`, `quit`

## Note

Claude Code v2.1.90+ has the buddy system built-in (feature flag: `BUDDY`). This standalone version is for:
- Exploring the companion system outside of Claude Code
- Using the companion in other CLI tools (Codex, OpenCode)
- Research and customization

To enable the built-in buddy in Claude Code:
```bash
CLAUDE_CODE_FEATURE_BUDDY=1 claude
```

## Verify

```bash
node ~/.claude/buddy-repo/cli.js face $USER && echo "✓ buddy works"
```

## Uninstalling
```bash
rm -rf ~/.claude/buddy-repo
```
