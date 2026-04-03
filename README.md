# anycli-buddy

An animated ASCII companion for your terminal coding agent. Works with **Codex CLI**, **OpenCode**, and any terminal.

```
   .----.
  / ✦  ✦ \   ── "bug squashed!"
  |      |
  ~`~``~`~
   Pixa ★
```

Your buddy watches your coding session, reacts to errors, celebrates fixes, and keeps you company during long debug sessions. 18 species, 5 rarity tiers, animated idle cycles, speech bubbles, and a hatching ceremony when you first meet.

---

## Install

### One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash
```

Then run from any project directory:

```bash
codex-buddy
```

### Codex CLI (auto-install via AI)

Tell Codex:

```
Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.codex/INSTALL.md
```

### OpenCode

Tell OpenCode:

```
Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.opencode/INSTALL.md
```

### Manual (shell)

```bash
git clone https://github.com/FunseaAI/anycli-buddy.git
cd anycli-buddy/codex-plugin && bash install.sh
```

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

The buddy lives in a tmux bottom pane. It animates in real-time (idle fidget, blink), speaks in response to your coding context, and stays out of the way.

---

## Features

### Hatching ceremony

First run plays an interactive hatching animation:

```
    _*_           * . *         / ✦  ✦ \
   / . \    →   . \ / .    →   |      |
  |  / .|       --+--          ~`~``~`~
  |. /  |       . / \ .
   \*__/         * . *       Give your ghost a name: _
```

Egg wobble → cracks → burst → species reveal → you name it → stats roll in one by one.

### 18 species

duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk

Each with 3 animation frames, unique face, and species-specific fidget patterns.

### Rarity system

| Rarity | Chance | Stars |
|--------|--------|-------|
| common | 60% | ★ |
| uncommon | 25% | ★★ |
| rare | 10% | ★★★ |
| epic | 4% | ★★★★ |
| legendary | 1% | ★★★★★ |

Higher rarity = higher stat floors, hats unlocked, stronger personality.

### 5 stats shaped by your coding style

| Stat | Influenced by |
|------|---------------|
| DEBUGGING | Fix/debug commits in your git history |
| PATIENCE | Detailed commit messages, many small commits |
| CHAOS | Reverts, force pushes, late-night coding |
| WISDOM | Refactoring commits, test runner usage |
| SNARK | Vim user, prolific coder |

Stats influence which reactions your buddy picks. High SNARK buddies say "ez" and "ship it!". High PATIENCE ones say "I believe in you".

### Context-aware reactions

Your buddy reads the actual conversation content and responds to what's happening:

| What happened | Buddy says |
|---------------|-----------|
| Fixed a bug | "bug squashed!" |
| Tests pass | "all green!" |
| Tests fail | "test caught something" |
| Build succeeds | "it builds!" |
| TypeError in output | "syntax demons!" |
| Git push | "shipped!" |
| Deploy to production | "fingers crossed" |
| Merge conflict | "conflict! *hides*" |
| User asks to debug | "let's find it" |
| User asks to refactor | "clean code!" |
| Nothing happening | zzZ |

47 content rules + 9 prompt rules + stat-weighted fallback quips. Buddy only speaks on turn completion — silent during tool execution.

### Commands

Type in Codex/OpenCode prompt:

| Command | Effect |
|---------|--------|
| `buddy` | Show stats panel (8s) |
| `buddy stats` | Same |
| `buddy pet` | Buddy says "purr~ ♥" |
| `pet` | Same |
| `buddy rename Sparky` | Rename companion |

### System prompt integration

On launch, buddy injects a companion intro into `instructions.md` so the AI knows about your buddy. When you mention your buddy by name, the AI stays brief and lets the buddy handle reactions.

---

## Standalone usage

Works without any CLI agent:

```bash
cd anycli-buddy

node cli.js gallery        # see all 18 species
node cli.js hatch myname   # generate a companion
node cli.js animate        # live animation (Ctrl+C to exit)
node demo.js               # interactive demo
```

---

## Architecture

```
codex-buddy (shell)
  ├── First run? → hatch-flow.js (hatching animation + naming)
  ├── prompt-inject.js (write companion intro to instructions.md)
  └── tmux split
       ├── Top pane: codex / opencode
       └── Bottom pane (6 rows): buddy-panel.js
            ├── Animated sprite (500ms tick)
            ├── Speech bubbles (10s display, 3s fade)
            └── Unix socket ← buddy-hook.sh ← CLI hooks
```

**Hook pipeline** (zero impact on agent):
```
CLI event → buddy-hook.sh (pure bash, 5 lines, background nc) → exit 0
                  ↓ (Unix socket, non-blocking)
            buddy-panel.js → context-reactor.js → reaction
```

No Node.js fork per event. No API calls. No blocking.

---

## Files

```
anycli-buddy/
├── .codex/INSTALL.md        # Fetch-and-follow install for Codex
├── .opencode/INSTALL.md     # Fetch-and-follow install for OpenCode
│
├── sprites.js               # 18 species × 3 frames ASCII art
├── companion.js             # Mulberry32 PRNG seed generation
├── renderer.js              # BuddyRenderer (animation engine)
├── types.js                 # Species, rarity, eyes, hats, stats
├── quips.js                 # Stat-weighted reaction pools
├── terminal.js              # ANSI cursor positioning
├── bridge.js                # JSON-over-stdio for Go/Rust/Python
├── cli.js                   # CLI tool
├── demo.js                  # Interactive demo
├── index.js                 # Public API
│
├── codex-plugin/
│   ├── install.sh           # Shell installer
│   ├── codex-buddy          # tmux launcher
│   ├── buddy-panel.js       # Panel renderer + event handler
│   ├── buddy-hook.sh        # Lightweight hook (5 lines)
│   ├── hooks.json           # Hook config for 5 events
│   ├── context-reactor.js   # Pattern matching reaction engine
│   ├── hatch-animation.js   # Hatching ceremony (centered, animated)
│   ├── hatch-flow.js        # First-run orchestrator
│   ├── storage.js           # Companion persistence
│   ├── user-profile.js      # Git/shell analysis for stat bonuses
│   └── prompt-inject.js     # System prompt injection
│
└── README.md
```

---

## API

```js
import { hatch, BuddyRenderer, pickQuip, renderFrame } from './index.js';

// Generate a companion
const buddy = hatch('seed-string', 'OptionalName');

// Animated rendering
const renderer = new BuddyRenderer(buddy);
renderer.start((lines, prevCount) => { /* render lines */ });
renderer.say('hello!');  // speech bubble, 10s
renderer.pet();          // heart animation, 2.5s
renderer.stop();

// Static frame
const lines = renderFrame(buddy, { reaction: 'nice!' });

// Stat-weighted quip
const quip = pickQuip('completion', buddy.stats, Date.now());
```

---

## License

MIT
