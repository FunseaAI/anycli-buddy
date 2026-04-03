// Hatching animation — centered, stats reveal one-by-one with suspense.

import { createInterface } from 'readline';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { renderSprite } = await import(join(__dirname, 'sprites.js'));
const { RARITY_COLORS, RARITY_STARS, RESET, BOLD, DIM, ITALIC } = await import(join(__dirname, 'types.js'));

const ESC = '\x1b[';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function cols() { return process.stdout.columns || 80; }
function rows() { return process.stdout.rows || 24; }

function centerH(text) {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, Math.floor((cols() - [...stripped].length) / 2));
  return ' '.repeat(pad) + text;
}

function clear() { process.stdout.write(`${ESC}2J${ESC}1;1H`); }

function drawCentered(lines) {
  clear();
  const startRow = Math.max(1, Math.floor((rows() - lines.length) / 2));
  for (let i = 0; i < lines.length; i++) {
    process.stdout.write(`${ESC}${startRow + i};1H${ESC}2K`);
    process.stdout.write(centerH(lines[i]));
  }
  return startRow;
}

// Write a single line at absolute position
function writeLine(row, text) {
  process.stdout.write(`${ESC}${row};1H${ESC}2K`);
  process.stdout.write(centerH(text));
}

function askName(species, defaultName) {
  return new Promise(resolve => {
    process.stdout.write(`${ESC}?25h`);
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const prompt = `Give your ${species} a name (Enter for "${defaultName}"): `;
    const row = Math.floor(rows() / 2) + 6;
    const lp = Math.max(0, Math.floor((cols() - prompt.length - 10) / 2));
    process.stdout.write(`${ESC}${row};1H${ESC}2K${' '.repeat(lp)}`);
    rl.question(prompt, (answer) => {
      rl.close();
      process.stdout.write(`${ESC}?25l`);
      resolve(answer.trim() || defaultName);
    });
  });
}

// Stat bar with rolling animation
function statBar(val, width = 15) {
  const filled = Math.round((val / 100) * width);
  return '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled);
}

// Rarity label with flair
function rarityLabel(rarity) {
  const labels = {
    common:    `${DIM}common${RESET}`,
    uncommon:  `\x1b[32muncommon${RESET}`,
    rare:      `\x1b[36m\x1b[1mrare${RESET}`,
    epic:      `\x1b[35m\x1b[1m✦ epic ✦${RESET}`,
    legendary: `\x1b[33m\x1b[1m★ LEGENDARY ★${RESET}`,
  };
  return labels[rarity] || rarity;
}

export async function playHatchAnimation(bones, defaultName, profile = null) {
  const color = RARITY_COLORS[bones.rarity] || '';
  const stars = RARITY_STARS[bones.rarity] || '';

  process.stdout.write(`${ESC}?25l`);

  // ── Phase 1: Egg wobble ──────────────────────────────────────
  const eggFrames = [
    ['    ___    ', '   /   \\   ', '  |     |  ', '  |     |  ', '   \\___/   '],
    ['    ___    ', '   /   \\   ', '  |     |  ', '  |     |  ', '    \\___/  '],
    ['    ___    ', '   /   \\   ', '  |     |  ', '  |     |  ', '   \\___/   '],
    ['   ___     ', '  /   \\    ', '  |     |  ', '  |     |  ', '   \\___/   '],
  ];
  for (const frame of eggFrames) {
    drawCentered([...frame.map(l => `${DIM}${l}${RESET}`), '', `${DIM}A mysterious egg appears...${RESET}`]);
    await sleep(400);
  }
  await sleep(600);

  // ── Phase 2: Cracking (3 stages) ─────────────────────────────
  const cracks = [
    ['    ___    ', '   /   \\   ', '  | .   |  ', '  |     |  ', '   \\___/   '],
    ['    ___    ', '   / . \\   ', '  |  /  |  ', '  | .   |  ', '   \\___/   '],
    ['    _*_    ', '   / . \\   ', '  |  / .|  ', '  |. /  |  ', '   \\*__/   '],
  ];
  for (let c = 0; c < cracks.length; c++) {
    const dots = '.'.repeat(c + 1);
    drawCentered([...cracks[c], '', `${ITALIC}*crack${dots}*${RESET}`]);
    await sleep(700);
  }

  // ── Phase 3: Burst ───────────────────────────────────────────
  drawCentered([
    `${color}${BOLD}    * . *    ${RESET}`,
    `${color}${BOLD}  .  \\ /  .  ${RESET}`,
    `${color}${BOLD}    --+--    ${RESET}`,
    `${color}${BOLD}  .  / \\  .  ${RESET}`,
    `${color}${BOLD}    * . *    ${RESET}`,
    '',
    `${color}${BOLD}!! HATCH !!${RESET}`,
  ]);
  await sleep(1200);

  // ── Phase 4: Reveal species + rarity ─────────────────────────
  const sprite = renderSprite(bones, 0);
  const revealLines = [
    ...sprite.map(l => `${color}${l}${RESET}`),
    '',
    `${rarityLabel(bones.rarity)}  ${color}${bones.species}${RESET}`,
    `${color}${stars}${RESET}`,
    ...(bones.shiny ? ['', `${BOLD}\x1b[33m\u2728 SHINY \u2728${RESET}`] : []),
  ];
  drawCentered(revealLines);
  await sleep(2000);

  // ── Phase 5: Ask for name ────────────────────────────────────
  const name = await askName(bones.species, defaultName);

  // ── Phase 6: Stats reveal one-by-one ─────────────────────────
  const statEntries = Object.entries(bones.stats);

  // Build the full card layout (but stats start as hidden)
  const cardBase = [
    ...sprite.map(l => `${color}${l}${RESET}`),
    '',
    `${color}${BOLD}${name}${RESET} ${color}${stars}${RESET}`,
    `${DIM}${bones.rarity} ${bones.species}${RESET}`,
    '',
    `${DIM}\u2500\u2500 Stats \u2500\u2500${RESET}`,
  ];

  // Draw base card first
  const startRow = drawCentered([
    ...cardBase,
    ...statEntries.map(() => `${DIM}  ..........  loading${RESET}`),
  ]);

  // Reveal each stat with rolling effect
  const statsStartRow = startRow + cardBase.length;
  for (let i = 0; i < statEntries.length; i++) {
    const [stat, val] = statEntries[i];

    // Rolling number animation (3 quick random values then real)
    for (let r = 0; r < 3; r++) {
      const fakeVal = Math.floor(Math.random() * 100);
      writeLine(statsStartRow + i, `${color}${stat.padEnd(10)} ${statBar(fakeVal)} ${DIM}${String(fakeVal).padStart(3)}${RESET}`);
      await sleep(100);
    }

    // Final real value
    writeLine(statsStartRow + i, `${color}${stat.padEnd(10)} ${statBar(val)} ${BOLD}${String(val).padStart(3)}${RESET}`);
    await sleep(400);
  }

  await sleep(1000);

  // ── Phase 6.5: Profile insights ──────────────────────────────
  if (profile) {
    const insights = [];
    if (profile.topLang) insights.push(`Raised on ${BOLD}${profile.topLang}${RESET}${DIM} (detected in your project)`);
    if (profile.debugFrequency > 5) insights.push(`${BOLD}Bug hunter${RESET}${DIM} — ${profile.debugFrequency} fix/debug commits found`);
    if (profile.refactorFrequency > 3) insights.push(`${BOLD}Clean coder${RESET}${DIM} — ${profile.refactorFrequency} refactor commits found`);
    if (profile.chaosLevel > 3) insights.push(`${BOLD}Chaos energy${RESET}${DIM} — ${profile.chaosLevel} reverts/yolo commits detected`);
    if (profile.lateNightCoder) insights.push(`${BOLD}Night owl${RESET}${DIM} — 30%+ commits after midnight`);
    if (profile.prolificCoder) insights.push(`${BOLD}Prolific${RESET}${DIM} — ${profile.commitCount} commits in this repo`);
    if (profile.testRunner) insights.push(`${BOLD}Tested${RESET}${DIM} — test runner detected in shell history`);
    if (profile.vimUser) insights.push(`${BOLD}Vim user${RESET}${DIM} — respect`);

    if (insights.length > 0) {
      const insightLines = [
        '',
        `${DIM}\u2500\u2500 Personality shaped by your coding style \u2500\u2500${RESET}`,
        '',
        ...insights.map(i => `${DIM}  \u2022 ${i}${RESET}`),
      ];

      for (const line of insightLines) {
        const row = startRow + cardBase.length + statEntries.length + insightLines.indexOf(line);
        writeLine(row, line);
        await sleep(300);
      }
      await sleep(1500);
    }
  }

  // ── Phase 7: Final message ───────────────────────────────────
  drawCentered([
    ...sprite.map(l => `${color}${l}${RESET}`),
    '',
    `${color}${BOLD}${name}${RESET} ${color}${stars}${RESET}`,
    '',
    ...statEntries.map(([stat, val]) =>
      `${color}${stat.padEnd(10)} ${statBar(val)} ${BOLD}${String(val).padStart(3)}${RESET}`
    ),
    '',
    `${BOLD}${name} is ready to code with you!${RESET}`,
  ]);
  await sleep(2500);

  process.stdout.write(`${ESC}?25h`);
  return name;
}
