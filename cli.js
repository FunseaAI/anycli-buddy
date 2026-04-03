#!/usr/bin/env node
// CLI entry point for anycli-buddy
// Usage:
//   anycli-buddy hatch [seed] [name]  — generate a companion
//   anycli-buddy show [seed]          — show static sprite
//   anycli-buddy card [seed]          — show full stats card
//   anycli-buddy gallery              — show all 18 species
//   anycli-buddy animate [seed]       — live animation (same as demo)
//   anycli-buddy face [seed]          — one-line face only

import { hatch, roll } from './companion.js';
import { BuddyRenderer, renderOneLiner, renderFrame } from './renderer.js';
import { renderSprite, renderFace } from './sprites.js';
import { SPECIES, RARITY_COLORS, RARITY_STARS, RESET, BOLD, DIM } from './types.js';
import { cursor, writeInline } from './terminal.js';

const [,, command, ...args] = process.argv;

function getSeed() {
  return args[0] || `user-${process.env.USER || 'anon'}`;
}

function printHelp() {
  console.log(`
${BOLD}anycli-buddy${RESET} — standalone terminal companion

${BOLD}Commands:${RESET}
  hatch [seed] [name]   Generate and display a companion
  show [seed]           Show static sprite
  card [seed]           Show full stats card
  gallery               Show all 18 species
  animate [seed]        Live animated companion (Ctrl+C to exit)
  face [seed]           One-line face only
  oneliner [seed]       Compact one-liner for status bars

${BOLD}Examples:${RESET}
  anycli-buddy hatch my-username Sparky
  anycli-buddy animate
  anycli-buddy gallery

${DIM}Seed defaults to $USER. Same seed always produces the same companion.${RESET}
`);
}

switch (command) {
  case 'hatch': {
    const seed = args[0] || getSeed();
    const name = args[1];
    const c = hatch(seed, name);
    const renderer = new BuddyRenderer(c);
    const card = renderer.renderCard();
    for (const line of card) console.log(line);
    break;
  }

  case 'show': {
    const c = hatch(getSeed());
    const lines = renderFrame(c);
    for (const line of lines) console.log(line);
    break;
  }

  case 'card': {
    const c = hatch(getSeed());
    const renderer = new BuddyRenderer(c);
    for (const line of renderer.renderCard()) console.log(line);
    break;
  }

  case 'face': {
    const c = hatch(getSeed());
    console.log(renderFace(c));
    break;
  }

  case 'oneliner': {
    const c = hatch(getSeed());
    console.log(renderOneLiner(c));
    break;
  }

  case 'gallery': {
    console.log(`\n${BOLD}  All 18 Species:${RESET}\n`);
    for (const species of SPECIES) {
      const bones = { species, eye: '\u00b7', hat: 'none', rarity: 'common', shiny: false, stats: {} };
      const sprite = renderSprite(bones, 0);
      console.log(`  ${DIM}${species}:${RESET}`);
      for (const line of sprite) console.log(`    ${line}`);
      console.log('');
    }
    break;
  }

  case 'animate': {
    const c = hatch(getSeed());
    console.log(`\n${BOLD}${RARITY_COLORS[c.rarity]}${c.name}${RESET} ${DIM}(${c.rarity} ${c.species})${RESET}`);
    console.log(`${DIM}Press Ctrl+C to exit${RESET}\n`);

    const spriteSpace = 10;
    for (let i = 0; i < spriteSpace; i++) process.stdout.write('\n');

    let prevCount = 0;
    const renderer = new BuddyRenderer(c);

    // Random quips every ~15s
    const quips = [
      'nice code!', 'hmm...', '*yawn*', 'you got this!',
      'what if we...', 'ooh!', 'debug time?', '*stretch*',
      'ship it!', 'one more test...', 'snack break?',
    ];
    let quipTimer = setInterval(() => {
      if (!renderer.reaction) {
        renderer.say(quips[Math.floor(Math.random() * quips.length)]);
      }
    }, 15000);

    renderer.start((lines, prev) => {
      writeInline(lines, prev || prevCount);
      prevCount = lines.length;
    });

    process.on('SIGINT', () => {
      clearInterval(quipTimer);
      renderer.stop();
      cursor.show();
      console.log('\n');
      process.exit(0);
    });
    break;
  }

  default:
    printHelp();
    break;
}
