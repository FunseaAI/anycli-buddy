// Deterministic companion generation from a seed string (userId, etc.)
import { EYES, HATS, RARITIES, RARITY_WEIGHTS, SPECIES, STAT_NAMES } from './types.js';

// Mulberry32 — tiny seeded PRNG
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function rollRarity(rng) {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (const rarity of RARITIES) {
    roll -= RARITY_WEIGHTS[rarity];
    if (roll < 0) return rarity;
  }
  return 'common';
}

const RARITY_FLOOR = { common: 5, uncommon: 15, rare: 25, epic: 35, legendary: 50 };

function rollStats(rng, rarity) {
  const floor = RARITY_FLOOR[rarity];
  const peak = pick(rng, STAT_NAMES);
  let dump = pick(rng, STAT_NAMES);
  while (dump === peak) dump = pick(rng, STAT_NAMES);
  const stats = {};
  for (const name of STAT_NAMES) {
    if (name === peak) {
      stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30));
    } else if (name === dump) {
      stats[name] = Math.max(1, floor - 10 + Math.floor(rng() * 15));
    } else {
      stats[name] = floor + Math.floor(rng() * 40);
    }
  }
  return stats;
}

const SALT = 'friend-2026-401';

export function roll(seed) {
  const rng = mulberry32(hashString(seed + SALT));
  const rarity = rollRarity(rng);
  const bones = {
    rarity,
    species: pick(rng, SPECIES),
    eye: pick(rng, EYES),
    hat: rarity === 'common' ? 'none' : pick(rng, HATS),
    shiny: rng() < 0.01,
    stats: rollStats(rng, rarity),
  };
  return { bones, inspirationSeed: Math.floor(rng() * 1e9) };
}

// Generate a companion with a random name if none provided
export function hatch(seed, name) {
  const { bones, inspirationSeed } = roll(seed);
  const autoName = name || generateName(inspirationSeed);
  return {
    ...bones,
    name: autoName,
    personality: `A ${bones.rarity} ${bones.species} companion`,
    hatchedAt: Date.now(),
  };
}

// Simple name generator using the inspiration seed
function generateName(seed) {
  const prefixes = [
    'Pip', 'Nix', 'Zap', 'Dot', 'Kit', 'Bop', 'Fizz', 'Chip', 'Glo',
    'Wiz', 'Tux', 'Hex', 'Bit', 'Pix', 'Zip', 'Bud', 'Mox', 'Dex',
  ];
  const suffixes = [
    'o', 'ie', 'ly', 'er', 'le', 'a', 'us', 'ix', 'on', 'et', 'sy', 'by',
  ];
  const rng = mulberry32(seed);
  return pick(rng, prefixes) + pick(rng, suffixes);
}
