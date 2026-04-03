#!/usr/bin/env node
// Standalone hatch flow — analyzes user, plays animation, saves companion.

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { loadCompanion, createBones, finalizeCompanion } = await import(join(__dirname, 'storage.js'));
const { playHatchAnimation } = await import(join(__dirname, 'hatch-animation.js'));

if (loadCompanion()) process.exit(0);

// Generate bones + analyze user profile
const { bones, profile } = createBones();

// Default name
const prefixes = ['Pip','Nix','Zap','Dot','Kit','Bop','Fizz','Chip','Glo','Wiz','Tux','Hex','Bit','Pix','Zip','Bud','Mox','Dex'];
const suffixes = ['o','ie','ly','er','le','a','us','ix','on','et','sy','by'];
const seed = process.env.USER || 'codex';
let h = 2166136261;
for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
h = h >>> 0;
const defaultName = prefixes[h % prefixes.length] + suffixes[(h >> 8) % suffixes.length];

// Play animation + ask name, passing profile for display
const chosenName = await playHatchAnimation(bones, defaultName, profile);

// Save with personality from profile
finalizeCompanion(bones, chosenName, profile);
