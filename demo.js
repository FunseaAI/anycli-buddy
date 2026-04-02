#!/usr/bin/env node
// Interactive demo — shows what the buddy system can do.
// Run: node demo.js [seed]

import { hatch } from './companion.js';
import { BuddyRenderer } from './renderer.js';
import { cursor, writeInline } from './terminal.js';
import { SPECIES, RARITY_STARS, RARITY_COLORS, RESET, BOLD, DIM } from './types.js';
import { renderSprite } from './sprites.js';

const seed = process.argv[2] || `demo-${Date.now()}`;
const companion = hatch(seed);

console.log('');
console.log(`${BOLD}terminal-buddy demo${RESET}  ${DIM}(seed: ${seed})${RESET}`);
console.log(`${DIM}Commands: say <text> | pet | info | gallery | quit${RESET}`);
console.log('');

// Show the stats card first
const renderer = new BuddyRenderer(companion);
const card = renderer.renderCard();
for (const line of card) console.log(line);

console.log('');
console.log(`${DIM}Starting animation... (type commands below)${RESET}`);
console.log('');

// Reserve space for the sprite
const spriteLines = 8; // max lines the sprite can take
for (let i = 0; i < spriteLines; i++) process.stdout.write('\n');

// Start animation
let prevCount = 0;
renderer.start((lines, prev) => {
  writeInline(lines, prev || prevCount);
  prevCount = lines.length;
});

// Handle stdin for interactive commands
if (process.stdin.isTTY) {
  process.stdin.setEncoding('utf8');

  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
  });

  // Move prompt below the sprite area
  rl.on('line', (input) => {
    const cmd = input.trim().toLowerCase();

    if (cmd === 'quit' || cmd === 'q' || cmd === 'exit') {
      renderer.stop();
      cursor.show();
      console.log('\nBye!');
      process.exit(0);
    }

    if (cmd.startsWith('say ')) {
      renderer.say(input.trim().slice(4));
      return;
    }

    if (cmd === 'pet') {
      renderer.pet();
      renderer.say('purr~');
      return;
    }

    if (cmd === 'info') {
      renderer.stop();
      console.log('\n'.repeat(spriteLines));
      const infoCard = renderer.renderCard();
      for (const line of infoCard) console.log(line);
      console.log(`${DIM}Resuming animation...${RESET}\n`);
      for (let i = 0; i < spriteLines; i++) process.stdout.write('\n');
      prevCount = 0;
      renderer.start((lines, prev) => {
        writeInline(lines, prev || prevCount);
        prevCount = lines.length;
      });
      return;
    }

    if (cmd === 'gallery') {
      renderer.stop();
      console.log('\n'.repeat(spriteLines + 2));
      showGallery();
      console.log(`\n${DIM}Resuming animation...${RESET}\n`);
      for (let i = 0; i < spriteLines; i++) process.stdout.write('\n');
      prevCount = 0;
      renderer.start((lines, prev) => {
        writeInline(lines, prev || prevCount);
        prevCount = lines.length;
      });
      return;
    }
  });

  rl.on('close', () => {
    renderer.stop();
    cursor.show();
    process.exit(0);
  });
}

// Cleanup on exit
process.on('SIGINT', () => {
  renderer.stop();
  cursor.show();
  console.log('\n');
  process.exit(0);
});

function showGallery() {
  console.log(`${BOLD}  All 18 Species:${RESET}\n`);
  for (const species of SPECIES) {
    const fakeBones = { species, eye: '\u00b7', hat: 'none', rarity: 'common', shiny: false, stats: {} };
    const sprite = renderSprite(fakeBones, 0);
    console.log(`  ${DIM}${species}:${RESET}`);
    for (const line of sprite) {
      console.log(`    ${line}`);
    }
  }
}
