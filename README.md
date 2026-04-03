# terminal-buddy

从 Claude Code 2.1 源码中提取并重构的终端宠物伴侣系统。可以独立运行，也可以作为插件集成到 Codex CLI、OpenCode 等 CLI Agent 中。

---

## 一键安装

### Codex CLI

Tell Codex:

```
Fetch and follow instructions from https://raw.githubusercontent.com/anthropics/terminal-buddy/refs/heads/main/.codex/INSTALL.md
```

### OpenCode

Tell OpenCode:

```
Fetch and follow instructions from https://raw.githubusercontent.com/anthropics/terminal-buddy/refs/heads/main/.opencode/INSTALL.md
```

### Claude Code

Tell Claude Code:

```
Fetch and follow instructions from https://raw.githubusercontent.com/anthropics/terminal-buddy/refs/heads/main/.claude/INSTALL.md
```

### 手动安装（Shell）

```bash
# Codex CLI
cd terminal-buddy/codex-plugin && bash install.sh

# 独立体验
cd terminal-buddy && node cli.js animate
```

---

## 项目结构

```
terminal-buddy/
├── terminal-buddy/          # 核心包（零依赖，纯 Node.js）
│   ├── sprites.js           # 18 种宠物 × 3 帧 ASCII 动画
│   ├── companion.js         # 种子生成器（相同种子 = 相同宠物）
│   ├── renderer.js          # BuddyRenderer 动画引擎
│   ├── types.js             # 种类/稀有度/眼睛/帽子/颜色常量
│   ├── quips.js             # 基于属性加权的台词系统
│   ├── terminal.js          # ANSI 光标定位工具
│   ├── bridge.js            # JSON-over-stdio 跨语言桥接
│   ├── cli.js               # 命令行工具
│   ├── demo.js              # 交互式演示
│   └── index.js             # 公共 API 导出
│
├── codex-plugin/            # Codex CLI 插件（推荐方式）
│   ├── install.sh           # 一键安装脚本
│   ├── codex-buddy          # 启动器（tmux 分屏）
│   ├── buddy-panel.js       # 面板渲染（动画 + 事件响应）
│   ├── buddy-hook.sh        # Codex hooks 脚本
│   └── hooks.json           # Codex hooks 配置
│
├── terminal-buddy-ink/      # React/Ink 组件（用于 Ink 系 TUI）
│   └── src/
│       ├── CompanionSprite.tsx
│       ├── SpeechBubble.tsx
│       ├── useAnimation.ts
│       └── useBubbleTimer.ts
│
└── terminal-buddy-opencode/ # Go/Bubble Tea 集成
    ├── bridge.go            # 子进程管理
    ├── buddy.go             # Bubble Tea Model
    ├── events.go            # 事件映射
    └── overlay.go           # lipgloss 定位
```

---

## 宠物系统

### 18 种宠物

duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk

### 5 种稀有度

| 稀有度 | 概率 | 颜色 | 星级 |
|--------|------|------|------|
| common | 60% | 灰色 | ★ |
| uncommon | 25% | 绿色 | ★★ |
| rare | 10% | 青色 | ★★★ |
| epic | 4% | 品红 | ★★★★ |
| legendary | 1% | 金色 | ★★★★★ |

### 属性系统

每只宠物有 5 项属性（DEBUGGING / PATIENCE / CHAOS / WISDOM / SNARK），影响台词选择的权重。

### 确定性生成

相同的种子（用户 ID）永远生成同一只宠物：
```js
import { hatch } from './companion.js';
const buddy = hatch('your-username');
// 永远是同一只 → 例如 Pixa (common ghost, ✦ 眼睛)
```

---

## 快速体验

```bash
cd terminal-buddy

# 查看所有宠物
node cli.js gallery

# 生成你的宠物
node cli.js hatch $USER

# 实时动画
node cli.js animate

# 交互式演示（say/pet/info/gallery）
node demo.js
```

---

## 集成到 Codex CLI

### 安装

```bash
cd terminal-buddy/codex-plugin
bash install.sh
```

安装脚本会：
1. 复制 buddy 文件到 `~/.codex/buddy/`
2. 配置 `~/.codex/hooks.json`（5 个事件钩子）
3. 启用 `codex_hooks` feature flag

### 使用

```bash
~/.codex/buddy/codex-buddy
```

效果：tmux 上下分屏，上方 Codex CLI，下方 6 行高的 buddy 面板。

### 工作原理

```
┌─────────────────────────────────┐
│         Codex CLI (TUI)         │
│                                 │
│  > hello                        │
│  • Hi! What can I help with?    │
│                                 │
├─────────────────────────────────┤
│     .----.                      │
│    / ✦  ✦ \   ── "hey!"        │
│    |      |                     │
│    ~`~``~`~                     │
│     Pixa ★                      │
└─────────────────────────────────┘
```

- **buddy-panel.js** 在 tmux 底部面板中渲染动画精灵
- **buddy-hook.sh** 被 Codex 的 hooks 系统在每个事件时调用
- 通过 **Unix socket** 把事件传给 buddy-panel
- buddy 根据事件类型说出对应台词：

| Codex 事件 | buddy 反应 |
|-----------|-----------|
| SessionStart | greeting（"hey!" / "let's code!"） |
| UserPromptSubmit | idle（"what if we..." / "*stretch*"） |
| PreToolUse | tool_start（"working on it..." / "on it!"） |
| PostToolUse | tool_complete（"done!" / "nice!"） |
| PostToolUse (error) | error（"uh oh..." / "bugs happen!"） |
| Stop | completion（"looks good!" / "ship it!"） |

### 卸载

```bash
rm -rf ~/.codex/buddy
rm ~/.codex/hooks.json
codex features disable codex_hooks
```

---

## 集成到 OpenCode CLI

### 方式：Go + JSON 桥接

OpenCode 使用 Go/Bubble Tea，通过子进程桥接方式集成：

```bash
cd terminal-buddy-opencode
# 参考 opencode-patch.md 进行集成
```

Go 端通过 `bridge.go` 启动 `node bridge.js` 子进程，以 JSON lines 协议通信：

```
→ {"cmd":"hatch","seed":"user","stream":true}
← {"type":"frame","lines":["..."]}
→ {"cmd":"say","text":"nice!"}
```

---

## 核心 API

### companion.js

```js
hatch(seed, name?)  // 生成宠物
roll(seed)          // 只生成骨架（不含名字）
```

### renderer.js

```js
const renderer = new BuddyRenderer(companion);
renderer.start(onFrame);  // 开始动画（500ms/帧）
renderer.say("hello!");   // 说话（气泡 10 秒后消失）
renderer.pet();           // 摸摸（爱心动画）
renderer.stop();          // 停止
```

### quips.js

```js
pickQuip(event, stats, seed)  // 按属性加权选台词
// event: 'greeting' | 'tool_start' | 'tool_complete' | 'error' | 'idle' | 'completion'
```

### bridge.js（跨语言集成）

```bash
echo '{"cmd":"hatch","seed":"test","stream":true}' | node bridge.js
# 输出 JSON 帧流，每 500ms 一帧
```

---

## 技术细节

- **零外部依赖**：核心包只用 Node.js 内置模块
- **确定性 PRNG**：Mulberry32 算法 + FNV-1a 哈希
- **动画系统**：3 帧 idle 序列 [0,0,0,0,1,0,0,0,-1,0,0,2,0,0,0]，-1 = 眨眼
- **气泡系统**：显示 20 tick（~10s），最后 6 tick 渐隐
- **台词权重**：高 SNARK 属性的宠物更可能说 "ez" / "ship it!"
- **ANSI 渲染**：绝对定位（ESC[row;colH），不依赖 React/Ink
- **跨语言桥接**：JSON lines over stdin/stdout，支持 Go/Rust/Python 消费

---

## 源码来源

从 Claude Code 2.1.88 的 `cli.js.map` 中逆向还原，涉及以下原始文件：

- `src/buddy/CompanionSprite.tsx` — React/Ink 组件（参考用于 Ink 版）
- `src/buddy/sprites.ts` — 18 种宠物的 ASCII art 数据
- `src/buddy/companion.ts` — 种子生成逻辑
- `src/buddy/types.ts` — 类型定义
- `src/buddy/useBuddyNotification.tsx` — 通知钩子
- `src/buddy/prompt.ts` — 系统提示词
