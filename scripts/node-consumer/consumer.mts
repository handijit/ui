// The ES module side: `import` → `.d.ts`. See `tsconfig.json`.
import { Button as RootButton, Field, UiProvider } from '@handijit/ui';
import Button from '@handijit/ui/button';
import Checkbox from '@handijit/ui/checkbox';
import { BarChart } from '@handijit/ui/charts';
import { ChatThread } from '@handijit/ui/chat';
import Select from '@handijit/ui/select';

export const used = [RootButton, Field, UiProvider, Button, Checkbox, BarChart, ChatThread, Select];

// The props are typed, not `any`: an unknown prop is an error.
// @ts-expect-error — `isLoadingg` is not a prop of Button.
export const typo = Button({ isLoadingg: true });

// 2.2: `error` on Checkbox, `null` in Select.
export const checkbox = Checkbox({ label: 'Kabul', error: 'Gerekli' });
export const select = Select({ label: 'İl', options: [], value: null, onChange: () => {} });
