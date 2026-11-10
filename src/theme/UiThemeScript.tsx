'use client';

import { type FC } from 'react';

import { THEME_BOOT_SCRIPT } from '@handijit/design';

type Props = {
  /**
   * The request's CSP nonce. Leave it out when the policy allows the script by hash
   * (`THEME_BOOT_SCRIPT_HASH`), which also works for statically rendered pages.
   */
  nonce?: string;
};

/**
 * The theme before the first paint — rendered in `<head>`, in the server output.
 *
 * It inlines the boot script of `@handijit/design` unchanged, so its text matches
 * `THEME_BOOT_SCRIPT_HASH`: the stored choice (`localStorage["hd-theme"]`) or the system setting is
 * written to `<html data-theme>` while the HTML is parsed. Put `suppressHydrationWarning` on
 * `<html>`: the attribute is set before React hydrates.
 *
 * A component and not a function: the package carries `'use client'`, and a plain exported function
 * cannot be called from a Next server component, while a component renders on the server too.
 * @example <head><UiThemeScript nonce={nonce} /></head>
 */
const UiThemeScript: FC<Props> = ({ nonce }) => (
  <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
);

export default UiThemeScript;
