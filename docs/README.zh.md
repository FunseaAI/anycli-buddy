<p align="center">
  <a href="../README.md">English</a> ·
  <a href="./README.zh.md"><b>中文</b></a> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.fr.md">Français</a> ·
  <a href="./README.ru.md">Русский</a>
</p>

<h1 align="center">🐾 AnyCLI-Buddy</h1>

<p align="center">
  <strong>一只从蛋里孵出来的终端宠物，会对你的代码做出反应。</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/宠物-18种-blue" alt="18 species">
  <img src="https://img.shields.io/badge/稀有度-5级-purple" alt="5 rarity">
  <img src="https://img.shields.io/badge/零-依赖-green" alt="zero deps">
  <img src="https://img.shields.io/github/stars/FunseaAI/anycli-buddy?style=social" alt="Stars">
</p>

<p align="center">
  <img src="demo.svg" alt="AnyCLI-Buddy Demo" width="600">
</p>

<p align="center">
  <sub>▲ 你的伙伴会根据你的编程风格获得独特的种类、稀有度和属性</sub>
</p>

---

> **你的 buddy 会观察你的编程过程。** 修复 bug 时说 *"bug squashed!"*，测试通过时说 *"all green!"*，遇到合并冲突时 *"conflict! \*hides\*"*。没事做的时候就安静地 *zzZ*。

<br>

## ⚡ 一键安装

### Codex CLI

```bash
# 第一步：安装
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash

# 第二步：运行（在任意项目目录）
codex-buddy
```

### OpenCode

```bash
# 第一步：安装
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install-opencode.sh | bash

# 第二步：运行（在任意项目目录）
opencode-buddy
```

> 首次运行会播放孵化动画 —— 给宠物起名，看属性逐条揭晓。之后每次启动 buddy 自动出现。

<details>
<summary>💬 或者让 AI 代理帮你安装</summary>
<br>

**Codex:**
> Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.codex/INSTALL.md

**OpenCode:**
> Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.opencode/INSTALL.md

</details>

---

## 🖥️ 效果展示

```
┌─────────────────────────────────────────────────┐
│  >_ Codex CLI                                   │
│                                                 │
│  > 修复认证 bug                                  │
│  • 修复了 login.js 中的空指针检查                 │
│                                                 │
├─────────────────────────────────────────────────┤
│       n______n                                  │
│      ( ·    · )    ── "bug squashed!"           │
│      (   oo   )                                 │
│       `------´                                  │
│       Cappie ★★★                                │
└─────────────────────────────────────────────────┘
```

<sub>Buddy 在 tmux 底部面板（6 行）中运行。实时动画，不干扰你的工作，对代理零影响。</sub>

---

## ✨ 功能特性

### 🥚 孵化仪式

首次运行时播放完整孵化动画 —— 蛋摇晃、裂缝、破壳、种族揭晓、**你来起名**、属性逐条滚动揭晓：

```
    _*_            * . *           n______n
   / . \    →    . \ / .    →    ( ·    · )
  |  / .|        --+--           (   oo   )
  |. /  |        . / \ .          `------´
   \*__/          * . *
                                给你的 capybara 起个名字: _
```

属性基于**你的真实 git 历史** —— 经常半夜写代码？高 CHAOS。提交消息很详细？高 PATIENCE。

### 🐾 18 种宠物

<table>
<tr><td>🦆 duck</td><td>🪿 goose</td><td>🫧 blob</td><td>🐱 cat</td><td>🐉 dragon</td><td>🐙 octopus</td></tr>
<tr><td>🦉 owl</td><td>🐧 penguin</td><td>🐢 turtle</td><td>🐌 snail</td><td>👻 ghost</td><td>🦎 axolotl</td></tr>
<tr><td>🦫 capybara</td><td>🌵 cactus</td><td>🤖 robot</td><td>🐰 rabbit</td><td>🍄 mushroom</td><td>😺 chonk</td></tr>
</table>

每种有 **3 帧动画**、独特的 ASCII 脸部和种族特有的小动作。

### 🎲 稀有度 & 帽子

| | 概率 | 星级 | 帽子 |
|:--|:--|:--|:--|
| **common** | 60% | ★ | — |
| **uncommon** | 25% | ★★ | 皇冠、礼帽、螺旋桨... |
| **rare** | 10% | ★★★ | 〃 |
| **epic** | 4% | ★★★★ | 〃 |
| **legendary** | 1% | ★★★★★ | 〃 |

### 📊 5 项属性，由你的编程 DNA 塑造

| 属性 | 影响因素 |
|:--|:--|
| **DEBUGGING** | git 日志中的 fix/debug 提交 |
| **PATIENCE** | 详细的提交消息，频繁的小提交 |
| **CHAOS** | revert、force push、午夜后的提交 |
| **WISDOM** | 重构提交、shell 历史中的测试工具 |
| **SNARK** | vim 用户、高产码农 |

属性决定宠物性格。高 SNARK → *"ez"*、*"ship it!"*。高 PATIENCE → *"I believe in you"*。

### 💬 基于上下文的反应

Buddy 读取每轮编程的**实际输出**：

| 发生了什么 | Buddy 说 |
|:--|:--|
| 修复了 bug | *"bug squashed!"* |
| 测试通过 | *"all green!"* |
| 测试失败 | *"test caught something"* |
| 构建成功 | *"it builds!"* |
| 输出中有 `TypeError` | *"syntax demons!"* |
| `git push` | *"shipped!"* |
| 部署到生产环境 | *"fingers crossed"* |
| 合并冲突 | *"conflict! \*hides\*"* |
| 无事发生 | *zzZ* |

47 条内容规则 + 9 条提示规则 + 属性加权后备台词。仅在**回合结束**时说话 —— 代理工作期间保持安静。

---

## 🎮 命令

在代理提示中输入：

| 命令 | 效果 |
|:--|:--|
| `buddy` | 显示属性面板（8秒） |
| `buddy stats` | 同上 |
| `buddy pet` | 摸摸 ♥ |
| `pet` | 同上 |
| `buddy rename 新名字` | 改名 |

---

## 🧪 独立体验

不需要任何 CLI 代理：

```bash
git clone https://github.com/FunseaAI/anycli-buddy.git && cd anycli-buddy

node cli.js gallery        # 查看全部 18 种宠物
node cli.js hatch myname   # 生成一只宠物
node cli.js animate        # 实时动画 (Ctrl+C 退出)
node demo.js               # 交互式演示
```

---

<details>
<summary>🗑️ 卸载</summary>

```bash
# Codex
rm -rf ~/.codex/buddy && rm -f ~/.codex/hooks.json && rm -f /usr/local/bin/codex-buddy

# OpenCode
rm -rf ~/.config/opencode/buddy && rm -f /usr/local/bin/opencode-buddy
```

</details>

---

<p align="center">
  <sub>MIT License · 由 <a href="https://github.com/FunseaAI">FunseaAI</a> 用 ♥ 制作</sub>
</p>

<p align="center">
  <sub>如果你的 buddy 给你带来了快乐，请给这个仓库一个 ⭐</sub>
</p>
