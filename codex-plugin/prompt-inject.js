#!/usr/bin/env node
// Writes companion intro into ~/.codex/instructions.md
// Codex reads this file as part of its system prompt — invisible to the user.

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { loadCompanion } = await import(join(__dirname, 'storage.js'));

const companion = loadCompanion();
if (!companion) process.exit(0);

const INSTRUCTIONS_PATH = join(process.env.HOME, '.codex', 'instructions.md');
const MARKER_START = '<!-- buddy-companion-start -->';
const MARKER_END = '<!-- buddy-companion-end -->';

const intro = `${MARKER_START}
# Companion

A small ${companion.species} named ${companion.name} sits beside the user's input area and occasionally comments in a speech bubble. You're not ${companion.name} — it's a separate watcher.

When the user addresses ${companion.name} directly (by name), its bubble will answer. Your job in that moment is to stay out of the way: respond in ONE line or less, or just answer any part of the message meant for you. Don't explain that you're not ${companion.name} — they know. Don't narrate what ${companion.name} might say — the bubble handles that.

${companion.name} is a ${companion.rarity} ${companion.species} with traits: DEBUGGING ${companion.stats.DEBUGGING}, PATIENCE ${companion.stats.PATIENCE}, CHAOS ${companion.stats.CHAOS}, WISDOM ${companion.stats.WISDOM}, SNARK ${companion.stats.SNARK}.
${MARKER_END}`;

// Read existing file, replace or append buddy section
let content = '';
if (existsSync(INSTRUCTIONS_PATH)) {
  content = readFileSync(INSTRUCTIONS_PATH, 'utf-8');
}

if (content.includes(MARKER_START)) {
  // Replace existing section
  const re = new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}`, 'g');
  content = content.replace(re, intro);
} else {
  // Append
  content = content.trimEnd() + '\n\n' + intro + '\n';
}

writeFileSync(INSTRUCTIONS_PATH, content);
