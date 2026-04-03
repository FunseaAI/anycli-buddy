<p align="center">
  <a href="../README.md">English</a> ·
  <a href="./README.zh.md">中文</a> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.fr.md">Français</a> ·
  <a href="./README.ru.md"><b>Русский</b></a>
</p>

<h1 align="center">🐾 AnyCLI-Buddy</h1>

<p align="center">
  <strong>Анимированный ASCII-компаньон для вашего терминального агента кодирования.</strong><br>
  Работает с <b>Codex CLI</b> · <b>OpenCode</b> · любым терминалом
</p>

```
      .----.
     / ✦  ✦ \    ── "bug squashed!"
     |      |
     ~`~``~`~
      Pixa ★
```

Ваш бадди наблюдает за сессией кодирования, реагирует на ошибки, празднует исправления и составляет вам компанию во время долгих сессий отладки.

**18 видов** · **5 уровней редкости** · **idle-анимация** · **речевые пузыри** · **церемония вылупления**

---

## Установка

### Codex CLI

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install.sh | bash
```

Запускайте из любой директории проекта:

```bash
codex-buddy
```

Или скажите Codex напрямую:

> Fetch and follow instructions from https://raw.githubusercontent.com/FunseaAI/anycli-buddy/refs/heads/main/.codex/INSTALL.md

### OpenCode

```bash
curl -fsSL https://raw.githubusercontent.com/FunseaAI/anycli-buddy/main/install-opencode.sh | bash
```

```bash
opencode-buddy
```

---

## Как это выглядит

```
┌─────────────────────────────────────────────┐
│  >_ Codex CLI                               │
│                                             │
│  > исправь баг авторизации                   │
│  • Исправлена проверка null в login.js       │
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

## Возможности

### 🥚 Церемония вылупления

При первом запуске проигрывается интерактивная анимация: покачивание яйца → трещины → взрыв → **раскрытие вида** → **вы даёте имя** → характеристики появляются одна за другой.

Характеристики питомца формируются на основе вашего реального стиля кодирования.

### 🐾 18 видов

duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk

### ✨ Система редкости

| Редкость | Шанс | Звёзды |
|----------|------|--------|
| common | 60% | ★ |
| uncommon | 25% | ★★ |
| rare | 10% | ★★★ |
| epic | 4% | ★★★★ |
| legendary | 1% | ★★★★★ |

### 📊 5 характеристик на основе вашего стиля

| Стат | Что влияет |
|------|------------|
| **DEBUGGING** | Коммиты fix/debug в git |
| **PATIENCE** | Подробные сообщения коммитов |
| **CHAOS** | Revert, force push, ночное кодирование |
| **WISDOM** | Рефакторинг, использование тестов |
| **SNARK** | Пользователь vim, продуктивный кодер |

### 💬 Контекстные реакции

Бадди читает содержимое разговора: исправлен баг → *"bug squashed!"*, тесты прошли → *"all green!"*, деплой → *"fingers crossed"*

---

## Команды

| Команда | Эффект |
|:--------|:-------|
| `buddy` | Панель характеристик |
| `buddy pet` | Погладить ♥ |
| `buddy rename имя` | Переименовать |

---

## Удаление

```bash
rm -rf ~/.codex/buddy && rm -f ~/.codex/hooks.json && rm -f /usr/local/bin/codex-buddy
```

---

<p align="center">
  <sub>MIT License · <a href="https://github.com/FunseaAI">FunseaAI</a></sub>
</p>
