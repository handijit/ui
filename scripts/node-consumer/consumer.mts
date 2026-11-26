// The ES module side: `import` → `.d.ts`. See `tsconfig.json`.
import { Button as RootButton, Field, UiProvider } from '@handijitcom/ui';
import Button from '@handijitcom/ui/button';
import Checkbox from '@handijitcom/ui/checkbox';
import { Calendar } from '@handijitcom/ui/calendar';
import { BarChart } from '@handijitcom/ui/charts';
import { ChatThread } from '@handijitcom/ui/chat';
import MoneyInput from '@handijitcom/ui/money-input';
import Select from '@handijitcom/ui/select';

export const used = [
  RootButton,
  Field,
  UiProvider,
  Button,
  Checkbox,
  BarChart,
  ChatThread,
  Select,
  Calendar,
];

// The props are typed, not `any`: an unknown prop is an error.
// @ts-expect-error — `isLoadingg` is not a prop of Button.
export const typo = Button({ isLoadingg: true });

// 2.2: `error` on Checkbox, `null` in Select.
export const checkbox = Checkbox({ label: 'Kabul', error: 'Gerekli' });
export const select = Select({ label: 'İl', options: [], value: null, onChange: () => {} });

// 2.4: a scaled integer in and out; the minor digits are required.
export const money = MoneyInput({ value: 123_450, onChange: () => {}, minorDigits: 2 });
// @ts-expect-error — `minorDigits` is required: the scale is never guessed.
export const noScale = MoneyInput({ value: 1, onChange: () => {} });
