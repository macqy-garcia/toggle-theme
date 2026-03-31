import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface DataField {
  label: string;
  /** Supports newlines (\n) for multi-line values */
  value: string;
}

/**
 * Data review modal that fetches and displays personal information for confirmation.
 * Personal data is loaded from `GET /api/personal-data` each time the modal opens.
 *
 * @fires modal-close   - Fired when the Close button is clicked
 * @fires modal-confirm - Fired when the confirm button is clicked
 * @fires modal-adjust  - Fired when the adjust button is clicked
 * @attr {boolean} open - When present, the modal is visible and triggers a data fetch
 * @csspart modal  - The modal container
 * @csspart header - The modal header
 * @csspart footer - The modal footer
 *
 * @example
 * <data-review-modal open></data-review-modal>
 */
@customElement('data-review-modal')
export class DataReviewModal extends LitElement {
  @property({ type: Boolean, reflect: true })
  open = false;

  @state()
  private _fields: DataField[] = [];

  @state()
  private _loading = false;

  @state()
  private _error = false;

  static styles = css`
    :host {
      display: none;
      /* Light mode defaults */
      --_orange: #e8501a;
      --_orange-hover: #c94217;
      --_radius-modal: 16px;
      --_radius-btn: 100px;
      --_shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
      --_modal-bg: #fff;
      --_modal-color: #111;
      --_modal-border: #ebebeb;
      --_close-btn-color: #444;
      --_close-btn-hover: #f0f0f0;
      --_close-icon-bg: #e8e8e8;
      --_subtitle-color: #666;
      --_label-color: #999;
      --_value-color: #111;
      --_field-border: #f0f0f0;
      --_btn-secondary-color: #111;
      --_btn-secondary-border: #ccc;
      --_btn-secondary-hover-bg: #f5f5f5;
      --_btn-secondary-hover-border: #aaa;
      --_scrollbar: #ddd;
      --_scroll-fade-end: rgba(255, 255, 255, 0.9);
      --_status-color: #888;
      --_error-color: #c0392b;
    }

    :host([open]) {
      display: contents;
    }

    /* Dark mode via data-theme on <html> */
    :host-context([data-theme='dark']) {
      --_modal-bg: #242424;
      --_modal-color: #f0f0f0;
      --_modal-border: #333;
      --_close-btn-color: #bbb;
      --_close-btn-hover: #333;
      --_close-icon-bg: #3a3a3a;
      --_subtitle-color: #999;
      --_label-color: #666;
      --_value-color: #ddd;
      --_field-border: #2e2e2e;
      --_btn-secondary-color: #f0f0f0;
      --_btn-secondary-border: #444;
      --_btn-secondary-hover-bg: #2e2e2e;
      --_btn-secondary-hover-border: #666;
      --_scrollbar: #444;
      --_scroll-fade-end: rgba(36, 36, 36, 0.9);
      --_status-color: #666;
      --_error-color: #e74c3c;
    }

    .modal {
      background: var(--_modal-bg);
      color: var(--_modal-color);
      border-radius: var(--_radius-modal);
      box-shadow: var(--_shadow);
      width: 100%;
      max-width: 560px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: popIn 0.25s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    @keyframes popIn {
      from {
        transform: scale(0.95) translateY(12px);
        opacity: 0;
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 28px 16px;
      border-bottom: 1px solid var(--_modal-border);
    }

    .modal-header-title {
      font-size: 15px;
      font-weight: 600;
    }

    .close-btn {
      cursor: pointer;
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.15s;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--_close-btn-color);
      font-family: inherit;
    }

    .close-btn:hover {
      background: var(--_close-btn-hover);
    }

    .close-btn:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    .close-icon {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 13px;
      background: var(--_close-icon-bg);
    }

    .modal-body {
      padding: 28px 28px 0;
      max-height: 62vh;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--_scrollbar) transparent;
    }

    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.4px;
      line-height: 1.25;
      margin: 0 0 10px;
      font-family: inherit;
    }

    .subtitle {
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 24px;
      color: var(--_subtitle-color);
      font-family: inherit;
    }

    .data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 16px;
      margin-bottom: 4px;
    }

    .data-field {
      padding: 14px 0;
      border-bottom: 1px solid var(--_field-border);
    }

    .data-field:last-child {
      border-bottom: none;
    }

    .field-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 4px;
      color: var(--_label-color);
    }

    .field-value {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
      color: var(--_value-color);
      white-space: pre-line;
    }

    .scroll-fade {
      position: sticky;
      bottom: 0;
      height: 40px;
      margin-top: -40px;
      pointer-events: none;
      background: linear-gradient(to bottom, transparent, var(--_scroll-fade-end));
    }

    .status-message {
      font-size: 14px;
      color: var(--_status-color);
      padding: 24px 0 28px;
      margin: 0;
      font-family: inherit;
    }

    .error-message {
      color: var(--_error-color);
    }

    .modal-footer {
      padding: 20px 28px 28px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn {
      cursor: pointer;
      border: none;
      border-radius: var(--_radius-btn);
      padding: 15px 24px;
      font-size: 15px;
      font-weight: 700;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      font-family: inherit;
    }

    .btn-primary {
      background: var(--_orange);
      color: #fff;
    }

    .btn-primary:hover {
      background: var(--_orange-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(232, 80, 26, 0.35);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-primary:focus-visible {
      outline: 2px solid var(--_orange);
      outline-offset: 2px;
    }

    .btn-secondary {
      background: transparent;
      color: var(--_btn-secondary-color);
      border: 1.5px solid var(--_btn-secondary-border);
    }

    .btn-secondary:hover {
      background: var(--_btn-secondary-hover-bg);
      border-color: var(--_btn-secondary-hover-border);
    }

    .btn-secondary:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    .btn-icon {
      font-size: 13px;
      opacity: 0.7;
    }

    .spacer {
      width: 64px;
    }
  `;

  updated(changed: Map<string, unknown>): void {
    if (changed.has('open') && this.open) {
      this._fetchFields();
    }
  }

  private async _fetchFields(): Promise<void> {
    this._loading = true;
    this._error = false;
    try {
      const res = await fetch('/api/personal-data');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { fields: DataField[] };
      this._fields = data.fields;
    } catch {
      this._error = true;
    } finally {
      this._loading = false;
    }
  }

  private _close(): void {
    this.dispatchEvent(
      new CustomEvent('modal-close', { bubbles: true, composed: true })
    );
  }

  private _confirm(): void {
    this.dispatchEvent(
      new CustomEvent('modal-confirm', { bubbles: true, composed: true })
    );
  }

  private _adjust(): void {
    this.dispatchEvent(
      new CustomEvent('modal-adjust', { bubbles: true, composed: true })
    );
  }

  private _renderBody() {
    if (this._loading) {
      return html`
        <div class="modal-body" aria-live="polite">
          <h1 id="review-title">Is everything still up to date?</h1>
          <p class="status-message">Loading your data…</p>
        </div>
      `;
    }

    if (this._error) {
      return html`
        <div class="modal-body" aria-live="polite">
          <h1 id="review-title">Is everything still up to date?</h1>
          <p class="status-message error-message">
            Failed to load your data. Please try again.
          </p>
        </div>
      `;
    }

    return html`
      <div class="modal-body">
        <h1 id="review-title">Is everything still up to date?</h1>
        <p class="subtitle">
          For your request, we will take over the following personal data from you.
        </p>

        <div class="data-grid">
          ${this._fields.map(
            (field) => html`
              <div class="data-field">
                <div class="field-label">${field.label}</div>
                <div class="field-value">${field.value}</div>
              </div>
            `
          )}
        </div>

        ${this._fields.length > 0
          ? html`<div class="scroll-fade" aria-hidden="true"></div>`
          : nothing}
      </div>
    `;
  }

  render() {
    return html`
      <div
        class="modal"
        part="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        aria-busy=${this._loading ? 'true' : 'false'}
      >
        <div class="modal-header" part="header">
          <button
            class="close-btn"
            @click=${this._close}
            aria-label="Close modal"
          >
            <span class="close-icon" aria-hidden="true">✕</span>
            Close
          </button>
          <span class="modal-header-title">Personal Data</span>
          <div class="spacer" aria-hidden="true"></div>
        </div>

        ${this._renderBody()}

        <div class="modal-footer" part="footer">
          <button class="btn btn-primary" @click=${this._confirm}>
            Yeah, everything's right
          </button>
          <button class="btn btn-secondary" @click=${this._adjust}>
            I need to adjust something
            <span class="btn-icon" aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'data-review-modal': DataReviewModal;
  }
}
