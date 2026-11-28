import { act, fireEvent, render, screen } from '@testing-library/react';

import BrandLockup from '@/components/BrandLockup';
import CodeText from '@/components/CodeText';
import UiProvider from '@/theme/UiProvider';
import { LABELS } from '@tests/fixtures/labels';

describe('CodeText', () => {
  it('writes the code in a native <code>, with size and tone classes', () => {
    render(<CodeText code="1K0 615 301 AA" size="sm" isMuted className="x" testId="code" />);

    const code = screen.getByTestId('code');
    expect(code.tagName).toBe('CODE');
    expect(code).toHaveTextContent('1K0 615 301 AA');
    expect(code).toHaveClass('code', 'code--sm', 'code--muted', 'x');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('follows the text size without a size', () => {
    render(<CodeText code="A1" testId="code" />);

    expect(screen.getByTestId('code').className).toBe('code');
  });

  it('copies the code, says so and returns to the copy label', async () => {
    jest.useFakeTimers();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(
      <UiProvider labels={LABELS}>
        <CodeText code="0 986 424 815" isCopyable />
      </UiProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '0 986 424 815 kopyala' }));
    });
    expect(writeText).toHaveBeenCalledWith('0 986 424 815');
    expect(screen.getByRole('button', { name: '0 986 424 815 kopyalandı' })).toBeInTheDocument();
    expect(screen.getByText('Kopyalandı')).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(2000));
    expect(screen.getByRole('button', { name: '0 986 424 815 kopyala' })).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('takes its own labels', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(
      <CodeText
        code="X"
        isCopyable
        copyLabel="Kodu kopyala"
        copiedLabel="Kopyalandı"
        copiedAnnouncement="Tamam"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Kodu kopyala' }));
    });
    expect(screen.getByRole('button', { name: 'Kopyalandı' })).toBeInTheDocument();
    expect(screen.getByText('Tamam')).toBeInTheDocument();
  });
});

describe('BrandLockup', () => {
  it('draws the initial tile and the name, the tile hidden from screen readers', () => {
    const { container } = render(
      <BrandLockup name="  yıldız Oto" tagline="Yedek parça" testId="brand" />,
    );

    expect(screen.getByTestId('brand')).toHaveClass('lockup', 'lockup--md');
    const tile = container.querySelector('.lockup__mark--tile');
    expect(tile).toHaveAttribute('aria-hidden', 'true');
    expect(tile).toHaveTextContent('Y');
    expect(screen.getByText('Yedek parça')).toBeInTheDocument();
  });

  it('takes a given initial, and a logo instead of the tile', () => {
    const { container, rerender } = render(<BrandLockup name="Han" initial="hd" size="sm" />);
    expect(container.querySelector('.lockup__mark')).toHaveTextContent('HD');

    rerender(<BrandLockup name="Han" logo={<img src="logo.svg" alt="" />} size="lg" />);
    expect(container.querySelector('.lockup__mark--tile')).toBeNull();
    expect(container.querySelector('img')).toHaveAttribute('src', 'logo.svg');
    expect(container.firstElementChild).toHaveClass('lockup--lg');
  });

  it('is a link named by the brand when given a page, through the provider', () => {
    const Link = ({ children, ...props }: { children?: React.ReactNode; href: string }) => (
      <a data-router="yes" {...props}>
        {children}
      </a>
    );
    render(
      <UiProvider linkComponent={Link}>
        <BrandLockup name="Yıldız Oto" href="/" linkProps={{ 'data-prefetch': 'no' }} />
      </UiProvider>,
    );

    const link = screen.getByRole('link', { name: 'Yıldız Oto' });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveAttribute('data-router', 'yes');
    expect(link).toHaveClass('lockup--link');
    expect(link).toHaveAttribute('data-prefetch', 'no');
  });

  it('draws an empty tile for an empty name', () => {
    const { container } = render(<BrandLockup name=" " />);

    expect(container.querySelector('.lockup__mark--tile')).toHaveTextContent('');
  });
});
