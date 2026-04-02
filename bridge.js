#!/usr/bin/env node
// JSON-over-stdio bridge for non-JS CLI integrations.
// Spawned as a subprocess by Go/Python/Rust CLIs to drive the buddy system.
//
// Protocol (JSON lines):
//   → stdin:  {"cmd":"hatch","seed":"user-123","name":"Buddy","stream":true}
//   ← stdout: {"type":"hatched","companion":{...}}
//   ← stdout: {"type":"frame","lines":[...],"width":12,"height":6}  (auto-pushed if stream:true)
//
//   → stdin:  {"cmd":"say","text":"nice code!"}
//   → stdin:  {"cmd":"pet"}
//   → stdin:  {"cmd":"frame"}        (request single frame)
//   → stdin:  {"cmd":"card"}         (request stats card)
//   → stdin:  {"cmd":"oneliner"}     (request one-liner)
//   → stdin:  {"cmd":"stop"}
//   ← stdout: {"type":"stopped"}
//
// Usage: node bridge.js              (reads JSON lines from stdin)
//        echo '{"cmd":"hatch","seed":"test"}' | node bridge.js

import { createInterface } from 'readline';
import { hatch } from './companion.js';
import { BuddyRenderer, renderOneLiner } from './renderer.js';

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

let companion = null;
let renderer = null;
let streaming = false;
let streamTimer = null;

function emitFrame() {
  if (!renderer) return;
  const lines = renderer._buildFrame();
  send({
    type: 'frame',
    lines,
    width: Math.max(...lines.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').length)),
    height: lines.length,
  });
}

function startStreaming() {
  if (streamTimer) clearInterval(streamTimer);
  streamTimer = setInterval(() => {
    if (renderer) {
      renderer.tick++;
      emitFrame();
    }
  }, 500);
}

function stopStreaming() {
  if (streamTimer) {
    clearInterval(streamTimer);
    streamTimer = null;
  }
}

function handleCommand(msg) {
  switch (msg.cmd) {
    case 'hatch': {
      const seed = msg.seed || `bridge-${Date.now()}`;
      const name = msg.name || undefined;
      companion = hatch(seed, name);
      renderer = new BuddyRenderer(companion);

      send({
        type: 'hatched',
        companion: {
          name: companion.name,
          species: companion.species,
          rarity: companion.rarity,
          eye: companion.eye,
          hat: companion.hat,
          shiny: companion.shiny,
          stats: companion.stats,
          personality: companion.personality,
          hatchedAt: companion.hatchedAt,
        },
      });

      // Auto-push frames if stream mode requested
      if (msg.stream) {
        streaming = true;
        startStreaming();
      }

      // Emit first frame immediately
      emitFrame();
      break;
    }

    case 'say': {
      if (!renderer) { send({ type: 'error', message: 'no companion hatched' }); break; }
      renderer.say(msg.text || '');
      if (!streaming) emitFrame();
      break;
    }

    case 'pet': {
      if (!renderer) { send({ type: 'error', message: 'no companion hatched' }); break; }
      renderer.pet();
      if (!streaming) emitFrame();
      break;
    }

    case 'frame': {
      if (!renderer) { send({ type: 'error', message: 'no companion hatched' }); break; }
      renderer.tick++;
      emitFrame();
      break;
    }

    case 'card': {
      if (!renderer) { send({ type: 'error', message: 'no companion hatched' }); break; }
      send({ type: 'card', lines: renderer.renderCard() });
      break;
    }

    case 'oneliner': {
      if (!companion) { send({ type: 'error', message: 'no companion hatched' }); break; }
      send({ type: 'oneliner', text: renderOneLiner(companion, renderer?.reaction) });
      break;
    }

    case 'stop': {
      stopStreaming();
      if (renderer) renderer.stop();
      send({ type: 'stopped' });
      process.exit(0);
      break;
    }

    default:
      send({ type: 'error', message: `unknown command: ${msg.cmd}` });
  }
}

// Read JSON lines from stdin
const rl = createInterface({ input: process.stdin, terminal: false });

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const msg = JSON.parse(trimmed);
    handleCommand(msg);
  } catch (e) {
    send({ type: 'error', message: `invalid JSON: ${e.message}` });
  }
});

rl.on('close', () => {
  stopStreaming();
  if (renderer) renderer.stop();
  process.exit(0);
});

// Clean exit on signals
process.on('SIGINT', () => { stopStreaming(); process.exit(0); });
process.on('SIGTERM', () => { stopStreaming(); process.exit(0); });
