<p align="center">
  <a href="../README.md">English</a> ·
  <a href="./README.zh.md">中文</a> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.fr.md"><b>Français</b></a> ·
  <a href="./README.ru.md">Русский</a>
</p>

<h1 align="center">🐾 AnyCLI-Buddy</h1>

<p align="center">
  <strong>Un compagnon ASCII animé pour votre agent de codage terminal.</strong><br>
  Compatible avec <b>Codex CLI</b> · <b>OpenCode</b> · tout terminal
</p>

```
      .----.
     / ✦  ✦ \    ── "bug squashed!"
     |      |
     ~`~``~`~
      Pixa ★
```

Votre buddy surveille votre session de codage, réagit aux erreurs, célèbre les corrections et vous tient compagnie pendant les longues sessions de débogage.

**18 espèces** · **5 niveaux de rareté** · **animations idle** · **bulles de dialogue** · **cérémonie d'éclosion**

---

## Installation

### Codex CLI

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash
```

Lancez depuis n'importe quel répertoire de projet :

```bash
codex-buddy
```

Ou dites directement à Codex :

> Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.codex/INSTALL.md

### OpenCode

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install-opencode.sh | bash
```

```bash
opencode-buddy
```

---

## Aperçu

```
┌─────────────────────────────────────────────┐
│  >_ Codex CLI                               │
│                                             │
│  > corriger le bug d'auth                   │
│  • Vérification null corrigée dans login.js │
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

## Fonctionnalités

### 🥚 Cérémonie d'éclosion

Le premier lancement joue une animation interactive : oscillation de l'œuf → fissures → éclatement → **révélation de l'espèce** → **vous le nommez** → les stats apparaissent une par une.

Les stats sont façonnées par votre style de codage réel — analysé à partir de l'historique git et de l'utilisation du shell.

### 🐾 18 espèces

duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk

### ✨ Système de rareté

| Rareté | Chance | Étoiles |
|--------|--------|---------|
| common | 60% | ★ |
| uncommon | 25% | ★★ |
| rare | 10% | ★★★ |
| epic | 4% | ★★★★ |
| legendary | 1% | ★★★★★ |

### 📊 5 stats façonnées par votre style

| Stat | Influencée par |
|------|----------------|
| **DEBUGGING** | Commits fix/debug dans git |
| **PATIENCE** | Messages de commit détaillés |
| **CHAOS** | Reverts, force push, codage nocturne |
| **WISDOM** | Refactoring, utilisation de tests |
| **SNARK** | Utilisateur vim, codeur prolifique |

### 💬 Réactions contextuelles

Le buddy lit le contenu réel de la conversation : bug corrigé → *"bug squashed!"*, tests réussis → *"all green!"*, déploiement → *"fingers crossed"*

---

## Commandes

| Commande | Effet |
|:---------|:------|
| `buddy` | Panneau de stats |
| `buddy pet` | Caresser ♥ |
| `buddy rename nom` | Renommer |

---

## Désinstallation

```bash
rm -rf ~/.codex/buddy && rm -f ~/.codex/hooks.json && rm -f /usr/local/bin/codex-buddy
```

---

<p align="center">
  <sub>MIT License · <a href="https://github.com/FunseaAI">FunseaAI</a></sub>
</p>
