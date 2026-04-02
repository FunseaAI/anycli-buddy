#!/usr/bin/env node
// Buddy panel — runs in the tmux right pane.
// Renders animated companion at a fixed position (top of pane).

import { createServer } from 'net';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { hatch } = await import(join(__dirname, 'companion.js'));
const { BuddyRenderer } = await import(join(__dirname, 'renderer.js'));
const { pickQuip } = await import(join(__dirname, 'quips.js'));

const SOCKET_PATH = join(__dirname, 'buddy.sock');
const PID_FILE = join(__dirname, 'buddy.pid');
const ESC = '\x1b[';

// ── Companion ──────────────────────────────────────────────────
const seed = process.env.USER || 'codex-user';
const companion = hatch(seed);
const renderer = new BuddyRenderer(companion);

// ── Fixed-position rendering ───────────────────────────────────
// Write each line at absolute row, clearing old content.
process.stdout.write(`${ESC}?25l`);  // hide cursor
process.stdout.write(`${ESC}2J`);    // clear screen

let prevCount = 0;

renderer.start((lines) => {
  const maxLines = Math.max(lines.length, prevCount);
  for (let i = 0; i < maxLines; i++) {
    process.stdout.write(`${ESC}${i + 1};1H`);  // move to row i+1, col 1
    process.stdout.write(`${ESC}2K`);             // clear line
    if (i < lines.length) {
      process.stdout.write(lines[i]);
    }
  }
  prevCount = lines.length;
});

renderer.say(pickQuip('greeting', companion.stats, Date.now()));

// ── Event mapping ──────────────────────────────────────────────
const EVENT_MAP = {
  SessionStart:     'greeting',
  UserPromptSubmit: 'idle',
  PreToolUse:       'tool_start',
  PostToolUse:      'tool_complete',
  Stop:             'completion',
};

function handleEvent(data) {
  try {
    const msg = JSON.parse(data);
    const event = msg.hook_event_name || 'idle';
    if (event === 'PostToolUse' && msg.tool_output) {
      const out = typeof msg.tool_output === 'string' ? msg.tool_output : '';
      if (/error|Error|FAILED/.test(out)) {
        renderer.say(pickQuip('error', companion.stats, Date.now()));
        return;
      }
    }
    renderer.say(pickQuip(EVENT_MAP[event] || 'idle', companion.stats, Date.now()));
  } catch {
    renderer.say(pickQuip('idle', companion.stats, Date.now()));
  }
}

// ── Socket server ──────────────────────────────────────────────
if (existsSync(SOCKET_PATH)) unlinkSync(SOCKET_PATH);

const server = createServer((conn) => {
  let buf = '';
  conn.on('data', (c) => { buf += c; });
  conn.on('end', () => { handleEvent(buf); conn.end(); });
});

server.listen(SOCKET_PATH, () => {
  writeFileSync(PID_FILE, process.pid.toString());
});

// ── Cleanup ────────────────────────────────────────────────────
function cleanup() {
  renderer.stop();
  process.stdout.write(`${ESC}?25h`); // show cursor
  server.close();
  try { unlinkSync(SOCKET_PATH); } catch {}
  try { unlinkSync(PID_FILE); } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGHUP', cleanup);
