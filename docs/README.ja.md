<p align="center">
  <a href="../README.md">English</a> ·
  <a href="./README.zh.md">中文</a> ·
  <a href="./README.ja.md"><b>日本語</b></a> ·
  <a href="./README.fr.md">Français</a> ·
  <a href="./README.ru.md">Русский</a>
</p>

<h1 align="center">🐾 AnyCLI-Buddy</h1>

<p align="center">
  <strong>ターミナルコーディングエージェント用アニメーションASCIIコンパニオン。</strong><br>
  <b>Codex CLI</b> · <b>OpenCode</b> · あらゆるターミナルに対応
</p>

```
      .----.
     / ✦  ✦ \    ── "bug squashed!"
     |      |
     ~`~``~`~
      Pixa ★
```

バディはコーディングセッションを見守り、エラーに反応し、修正を祝い、長いデバッグセッションであなたに寄り添います。

**18種のペット** · **5段階のレアリティ** · **アイドルアニメーション** · **吹き出し** · **孵化セレモニー**

---

## インストール

### Codex CLI

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash
```

任意のプロジェクトディレクトリから起動：

```bash
codex-buddy
```

Codexに直接伝えることもできます：

> Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.codex/INSTALL.md

### OpenCode

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install-opencode.sh | bash
```

```bash
opencode-buddy
```

---

## 表示イメージ

```
┌─────────────────────────────────────────────┐
│  >_ Codex CLI                               │
│                                             │
│  > 認証バグを修正して                         │
│  • login.jsのnullチェックを修正しました       │
│                                             │
├─────────────────────────────────────────────┤
│        .----.                               │
│       / ✦  ✦ \   ── "bug squashed!"        │
│       |      |                              │
│       ~`~``~`~                              │
│        Pixa ★                               │
└─────────────────────────────────────────────┘
```

---

## 機能

### 🥚 孵化セレモニー

初回起動時にインタラクティブな孵化アニメーションが再生されます。卵の揺れ → ひび → 爆発 → **種族発表** → **名前を付ける** → ステータスが一つずつロールイン。

ペットのステータスはあなたの実際のコーディングスタイルに基づいて生成されます。

### 🐾 18種のペット

duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk

### ✨ レアリティシステム

| レアリティ | 確率 | 星 |
|-----------|------|-----|
| common | 60% | ★ |
| uncommon | 25% | ★★ |
| rare | 10% | ★★★ |
| epic | 4% | ★★★★ |
| legendary | 1% | ★★★★★ |

### 📊 コーディングスタイルで決まる5つのステータス

| ステータス | 影響する要素 |
|-----------|-------------|
| **DEBUGGING** | gitのfix/debugコミット |
| **PATIENCE** | 詳細なコミットメッセージ |
| **CHAOS** | revert、force push、深夜コーディング |
| **WISDOM** | リファクタリング、テストランナー使用 |
| **SNARK** | vimユーザー、多作なコーダー |

### 💬 コンテキスト対応リアクション

バディは実際の会話内容を読んで反応します。バグ修正 → *"bug squashed!"*、テスト成功 → *"all green!"*、デプロイ → *"fingers crossed"*

---

## コマンド

| コマンド | 効果 |
|:--------|:-----|
| `buddy` | ステータスパネル表示 |
| `buddy pet` | なでる ♥ |
| `buddy rename 名前` | 名前変更 |

---

## アンインストール

```bash
rm -rf ~/.codex/buddy && rm -f ~/.codex/hooks.json && rm -f /usr/local/bin/codex-buddy
```

---

<p align="center">
  <sub>MIT License · <a href="https://github.com/FunseaAI">FunseaAI</a></sub>
</p>
