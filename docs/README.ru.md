<p align="center">
  <a href="../README.md">English</a> ·
  <a href="./README.zh.md">中文</a> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.fr.md">Français</a> ·
  <a href="./README.ru.md"><b>Русский</b></a>
</p>

<h1 align="center">🐾 AnyCLI-Buddy</h1>

<p align="center">
  <strong>Терминальный питомец, который вылупляется из яйца и реагирует на ваш код.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/видов-18-blue" alt="18 species">
  <img src="https://img.shields.io/badge/редкость-5_уровней-purple" alt="5 rarity">
  <img src="https://img.shields.io/badge/зависимости-ноль-green" alt="zero deps">
  <img src="https://img.shields.io/github/stars/FunseaAI/anycli-buddy?style=social" alt="Stars">
</p>

<p align="center">
  <img src="demo.svg" alt="AnyCLI-Buddy Demo" width="600">
</p>

---

> **Ваш бадди наблюдает за кодингом.** Говорит *"bug squashed!"* при исправлении бага, *"all green!"* при прохождении тестов, *"conflict! \*hides\*"* при конфликте мержа. В остальное время — *zzZ*.

<br>

## ⚡ Установка одной командой

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

Запускайте **`codex-buddy`** или **`opencode-buddy`** из любой директории проекта.

---

## ✨ Возможности

### 🥚 Церемония вылупления

Яйцо качается → трещины → взрыв → **раскрытие вида** → **вы даёте имя** → характеристики появляются одна за другой.

Характеристики основаны на вашей **реальной истории git**.

### 🐾 18 видов

<table>
<tr><td>🦆 duck</td><td>🪿 goose</td><td>🫧 blob</td><td>🐱 cat</td><td>🐉 dragon</td><td>🐙 octopus</td></tr>
<tr><td>🦉 owl</td><td>🐧 penguin</td><td>🐢 turtle</td><td>🐌 snail</td><td>👻 ghost</td><td>🦎 axolotl</td></tr>
<tr><td>🦫 capybara</td><td>🌵 cactus</td><td>🤖 robot</td><td>🐰 rabbit</td><td>🍄 mushroom</td><td>😺 chonk</td></tr>
</table>

### 🎲 Редкость и шляпы

| | Шанс | Звёзды | Шляпы |
|:--|:--|:--|:--|
| **common** | 60% | ★ | — |
| **uncommon** | 25% | ★★ | корона, цилиндр... |
| **rare** | 10% | ★★★ | 〃 |
| **epic** | 4% | ★★★★ | 〃 |
| **legendary** | 1% | ★★★★★ | 〃 |

### 📊 5 характеристик из вашего кодинг-ДНК

| Стат | Что влияет |
|:--|:--|
| **DEBUGGING** | Коммиты fix/debug в git |
| **PATIENCE** | Подробные сообщения коммитов |
| **CHAOS** | Revert, force push, ночные коммиты |
| **WISDOM** | Рефакторинг, использование тестов |
| **SNARK** | Пользователь vim, продуктивный кодер |

### 💬 Контекстные реакции

| Событие | Бадди говорит |
|:--|:--|
| Исправлен баг | *"bug squashed!"* |
| Тесты прошли | *"all green!"* |
| Тесты упали | *"test caught something"* |
| Сборка успешна | *"it builds!"* |
| `TypeError` | *"syntax demons!"* |
| `git push` | *"shipped!"* |
| Деплой | *"fingers crossed"* |
| Конфликт мержа | *"conflict! \*hides\*"* |

---

## 🎮 Команды

| Команда | Эффект |
|:--|:--|
| `buddy` | Панель характеристик (8с) |
| `buddy pet` | Погладить ♥ |
| `buddy rename имя` | Переименовать |

---

## 🧪 Автономное использование

```bash
git clone https://github.com/FunseaAI/anycli-buddy.git && cd anycli-buddy

node cli.js gallery        # все 18 видов
node cli.js hatch myname   # создать компаньона
node cli.js animate        # живая анимация
```

---

<p align="center">
  <sub>MIT License · <a href="https://github.com/FunseaAI">FunseaAI</a></sub>
</p>

<p align="center">
  <sub>Если бадди поднял вам настроение, поставьте ⭐</sub>
</p>
