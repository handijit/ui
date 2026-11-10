/**
 * @jest-environment node
 */
/* Server rendering is under test: Node, not jsdom. */
import { renderToString } from 'react-dom/server';

import UiProvider from '@/theme/UiProvider';

describe('UiProvider — server rendering', () => {
  /*
   * Until 2.0 the provider rendered a <style> with theme overrides. It injects NOTHING now: an
   * inline style element is exactly what a strict Content-Security-Policy refuses.
   */
  it('renders the children and nothing else — no injected style or script', () => {
    const html = renderToString(
      <UiProvider labels={{ close: 'Kapat' }}>
        <p>içerik</p>
      </UiProvider>,
    );

    expect(html).toBe('<p>içerik</p>');
  });
});
