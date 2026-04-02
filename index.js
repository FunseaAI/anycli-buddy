// terminal-buddy — standalone terminal companion system
// No dependencies on React, Ink, or Claude Code internals.

export { SPECIES, RARITIES, EYES, HATS, STAT_NAMES, RARITY_COLORS, RARITY_STARS } from './types.js';
export { renderSprite, spriteFrameCount, renderFace } from './sprites.js';
export { roll, hatch } from './companion.js';
export { BuddyRenderer, renderOneLiner, renderFrame } from './renderer.js';
export { pickQuip, getAllQuips, QUIP_POOLS } from './quips.js';
