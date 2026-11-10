/**
 * @jest-environment node
 *
 * 2.2 — the styles behind the new states: an invalid choice control draws the danger edge of an
 * invalid field, the error under a choice is `Field`'s error, and `Alert` lets its action wrap
 * under the text instead of squeezing it.
 */
import { readFileSync } from 'node:fs';

const read = (path: string): string => readFileSync(path, 'utf8');

const mixins = read('src/styles/_mixins.scss');

/** The body of the first `selector {` block, one level deep. */
const block = (source: string, selector: string): string => {
  const start = source.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`no block ${selector}`);
  let depth = 0;
  for (let index = source.indexOf('{', start); index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`unclosed block ${selector}`);
};

describe('invalid choice controls', () => {
  it('Checkbox and Radio draw the danger edge from aria-invalid (choice-control)', () => {
    expect(block(mixins, '@mixin choice-control($shape: check)')).toMatch(
      /&\[aria-invalid='true'\]:not\(:disabled\) \{\s*border-color: \$danger-solid;/,
    );
  });

  it('Switch draws a danger edge around an invalid track that is off', () => {
    expect(read('src/components/Switch/index.module.scss')).toMatch(
      /\.switch__input\[aria-invalid='true'\]:not\(:checked\) \+ \.switch__track \{[^}]*\$danger-solid/,
    );
  });

  it.each(['Checkbox', 'Radio'])('%s draws its error with field-error', name => {
    expect(read(`src/components/${name}/index.module.scss`)).toMatch(
      /&__error \{\s*@include field-error;/,
    );
  });

  it('Switch draws its error with field-error, and Field shares the mixin', () => {
    expect(read('src/components/Switch/index.module.scss')).toMatch(
      /\.switch__error \{\s*@include field-error;/,
    );
    expect(read('src/components/Field/index.module.scss')).toMatch(
      /&__error \{\s*@include field-error;/,
    );
  });

  it.each([
    [
      'QuantityStepper',
      /&:has\(\.stepper__input\[aria-invalid='true'\]\) \{\s*border-color: \$danger-solid;/,
    ],
    ['SegmentedControl', /&\[aria-invalid='true'\] \{\s*border-color: \$danger-solid;/],
  ])('%s draws the danger edge from aria-invalid', (name, pattern) => {
    expect(read(`src/components/${name}/index.module.scss`)).toMatch(pattern);
  });
});

describe('Alert action', () => {
  const source = read('src/components/Alert/index.module.scss');
  const markup = read('src/components/Alert/index.tsx');

  it('sits inside the body, after the text', () => {
    expect(markup).toMatch(
      /alert__body[\s\S]*alert__text[\s\S]*alert__action[\s\S]*<\/div>\s*<\/div>\s*\);/,
    );
  });

  it('wraps under the text once the text would be narrower than its minimum', () => {
    expect(block(source, '  &__body')).toMatch(/flex-wrap: wrap;/);
    expect(block(source, '  &__text')).toMatch(/flex: 1 1 \$alert-text-min;/);
    expect(block(source, '  &__action')).toMatch(/flex: 0 0 auto;/);
  });

  it('has no phone-only layout left: the wrap is the rule at every width', () => {
    expect(source).not.toMatch(/for-mobile/);
  });
});
