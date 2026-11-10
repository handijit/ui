/**
 * @jest-environment node
 */
/* Server rendering is under test: Node, not jsdom — it has to render without a browser API. */
import { createHash } from 'node:crypto';

import { renderToString } from 'react-dom/server';

import { THEME_BOOT_SCRIPT, THEME_BOOT_SCRIPT_HASH } from '@handijit/design';

import UiThemeScript from '@/theme/UiThemeScript';

const bodyOf = (html: string): string =>
  html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');

describe('UiThemeScript', () => {
  it('renders on the SERVER — usable in the <head> of a server layout', () => {
    const html = renderToString(<UiThemeScript />);

    expect(html.startsWith('<script>')).toBe(true);
    expect(html).toContain('data-theme');
  });

  /*
   * The whole point of re-using the design script: a policy that lists THEME_BOOT_SCRIPT_HASH
   * must accept what this component renders. One escaped character would break the hash.
   */
  it('inlines the design boot script BYTE FOR BYTE — the published CSP hash matches', () => {
    const body = bodyOf(renderToString(<UiThemeScript />));
    const hash = `sha256-${createHash('sha256').update(body).digest('base64')}`;

    expect(body).toBe(THEME_BOOT_SCRIPT);
    expect(hash).toBe(THEME_BOOT_SCRIPT_HASH);
  });

  it('carries the nonce of the request', () => {
    const html = renderToString(<UiThemeScript nonce="r4nd0m" />);

    expect(html.startsWith('<script nonce="r4nd0m">')).toBe(true);
    expect(bodyOf(html)).toBe(THEME_BOOT_SCRIPT);
  });
});
