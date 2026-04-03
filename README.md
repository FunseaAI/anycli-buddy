<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./docs/README.zh.md">中文</a> ·
  <a href="./docs/README.ja.md">日本語</a> ·
  <a href="./docs/README.fr.md">Français</a> ·
  <a href="./docs/README.ru.md">Русский</a>
</p>

<h1 align="center">🐾 AnyCLI-Buddy</h1>

<p align="center">
  <strong>A terminal pet that hatches from an egg and reacts to your code.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/species-18-blue" alt="18 species">
  <img src="https://img.shields.io/badge/rarity_tiers-5-purple" alt="5 rarity tiers">
  <img src="https://img.shields.io/badge/zero-dependencies-green" alt="zero dependencies">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="node >= 18">
  <img src="https://img.shields.io/github/license/FunseaAI/anycli-buddy" alt="MIT License">
  <img src="https://img.shields.io/github/stars/FunseaAI/anycli-buddy?style=social" alt="GitHub Stars">
</p>

<p align="center">
  <img src="docs/demo.svg" alt="AnyCLI-Buddy Hatching Demo" width="600">
</p>

<p align="center">
  <sub>▲ Your companion hatches with a unique species, rarity, and stats based on your coding style</sub>
</p>

---

> **Your buddy watches your coding session.** It reacts when you squash bugs (*"bug squashed!"*), cheers when tests pass (*"all green!"*), and hides during merge conflicts (*"conflict! \*hides\*"*). When nothing's happening, it just sits there going *zzZ*.

<br>

## ⚡ One-command install

### Codex CLI

```bash
# Step 1: Install
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash

# Step 2: Run (from any project directory)
codex-buddy
```

### OpenCode

```bash
# Step 1: Install
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install-opencode.sh | bash

# Step 2: Run (from any project directory)
opencode-buddy
```

> First run shows a hatching animation — pick a name, see your companion's stats roll in. After that, your buddy appears automatically every time.

<details>
<summary>💬 Or tell your AI agent to install it</summary>
<br>

**Codex:**
> Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.codex/INSTALL.md

**OpenCode:**
> Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.opencode/INSTALL.md

</details>

---

## 🖥️ What it looks like

```
┌─────────────────────────────────────────────────┐
│  >_ Codex CLI                                   │
│                                                 │
│  > fix the auth bug                             │
│  • Fixed null check in login.js                 │
│                                                 │
├─────────────────────────────────────────────────┤
│       n______n                                  │
│      ( ·    · )    ── "bug squashed!"           │
│      (   oo   )                                 │
│       `------´                                  │
│       Cappie ★★★                                │
└─────────────────────────────────────────────────┘
```

<sub>Buddy lives in a tmux bottom pane (6 rows). Animates in real-time, stays out of the way, zero impact on your agent.</sub>

---

## ✨ Features

### 🥚 Hatching ceremony

Your first run plays a full hatching sequence — egg wobble, cracks, burst, species reveal, **you name it**, then stats roll in one by one:

```
    _*_            * . *           n______n
   / . \    →    . \ / .    →    ( ·    · )
  |  / .|        --+--           (   oo   )
  |. /  |        . / \ .          `------´
   \*__/          * . *
                                Give your capybara a name: _
```

Stats are shaped by **your actual git history** — late-night coder? High CHAOS. Clean commit messages? High PATIENCE.

### 🐾 18 species

<table>
<tr><td>🦆 duck</td><td>🪿 goose</td><td>🫧 blob</td><td>🐱 cat</td><td>🐉 dragon</td><td>🐙 octopus</td></tr>
<tr><td>🦉 owl</td><td>🐧 penguin</td><td>🐢 turtle</td><td>🐌 snail</td><td>👻 ghost</td><td>🦎 axolotl</td></tr>
<tr><td>🦫 capybara</td><td>🌵 cactus</td><td>🤖 robot</td><td>🐰 rabbit</td><td>🍄 mushroom</td><td>😺 chonk</td></tr>
</table>

Each with **3 animation frames**, unique ASCII face, and species-specific idle fidgets.

### 🎲 Rarity & hats

| | Chance | Stars | Hats |
|:--|:--|:--|:--|
| **common** | 60% | ★ | — |
| **uncommon** | 25% | ★★ | crown, tophat, propeller... |
| **rare** | 10% | ★★★ | 〃 |
| **epic** | 4% | ★★★★ | 〃 |
| **legendary** | 1% | ★★★★★ | 〃 |

### 📊 5 stats from your coding DNA

| Stat | What boosts it |
|:--|:--|
| **DEBUGGING** | Fix/debug commits in your git log |
| **PATIENCE** | Detailed commit messages, many small commits |
| **CHAOS** | Reverts, force pushes, commits after midnight |
| **WISDOM** | Refactoring commits, test runner in shell history |
| **SNARK** | Vim user, prolific committer |

Your buddy's personality comes from these stats. High SNARK? It says *"ez"* and *"ship it!"*. High PATIENCE? *"I believe in you"*.

### 💬 Context-aware reactions

Buddy reads the **actual output** of each coding turn:

| What happened | Buddy says |
|:--|:--|
| Fixed a bug | *"bug squashed!"* |
| Tests pass | *"all green!"* |
| Tests fail | *"test caught something"* |
| Build succeeds | *"it builds!"* |
| `TypeError` in output | *"syntax demons!"* |
| `git push` | *"shipped!"* |
| Deploy to production | *"fingers crossed"* |
| Merge conflict | *"conflict! \*hides\*"* |
| Nothing happening | *zzZ* |

47 content patterns + 9 prompt patterns + stat-weighted fallback quips. Speaks only on **turn completion** — silent while the agent works.

---

## 🎮 Commands

Type in your agent's prompt (not slash commands — these go through hooks):

| Command | Effect |
|:--|:--|
| `buddy` | Show stats panel (8s) |
| `buddy stats` | Same |
| `buddy pet` | Purr~ ♥ |
| `pet` | Same |
| `buddy rename Sparky` | Rename your companion |

---

## 🧪 Try it standalone

No CLI agent needed:

```bash
git clone https://github.com/FunseaAI/anycli-buddy.git && cd anycli-buddy

node cli.js gallery        # see all 18 species
node cli.js hatch myname   # generate a companion
node cli.js animate        # live animation (Ctrl+C to exit)
node demo.js               # interactive demo
```

---

<details>
<summary>🏗️ Architecture</summary>

```
codex-buddy / opencode-buddy
  │
  ├── First run? → hatch-flow.js
  │     ├── Analyze git/shell history (user-profile.js)
  │     ├── Play hatching animation
  │     ├── User names companion → companion.json
  │     └── Inject companion intro → instructions.md
  │
  └── tmux split
       ├── Top: codex / opencode (your working directory)
       └── Bottom (6 rows): buddy-panel.js
            ├── Animated sprite (500ms tick)
            ├── Speech bubbles (10s, 3s fade)
            └── Unix socket ← buddy-hook.sh ← hooks
```

**Zero agent impact:**
```
hook event → buddy-hook.sh (5 lines, background nc) → exit 0
                   ↓ Unix socket
             buddy-panel.js → context-reactor.js → reaction
```

No Node.js fork per event. No API calls. No blocking.

</details>

<details>
<summary>📦 API — use in your own project</summary>

```js
import { hatch, BuddyRenderer, pickQuip } from 'anycli-buddy';

const buddy = hatch('seed', 'Sparky');
const renderer = new BuddyRenderer(buddy);
renderer.start((lines) => { /* render */ });
renderer.say('hello!');   // speech bubble (10s)
renderer.pet();           // heart animation (2.5s)
renderer.stop();
```

</details>

<details>
<summary>🗑️ Uninstall</summary>

```bash
# Codex
rm -rf ~/.codex/buddy && rm -f ~/.codex/hooks.json && rm -f /usr/local/bin/codex-buddy

# OpenCode
rm -rf ~/.config/opencode/buddy && rm -f /usr/local/bin/opencode-buddy
```

</details>

---

<p align="center">
  <sub>MIT License · Made with ♥ by <a href="https://github.com/FunseaAI">FunseaAI</a></sub>
</p>

<p align="center">
  <sub>If your buddy brings you joy, consider giving this repo a ⭐</sub>
</p>
