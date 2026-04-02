// Companion persistence — save/load from companion.json

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAVE_PATH = join(__dirname, 'companion.json');

const { roll } = await import(join(__dirname, 'companion.js'));

export function loadCompanion() {
  if (!existsSync(SAVE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(SAVE_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

export function saveCompanion(companion) {
  writeFileSync(SAVE_PATH, JSON.stringify(companion, null, 2));
}

/**
 * Create companion bones (no name yet).
 * Name is set later during the hatch flow.
 */
export function createBones() {
  const seed = process.env.USER || process.env.USERNAME || 'codex-user';
  const { bones } = roll(seed);
  return bones;
}

/**
 * Finalize companion with a name and save.
 */
export function finalizeCompanion(bones, name) {
  const companion = {
    ...bones,
    name,
    personality: `A ${bones.rarity} ${bones.species} companion`,
    hatchedAt: Date.now(),
  };
  saveCompanion(companion);
  return companion;
}
