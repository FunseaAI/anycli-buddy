// Hatching animation with naming flow.
// egg → crack → burst → reveal species → ask name → show stats

import { createInterface } from 'readline';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { renderSprite } = await import(join(__dirname, 'sprites.js'));
const { RARITY_COLORS, RARITY_STARS, RESET, BOLD, DIM, ITALIC } = await import(join(__dirname, 'types.js'));

const ESC = '\x1b[';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function center(text, cols) {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, Math.floor((cols - [...stripped].length) / 2));
  return ' '.repeat(pad) + text;
}

function clearScreen() {
  process.stdout.write(`${ESC}2J${ESC}1;1H`);
}

/**
 * Ask the user for a name via stdin.
 * @param {string} species
 * @param {string} defaultName
 * @returns {Promise<string>}
 */
function askName(species, defaultName, cols) {
  return new Promise(resolve => {
    process.stdout.write(`${ESC}?25h`); // show cursor for input
    const rl = createInterface({ input: process.stdin, output: process.stdout });

    const prompt = `  Give your ${species} a name (Enter for "${defaultName}"): `;
    const row = 10;
    process.stdout.write(`${ESC}${row};1H${ESC}2K`);
    // Center the prompt area
    const lp = Math.max(0, Math.floor((cols - prompt.length - 10) / 2));
    process.stdout.write(' '.repeat(lp));

    rl.question(prompt, (answer) => {
      rl.close();
      process.stdout.write(`${ESC}?25l`); // hide cursor again
      const name = answer.trim() || defaultName;
      resolve(name);
    });
  });
}

/**
 * Play the full hatching sequence.
 * @param {object} bones - companion bones (no name yet)
 * @param {string} defaultName - fallback name
 * @returns {Promise<string>} chosen name
 */
export async function playHatchAnimation(bones, defaultName) {
  const cols = process.stdout.columns || 80;
  const color = RARITY_COLORS[bones.rarity] || '';
  const stars = RARITY_STARS[bones.rarity] || '';

  process.stdout.write(`${ESC}?25l`); // hide cursor
  clearScreen();

  // ── Phase 1: Egg ─────────────────────────────────────────────
  const egg = [
    '    ___    ',
    '   /   \\   ',
    '  |     |  ',
    '  |     |  ',
    '   \\___/   ',
  ];
  for (let i = 0; i < egg.length; i++) {
    process.stdout.write(`${ESC}${i + 2};1H${ESC}2K`);
    process.stdout.write(center(`${DIM}${egg[i]}${RESET}`, cols));
  }
  process.stdout.write(`${ESC}${8};1H${ESC}2K`);
  process.stdout.write(center(`${DIM}A mysterious egg appears...${RESET}`, cols));
  await sleep(1500);

  // ── Phase 2: Cracking ────────────────────────────────────────
  const cracks = [
    ['    ___    ', '   /   \\   ', '  | .   |  ', '  |     |  ', '   \\___/   '],
    ['    ___    ', '   / . \\   ', '  |  /  |  ', '  | .   |  ', '   \\___/   '],
    ['    _*_    ', '   / . \\   ', '  |  / .|  ', '  |. /  |  ', '   \\*__/   '],
  ];
  for (const frame of cracks) {
    for (let i = 0; i < frame.length; i++) {
      process.stdout.write(`${ESC}${i + 2};1H${ESC}2K`);
      process.stdout.write(center(frame[i], cols));
    }
    process.stdout.write(`${ESC}${8};1H${ESC}2K`);
    process.stdout.write(center(`${ITALIC}*crack*${RESET}`, cols));
    await sleep(800);
  }

  // ── Phase 3: Burst ───────────────────────────────────────────
  const burst = [
    '    * . *    ',
    '  .  \\ /  .  ',
    '    --+--    ',
    '  .  / \\  .  ',
    '    * . *    ',
  ];
  for (let i = 0; i < burst.length; i++) {
    process.stdout.write(`${ESC}${i + 2};1H${ESC}2K`);
    process.stdout.write(center(`${color}${BOLD}${burst[i]}${RESET}`, cols));
  }
  process.stdout.write(`${ESC}${8};1H${ESC}2K`);
  process.stdout.write(center(`${color}${BOLD}!! HATCH !!${RESET}`, cols));
  await sleep(1000);

  // ── Phase 4: Reveal species ──────────────────────────────────
  clearScreen();
  const sprite = renderSprite(bones, 0);
  for (let i = 0; i < sprite.length; i++) {
    process.stdout.write(`${ESC}${i + 2};1H${ESC}2K`);
    process.stdout.write(center(`${color}${sprite[i]}${RESET}`, cols));
  }
  const infoRow = sprite.length + 3;
  process.stdout.write(`${ESC}${infoRow};1H${ESC}2K`);
  process.stdout.write(center(
    `${color}${stars}${RESET}  ${DIM}${bones.rarity} ${bones.species}${RESET}  ${color}${stars}${RESET}`,
    cols
  ));
  if (bones.shiny) {
    process.stdout.write(`${ESC}${infoRow + 1};1H${ESC}2K`);
    process.stdout.write(center(`${BOLD}\u2728 SHINY \u2728${RESET}`, cols));
  }
  await sleep(1500);

  // ── Phase 5: Ask for name ────────────────────────────────────
  const name = await askName(bones.species, defaultName, cols);

  // ── Phase 6: Show final card with name ───────────────────────
  clearScreen();
  for (let i = 0; i < sprite.length; i++) {
    process.stdout.write(`${ESC}${i + 2};1H${ESC}2K`);
    process.stdout.write(center(`${color}${sprite[i]}${RESET}`, cols));
  }
  const nameRow = sprite.length + 3;
  process.stdout.write(`${ESC}${nameRow};1H${ESC}2K`);
  process.stdout.write(center(`${color}${BOLD}${name}${RESET} ${color}${stars}${RESET}`, cols));
  process.stdout.write(`${ESC}${nameRow + 1};1H${ESC}2K`);
  process.stdout.write(center(`${DIM}${bones.rarity} ${bones.species}${RESET}`, cols));

  // Stats
  const statsRow = nameRow + 3;
  process.stdout.write(`${ESC}${statsRow};1H${ESC}2K`);
  process.stdout.write(center(`${DIM}── Stats ──${RESET}`, cols));

  const statNames = Object.keys(bones.stats);
  for (let i = 0; i < statNames.length; i++) {
    const sn = statNames[i];
    const val = bones.stats[sn];
    const filled = Math.round((val / 100) * 15);
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(15 - filled);
    process.stdout.write(`${ESC}${statsRow + 1 + i};1H${ESC}2K`);
    process.stdout.write(center(`${color}${sn.padEnd(10)} ${bar} ${val}${RESET}`, cols));
    await sleep(300);
  }

  await sleep(1000);
  const msgRow = statsRow + statNames.length + 2;
  process.stdout.write(`${ESC}${msgRow};1H${ESC}2K`);
  process.stdout.write(center(`${BOLD}${name} is ready to code with you!${RESET}`, cols));
  await sleep(2000);

  process.stdout.write(`${ESC}?25h`);
  return name;
}
