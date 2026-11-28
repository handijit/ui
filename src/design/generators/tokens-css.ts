import cssVarName from '../modules/css-var-name';
import motion from '../tokens/motion';
import THEME_ATTRIBUTE from '../tokens/theme-attribute';
import type { ThemeName } from '../types';
import type { DeclarationGroup } from './declarations';
import { staticGroups, themedGroups } from './declarations';

// `transitionend` never fires for a 0ms transition, and components wait on that event.
const REDUCED_MOTION_DURATION = '0.01ms';

const themeSelector = (theme: ThemeName): string => `[${THEME_ATTRIBUTE}="${theme}"]`;

const renderGroups = (groups: readonly DeclarationGroup[], indent: string): string =>
  groups
    .map(({ title, declarations }) =>
      [
        `${indent}/* ${title} */`,
        ...declarations.map(([name, value]) => `${indent}${cssVarName(name)}: ${value};`),
      ].join('\n'),
    )
    .join('\n\n');

const renderTheme = (theme: ThemeName, indent: string): string =>
  `${indent}color-scheme: ${theme};\n\n${renderGroups(themedGroups(theme), indent)}`;

/*
 * Paper is light. Every selector that can turn a theme dark (the system preference on the root,
 * an explicit dark root, a dark island) is redeclared light inside `@media print`, with the same
 * specificity and later in the file, so a dark page printed with Ctrl/Cmd+P never puts light text
 * on white paper. `:root:not([data-theme="light"])` covers the bare and the dark root alike.
 */
const PRINT_SELECTORS = [`:root:not(${themeSelector('light')})`, themeSelector('dark')] as const;

/**
 * Renders `tokens.css`. Theme-dependent values are redeclared inside every theme selector,
 * never referenced through `var()` from `:root`: a custom property is resolved where it is
 * declared, so a nested theme island would otherwise inherit the outer theme's value.
 */
const renderTokensCss = (): string =>
  [
    '/* @handijitcom/ui/design — generated from the TypeScript tokens. Do not edit. */',
    `:root {\n${renderGroups(staticGroups(), '  ')}\n}`,
    `:root,\n${themeSelector('light')} {\n${renderTheme('light', '  ')}\n}`,
    '/* System mode: no explicit choice on the root element. */',
    `@media (prefers-color-scheme: dark) {\n  :root:not(${themeSelector('light')}) {\n${renderTheme('dark', '    ')}\n  }\n}`,
    `:root${themeSelector('dark')},\n${themeSelector('dark')} {\n${renderTheme('dark', '  ')}\n}`,
    '/* Print: paper is light, whatever the theme on screen. */',
    `@media print {\n  ${PRINT_SELECTORS.join(',\n  ')} {\n${renderTheme('light', '    ')}\n  }\n}`,
    `@media (prefers-reduced-motion: reduce) {\n  :root {\n${Object.keys(motion.duration)
      .map(
        name =>
          `    ${cssVarName(`duration-${name as keyof typeof motion.duration}`)}: ${REDUCED_MOTION_DURATION};`,
      )
      .join('\n')}\n  }\n}`,
    '',
  ]
    .join('\n\n')
    .replace(/\n\n$/, '\n');

export default renderTokensCss;
