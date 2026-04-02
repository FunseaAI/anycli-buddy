#!/usr/bin/env node
// Buddy daemon — runs as a persistent background process.
// Listens on a Unix socket for event messages from hooks.
// Renders the buddy sprite in the terminal's right margin.
//
// Started by the first hook invocation, stays alive until Codex exits.

import { createServer } from 'net';
import { existsSync, unlinkSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Resolve imports relative to this file's directory (works when installed to ~/.codex/buddy/)
const __dirname = dirname(fileURLToPath(import.meta.url));
const { hatch } = await import(join(__dirname, 'companion.js'));
const { BuddyRenderer } = await import(join(__dirname, 'renderer.js'));
const { pickQuip } = await import(join(__dirname, 'quips.js'));
const { RARITY_COLORS, RARITY_STARS, RESET, BOLD, DIM } = await import(join(__dirname, 'types.js'));

const SOCKET_PATH = join(process.env.HOME || '/tmp', '.codex', 'buddy', 'buddy.sock');
const PID_FILE = join(process.env.HOME || '/tmp', '.codex', 'buddy', 'buddy.pid');

// ── Companion setup ────────────────────────────────────────────
const seed = process.env.USER || process.env.USERNAME || 'codex-user';
const companion = hatch(seed);
const renderer = new BuddyRenderer(companion);

// ── Terminal rendering ─────────────────────────────────────────
// Render in the top-right corner of the terminal using ANSI positioning.
// This avoids interfering with Codex's main output area.

const ESC = '\x1b[';

function getTermSize() {
  return {
    cols: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  };
}

let prevLineCount = 0;

function renderBuddy(lines) {
  const { cols, rows } = getTermSize();
  const spriteWidth = 16;
  const startCol = Math.max(1, cols - spriteWidth);
  const startRow = 2; // leave row 1 for Codex status

  // Save cursor, render sprite, restore cursor
  process.stderr.write(`${ESC}s`); // save cursor (use stderr to not interfere with Codex stdout)

  const maxLines = Math.max(lines.length, prevLineCount);
  for (let i = 0; i < maxLines; i++) {
    process.stderr.write(`${ESC}${startRow + i};${startCol}H`); // move to position
    process.stderr.write(`${ESC}K`); // clear to end of line
    if (i < lines.length) {
      process.stderr.write(lines[i]);
    }
  }

  process.stderr.write(`${ESC}u`); // restore cursor
  prevLineCount = lines.length;
}

// Start animation loop
renderer.start((lines) => {
  renderBuddy(lines);
});

// ── Event mapping ──────────────────────────────────────────────
const EVENT_MAP = {
  SessionStart:     'greeting',
  UserPromptSubmit: 'idle',
  PreToolUse:       'tool_start',
  PostToolUse:      'tool_complete',
  Stop:             'completion',
};

function handleEvent(eventData) {
  try {
    const data = JSON.parse(eventData);
    const eventName = data.hook_event_name || data.event;

    // Map hook event to quip category
    const quipCategory = EVENT_MAP[eventName] || 'idle';

    // Check for errors in PostToolUse
    if (eventName === 'PostToolUse' && data.tool_output) {
      const output = typeof data.tool_output === 'string' ? data.tool_output : '';
      if (output.includes('error') || output.includes('Error') || output.includes('FAILED')) {
        renderer.say(pickQuip('error', companion.stats, Date.now()));
        return;
      }
    }

    renderer.say(pickQuip(quipCategory, companion.stats, Date.now()));
  } catch {
    // Non-JSON event, just trigger idle
    renderer.say(pickQuip('idle', companion.stats, Date.now()));
  }
}

// ── Socket server ──────────────────────────────────────────────
// Clean up stale socket
if (existsSync(SOCKET_PATH)) {
  unlinkSync(SOCKET_PATH);
}

const server = createServer((conn) => {
  let data = '';
  conn.on('data', (chunk) => { data += chunk; });
  conn.on('end', () => {
    handleEvent(data);
    conn.end();
  });
});

server.listen(SOCKET_PATH, () => {
  // Write PID file so hook script can check if daemon is alive
  writeFileSync(PID_FILE, process.pid.toString());
});

// ── Cleanup ────────────────────────────────────────────────────
function cleanup() {
  renderer.stop();
  server.close();
  try { unlinkSync(SOCKET_PATH); } catch {}
  try { unlinkSync(PID_FILE); } catch {}
  // Clear the sprite area
  const { cols } = getTermSize();
  const spriteWidth = 16;
  const startCol = Math.max(1, cols - spriteWidth);
  process.stderr.write(`${ESC}s`);
  for (let i = 0; i < prevLineCount + 2; i++) {
    process.stderr.write(`${ESC}${2 + i};${startCol}H${ESC}K`);
  }
  process.stderr.write(`${ESC}u`);
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGHUP', cleanup);

// Auto-exit after 30 minutes of no events (Codex probably closed)
let lastEvent = Date.now();
setInterval(() => {
  if (Date.now() - lastEvent > 30 * 60 * 1000) {
    cleanup();
  }
}, 60000);

// Update lastEvent on each connection
server.on('connection', () => { lastEvent = Date.now(); });
