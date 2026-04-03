<p align="center">
  <a href="../README.md">English</a> ·
  <a href="./README.zh.md">中文</a> ·
  <a href="./README.ja.md"><b>日本語</b></a> ·
  <a href="./README.fr.md">Français</a> ·
  <a href="./README.ru.md">Русский</a>
</p>

<h1 align="center">🐾 AnyCLI-Buddy</h1>

<p align="center">
  <strong>卵から孵化し、あなたのコードに反応するターミナルペット。</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/種族-18種-blue" alt="18 species">
  <img src="https://img.shields.io/badge/レアリティ-5段階-purple" alt="5 rarity">
  <img src="https://img.shields.io/badge/依存関係-ゼロ-green" alt="zero deps">
  <img src="https://img.shields.io/github/stars/FunseaAI/anycli-buddy?style=social" alt="Stars">
</p>

<p align="center">
  <img src="demo.svg" alt="AnyCLI-Buddy Demo" width="600">
</p>

---

> **バディはあなたのコーディングを見守ります。** バグを直すと *"bug squashed!"*、テストが通ると *"all green!"*、マージコンフリクトでは *"conflict! \*hides\*"*。何もない時は *zzZ*。

<br>

## ⚡ ワンコマンドインストール

<table>
<tr>
<td><b>Codex CLI</b></td>
<td>

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash
```

</td>
</tr>
<tr>
<td><b>OpenCode</b></td>
<td>

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install-opencode.sh | bash
```

</td>
</tr>
</table>

プロジェクトディレクトリで **`codex-buddy`** または **`opencode-buddy`** を実行。

---

## ✨ 機能

### 🥚 孵化セレモニー

初回起動時にインタラクティブな孵化アニメーション — 卵の揺れ → ひび → 爆発 → **種族発表** → **名前を付ける** → ステータスが一つずつロールイン。

ステータスはあなたの **実際のgit履歴** に基づいて生成されます。

### 🐾 18種のペット

<table>
<tr><td>🦆 duck</td><td>🪿 goose</td><td>🫧 blob</td><td>🐱 cat</td><td>🐉 dragon</td><td>🐙 octopus</td></tr>
<tr><td>🦉 owl</td><td>🐧 penguin</td><td>🐢 turtle</td><td>🐌 snail</td><td>👻 ghost</td><td>🦎 axolotl</td></tr>
<tr><td>🦫 capybara</td><td>🌵 cactus</td><td>🤖 robot</td><td>🐰 rabbit</td><td>🍄 mushroom</td><td>😺 chonk</td></tr>
</table>

各種 **3フレームアニメーション**、ユニークなASCIIフェイス、種族固有のアイドルモーション付き。

### 🎲 レアリティ＆帽子

| | 確率 | 星 | 帽子 |
|:--|:--|:--|:--|
| **common** | 60% | ★ | — |
| **uncommon** | 25% | ★★ | 王冠、シルクハット... |
| **rare** | 10% | ★★★ | 〃 |
| **epic** | 4% | ★★★★ | 〃 |
| **legendary** | 1% | ★★★★★ | 〃 |

### 📊 コーディングDNAから生まれる5つのステータス

| ステータス | ブースト要因 |
|:--|:--|
| **DEBUGGING** | gitログのfix/debugコミット |
| **PATIENCE** | 詳細なコミットメッセージ、小さなコミット |
| **CHAOS** | revert、force push、深夜コミット |
| **WISDOM** | リファクタリング、テストランナー使用 |
| **SNARK** | vimユーザー、多作コーダー |

### 💬 コンテキスト対応リアクション

| 出来事 | バディの反応 |
|:--|:--|
| バグ修正 | *"bug squashed!"* |
| テスト成功 | *"all green!"* |
| テスト失敗 | *"test caught something"* |
| ビルド成功 | *"it builds!"* |
| `TypeError` | *"syntax demons!"* |
| `git push` | *"shipped!"* |
| デプロイ | *"fingers crossed"* |
| マージコンフリクト | *"conflict! \*hides\*"* |
| 何もなし | *zzZ* |

---

## 🎮 コマンド

| コマンド | 効果 |
|:--|:--|
| `buddy` | ステータスパネル表示（8秒） |
| `buddy pet` | なでる ♥ |
| `pet` | 同上 |
| `buddy rename 名前` | 名前変更 |

---

## 🧪 スタンドアロン

```bash
git clone https://github.com/FunseaAI/anycli-buddy.git && cd anycli-buddy

node cli.js gallery        # 全18種を表示
node cli.js hatch myname   # コンパニオン生成
node cli.js animate        # ライブアニメーション
node demo.js               # インタラクティブデモ
```

---

<p align="center">
  <sub>MIT License · <a href="https://github.com/FunseaAI">FunseaAI</a></sub>
</p>

<p align="center">
  <sub>バディが気に入ったら ⭐ をお願いします</sub>
</p>
