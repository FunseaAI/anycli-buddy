#!/usr/bin/env node
// Inline buddy renderer for Codex hooks.
// Outputs a single static frame (sprite + speech bubble) to stdout.
// Codex displays this as visible text in the conversation flow.

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { hatch } = await import(join(__dirname, 'companion.js'));
const { renderSprite, renderFace } = await import(join(__dirname, 'sprites.js'));
const { pickQuip } = await import(join(__dirname, 'quips.js'));

// ── Event → quip mapping ───────────────────────────────────────
const EVENT_MAP = {
  SessionStart:     'greeting',
  UserPromptSubmit: 'idle',
  PreToolUse:       'tool_start',
  PostToolUse:      'tool_complete',
  Stop:             'completion',
};

// ── Parse event from command line arg ──────────────────────────
let eventName = 'idle';
try {
  const data = JSON.parse(process.argv[2] || '{}');
  eventName = data.hook_event_name || 'idle';
} catch {}

// ── Generate companion (deterministic per user) ────────────────
const seed = process.env.USER || process.env.USERNAME || 'codex-user';
const companion = hatch(seed);

// ── Pick quip based on event ───────────────────────────────────
const quipCategory = EVENT_MAP[eventName] || 'idle';
const quip = pickQuip(quipCategory, companion.stats, Date.now());

// ── Render sprite + quip as plain text ─────────────────────────
const face = renderFace(companion);
const sprite = renderSprite(companion, 0);

// Compact output: face + name + quip on one line, sprite below
const line = `${face} ${companion.name}: "${quip}"`;

// Only show the full sprite on SessionStart (first appearance),
// keep other events compact so they don't clutter the conversation.
if (eventName === 'SessionStart') {
  console.log('');
  console.log(`🐾 Your coding buddy has arrived!`);
  console.log('');
  for (const row of sprite) {
    console.log('  ' + row);
  }
  console.log(`  ${companion.name} (${companion.rarity} ${companion.species})`);
  console.log('');
  console.log(`  ${companion.name}: "${quip}"`);
  console.log('');
} else {
  // One-liner for other events
  console.log(`${face} ${companion.name}: "${quip}"`);
}
