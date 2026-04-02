// Pure-ANSI terminal renderer — no React, no Ink, no dependencies.
// Renders the companion sprite inline or as a side-panel in the terminal.

import { RARITY_COLORS, RARITY_STARS, RESET, BOLD, DIM, ITALIC } from './types.js';
import { renderSprite, spriteFrameCount, renderFace } from './sprites.js';

const TICK_MS = 500;
const BUBBLE_SHOW_TICKS = 20;   // ~10s
const FADE_START_TICKS = 14;    // last ~3s
const IDLE_SEQUENCE = [0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0];
const HEART = '\u2665';

// ── Speech Bubble ──────────────────────────────────────────────

function wrapText(text, width) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (cur.length + w.length + 1 > width && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? `${cur} ${w}` : w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function renderBubble(text, color, fading) {
  const maxW = 30;
  const lines = wrapText(text, maxW);
  const innerW = Math.max(...lines.map(l => l.length), 1);
  const padW = innerW + 2; // 1 padding each side

  const borderColor = fading ? DIM : color;
  const textStyle = fading ? DIM : '';

  const top    = `${borderColor}\u256d${'─'.repeat(padW)}\u256e${RESET}`;
  const bottom = `${borderColor}\u2570${'─'.repeat(padW)}\u256f${RESET}`;
  const tail   = `${borderColor} \u2572${RESET}`;

  const body = lines.map(l => {
    const pad = ' '.repeat(innerW - l.length);
    return `${borderColor}\u2502${RESET} ${textStyle}${ITALIC}${l}${pad}${RESET} ${borderColor}\u2502${RESET}`;
  });

  return [top, ...body, bottom, ' '.repeat(innerW) + tail];
}

// ── Stat Bar ───────────────────────────────────────────────────

function statBar(name, value, maxWidth = 20) {
  const filled = Math.round((value / 100) * maxWidth);
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(maxWidth - filled);
  return `  ${name.padEnd(10)} ${bar} ${value}`;
}

// ── Main Renderer ──────────────────────────────────────────────

export class BuddyRenderer {
  constructor(companion) {
    this.companion = companion;
    this.tick = 0;
    this.reaction = null;       // current speech text
    this.reactionTick = 0;      // tick when reaction started
    this.petTick = -Infinity;
    this.timer = null;
    this.onFrame = null;        // callback: (frameLines: string[]) => void
    this._prevLineCount = 0;
  }

  get color() {
    return RARITY_COLORS[this.companion.rarity] || '';
  }

  // Start the animation loop. Calls onFrame(lines) every tick.
  start(onFrame) {
    this.onFrame = onFrame;
    this.timer = setInterval(() => {
      this.tick++;
      this._render();
    }, TICK_MS);
    this._render(); // immediate first frame
    return this;
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  // Make the companion say something
  say(text) {
    this.reaction = text;
    this.reactionTick = this.tick;
  }

  // Pet the companion
  pet() {
    this.petTick = this.tick;
  }

  // ── Internal rendering ─────────────────────────────────────

  _render() {
    if (!this.onFrame) return;
    const lines = this._buildFrame();
    this.onFrame(lines, this._prevLineCount);
    this._prevLineCount = lines.length;
  }

  _buildFrame() {
    const c = this.companion;
    const color = this.color;
    const frameCount = spriteFrameCount(c.species);

    // Bubble state
    const bubbleAge = this.reaction ? this.tick - this.reactionTick : Infinity;
    const speaking = this.reaction && bubbleAge < BUBBLE_SHOW_TICKS;
    const fading = speaking && bubbleAge >= FADE_START_TICKS;

    // Clear expired reaction
    if (this.reaction && bubbleAge >= BUBBLE_SHOW_TICKS) {
      this.reaction = null;
    }

    // Pet state
    const petting = (this.tick - this.petTick) * TICK_MS < 2500;

    // Pick animation frame
    let spriteFrame;
    let blink = false;
    if (speaking || petting) {
      spriteFrame = this.tick % frameCount;
    } else {
      const step = IDLE_SEQUENCE[this.tick % IDLE_SEQUENCE.length];
      if (step === -1) {
        spriteFrame = 0;
        blink = true;
      } else {
        spriteFrame = step % frameCount;
      }
    }

    // Render sprite body
    let body = renderSprite(c, spriteFrame);
    if (blink) {
      body = body.map(line => line.replaceAll(c.eye, '-'));
    }

    // Colorize sprite
    const coloredBody = body.map(line => `${color}${line}${RESET}`);

    // Hearts above sprite when petting
    const heartLines = [];
    if (petting) {
      const petAge = this.tick - this.petTick;
      const patterns = [
        `   ${HEART}    ${HEART}   `,
        `  ${HEART}  ${HEART}   ${HEART}  `,
        ` ${HEART}   ${HEART}  ${HEART}   `,
      ];
      heartLines.push(`\x1b[31m${patterns[petAge % patterns.length]}${RESET}`);
    }

    // Build output
    const output = [];

    if (speaking) {
      const bubbleLines = renderBubble(this.reaction, color, fading);
      output.push(...bubbleLines);
    }

    output.push(...heartLines);
    output.push(...coloredBody);

    // Name row
    const stars = RARITY_STARS[c.rarity];
    output.push(`${color}${BOLD}    ${c.name}${RESET} ${color}${stars}${RESET}`);

    return output;
  }

  // Render a full stats card (non-animated, for /buddy info)
  renderCard() {
    const c = this.companion;
    const color = this.color;
    const body = renderSprite(c, 0);

    const lines = [];
    lines.push('');
    lines.push(`${color}${BOLD}  ${c.name}${RESET}  ${color}${RARITY_STARS[c.rarity]}${RESET}  ${DIM}(${c.rarity} ${c.species})${RESET}`);
    if (c.shiny) lines.push(`  ${BOLD}\u2728 SHINY \u2728${RESET}`);
    lines.push('');
    for (const line of body) {
      lines.push(`  ${color}${line}${RESET}`);
    }
    lines.push('');
    lines.push(`  ${DIM}Hat: ${c.hat}   Eye: ${c.eye}${RESET}`);
    lines.push('');
    for (const stat of Object.keys(c.stats)) {
      lines.push(statBar(stat, c.stats[stat]));
    }
    lines.push('');
    return lines;
  }
}

// ── Inline rendering helpers ───────────────────────────────────

// Render a one-line compact representation (for narrow terminals / status bars)
export function renderOneLiner(companion, reaction) {
  const color = RARITY_COLORS[companion.rarity] || '';
  const face = renderFace(companion);
  const label = reaction
    ? `"${reaction.length > 24 ? reaction.slice(0, 23) + '\u2026' : reaction}"`
    : companion.name;
  return `${color}${BOLD}${face}${RESET} ${label}`;
}

// Render sprite + optional bubble as an array of strings (single static frame)
export function renderFrame(companion, options = {}) {
  const renderer = new BuddyRenderer(companion);
  if (options.reaction) renderer.say(options.reaction);
  return renderer._buildFrame();
}
