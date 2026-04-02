#!/usr/bin/env node
// Standalone hatch flow — runs before tmux starts.
// Plays animation, asks for name, saves companion.json.

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { loadCompanion, createBones, finalizeCompanion } = await import(join(__dirname, 'storage.js'));
const { playHatchAnimation } = await import(join(__dirname, 'hatch-animation.js'));

// Already hatched? Skip.
if (loadCompanion()) {
  process.exit(0);
}

// Generate bones
const bones = createBones();

// Default name
const prefixes = ['Pip','Nix','Zap','Dot','Kit','Bop','Fizz','Chip','Glo','Wiz','Tux','Hex','Bit','Pix','Zip','Bud','Mox','Dex'];
const suffixes = ['o','ie','ly','er','le','a','us','ix','on','et','sy','by'];
const seed = process.env.USER || 'codex';
let h = 2166136261;
for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
h = h >>> 0;
const defaultName = prefixes[h % prefixes.length] + suffixes[(h >> 8) % suffixes.length];

// Play animation + ask name
const chosenName = await playHatchAnimation(bones, defaultName);

// Save
finalizeCompanion(bones, chosenName);
