import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UserMenu from '@/components/UserMenu';
import UiProvider from '@/theme/UiProvider';
import { LABELS } from '@tests/fixtures/labels';

describe('UserMenu', () => {
  it('names the trigger once and opens the account menu', async () => {
    const onSignOut = jest.fn();
    render(
      <UiProvider labels={LABELS}>
        <UserMenu
          name="Ayşe Yılmaz"
          meta="Bayi yöneticisi"
          items={[{ id: 'out', label: 'Çıkış yap', onSelect: onSignOut, isDanger: true }]}
          className="extra"
          testId="user"
        />
      </UiProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Ayşe Yılmaz Bayi yöneticisi' });
    expect(trigger).toHaveClass('extra');

    await userEvent.click(trigger);
    expect(screen.getByRole('menu', { name: 'Hesap' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('menuitem', { name: 'Çıkış yap' }));
    expect(onSignOut).toHaveBeenCalled();
  });

  it('takes its menu name as a prop and has no second line without meta', async () => {
    render(
      <UserMenu
        name="Ali Kaya"
        label="Profil"
        items={[{ id: 'a', label: 'Ayarlar', onSelect: () => {} }]}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Ali Kaya' });
    await userEvent.click(trigger);

    expect(screen.getByRole('menu', { name: 'Profil' })).toBeInTheDocument();
  });
});
