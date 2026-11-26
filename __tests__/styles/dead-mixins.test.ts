import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MIXINS_FILE = 'src/styles/_mixins.scss';

/*
 * Mixins the library no longer calls but still publishes in `@handijitcom/ui/scss`: removing one is a
 * major (`check:api`). Each name says when its last caller left and waits for the next major.
 * Empty since 2.0: `for-desktop-up` (kept from 2.3, when the toast stack stopped calling it) is
 * called again by `Band`, for the room beside its artwork.
 */
const KEPT_FOR_CONSUMERS = new Set<string>([]);

const styleFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return styleFiles(path);
    return path.endsWith('.scss') ? [path] : [];
  });

describe('_mixins.scss', () => {
  const source = readFileSync(MIXINS_FILE, 'utf8');
  const declared = [...source.matchAll(/^@mixin\s+([a-z0-9-]+)/gm)].map(match => match[1]);
  const allStyles = styleFiles('src')
    .map(path => readFileSync(path, 'utf8'))
    .join('\n');

  it('tanımlı mixin bulunur — tarayıcı gerçekten okuyor', () => {
    expect(declared.length).toBeGreaterThan(30);
  });

  it('TANIMLI HER MIXIN KULLANILIR', () => {
    const dead = declared.filter(
      name =>
        !KEPT_FOR_CONSUMERS.has(name) && !new RegExp(`@include\\s+${name}\\b`).test(allStyles),
    );

    expect(dead).toEqual([]);
  });

  it('a kept mixin is really unused and really public (the list does not go stale)', () => {
    const scssApi = readFileSync('scripts/api-baseline.scss.txt', 'utf8');

    for (const name of KEPT_FOR_CONSUMERS) {
      expect(allStyles).not.toMatch(new RegExp(`@include\\s+${name}\\b`));
      expect(scssApi).toContain(`@mixin ${name}`);
    }
  });

  it('kendi içindeki çağrı da KULLANIMDIR — `scroll-row` → `hide-scrollbar`', () => {
    expect(source).toMatch(/@include\s+hide-scrollbar\b/);
    expect(declared).toContain('hide-scrollbar');
  });
});
