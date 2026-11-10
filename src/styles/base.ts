/**
 * `@handijit/ui/base.css` — box-model reset, `@keyframes` and helper classes (no design tokens:
 * those are `@handijit/design/tokens.css`).
 *
 * This module only gives the build a CSS entry: Vite emits `base.scss` as `build/base.css`.
 * ⚠ `index.ts` does NOT import it: the facade carries re-exports only, so Next's
 * `optimizePackageImports` can treat it as a pure facade and short-circuit to the component file.
 */
import './base.scss';
