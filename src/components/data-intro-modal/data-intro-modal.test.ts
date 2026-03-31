import { fixture, html, expect, aTimeout } from '@open-wc/testing';
import { DataIntroModal } from './data-intro-modal.js';

describe('DataIntroModal', () => {
  // ── Registration ────────────────────────────────────────────────────────────

  it('is defined as a custom element', () => {
    const el = customElements.get('data-intro-modal');
    expect(el).to.equal(DataIntroModal);
  });

  // ── open property / attribute ────────────────────────────────────────────────

  it('renders nothing visible when closed', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal></data-intro-modal>`);
    expect(el.open).to.be.false;
    expect(getComputedStyle(el).display).to.equal('none');
  });

  it('shows the modal when open attribute is set', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    expect(el.open).to.be.true;
    expect(el.shadowRoot!.querySelector('.modal')).to.exist;
  });

  it('reflects the open property as an attribute', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal></data-intro-modal>`);
    expect(el.hasAttribute('open')).to.be.false;
    el.open = true;
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.true;
  });

  it('hides the modal when open is set back to false', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    el.open = false;
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.false;
    expect(getComputedStyle(el).display).to.equal('none');
  });

  // ── Content ──────────────────────────────────────────────────────────────────

  it('renders the correct heading text', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    const heading = el.shadowRoot!.querySelector('h1');
    expect(heading?.textContent?.trim()).to.equal('Add to your data');
  });

  it('renders the body description paragraph', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    const p = el.shadowRoot!.querySelector('p');
    expect(p?.textContent?.trim()).to.include('bank');
  });

  it('renders the illustration svg', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    const svg = el.shadowRoot!.querySelector('.illustration svg');
    expect(svg).to.exist;
  });

  it('renders the Next button with correct label', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-primary');
    expect(btn?.textContent?.trim()).to.equal('Next');
  });

  it('renders the Close button with correct label', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>('.close-btn');
    expect(btn?.textContent?.trim()).to.include('Close');
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  it('has role="dialog" and aria-modal on the modal element', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    const modal = el.shadowRoot!.querySelector('.modal');
    expect(modal?.getAttribute('role')).to.equal('dialog');
    expect(modal?.getAttribute('aria-modal')).to.equal('true');
  });

  it('modal is labelled by the h1 via aria-labelledby', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    const modal = el.shadowRoot!.querySelector('.modal');
    const labelId = modal?.getAttribute('aria-labelledby');
    expect(labelId).to.be.a('string').and.not.be.empty;
    const labelEl = el.shadowRoot!.querySelector(`#${labelId}`);
    expect(labelEl?.tagName.toLowerCase()).to.equal('h1');
  });

  it('close button has aria-label="Close modal"', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>('.close-btn');
    expect(btn?.getAttribute('aria-label')).to.equal('Close modal');
  });

  // ── CSS parts ────────────────────────────────────────────────────────────────

  it('exposes part="modal" on the modal container', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    expect(el.shadowRoot!.querySelector('[part="modal"]')).to.exist;
  });

  it('exposes part="header" on the modal header', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    expect(el.shadowRoot!.querySelector('[part="header"]')).to.exist;
  });

  it('exposes part="footer" on the modal footer', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    expect(el.shadowRoot!.querySelector('[part="footer"]')).to.exist;
  });

  // ── Events ───────────────────────────────────────────────────────────────────

  it('fires modal-close when the Close button is clicked', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    let fired = false;
    el.addEventListener('modal-close', () => { fired = true; });
    el.shadowRoot!.querySelector<HTMLButtonElement>('.close-btn')!.click();
    expect(fired).to.be.true;
  });

  it('fires modal-next when the Next button is clicked', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    let fired = false;
    el.addEventListener('modal-next', () => { fired = true; });
    el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    expect(fired).to.be.true;
  });

  it('modal-close event has bubbles and composed set to true', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    let captured: CustomEvent | null = null;
    el.addEventListener('modal-close', (e: Event) => { captured = e as CustomEvent; });
    el.shadowRoot!.querySelector<HTMLButtonElement>('.close-btn')!.click();
    await aTimeout(0);
    expect(captured!.bubbles).to.be.true;
    expect(captured!.composed).to.be.true;
  });

  it('modal-next event has bubbles and composed set to true', async () => {
    const el = await fixture<DataIntroModal>(html`<data-intro-modal open></data-intro-modal>`);
    let captured: CustomEvent | null = null;
    el.addEventListener('modal-next', (e: Event) => { captured = e as CustomEvent; });
    el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    await aTimeout(0);
    expect(captured!.bubbles).to.be.true;
    expect(captured!.composed).to.be.true;
  });
});
