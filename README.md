<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./docs/README.zh.md">中文</a> ·
  <a href="./docs/README.ja.md">日本語</a> ·
  <a href="./docs/README.fr.md">Français</a> ·
  <a href="./docs/README.ru.md">Русский</a>
</p>

<h1 align="center">🐾 AnyCLI-Buddy</h1>

<p align="center">
  <strong>An animated ASCII companion for your terminal coding agent.</strong><br>
  Works with <b>Codex CLI</b> · <b>OpenCode</b> · any terminal
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#features">Features</a> ·
  <a href="#commands">Commands</a> ·
  <a href="#standalone-usage">Standalone</a> ·
  <a href="#api">API</a>
</p>

<p align="center">
  <img src="docs/demo.gif" alt="AnyCLI-Buddy Demo" width="600">
</p>

---

Your buddy watches your coding session, reacts to errors, celebrates fixes, and keeps you company during long debug sessions.

**18 species** · **5 rarity tiers** · **animated idle cycles** · **speech bubbles** · **hatching ceremony**

## Install

### Codex CLI

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash
```

Then start from any project directory:

```bash
codex-buddy
```

Or tell Codex directly:

> Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.codex/INSTALL.md

### OpenCode

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install-opencode.sh | bash
```

```bash
opencode-buddy
```

Or tell OpenCode directly:

> Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.opencode/INSTALL.md

---

## What it looks like

```
┌─────────────────────────────────────────────┐
│  >_ Codex CLI                               │
│                                             │
│  > fix the auth bug                         │
│  • Fixed null check in login.js             │
│                                             │
├─────────────────────────────────────────────┤
│        .----.                               │
│       / ✦  ✦ \   ── "bug squashed!"        │
│       |      |                              │
│       ~`~``~`~                              │
│        Pixa ★                               │
└─────────────────────────────────────────────┘
```

Buddy lives in a **tmux bottom pane** (6 rows). Animates in real-time, speaks in response to your coding context, stays out of the way.

---

## Features

### 🥚 Hatching ceremony

First run plays an interactive animation:

```
    _*_           * . *         / ✦  ✦ \
   / . \    →   . \ / .    →   |      |
  |  / .|       --+--          ~`~``~`~
  |. /  |       . / \ .
   \*__/         * . *       Give your ghost a name: _
```

Egg wobble → cracks → burst → **species reveal** → **you name it** → stats roll in one by one with suspense animation.

Your companion's stats are shaped by your actual coding style — analyzed from git history, shell usage, and project structure.

### 🐾 18 species

| | | | | | |
|---|---|---|---|---|---|
| duck | goose | blob | cat | dragon | octopus |
| owl | penguin | turtle | snail | ghost | axolotl |
| capybara | cactus | robot | rabbit | mushroom | chonk |

Each with **3 animation frames**, unique face, and species-specific fidget patterns.

### ✨ Rarity system

| Rarity | Chance | Stars | Hat |
|--------|--------|-------|-----|
| common | 60% | ★ | none |
| uncommon | 25% | ★★ | random |
| rare | 10% | ★★★ | random |
| epic | 4% | ★★★★ | random |
| legendary | 1% | ★★★★★ | random |

### 📊 5 stats shaped by your coding style

| Stat | What boosts it |
|------|----------------|
| **DEBUGGING** | Fix/debug commits in git history |
| **PATIENCE** | Detailed commit messages, many small commits |
| **CHAOS** | Reverts, force pushes, late-night coding |
| **WISDOM** | Refactoring commits, test runner usage |
| **SNARK** | Vim user, prolific coder |

Stats influence reactions. High SNARK → *"ez"*, *"ship it!"*. High PATIENCE → *"I believe in you"*.

### 💬 Context-aware reactions

Buddy reads actual conversation content:

| What happened | Buddy says |
|:---|:---|
| Fixed a bug | *"bug squashed!"* |
| Tests pass | *"all green!"* |
| Tests fail | *"test caught something"* |
| Build succeeds | *"it builds!"* |
| TypeError | *"syntax demons!"* |
| Git push | *"shipped!"* |
| Deploy | *"fingers crossed"* |
| Merge conflict | *"conflict! \*hides\*"* |
| Nothing happening | *zzZ* |

**47 content rules** + **9 prompt rules** + stat-weighted fallback quips.

Buddy speaks on **turn completion** only — silent during tool execution (zero agent impact).

---

## Commands

Type in your CLI agent's prompt:

| Command | Effect |
|:--------|:-------|
| `buddy` | Show stats panel (8s) |
| `buddy stats` | Same |
| `buddy pet` | Purr~ ♥ |
| `pet` | Same |
| `buddy rename Sparky` | Rename companion |

---

## Standalone usage

Works without any CLI agent:

```bash
git clone https://github.com/FunseaAI/anycli-buddy.git && cd anycli-buddy

node cli.js gallery        # see all 18 species
node cli.js hatch myname   # generate a companion
node cli.js animate        # live animation (Ctrl+C to exit)
node demo.js               # interactive demo
```

---

## Architecture

```
codex-buddy / opencode-buddy
  │
  ├── First run? → hatch-flow.js
  │                 ├── Analyze git/shell history (user-profile.js)
  │                 ├── Play hatching animation
  │                 ├── User names companion
  │                 └── Save to companion.json
  │
  ├── prompt-inject.js → writes companion intro to instructions.md
  │
  └── tmux split
       ├── Top pane: codex / opencode (your working directory)
       └── Bottom pane (6 rows): buddy-panel.js
            ├── Animated sprite (500ms tick, idle/fidget/blink)
            ├── Speech bubbles (10s display, 3s fade)
            └── Unix socket ← buddy-hook.sh ← CLI event hooks
```

**Hook pipeline** — zero impact on your agent:

```
CLI event → buddy-hook.sh (5 lines bash, background) → exit 0
                  ↓ Unix socket
            buddy-panel.js → context-reactor.js → reaction
```

No Node.js fork per event. No API calls. No blocking.

---

## API

Use the core library in your own projects:

```js
import { hatch, BuddyRenderer, pickQuip, renderFrame } from 'anycli-buddy';

const buddy = hatch('seed', 'Sparky');        // generate companion
const renderer = new BuddyRenderer(buddy);
renderer.start((lines) => { /* render */ });   // 500ms animation loop
renderer.say('hello!');                        // speech bubble (10s)
renderer.pet();                                // heart animation (2.5s)
renderer.stop();
```

---

## Uninstall

```bash
# Codex
rm -rf ~/.codex/buddy && rm -f ~/.codex/hooks.json && rm -f /usr/local/bin/codex-buddy

# OpenCode
rm -rf ~/.config/opencode/buddy && rm -f /usr/local/bin/opencode-buddy
```

---

<p align="center">
  <sub>MIT License · Made by <a href="https://github.com/FunseaAI">FunseaAI</a></sub>
</p>
