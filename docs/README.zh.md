<p align="center">
  <a href="../README.md">English</a> ·
  <a href="./README.zh.md"><b>中文</b></a> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.fr.md">Français</a> ·
  <a href="./README.ru.md">Русский</a>
</p>

<h1 align="center">🐾 AnyCLI-Buddy</h1>

<p align="center">
  <strong>终端编程代理的动画 ASCII 宠物伴侣。</strong><br>
  支持 <b>Codex CLI</b> · <b>OpenCode</b> · 任何终端
</p>

```
      .----.
     / ✦  ✦ \    ── "bug squashed!"
     |      |
     ~`~``~`~
      Pixa ★
```

你的 buddy 会观察你的编程过程，对错误做出反应，庆祝修复，在漫长的调试过程中陪伴你。

**18 种宠物** · **5 种稀有度** · **idle 动画循环** · **语音气泡** · **孵化仪式**

---

## 安装

### Codex CLI

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash
```

然后在任意项目目录启动：

```bash
codex-buddy
```

或者直接告诉 Codex：

> Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.codex/INSTALL.md

### OpenCode

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install-opencode.sh | bash
```

```bash
opencode-buddy
```

---

## 效果展示

```
┌─────────────────────────────────────────────┐
│  >_ Codex CLI                               │
│                                             │
│  > 修复认证 bug                              │
│  • 修复了 login.js 中的空指针检查             │
│                                             │
├─────────────────────────────────────────────┤
│        .----.                               │
│       / ✦  ✦ \   ── "bug squashed!"        │
│       |      |                              │
│       ~`~``~`~                              │
│        Pixa ★                               │
└─────────────────────────────────────────────┘
```

Buddy 在 **tmux 底部面板**（6 行）中运行。实时动画，根据编程上下文说话，不会干扰你的工作。

---

## 功能特性

### 🥚 孵化仪式

首次运行时播放交互式孵化动画：

```
    _*_           * . *         / ✦  ✦ \
   / . \    →   . \ / .    →   |      |
  |  / .|       --+--          ~`~``~`~
  |. /  |       . / \ .
   \*__/         * . *       给你的 ghost 起个名字: _
```

蛋摇晃 → 裂缝 → 破壳 → **揭晓种类** → **你来起名** → 属性逐条揭晓并带悬念动画。

宠物属性基于你的真实编程风格生成 —— 分析自 git 历史、shell 使用习惯和项目结构。

### 🐾 18 种宠物

| | | | | | |
|---|---|---|---|---|---|
| duck | goose | blob | cat | dragon | octopus |
| owl | penguin | turtle | snail | ghost | axolotl |
| capybara | cactus | robot | rabbit | mushroom | chonk |

每种有 **3 帧动画**、独特的脸部表情和种族特有的小动作。

### ✨ 稀有度系统

| 稀有度 | 概率 | 星级 | 帽子 |
|--------|------|------|------|
| common | 60% | ★ | 无 |
| uncommon | 25% | ★★ | 随机 |
| rare | 10% | ★★★ | 随机 |
| epic | 4% | ★★★★ | 随机 |
| legendary | 1% | ★★★★★ | 随机 |

### 📊 5 项属性，由你的编程风格塑造

| 属性 | 影响因素 |
|------|----------|
| **DEBUGGING** | git 历史中的 fix/debug 提交 |
| **PATIENCE** | 详细的提交消息，频繁的小提交 |
| **CHAOS** | revert、force push、深夜编程 |
| **WISDOM** | 重构提交、测试工具使用 |
| **SNARK** | vim 用户、高产码农 |

属性影响宠物说话风格。高 SNARK → *"ez"*、*"ship it!"*。高 PATIENCE → *"I believe in you"*。

### 💬 基于上下文的反应

Buddy 读取实际对话内容并做出反应：

| 发生了什么 | Buddy 说 |
|:---|:---|
| 修复了 bug | *"bug squashed!"* |
| 测试通过 | *"all green!"* |
| 测试失败 | *"test caught something"* |
| 构建成功 | *"it builds!"* |
| TypeError | *"syntax demons!"* |
| Git push | *"shipped!"* |
| 部署 | *"fingers crossed"* |
| 合并冲突 | *"conflict! \*hides\*"* |
| 无事发生 | *zzZ* |

---

## 命令

在 CLI agent 中输入：

| 命令 | 效果 |
|:-----|:-----|
| `buddy` | 显示属性面板（8秒） |
| `buddy pet` | 摸摸 ♥ |
| `pet` | 同上 |
| `buddy rename 新名字` | 改名 |

---

## 卸载

```bash
# Codex
rm -rf ~/.codex/buddy && rm -f ~/.codex/hooks.json && rm -f /usr/local/bin/codex-buddy

# OpenCode
rm -rf ~/.config/opencode/buddy && rm -f /usr/local/bin/opencode-buddy
```

---

<p align="center">
  <sub>MIT License · <a href="https://github.com/FunseaAI">FunseaAI</a></sub>
</p>
