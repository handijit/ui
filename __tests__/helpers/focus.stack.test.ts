import {
  captureFocus,
  focusFirstMeaningful,
  hasOpenSurface,
  isTopModal,
  pushModal,
  resetModalStack,
} from '@/helpers/focus.helper';

const mount = (html: string): HTMLElement => {
  document.body.innerHTML = html;
  return document.body.firstElementChild as HTMLElement;
};

describe('captureFocus', () => {
  it('odağı AÇAN öğeye geri verir', () => {
    const root = mount('<div><button id="trigger">Aç</button><input id="inside" /></div>');
    const trigger = root.querySelector<HTMLElement>('#trigger')!;

    trigger.focus();
    const restore = captureFocus();

    root.querySelector<HTMLElement>('#inside')!.focus();
    restore();

    expect(trigger).toHaveFocus();
  });

  it('açan öğe DOM`dan kalktıysa sessizce vazgeçer', () => {
    const root = mount('<div><button id="trigger">Sil</button></div>');
    const trigger = root.querySelector<HTMLElement>('#trigger')!;

    trigger.focus();
    const restore = captureFocus();
    trigger.remove();

    expect(() => restore()).not.toThrow();
  });
});

describe('focusFirstMeaningful', () => {
  it('KAPATMA düğmesini atlar', () => {
    const panel = mount(`
      <div>
        <button class="close" data-ui-close>Kapat</button>
        <input id="first" />
        <button id="save">Kaydet</button>
      </div>
    `);

    focusFirstMeaningful(panel);

    expect(panel.querySelector('#first')).toHaveFocus();
  });

  it('`data-ui-autofocus` her şeyi EZER', () => {
    const panel = mount(`
      <div>
        <input id="first" />
        <button id="save" data-ui-autofocus>Kaydet</button>
      </div>
    `);

    focusFirstMeaningful(panel);

    expect(panel.querySelector('#save')).toHaveFocus();
  });

  it('atlanacak öğe TEK adaysa yine ona odaklanır', () => {
    const panel = mount('<div><button data-ui-close>Kapat</button></div>');

    focusFirstMeaningful(panel);

    expect(panel.querySelector('button')).toHaveFocus();
  });

  it('odaklanabilir öğe yoksa PANELİN KENDİSİNE odaklanır', () => {
    const panel = mount('<div><p>Yalnızca metin</p></div>');

    focusFirstMeaningful(panel);

    expect(panel).toHaveFocus();
    expect(panel).toHaveAttribute('tabindex', '-1');
  });

  it('pasif öğe aday DEĞİLDİR', () => {
    const panel = mount('<div><button disabled>Pasif</button><a href="#x">Bağlantı</a></div>');

    focusFirstMeaningful(panel);

    expect(panel.querySelector('a')).toHaveFocus();
  });
});

describe('kipsel yığın', () => {
  beforeEach(resetModalStack);

  it('yalnızca EN ÜSTTEKİ panel en üsttedir', () => {
    const outer = pushModal();
    const inner = pushModal();

    expect(isTopModal(inner.token)).toBe(true);
    expect(isTopModal(outer.token)).toBe(false);
  });

  it('üstteki kapanınca alttaki en üste çıkar', () => {
    const outer = pushModal();
    const inner = pushModal();

    inner.pop();

    expect(isTopModal(outer.token)).toBe(true);
  });

  it('ORTADAKİ panel çıkarıldığında sıra bozulmaz', () => {
    const first = pushModal();
    const second = pushModal();
    const third = pushModal();

    second.pop();

    expect(isTopModal(third.token)).toBe(true);
    expect(isTopModal(first.token)).toBe(false);
  });

  it('yığın boşken hiçbir belirteç en üstte değildir', () => {
    const { token, pop } = pushModal();
    pop();

    expect(isTopModal(token)).toBe(false);
  });
});

describe('hasOpenSurface', () => {
  beforeEach(() => resetModalStack());

  it('yığın boşken false, bir yüzey açılınca true, kapanınca yine false', () => {
    expect(hasOpenSurface()).toBe(false);

    const { pop } = pushModal();
    expect(hasOpenSurface()).toBe(true);

    pop();
    expect(hasOpenSurface()).toBe(false);
  });
});

describe('hasOpenSurface — transient entries (2.3)', () => {
  beforeEach(() => resetModalStack());

  it('a transient entry (toast, tooltip) is not an open surface', () => {
    const { pop } = pushModal({ isTransient: true });

    expect(hasOpenSurface()).toBe(false);
    expect(hasOpenSurface({ includeTransient: true })).toBe(true);

    pop();
    expect(hasOpenSurface({ includeTransient: true })).toBe(false);
  });

  it('a modal entry under a transient one still counts', () => {
    pushModal();
    pushModal({ isTransient: true });

    expect(hasOpenSurface()).toBe(true);
  });

  it('Escape order is one stack: the newest entry is on top whatever its kind', () => {
    const modal = pushModal();
    const notice = pushModal({ isTransient: true });

    expect(isTopModal(notice.token)).toBe(true);
    expect(isTopModal(modal.token)).toBe(false);

    notice.pop();
    expect(isTopModal(modal.token)).toBe(true);
  });
});
