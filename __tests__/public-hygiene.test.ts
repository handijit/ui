import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * PUBLIC HYGIENE.
 *
 * This repository is public, so nothing it tracks may point at a developer's machine or name a
 * project that is not public:
 * - No editor or agent workspace settings (`.claude/`): they hold local launch commands.
 * - No absolute path into a home directory or a temporary folder of one machine.
 * - No name from the denylist below. The names are stored as SHA-256 digests of their lower-case
 *   form, so that this test does not publish the very words it keeps out. A digest is compared
 *   with every word, and every pair of adjacent words, of the same length as a denied name.
 *
 * The scan reads `git ls-files`: what a clone of the repository holds, not what the working
 * directory happens to contain. Binary files (images, fonts) are skipped.
 */
const ROOT = join(__dirname, '..');

const DENIED_DIGESTS: ReadonlyMap<number, ReadonlySet<string>> = new Map([
  [9, new Set(['0cad4b4261a0a2ead372eba90c0c8a599fe9ab1e3199f91e2fa4db83faa070c7'])],
  [10, new Set(['89577224040dd74eeb5c21e8d03bdb91066354bff5463b1797f505295567e590'])],
]);

/* Written with escaped slashes so that the source of this file does not match itself. */
const LOCAL_PATHS: readonly RegExp[] = [
  /\/Users\/[^/\s'"`]+\//,
  /\/home\/[^/\s'"`]+\//,
  /[A-Za-z]:\\Users\\/,
  /~\/projects\b/,
  /\/private\/tmp\//,
  /\/var\/folders\//,
];

const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|pdf|zip|gz)$/i;

const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const textFiles = tracked.filter(file => !BINARY.test(file));

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

const deniedWordsIn = (source: string): number => {
  const words = source.toLocaleLowerCase('en-US').match(/[\p{L}\p{N}]+/gu) ?? [];
  let hits = 0;
  words.forEach((word, index) => {
    const candidates = [word, index > 0 ? `${words[index - 1]} ${word}` : ''];
    for (const candidate of candidates) {
      const digests = DENIED_DIGESTS.get(candidate.length);
      if (digests?.has(sha256(candidate))) hits += 1;
    }
  });
  return hits;
};

describe('public hygiene of the tracked files', () => {
  it('tracks something (the scan reads a real clone)', () => {
    expect(textFiles.length).toBeGreaterThan(100);
  });

  it('tracks no `.claude/` workspace settings', () => {
    expect(tracked.filter(file => file.startsWith('.claude/'))).toEqual([]);
  });

  it('keeps `.claude/` ignored, so it cannot be added back by accident', () => {
    const ignored = readFileSync(join(ROOT, '.gitignore'), 'utf8').split('\n');
    expect(ignored).toContain('.claude/');
  });

  it('holds no absolute path into one machine', () => {
    const offenders = textFiles.filter(file => {
      const source = readFileSync(join(ROOT, file), 'utf8');
      return LOCAL_PATHS.some(pattern => pattern.test(source));
    });
    expect(offenders).toEqual([]);
  });

  it('names no project that is not public', () => {
    const offenders = textFiles.filter(
      file => deniedWordsIn(readFileSync(join(ROOT, file), 'utf8')) > 0,
    );
    expect(offenders).toEqual([]);
  });
});
