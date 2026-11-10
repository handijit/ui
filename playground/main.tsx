import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { THEME_ATTRIBUTE } from '@handijit/design';

import { UiProvider, LABELS, SCENARIOS } from './scenarios';
import { SOLO_ONLY } from './solo';

/* The design tokens and fonts first — exactly what an application does — then the library's globals. */
import '@handijit/design/tokens.css';
import '@handijit/design/fonts.css';
import '../src/styles/base.scss';

import './playground.css';

/** COMPONENT GALLERY — every component in every state; `?theme=dark`, `?dir=rtl`, `?solo=<name>`. */

const params = new URLSearchParams(window.location.search);

const theme = params.get('theme') === 'dark' ? 'dark' : 'light';
const direction = params.get('dir') === 'rtl' ? 'rtl' : 'ltr';
const solo = params.get('solo');

document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
document.documentElement.setAttribute('dir', direction);

const entries = Object.entries(SCENARIOS).filter(([name]) =>
  solo ? name === solo : !SOLO_ONLY.includes(name as (typeof SOLO_ONLY)[number]),
);

const Gallery = () => (
  <UiProvider labels={LABELS}>
    {!solo && (
      <header className="gallery__bar">
        <h1>ui — bileşen galerisi</h1>
        <nav>
          <a href={`?theme=${theme === 'dark' ? 'light' : 'dark'}&dir=${direction}`}>
            {theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
          </a>
          <a href={`?theme=${theme}&dir=${direction === 'rtl' ? 'ltr' : 'rtl'}`}>
            {direction === 'rtl' ? 'LTR' : 'RTL'}
          </a>
        </nav>
      </header>
    )}

    <main className="gallery">
      {entries.map(([name, states]) => (
        <section key={name} className="gallery__section" data-gallery={name}>
          <h2 className="gallery__title">{name}</h2>

          <div className="gallery__states">
            {Object.entries(states).map(([state, element]) => (
              <div key={state} className="gallery__state" data-state={state}>
                <span className="gallery__label">{state}</span>
                <div className="gallery__stage">{element}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  </UiProvider>
);

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
