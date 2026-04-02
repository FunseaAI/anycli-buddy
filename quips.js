// Event-to-reaction quip pools. Companions pick quips weighted by their stats.
// Used by both Codex and OpenCode integrations.

export const QUIP_POOLS = {
  tool_start: [
    { text: 'working on it...', weight: { default: 1 } },
    { text: 'let me see...', weight: { default: 1 } },
    { text: 'hmm, interesting...', weight: { WISDOM: 2 } },
    { text: 'ooh, a challenge!', weight: { CHAOS: 2 } },
    { text: "I'll wait...", weight: { PATIENCE: 2 } },
    { text: 'hold my bytes...', weight: { SNARK: 2 } },
    { text: 'debugging time!', weight: { DEBUGGING: 2 } },
    { text: "on it!", weight: { default: 1 } },
  ],
  tool_complete: [
    { text: 'done!', weight: { default: 1 } },
    { text: 'got it!', weight: { default: 1 } },
    { text: 'nice!', weight: { default: 1 } },
    { text: 'that was elegant', weight: { WISDOM: 2 } },
    { text: 'ez', weight: { SNARK: 2 } },
    { text: "didn't even break a sweat", weight: { CHAOS: 2 } },
    { text: 'nailed it!', weight: { DEBUGGING: 2 } },
    { text: 'all good!', weight: { PATIENCE: 2 } },
  ],
  error: [
    { text: 'uh oh...', weight: { default: 1 } },
    { text: 'oops!', weight: { default: 1 } },
    { text: "let's try again", weight: { PATIENCE: 2 } },
    { text: 'bugs happen!', weight: { DEBUGGING: 2 } },
    { text: 'have you tried turning it off and on again?', weight: { SNARK: 2 } },
    { text: 'chaos reigns!', weight: { CHAOS: 2 } },
    { text: 'a learning moment', weight: { WISDOM: 2 } },
    { text: '...interesting', weight: { default: 1 } },
  ],
  idle: [
    { text: '*yawn*', weight: { default: 1 } },
    { text: '*stretch*', weight: { default: 1 } },
    { text: 'snack break?', weight: { default: 1 } },
    { text: 'you got this!', weight: { PATIENCE: 2 } },
    { text: 'what if we...', weight: { WISDOM: 2 } },
    { text: '*pokes terminal*', weight: { CHAOS: 2 } },
    { text: 'still here!', weight: { default: 1 } },
    { text: 'ship it!', weight: { SNARK: 2 } },
    { text: 'I believe in you', weight: { PATIENCE: 2 } },
    { text: 'need a rubber duck?', weight: { DEBUGGING: 2 } },
    { text: '*hums quietly*', weight: { default: 1 } },
    { text: 'are we there yet?', weight: { SNARK: 2 } },
  ],
  completion: [
    { text: 'looks good!', weight: { default: 1 } },
    { text: 'nice code!', weight: { default: 1 } },
    { text: 'well done!', weight: { PATIENCE: 2 } },
    { text: 'ship it!', weight: { SNARK: 2 } },
    { text: 'beautiful', weight: { WISDOM: 2 } },
    { text: 'chaos contained!', weight: { CHAOS: 2 } },
    { text: 'zero bugs detected*', weight: { DEBUGGING: 2 } },
    { text: '*happy noises*', weight: { default: 1 } },
  ],
  greeting: [
    { text: 'hey!', weight: { default: 1 } },
    { text: "let's code!", weight: { default: 1 } },
    { text: 'ready when you are', weight: { PATIENCE: 2 } },
    { text: 'time to break things', weight: { CHAOS: 2 } },
    { text: 'greetings, human', weight: { WISDOM: 2 } },
    { text: "what's the damage today?", weight: { SNARK: 2 } },
    { text: 'bugs beware!', weight: { DEBUGGING: 2 } },
  ],
};

// Simple seeded random for deterministic quip selection within a tick
function simpleRng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick a quip for an event, weighted by the companion's stats.
 * @param {string} event - One of the QUIP_POOLS keys
 * @param {object} stats - Companion's stats (e.g., { DEBUGGING: 42, SNARK: 88, ... })
 * @param {number} [seed] - Optional seed for deterministic selection (e.g., Date.now())
 * @returns {string} The selected quip text
 */
export function pickQuip(event, stats, seed) {
  const pool = QUIP_POOLS[event];
  if (!pool || pool.length === 0) return '...';

  // Calculate weighted scores
  const weights = pool.map(q => {
    let w = q.weight.default || 0;
    for (const [stat, bonus] of Object.entries(q.weight)) {
      if (stat === 'default') continue;
      const statVal = stats[stat] || 50;
      // Higher stat value = more likely to pick stat-weighted quips
      w += bonus * (statVal / 100);
    }
    return Math.max(w, 0.1);
  });

  const total = weights.reduce((a, b) => a + b, 0);
  const rng = seed != null ? simpleRng(seed) : Math.random;
  let roll = (typeof rng === 'function' ? rng() : Math.random()) * total;

  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i].text;
  }
  return pool[pool.length - 1].text;
}

/**
 * Get all quip texts for an event (unweighted, for debugging/display).
 */
export function getAllQuips(event) {
  return (QUIP_POOLS[event] || []).map(q => q.text);
}
