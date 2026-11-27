import { readdirSync, readFileSync } from 'node:fs';

/*
 * COLOUR FOOTPRINT — the role rule of the theme, as a failing test.
 *
 *   cobalt (`$primary*`)            primary action, link, focus, selection — the interface colour
 *   coral (`$accent*`)              the CONVERSION button (download, try, subscribe) and nothing else
 *   brand surface (`$brand-surface-*`) the cobalt brand surface and what sits on it
 *
 * 3.0: the palette is cobalt, coral, ink (the neutrals) and danger red. Turquoise (2.0.0), the
 * success and warning families and the navy band (3.0) are gone; the last test below keeps their
 * names from coming back.
 *
 * ⚠ No single declaration is ever wrong on its own: a coral chip here, a coral progress bar there,
 * and coral stops meaning "this is the button that converts". This list turns that drift into a
 * failing test. A component that reaches for one of these families enters here WITH its reason.
 * Cobalt is not listed: it is the general interface colour and belongs everywhere it is used.
 */
const FAMILIES = {
  accent: /\$(?:accent(?:-[a-z]+)?|on-accent)(?![\w-])/g,
  brandSurface: /\$brand-surface-[a-z0-9-]+(?![\w-])/g,
} as const;

type Family = keyof typeof FAMILIES;

const ALLOWED: Record<Family, Record<string, string>> = {
  accent: {
    BrandSurface:
      "`BrandBlueprint`'s dot — the coral point of the brand mark, as in the logo; never clickable",
    Button: 'the ACCENT variant — the conversion button',
    CodeBlock: 'strings and literals in syntax colouring (`accent-text`) — text, never a control',
    IconButton: 'the `accent` variant — the same button without a text label',
  },
  brandSurface: {
    BrandSurface: 'the surface itself: its deeper step, white imagery and hairlines',
    Button: 'the ON_BRAND variant, and the glow of ACCENT on the brand surface',
    Eyebrow: 'its rules on the brand surface',
    StatStrip: '`variant="brand"` — the deep strip at the foot of the brand surface',
  },
};

/* The main entry AND the sub-entries. */
const ROOTS = ['src/components', 'src/chat', 'src/charts'];

const componentDirs = (): [string, string][] =>
  ROOTS.flatMap(root =>
    readdirSync(root, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => [entry.name, `${root}/${entry.name}`] as [string, string]),
  );

const usages = (): Record<Family, Set<string>> => {
  const found = Object.fromEntries(
    Object.keys(FAMILIES).map(family => [family, new Set<string>()]),
  ) as Record<Family, Set<string>>;

  for (const [component, dir] of componentDirs()) {
    const files = readdirSync(dir).filter(name => name.endsWith('.scss'));

    for (const file of files) {
      const source = readFileSync(`${dir}/${file}`, 'utf8');

      for (const [family, pattern] of Object.entries(FAMILIES) as [Family, RegExp][])
        if (source.match(pattern)) found[family].add(component);
    }
  }

  return found;
};

describe('colour footprint', () => {
  const found = usages();

  it.each(Object.keys(FAMILIES) as Family[])('%s is used only where it is allowed', family => {
    const outside = [...found[family]].filter(component => !(component in ALLOWED[family]));

    expect(outside).toEqual([]);
  });

  /* A stale entry is a door left open: an allowance nobody uses is deleted. */
  it.each(Object.keys(FAMILIES) as Family[])('%s has no stale allowance', family => {
    const unused = Object.keys(ALLOWED[family]).filter(component => !found[family].has(component));

    expect(unused).toEqual([]);
  });

  /* The shop-era roles of 1.x. A name coming back means a copy-paste from an old consumer. */
  it('the 1.x role names do not come back', () => {
    const legacy =
      /\$(?:cart|on-cart|oem|alt|off|sale|action|on-action|link|selected|shell|nav|surface|page)(?:-[a-z0-9]+)*(?![\w-])/;

    const offenders = componentDirs()
      .filter(([, dir]) =>
        readdirSync(dir)
          .filter(name => name.endsWith('.scss'))
          .some(file => legacy.test(readFileSync(`${dir}/${file}`, 'utf8'))),
      )
      .map(([component]) => component);

    expect(offenders).toEqual([]);
  });

  /* Removed roles coming back mean a copy from an older consumer: turquoise (2.0.0), the success
   * and warning families and the navy band (3.0). */
  it('the removed roles do not come back', () => {
    const turquoise =
      /\$(?:highlight|on-highlight|turquoise|success|warning|band|slate)(?:-[a-z0-9]+)*(?![\w-])/;

    const offenders = componentDirs()
      .filter(([, dir]) =>
        readdirSync(dir)
          .filter(name => name.endsWith('.scss'))
          .some(file => turquoise.test(readFileSync(`${dir}/${file}`, 'utf8'))),
      )
      .map(([component]) => component);

    expect(offenders).toEqual([]);
  });
});
