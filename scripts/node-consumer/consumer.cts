// The CommonJS side: `require` → `.d.cts`. See `tsconfig.json`.
import Button = require('@handijit/ui/button');
import ui = require('@handijit/ui');
import chat = require('@handijit/ui/chat');

export const used = [Button, ui.Field, chat.ChatThread];

// @ts-expect-error — `isLoadingg` is not a prop of Button.
export const typo = Button.default({ isLoadingg: true });
