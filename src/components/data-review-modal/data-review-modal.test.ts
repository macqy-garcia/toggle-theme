import { fixture, html, expect, aTimeout } from '@open-wc/testing';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/node.js';
import { DataReviewModal } from './data-review-modal.js';

before(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
after(() => server.close());

describe('DataReviewModal', () => {
  // ── Registration ─────────────────────────────────────────────────────────────

  it('is defined as a custom element', () => {
    const el = customElements.get('data-review-modal');
    expect(el).to.equal(DataReviewModal);
  });

  // ── open property / attribute ─────────────────────────────────────────────────

  it('renders nothing visible when closed', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal></data-review-modal>`);
    expect(el.open).to.be.false;
    expect(getComputedStyle(el).display).to.equal('none');
  });

  it('shows the modal when open attribute is set', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    await aTimeout(50);
    expect(el.open).to.be.true;
    expect(el.shadowRoot!.querySelector('.modal')).to.exist;
  });

  it('reflects the open property as an attribute', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal></data-review-modal>`);
    expect(el.hasAttribute('open')).to.be.false;
    el.open = true;
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.true;
  });

  it('hides the modal when open is set back to false', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    await aTimeout(50);
    el.open = false;
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.false;
    expect(getComputedStyle(el).display).to.equal('none');
  });

  // ── Data fetching ─────────────────────────────────────────────────────────────

  it('fetches personal data from GET /api/personal-data when opened', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal></data-review-modal>`);
    el.open = true;
    await el.updateComplete;
    await aTimeout(50);
    await el.updateComplete;

    const fields = el.shadowRoot!.querySelectorAll('.data-field');
    expect(fields.length).to.be.greaterThan(0);
  });

  it('renders the field labels returned by the API', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal></data-review-modal>`);
    el.open = true;
    await el.updateComplete;
    await aTimeout(50);
    await el.updateComplete;

    const labels = Array.from(el.shadowRoot!.querySelectorAll('.field-label')).map(
      (node) => node.textContent?.trim()
    );
    expect(labels).to.include('Name');
    expect(labels).to.include('E-Mail-Adresse');
  });

  it('renders the field values returned by the API', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal></data-review-modal>`);
    el.open = true;
    await el.updateComplete;
    await aTimeout(50);
    await el.updateComplete;

    const values = Array.from(el.shadowRoot!.querySelectorAll('.field-value')).map(
      (node) => node.textContent?.trim()
    );
    expect(values).to.include('Frau Alex Mustermensch');
    expect(values).to.include('+49 151 12345678');
  });

  it('re-fetches when the modal is closed and reopened', async () => {
    let callCount = 0;
    server.use(
      http.get('/api/personal-data', () => {
        callCount++;
        return HttpResponse.json({ fields: [{ label: 'Name', value: `Call ${callCount}` }] });
      })
    );

    const el = await fixture<DataReviewModal>(html`<data-review-modal></data-review-modal>`);

    el.open = true;
    await el.updateComplete;
    await aTimeout(50);
    await el.updateComplete;
    expect(callCount).to.equal(1);

    el.open = false;
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    await aTimeout(50);
    await el.updateComplete;
    expect(callCount).to.equal(2);
  });

  it('does not fetch when the modal is already open', async () => {
    let callCount = 0;
    server.use(
      http.get('/api/personal-data', () => {
        callCount++;
        return HttpResponse.json({ fields: [] });
      })
    );

    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    await aTimeout(50);
    await el.updateComplete;

    // Setting open=true again on an already-open modal should not re-fetch
    el.open = true;
    await el.updateComplete;
    await aTimeout(50);

    expect(callCount).to.equal(1);
  });

  // ── Loading state ─────────────────────────────────────────────────────────────

  it('shows a loading message while the fetch is in progress', async () => {
    let resolveRequest!: () => void;
    server.use(
      http.get('/api/personal-data', () =>
        new Promise<Response>((resolve) => {
          resolveRequest = () => resolve(HttpResponse.json({ fields: [] }));
        })
      )
    );

    const el = await fixture<DataReviewModal>(html`<data-review-modal></data-review-modal>`);
    el.open = true;
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.status-message')).to.exist;
    expect(el.shadowRoot!.querySelector('.status-message')?.textContent?.trim()).to.include('Loading');

    resolveRequest();
    await aTimeout(50);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.status-message')).not.to.exist;
  });

  it('sets aria-busy="true" on the modal while loading', async () => {
    let resolveRequest!: () => void;
    server.use(
      http.get('/api/personal-data', () =>
        new Promise<Response>((resolve) => {
          resolveRequest = () => resolve(HttpResponse.json({ fields: [] }));
        })
      )
    );

    const el = await fixture<DataReviewModal>(html`<data-review-modal></data-review-modal>`);
    el.open = true;
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.modal')?.getAttribute('aria-busy')).to.equal('true');

    resolveRequest();
    await aTimeout(50);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.modal')?.getAttribute('aria-busy')).to.equal('false');
  });

  // ── Error state ───────────────────────────────────────────────────────────────

  it('shows an error message when the fetch fails', async () => {
    server.use(
      http.get('/api/personal-data', () => HttpResponse.error())
    );

    const el = await fixture<DataReviewModal>(html`<data-review-modal></data-review-modal>`);
    el.open = true;
    await el.updateComplete;
    await aTimeout(50);
    await el.updateComplete;

    const errorMsg = el.shadowRoot!.querySelector('.error-message');
    expect(errorMsg).to.exist;
    expect(errorMsg?.textContent?.trim()).to.include('Failed');
  });

  it('shows an error message on a non-OK HTTP response', async () => {
    server.use(
      http.get('/api/personal-data', () =>
        HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      )
    );

    const el = await fixture<DataReviewModal>(html`<data-review-modal></data-review-modal>`);
    el.open = true;
    await el.updateComplete;
    await aTimeout(50);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.error-message')).to.exist;
  });

  it('does not show the data grid when an error occurs', async () => {
    server.use(
      http.get('/api/personal-data', () => HttpResponse.error())
    );

    const el = await fixture<DataReviewModal>(html`<data-review-modal></data-review-modal>`);
    el.open = true;
    await el.updateComplete;
    await aTimeout(50);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.data-grid')).not.to.exist;
  });

  // ── Content ───────────────────────────────────────────────────────────────────

  it('renders the correct heading text', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    await aTimeout(50);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('h1')?.textContent?.trim()).to.equal(
      'Is everything still up to date?'
    );
  });

  it('renders the subtitle paragraph after data loads', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    await aTimeout(50);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.subtitle')?.textContent?.trim()).to.include('personal data');
  });

  it('renders the confirm button with correct label', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-primary');
    expect(btn?.textContent?.trim()).to.include("everything's right");
  });

  it('renders the adjust button with correct label', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-secondary');
    expect(btn?.textContent?.trim()).to.include('adjust');
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  it('has role="dialog" and aria-modal on the modal element', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    const modal = el.shadowRoot!.querySelector('.modal');
    expect(modal?.getAttribute('role')).to.equal('dialog');
    expect(modal?.getAttribute('aria-modal')).to.equal('true');
  });

  it('modal is labelled by the h1 via aria-labelledby', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    const modal = el.shadowRoot!.querySelector('.modal');
    const labelId = modal?.getAttribute('aria-labelledby');
    expect(labelId).to.be.a('string').and.not.be.empty;
    const labelEl = el.shadowRoot!.querySelector(`#${labelId}`);
    expect(labelEl?.tagName.toLowerCase()).to.equal('h1');
  });

  it('close button has aria-label="Close modal"', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>('.close-btn');
    expect(btn?.getAttribute('aria-label')).to.equal('Close modal');
  });

  // ── CSS parts ─────────────────────────────────────────────────────────────────

  it('exposes part="modal" on the modal container', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    expect(el.shadowRoot!.querySelector('[part="modal"]')).to.exist;
  });

  it('exposes part="header" on the modal header', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    expect(el.shadowRoot!.querySelector('[part="header"]')).to.exist;
  });

  it('exposes part="footer" on the modal footer', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    expect(el.shadowRoot!.querySelector('[part="footer"]')).to.exist;
  });

  // ── Events ────────────────────────────────────────────────────────────────────

  it('fires modal-close when the Close button is clicked', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    let fired = false;
    el.addEventListener('modal-close', () => { fired = true; });
    el.shadowRoot!.querySelector<HTMLButtonElement>('.close-btn')!.click();
    expect(fired).to.be.true;
  });

  it('fires modal-confirm when the primary button is clicked', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    let fired = false;
    el.addEventListener('modal-confirm', () => { fired = true; });
    el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    expect(fired).to.be.true;
  });

  it('fires modal-adjust when the secondary button is clicked', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    let fired = false;
    el.addEventListener('modal-adjust', () => { fired = true; });
    el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-secondary')!.click();
    expect(fired).to.be.true;
  });

  it('modal-close event has bubbles and composed set to true', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    let captured: CustomEvent | null = null;
    el.addEventListener('modal-close', (e: Event) => { captured = e as CustomEvent; });
    el.shadowRoot!.querySelector<HTMLButtonElement>('.close-btn')!.click();
    await aTimeout(0);
    expect(captured!.bubbles).to.be.true;
    expect(captured!.composed).to.be.true;
  });

  it('modal-confirm event has bubbles and composed set to true', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    let captured: CustomEvent | null = null;
    el.addEventListener('modal-confirm', (e: Event) => { captured = e as CustomEvent; });
    el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    await aTimeout(0);
    expect(captured!.bubbles).to.be.true;
    expect(captured!.composed).to.be.true;
  });

  it('modal-adjust event has bubbles and composed set to true', async () => {
    const el = await fixture<DataReviewModal>(html`<data-review-modal open></data-review-modal>`);
    let captured: CustomEvent | null = null;
    el.addEventListener('modal-adjust', (e: Event) => { captured = e as CustomEvent; });
    el.shadowRoot!.querySelector<HTMLButtonElement>('.btn-secondary')!.click();
    await aTimeout(0);
    expect(captured!.bubbles).to.be.true;
    expect(captured!.composed).to.be.true;
  });
});
