// Companion persistence with user profile integration.

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAVE_PATH = join(__dirname, 'companion.json');

const { roll } = await import(join(__dirname, 'companion.js'));
const { analyzeUser, profileToStatMods, profileToPersonality } = await import(join(__dirname, 'user-profile.js'));

export function loadCompanion() {
  if (!existsSync(SAVE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(SAVE_PATH, 'utf-8'));
  } catch { return null; }
}

export function saveCompanion(companion) {
  writeFileSync(SAVE_PATH, JSON.stringify(companion, null, 2));
}

/**
 * Create companion bones, enhanced by user profile analysis.
 * Returns { bones, profile }.
 */
export function createBones() {
  // Random seed for variety
  const seed = `${process.env.USER || 'codex'}-${Date.now()}-${Math.random()}`;
  const { bones } = roll(seed);

  // Analyze user environment
  const profile = analyzeUser();

  // Apply profile-based stat modifiers
  const mods = profileToStatMods(profile);
  for (const [stat, mod] of Object.entries(mods)) {
    if (bones.stats[stat] !== undefined) {
      bones.stats[stat] = Math.min(100, Math.max(1, bones.stats[stat] + mod));
    }
  }

  return { bones, profile };
}

/**
 * Finalize companion with a name and save.
 */
export function finalizeCompanion(bones, name, profile) {
  const personality = profileToPersonality(profile, name, bones.species);
  const companion = {
    ...bones,
    name,
    personality,
    hatchedAt: Date.now(),
  };
  saveCompanion(companion);
  return companion;
}
