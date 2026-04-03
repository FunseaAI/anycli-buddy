// Analyze user's coding environment to personalize companion generation.
// Reads git history, project files, shell history — no AI model needed.

import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Safely run a command, return empty string on failure
function run(cmd) {
  try { return execSync(cmd, { timeout: 3000, encoding: 'utf-8' }).trim(); }
  catch { return ''; }
}

/**
 * Build a user profile from local environment signals.
 * Returns { languages, recentActivity, commitStyle, personality hints }
 */
export function analyzeUser() {
  const profile = {
    languages: [],
    topLang: null,
    commitCount: 0,
    recentCommits: [],
    projectTypes: [],
    lateNightCoder: false,
    prolificCoder: false,
    debugFrequency: 0,    // how often "fix" / "bug" in commits
    refactorFrequency: 0, // how often "refactor" / "clean" in commits
    chaosLevel: 0,        // force pushes, reverts
    patience: 0,          // long commit messages, many small commits
  };

  // ── Git analysis ─────────────────────────────────────────────
  const gitLog = run('git log --oneline -100 --format="%H|%s|%aI" 2>/dev/null');
  if (gitLog) {
    const lines = gitLog.split('\n').filter(Boolean);
    profile.commitCount = lines.length;
    profile.recentCommits = lines.slice(0, 10).map(l => l.split('|')[1] || '');

    // Analyze commit messages
    const msgs = lines.map(l => (l.split('|')[1] || '').toLowerCase());
    profile.debugFrequency = msgs.filter(m => /fix|bug|debug|patch|hotfix/.test(m)).length;
    profile.refactorFrequency = msgs.filter(m => /refactor|clean|reorganize|rename/.test(m)).length;
    profile.chaosLevel = msgs.filter(m => /revert|force|yolo|wip|temp|hack/.test(m)).length;
    profile.patience = msgs.filter(m => m.length > 50).length; // detailed commit messages

    // Late night coding (check commit hours)
    const hours = lines.map(l => {
      const iso = l.split('|')[2] || '';
      const m = iso.match(/T(\d{2}):/);
      return m ? parseInt(m[1]) : -1;
    }).filter(h => h >= 0);
    const lateNight = hours.filter(h => h >= 22 || h <= 5).length;
    profile.lateNightCoder = lateNight > lines.length * 0.3;

    profile.prolificCoder = profile.commitCount >= 50;
  }

  // ── Language detection ───────────────────────────────────────
  const cwd = process.cwd();
  const langSignals = {
    'JavaScript':  ['package.json', 'node_modules'],
    'TypeScript':  ['tsconfig.json'],
    'Python':      ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile'],
    'Rust':        ['Cargo.toml'],
    'Go':          ['go.mod'],
    'Java':        ['pom.xml', 'build.gradle'],
    'C/C++':       ['CMakeLists.txt', 'Makefile'],
    'Ruby':        ['Gemfile'],
    'Swift':       ['Package.swift', '*.xcodeproj'],
    'Dart':        ['pubspec.yaml'],
  };

  for (const [lang, files] of Object.entries(langSignals)) {
    for (const f of files) {
      if (f.includes('*')) {
        try {
          if (readdirSync(cwd).some(e => e.endsWith(f.replace('*', '')))) {
            profile.languages.push(lang);
            break;
          }
        } catch {}
      } else if (existsSync(join(cwd, f))) {
        profile.languages.push(lang);
        break;
      }
    }
  }
  profile.topLang = profile.languages[0] || null;

  // ── Shell history (last 50 commands) ─────────────────────────
  let shellHistory = '';
  const histFiles = [
    join(process.env.HOME || '', '.zsh_history'),
    join(process.env.HOME || '', '.bash_history'),
  ];
  for (const hf of histFiles) {
    if (existsSync(hf)) {
      try {
        const content = readFileSync(hf, 'utf-8');
        shellHistory = content.split('\n').slice(-50).join(' ');
        break;
      } catch {}
    }
  }
  const dockerUser = shellHistory.includes('docker');
  const vimUser = shellHistory.includes('vim') || shellHistory.includes('nvim');
  const testRunner = /jest|pytest|cargo test|go test/.test(shellHistory);

  return {
    ...profile,
    dockerUser,
    vimUser,
    testRunner,
  };
}

/**
 * Generate stat adjustments based on user profile.
 * Returns modifiers: { DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK }
 */
export function profileToStatMods(profile) {
  const mods = { DEBUGGING: 0, PATIENCE: 0, CHAOS: 0, WISDOM: 0, SNARK: 0 };

  // Debuggers get debug bonus
  if (profile.debugFrequency > 10) mods.DEBUGGING += 15;
  else if (profile.debugFrequency > 5) mods.DEBUGGING += 8;

  // Patient coders (long messages, many small commits)
  if (profile.patience > 10) mods.PATIENCE += 12;
  if (profile.commitCount > 80) mods.PATIENCE += 5;

  // Chaos coders (reverts, force push, yolo)
  if (profile.chaosLevel > 5) mods.CHAOS += 15;
  if (profile.lateNightCoder) mods.CHAOS += 8;

  // Wisdom (refactoring, clean code)
  if (profile.refactorFrequency > 5) mods.WISDOM += 12;
  if (profile.testRunner) mods.WISDOM += 8;

  // Snark (vim users, docker power users, prolific coders)
  if (profile.vimUser) mods.SNARK += 10;
  if (profile.prolificCoder) mods.SNARK += 5;

  return mods;
}

/**
 * Generate a personality description from the profile.
 */
export function profileToPersonality(profile, name, species) {
  const traits = [];

  if (profile.lateNightCoder) traits.push('a night owl who codes best after midnight');
  if (profile.debugFrequency > 10) traits.push('a veteran bug hunter');
  if (profile.refactorFrequency > 5) traits.push('a clean code enthusiast');
  if (profile.chaosLevel > 5) traits.push('a chaos gremlin who lives on the edge');
  if (profile.prolificCoder) traits.push('incredibly productive');
  if (profile.testRunner) traits.push('a testing advocate');
  if (profile.vimUser) traits.push('a vim devotee');
  if (profile.dockerUser) traits.push('a containerization fan');

  if (profile.topLang) traits.push(`raised on ${profile.topLang}`);

  if (traits.length === 0) traits.push('curious and eager to learn');

  return `${name} is a ${species} who is ${traits.join(', ')}.`;
}
