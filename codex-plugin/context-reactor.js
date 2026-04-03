// Context-aware reaction generator — pure local, no API calls.
// Analyzes conversation content via pattern matching.
// Only reacts on Stop (turn complete), silent on other events.

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const { pickQuip } = await import(join(__dirname, 'quips.js'));

// ── Content rules (match against assistant's last message) ─────
const CONTENT_RULES = [
  // Errors
  { test: /TypeError|ReferenceError|SyntaxError/i, r: ['ooh, a TypeError...', 'syntax demons!', 'classic.', 'seen that one before'] },
  { test: /ENOENT|no such file/i, r: ['file went missing!', 'poof, gone', 'check the path?'] },
  { test: /permission denied|EACCES/i, r: ['permission issues...', 'sudo time?', 'access denied!'] },
  { test: /segfault|segmentation fault/i, r: ['segfault! yikes', 'oof, the dreaded segfault'] },
  { test: /stack overflow|maximum call stack/i, r: ['infinite loop?', 'recursion strikes again'] },
  { test: /timeout|timed out/i, r: ['too slow...', 'patience...', 'tick tock'] },
  { test: /404|not found/i, r: ['404 vibes', 'vanished!'] },
  { test: /500|internal server error/i, r: ['server said no', 'uh oh, 500'] },
  { test: /deprecat/i, r: ['deprecated! time to upgrade', 'out with the old...'] },
  { test: /vulnerability|CVE|security/i, r: ['security alert!', 'patch it!'] },

  // Testing
  { test: /all tests pass|tests? (pass|succeed|✓|✅)/i, r: ['all green!', 'tests pass!', 'confidence: high'] },
  { test: /tests? fail|assertion.*fail|expect.*to/i, r: ['test caught something', 'red! fix time'] },
  { test: /\d+ pass(ed|ing)?,?\s*\d+ fail/i, r: ['mixed results...', 'getting there'] },
  { test: /coverage.*(100|9\d)%/i, r: ['great coverage!', 'almost 100%!'] },

  // Git
  { test: /committed|git commit/i, r: ['committed!', 'saved to history', 'one more for the log'] },
  { test: /pushed|git push/i, r: ['shipped!', 'off it goes', 'pushed!'] },
  { test: /merge conflict/i, r: ['conflict! *hides*', 'merge pain...', 'choose wisely'] },
  { test: /pull request|PR.*(created|opened)/i, r: ['PR up!', 'review time'] },

  // Build
  { test: /build (succeed|complete|done)|compiled successfully/i, r: ['it builds!', 'clean compile', 'zero errors!'] },
  { test: /build fail|compilation error/i, r: ['build broke', 'compiler says no', 'almost...'] },
  { test: /\d+ warnings?/i, r: ['just warnings...', 'warnings are future bugs'] },

  // File operations
  { test: /created? (the )?file|wrote to|saved/i, r: ['new file!', 'saved!', 'fresh code'] },
  { test: /delet(e|ed|ing)|remov(e|ed|ing)/i, r: ['gone forever', 'cleanup time', 'less is more'] },
  { test: /refactor/i, r: ['refactoring!', 'clean code vibes', 'making it better'] },
  { test: /rename|moved/i, r: ['reorganized!', 'better name'] },

  // Code concepts
  { test: /function|method|class/i, r: ['new logic!', 'structured', 'modular'] },
  { test: /async|await|promise/i, r: ['async stuff!', 'concurrent!'] },
  { test: /import|require|dependency/i, r: ['wiring it up', 'connected'] },
  { test: /database|sql|query|migration/i, r: ['database work', 'data!'] },
  { test: /api|endpoint|route|REST/i, r: ['API stuff', 'endpoints!'] },
  { test: /docker|container/i, r: ['containerized!', 'docker go brrr'] },
  { test: /deploy|production|staging/i, r: ['deploy time!', 'to production!', 'fingers crossed'] },

  // Positive outcomes
  { test: /fixed|resolved|solved/i, r: ['bug squashed!', 'fixed!', 'another one down'] },
  { test: /success|done|complete|finished|✓|✅/i, r: ['nice!', 'done!', 'smooth'] },
  { test: /looks good|lgtm|approved/i, r: ['ship it!', 'approved!'] },
  { test: /implement|added|created/i, r: ['built!', 'new feature!', 'growing'] },
  { test: /optimi[sz]/i, r: ['faster!', 'optimized!', 'speed boost'] },
  { test: /install|setup|configur/i, r: ['set up!', 'configured'] },
  { test: /updat|upgrad|bump/i, r: ['updated!', 'fresh version'] },
  { test: /document|readme|comment/i, r: ['documented!', 'future you says thanks'] },
];

// ── Prompt rules (what user is asking) ─────────────────────────
const PROMPT_RULES = [
  { test: /fix|bug|debug|error|broken|crash/i, r: ['bug hunting!', 'let\'s find it', 'detective time'] },
  { test: /explain|what does|how does|why/i, r: ['learning time!', 'good question', 'curious!'] },
  { test: /refactor|clean|improve|optimize/i, r: ['polish time!', 'clean code!'] },
  { test: /test|spec|coverage/i, r: ['testing!', 'quality matters'] },
  { test: /add|create|implement|build|make/i, r: ['building!', 'creating!', 'new feature time'] },
  { test: /delete|remove|drop/i, r: ['cleaning up', 'less code!'] },
  { test: /deploy|release|ship/i, r: ['shipping!', 'to the world!'] },
  { test: /help|stuck|confused/i, r: ['we got this!', 'you\'re not alone'] },
  { test: /review|check|look at/i, r: ['reviewing...', '*puts on glasses*'] },
];

function matchLocal(text, rules) {
  if (!text) return null;
  for (const rule of rules) {
    if (rule.test.test(text)) {
      return rule.r[Math.floor(Math.random() * rule.r.length)];
    }
  }
  return null;
}

/**
 * Generate a reaction based on event context.
 * @param {object} msg - Hook event JSON
 * @param {object} companion - Companion object
 * @returns {string|null} Reaction text, or null to stay silent
 */
export function generateReaction(msg, companion) {
  const event = msg.hook_event_name;

  // Turn complete — react to assistant's last message
  if (event === 'Stop' && msg.last_assistant_message) {
    return matchLocal(msg.last_assistant_message, CONTENT_RULES)
      || pickQuip('completion', companion.stats, Date.now());
  }

  // User prompt — react to what they're asking (only if pattern matches)
  if (event === 'UserPromptSubmit' && msg.prompt) {
    return matchLocal(msg.prompt, PROMPT_RULES);
    // null if no match → silent
  }

  // Everything else → silent
  return null;
}
