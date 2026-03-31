import { fixture, html, expect, aTimeout } from '@open-wc/testing';
import { server } from '../../mocks/node.js';
import type { DarkModeToggle } from './dark-mode-toggle.js';
import './dark-mode-toggle.js';

before(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
after(() => server.close());

describe('DarkModeToggle', () => {
  it('is defined as a custom element', () => {
    const el = document.createElement('dark-mode-toggle');
    expect(el).to.be.instanceOf(HTMLElement);
  });

  it('renders a button inside shadow root', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    const btn = el.shadowRoot?.querySelector('button');
    expect(btn).to.exist;
  });

  it('defaults to light mode (dark=false)', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    expect(el.dark).to.equal(false);
  });

  it('sets aria-pressed="false" in light mode', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.getAttribute('aria-pressed')).to.equal('false');
  });

  it('sets aria-pressed="true" in dark mode', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle dark></dark-mode-toggle>`
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.getAttribute('aria-pressed')).to.equal('true');
  });

  it('toggles dark property on button click', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    el.shadowRoot!.querySelector('button')!.click();
    await el.updateComplete;
    expect(el.dark).to.equal(true);
  });

  it('dispatches dark-mode-change event on click', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    let eventDetail: { dark: boolean } | null = null;
    el.addEventListener('dark-mode-change', (e: Event) => {
      eventDetail = (e as CustomEvent<{ dark: boolean }>).detail;
    });
    el.shadowRoot!.querySelector('button')!.click();
    await aTimeout(0);
    expect(eventDetail).to.deep.equal({ dark: true });
  });

  it('updates aria-label when toggled', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).to.equal('Switch to dark mode');
    btn.click();
    await el.updateComplete;
    expect(btn.getAttribute('aria-label')).to.equal('Switch to light mode');
  });

  it('reflects dark attribute on the host element', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    el.shadowRoot!.querySelector('button')!.click();
    await el.updateComplete;
    expect(el.hasAttribute('dark')).to.equal(true);
  });

  it('shows 🌙 emoji in light mode', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.textContent?.trim()).to.equal('🌙');
  });

  it('shows ☀️ emoji in dark mode', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle dark></dark-mode-toggle>`
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.textContent?.trim()).to.equal('☀️');
  });

  it('double-click returns to original light state', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    btn.click();
    await el.updateComplete;
    btn.click();
    await el.updateComplete;
    expect(el.dark).to.equal(false);
  });

  it('sets data-theme="dark" on <html> when toggled to dark', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    el.shadowRoot!.querySelector('button')!.click();
    await el.updateComplete;
    expect(document.documentElement.getAttribute('data-theme')).to.equal('dark');
  });

  it('sets data-theme="light" on <html> when toggled back to light', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle dark></dark-mode-toggle>`
    );
    el.shadowRoot!.querySelector('button')!.click();
    await el.updateComplete;
    expect(document.documentElement.getAttribute('data-theme')).to.equal('light');
  });

  it('dispatches event with { dark: false } when toggled from dark to light', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle dark></dark-mode-toggle>`
    );
    let eventDetail: { dark: boolean } | null = null;
    el.addEventListener('dark-mode-change', (e: Event) => {
      eventDetail = (e as CustomEvent<{ dark: boolean }>).detail;
    });
    el.shadowRoot!.querySelector('button')!.click();
    await aTimeout(0);
    expect(eventDetail).to.deep.equal({ dark: false });
  });

  it('dispatched event has bubbles and composed set to true', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    let capturedEvent: CustomEvent | null = null;
    el.addEventListener('dark-mode-change', (e: Event) => {
      capturedEvent = e as CustomEvent;
    });
    el.shadowRoot!.querySelector('button')!.click();
    await aTimeout(0);
    expect(capturedEvent!.bubbles).to.be.true;
    expect(capturedEvent!.composed).to.be.true;
  });

  it('button has the correct title in light mode', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.getAttribute('title')).to.equal('Dark mode');
  });

  it('button has the correct title in dark mode', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle dark></dark-mode-toggle>`
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.getAttribute('title')).to.equal('Light mode');
  });

  it('button exposes part="button" for CSS part styling', async () => {
    const el = await fixture<DarkModeToggle>(
      html`<dark-mode-toggle></dark-mode-toggle>`
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.getAttribute('part')).to.equal('button');
  });
});
