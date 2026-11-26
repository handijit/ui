// The CommonJS side: `require` → `.d.cts`. See `tsconfig.json`.
import Button = require('@handijitcom/ui/button');
import ui = require('@handijitcom/ui');
import chat = require('@handijitcom/ui/chat');

export const used = [Button, ui.Field, chat.ChatThread];

// @ts-expect-error — `isLoadingg` is not a prop of Button.
export const typo = Button.default({ isLoadingg: true });
