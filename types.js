// Species, rarities, eyes, hats, stats — companion system for terminal coding agents

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const SPECIES = [
  'duck', 'goose', 'blob', 'cat', 'dragon', 'octopus', 'owl', 'penguin',
  'turtle', 'snail', 'ghost', 'axolotl', 'capybara', 'cactus', 'robot',
  'rabbit', 'mushroom', 'chonk',
];

export const EYES = ['·', '\u2726', '\u00d7', '\u25c9', '@', '\u00b0']; // · ✦ × ◉ @ °

export const HATS = [
  'none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie', 'tinyduck',
];

export const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK'];

export const RARITY_WEIGHTS = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
};

export const RARITY_STARS = {
  common:    '\u2605',
  uncommon:  '\u2605\u2605',
  rare:      '\u2605\u2605\u2605',
  epic:      '\u2605\u2605\u2605\u2605',
  legendary: '\u2605\u2605\u2605\u2605\u2605',
};

// ANSI 256-color codes for each rarity
export const RARITY_COLORS = {
  common:    '\x1b[90m',   // gray
  uncommon:  '\x1b[32m',   // green
  rare:      '\x1b[36m',   // cyan
  epic:      '\x1b[35m',   // magenta
  legendary: '\x1b[33m',   // yellow
};

export const RESET = '\x1b[0m';
export const BOLD = '\x1b[1m';
export const DIM = '\x1b[2m';
export const ITALIC = '\x1b[3m';
export const INVERSE = '\x1b[7m';
