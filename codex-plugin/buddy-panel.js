#!/usr/bin/env node
// Buddy panel — centered horizontal layout for tmux bottom pane.

import { createServer } from 'net';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { renderSprite, spriteFrameCount, renderFace } = await import(join(__dirname, 'sprites.js'));
const { pickQuip } = await import(join(__dirname, 'quips.js'));
const { generateReaction } = await import(join(__dirname, 'context-reactor.js'));
const { RARITY_COLORS, RARITY_STARS, RESET, BOLD, DIM, ITALIC } = await import(join(__dirname, 'types.js'));
const { loadCompanion } = await import(join(__dirname, 'storage.js'));

const SOCKET_PATH = join(__dirname, 'buddy.sock');
const PID_FILE = join(__dirname, 'buddy.pid');
const ESC = '\x1b[';

// ── Load companion (hatch-flow.js already ran before tmux) ─────
const companion = loadCompanion();
if (!companion) {
  console.error('No companion found. Run hatch-flow.js first.');
  process.exit(1);
}

const color = RARITY_COLORS[companion.rarity] || '';
const stars = RARITY_STARS[companion.rarity] || '';

const TICK_MS = 500;
const IDLE_SEQ = [0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0];
const BUBBLE_TICKS = 20;
const FADE_START = 14;

let tick = 0;
let reaction = null;
let reactionTick = 0;
let showStats = false;
let statsTimer = null;

function stripAnsi(s) { return s.replace(/\x1b\[[0-9;]*m/g, ''); }
function visLen(s) { return [...stripAnsi(s)].length; }
function pad(s, w) { return s + ' '.repeat(Math.max(0, w - visLen(s))); }

const PANEL_ROWS = 6;

function buildFrame() {
  const cols = process.stdout.columns || 80;
  const frameCount = spriteFrameCount(companion.species);
  const bubbleAge = reaction ? tick - reactionTick : Infinity;
  const speaking = reaction && bubbleAge < BUBBLE_TICKS;
  const fading = speaking && bubbleAge >= FADE_START;
  if (reaction && bubbleAge >= BUBBLE_TICKS) reaction = null;

  const bc = fading ? DIM : color;
  const tc = fading ? DIM : '';

  let frame, blink = false;
  if (speaking) {
    frame = tick % frameCount;
  } else {
    const step = IDLE_SEQ[tick % IDLE_SEQ.length];
    if (step === -1) { frame = 0; blink = true; } else frame = step % frameCount;
  }

  let body = renderSprite(companion, frame);
  if (blink) body = body.map(l => l.replaceAll(companion.eye, '-'));
  // Strip empty top line
  if (body.length > 0 && !body[0].trim()) body.shift();
  // Keep max 5 sprite rows (6 panel - 1 name), trim from top
  while (body.length > PANEL_ROWS - 1) body.shift();

  // ── Sprite column (compact, centered) ────────────────────────
  const spriteW = 12;
  const left = body.map(l => {
    const vl = visLen(l);
    const lp = Math.floor((spriteW - vl) / 2);
    return `${' '.repeat(Math.max(0, lp))}${color}${l}${RESET}`;
  });
  // Name on same last line to save a row
  const nameTag = `${companion.name} ${stars}`;
  const nameVl = visLen(nameTag);
  const nameLp = Math.floor((spriteW - nameVl) / 2);
  left.push(`${' '.repeat(Math.max(0, nameLp))}${color}${BOLD}${nameTag}${RESET}`);

  // ── Bubble (auto width, single line when short) ──────────────
  const gap = 2;
  const right = [];

  if (speaking) {
    const bc = fading ? DIM : color;
    const tc = fading ? DIM : '';
    // Short text: no box, just inline quote
    if (reaction.length <= 30) {
      right.push(`${bc}── ${RESET}${tc}${ITALIC}"${reaction}"${RESET}`);
    } else {
      const maxTextW = Math.max(10, cols - spriteW - gap - 6);
      const words = reaction.split(' ');
      const wrapped = [];
      let cur = '';
      for (const w of words) {
        if (cur.length + w.length + 1 > maxTextW && cur) { wrapped.push(cur); cur = w; }
        else cur = cur ? `${cur} ${w}` : w;
      }
      if (cur) wrapped.push(cur);
      const innerW = Math.max(...wrapped.map(l => l.length), 1);
      const boxW = innerW + 2;
      right.push(`${bc}\u256d${'─'.repeat(boxW)}\u256e${RESET}`);
      for (const l of wrapped) {
        right.push(`${bc}\u2502${RESET} ${tc}${ITALIC}${l}${RESET}${' '.repeat(innerW - l.length)} ${bc}\u2502${RESET}`);
      }
      right.push(`${bc}\u2570${'─'.repeat(boxW)}\u256f${RESET}`);
    }
  } else {
    right.push(`${DIM}zzZ${RESET}`);
  }

  // ── Sprite at 1/3, bubble aligned to sprite's middle row ─────
  const spriteCenter = Math.floor(cols / 3);
  const spriteMargin = Math.max(0, spriteCenter - Math.floor(spriteW / 2));
  const marginStr = ' '.repeat(spriteMargin);
  const gapStr = ' '.repeat(gap);

  const maxH = Math.max(left.length, right.length);
  // Align bubble to vertical center of sprite
  const rightStart = Math.max(0, Math.floor((left.length - right.length) / 2));

  const output = [];
  for (let i = 0; i < maxH; i++) {
    const l = i < left.length ? pad(left[i], spriteW) : pad('', spriteW);
    const ri = i - rightStart;
    const r = (ri >= 0 && ri < right.length) ? right[ri] : '';
    output.push(`${marginStr}${l}${gapStr}${r}`);
  }

  return output;
}

// ── Render ─────────────────────────────────────────────────────
process.stdout.write(`${ESC}?25l${ESC}2J`);
let prevCount = 0;

function render() {
  const lines = showStats ? buildStatsFrame() : buildFrame();
  const max = Math.max(lines.length, prevCount);
  for (let i = 0; i < max; i++) {
    process.stdout.write(`${ESC}${i + 1};1H${ESC}2K`);
    if (i < lines.length) process.stdout.write(lines[i]);
  }
  prevCount = lines.length;
}

const timer = setInterval(() => { tick++; render(); }, TICK_MS);
reaction = pickQuip('greeting', companion.stats, Date.now());
reactionTick = tick;
render();

// ── Stats overlay mode ─────────────────────────────────────────
const STATS_DURATION = 8000; // 8 seconds

function buildStatsFrame() {
  const cols = process.stdout.columns || 80;
  const rows = 6; // fixed panel height

  // Left: sprite (compact)
  let body = renderSprite(companion, tick % spriteFrameCount(companion.species));
  if (body.length > 0 && !body[0].trim()) body.shift();
  while (body.length > rows - 1) body.shift();

  const spriteW = 12;
  const left = body.map(l => {
    const vl = visLen(l);
    const lp = Math.floor((spriteW - vl) / 2);
    return `${' '.repeat(Math.max(0, lp))}${color}${l}${RESET}`;
  });
  const nameTag = `${companion.name} ${stars}`;
  const nameVl = visLen(nameTag);
  const nameLp = Math.floor((spriteW - nameVl) / 2);
  left.push(`${' '.repeat(Math.max(0, nameLp))}${color}${BOLD}${nameTag}${RESET}`);

  // Right: stats card
  const gap = 3;
  const right = [];
  right.push(`${DIM}${companion.rarity} ${companion.species}${companion.shiny ? '  \u2728shiny' : ''}  eye:${companion.eye}  hat:${companion.hat}${RESET}`);
  for (const [stat, val] of Object.entries(companion.stats)) {
    const filled = Math.round((val / 100) * 10);
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled);
    right.push(`${color}${stat.padEnd(10)} ${bar} ${String(val).padStart(3)}${RESET}`);
  }

  // Merge side by side, centered at 1/3
  const spriteCenter = Math.floor(cols / 3);
  const spriteMargin = Math.max(0, spriteCenter - Math.floor(spriteW / 2));
  const marginStr = ' '.repeat(spriteMargin);
  const gapStr = ' '.repeat(gap);

  const maxH = Math.max(left.length, right.length);
  const rightStart = Math.max(0, Math.floor((left.length - right.length) / 2));

  const output = [];
  for (let i = 0; i < maxH; i++) {
    const l = i < left.length ? pad(left[i], spriteW) : pad('', spriteW);
    const ri = i - rightStart;
    const r = (ri >= 0 && ri < right.length) ? right[ri] : '';
    output.push(`${marginStr}${l}${gapStr}${r}`);
  }
  return output;
}

function center(text, cols) {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const lp = Math.max(0, Math.floor((cols - [...stripped].length) / 2));
  return ' '.repeat(lp) + text;
}

function triggerStats() {
  showStats = true;
  if (statsTimer) clearTimeout(statsTimer);
  statsTimer = setTimeout(() => { showStats = false; }, STATS_DURATION);
}

function triggerPet() {
  reaction = 'purr~ \u2665';
  reactionTick = tick;
  // TODO: heart animation in sprite
}

function triggerRename(newName) {
  companion.name = newName;
  // Update saved file
  import('fs').then(fs => {
    fs.writeFileSync(join(__dirname, 'companion.json'), JSON.stringify(companion, null, 2));
  });
  reaction = `I'm ${newName} now!`;
  reactionTick = tick;
}

// ── Events ─────────────────────────────────────────────────────

function handleEvent(data) {
  try {
    const msg = JSON.parse(data);

    // Detect buddy commands from UserPromptSubmit prompt field
    const prompt = (msg.prompt || '').trim().toLowerCase();
    if (msg.hook_event_name === 'UserPromptSubmit' && prompt) {
      if (prompt === 'buddy' || prompt === 'buddy stats' || prompt === 'buddy info') {
        triggerStats(); return;
      }
      if (prompt === 'buddy pet' || prompt === 'pet' || prompt === 'pet buddy') {
        triggerPet(); return;
      }
      if (prompt.startsWith('buddy rename ')) {
        triggerRename(prompt.slice('buddy rename '.length).trim());
        return;
      }
    }

    // Context-aware reaction — null means stay silent
    const result = generateReaction(msg, companion);
    if (result !== null) {
      reaction = result;
      reactionTick = tick;
    }
  } catch {
    // Silent on error
  }
}

if (existsSync(SOCKET_PATH)) unlinkSync(SOCKET_PATH);
const server = createServer((c) => {
  let b = '';
  c.on('data', (d) => { b += d; });
  c.on('end', () => { handleEvent(b); c.end(); });
});
server.listen(SOCKET_PATH, () => writeFileSync(PID_FILE, process.pid.toString()));

function cleanup() {
  clearInterval(timer);
  process.stdout.write(`${ESC}?25h`);
  server.close();
  try { unlinkSync(SOCKET_PATH); } catch {}
  try { unlinkSync(PID_FILE); } catch {}
  process.exit(0);
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGHUP', cleanup);
