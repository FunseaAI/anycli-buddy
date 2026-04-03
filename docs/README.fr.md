<p align="center">
  <a href="../README.md">English</a> ·
  <a href="./README.zh.md">中文</a> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.fr.md"><b>Français</b></a> ·
  <a href="./README.ru.md">Русский</a>
</p>

<h1 align="center">🐾 AnyCLI-Buddy</h1>

<p align="center">
  <strong>Un animal de compagnie terminal qui éclot d'un œuf et réagit à votre code.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/espèces-18-blue" alt="18 species">
  <img src="https://img.shields.io/badge/raretés-5-purple" alt="5 rarity">
  <img src="https://img.shields.io/badge/zéro-dépendances-green" alt="zero deps">
  <img src="https://img.shields.io/github/stars/FunseaAI/anycli-buddy?style=social" alt="Stars">
</p>

<p align="center">
  <img src="demo.svg" alt="AnyCLI-Buddy Demo" width="600">
</p>

---

> **Votre buddy surveille votre session.** Il dit *"bug squashed!"* quand vous corrigez un bug, *"all green!"* quand les tests passent, et *"conflict! \*hides\*"* lors d'un conflit de merge. Sinon, il fait *zzZ*.

<br>

## ⚡ Installation en une commande

### Codex CLI

```bash
# Étape 1 : Installer
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash

# Étape 2 : Lancer (depuis n'importe quel répertoire)
codex-buddy
```

### OpenCode

```bash
# Étape 1 : Installer
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install-opencode.sh | bash

# Étape 2 : Lancer (depuis n'importe quel répertoire)
opencode-buddy
```

> Au premier lancement, une animation d'éclosion se joue — nommez votre compagnon et regardez ses stats apparaître. Ensuite, votre buddy apparaît automatiquement.

---

## ✨ Fonctionnalités

### 🥚 Cérémonie d'éclosion

L'œuf tremble → fissures → éclatement → **révélation de l'espèce** → **vous le nommez** → les stats apparaissent une par une.

Les stats sont façonnées par votre **vrai historique git**.

### 🐾 18 espèces

<table>
<tr><td>🦆 duck</td><td>🪿 goose</td><td>🫧 blob</td><td>🐱 cat</td><td>🐉 dragon</td><td>🐙 octopus</td></tr>
<tr><td>🦉 owl</td><td>🐧 penguin</td><td>🐢 turtle</td><td>🐌 snail</td><td>👻 ghost</td><td>🦎 axolotl</td></tr>
<tr><td>🦫 capybara</td><td>🌵 cactus</td><td>🤖 robot</td><td>🐰 rabbit</td><td>🍄 mushroom</td><td>😺 chonk</td></tr>
</table>

### 🎲 Rareté & chapeaux

| | Chance | Étoiles | Chapeaux |
|:--|:--|:--|:--|
| **common** | 60% | ★ | — |
| **uncommon** | 25% | ★★ | couronne, haut-de-forme... |
| **rare** | 10% | ★★★ | 〃 |
| **epic** | 4% | ★★★★ | 〃 |
| **legendary** | 1% | ★★★★★ | 〃 |

### 📊 5 stats basées sur votre style de codage

| Stat | Ce qui la booste |
|:--|:--|
| **DEBUGGING** | Commits fix/debug dans git |
| **PATIENCE** | Messages de commit détaillés |
| **CHAOS** | Reverts, force push, commits nocturnes |
| **WISDOM** | Refactoring, tests |
| **SNARK** | Utilisateur vim, codeur prolifique |

### 💬 Réactions contextuelles

| Événement | Buddy dit |
|:--|:--|
| Bug corrigé | *"bug squashed!"* |
| Tests réussis | *"all green!"* |
| Tests échoués | *"test caught something"* |
| Build réussi | *"it builds!"* |
| `TypeError` | *"syntax demons!"* |
| `git push` | *"shipped!"* |
| Déploiement | *"fingers crossed"* |
| Conflit de merge | *"conflict! \*hides\*"* |

---

## 🎮 Commandes

| Commande | Effet |
|:--|:--|
| `buddy` | Panneau de stats (8s) |
| `buddy pet` | Caresser ♥ |
| `buddy rename nom` | Renommer |

---

## 🧪 Utilisation autonome

```bash
git clone https://github.com/FunseaAI/anycli-buddy.git && cd anycli-buddy

node cli.js gallery        # voir les 18 espèces
node cli.js hatch myname   # générer un compagnon
node cli.js animate        # animation en direct
```

---

<p align="center">
  <sub>MIT License · <a href="https://github.com/FunseaAI">FunseaAI</a></sub>
</p>

<p align="center">
  <sub>Si votre buddy vous fait sourire, mettez une ⭐</sub>
</p>
