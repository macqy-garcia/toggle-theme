import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Intro modal prompting the user to begin the personal data collection flow.
 *
 * @fires modal-close - Fired when the Close button is clicked
 * @fires modal-next  - Fired when the Next button is clicked
 * @attr {boolean} open - When present, the modal is visible
 * @csspart modal  - The modal container
 * @csspart header - The modal header
 * @csspart footer - The modal footer
 *
 * @example
 * <data-intro-modal open></data-intro-modal>
 */
@customElement('data-intro-modal')
export class DataIntroModal extends LitElement {
  @property({ type: Boolean, reflect: true })
  open = false;

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
      --_body-text-color: #555;
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
      --_body-text-color: #aaa;
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
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 40px 48px 36px;
    }

    .illustration {
      width: 120px;
      height: 120px;
      margin-bottom: 32px;
    }

    .illustration svg {
      width: 100%;
      height: 100%;
    }

    h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0 0 14px;
      line-height: 1.2;
      font-family: inherit;
    }

    p {
      font-size: 15px;
      line-height: 1.65;
      max-width: 380px;
      margin: 0 0 36px;
      color: var(--_body-text-color);
      font-family: inherit;
    }

    .modal-footer {
      padding: 0 48px 40px;
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

    .spacer {
      width: 64px;
    }
  `;

  private _close(): void {
    this.dispatchEvent(
      new CustomEvent('modal-close', { bubbles: true, composed: true })
    );
  }

  private _next(): void {
    this.dispatchEvent(
      new CustomEvent('modal-next', { bubbles: true, composed: true })
    );
  }

  render() {
    return html`
      <div
        class="modal"
        part="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-title"
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

        <div class="modal-body">
          <div class="illustration" aria-hidden="true">
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="28" y="22" width="62" height="78" rx="6" fill="#D0C8BE" transform="rotate(-4 28 22)" />
              <rect x="24" y="18" width="62" height="78" rx="6" fill="#F0EBE3" />
              <rect x="34" y="34" width="42" height="5" rx="2.5" fill="#C8BFB4" />
              <rect x="34" y="44" width="34" height="4" rx="2" fill="#DDD6CE" />
              <rect x="34" y="52" width="38" height="4" rx="2" fill="#DDD6CE" />
              <rect x="34" y="60" width="28" height="4" rx="2" fill="#DDD6CE" />
              <g transform="rotate(30 85 85)">
                <rect x="74" y="60" width="12" height="40" rx="2" fill="#3B82F6" />
                <polygon points="74,100 86,100 80,112" fill="#FCD34D" />
                <rect x="74" y="58" width="12" height="6" rx="1" fill="#93C5FD" />
              </g>
              <circle cx="82" cy="28" r="16" fill="#F59E0B" />
              <path
                d="M74 28 l6 6 10-12"
                stroke="#fff"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <h1 id="intro-title">Add to your data</h1>
          <p>
            As a bank, we are required to collect or update some additional
            information from you because it concerns accounts and finances.
          </p>
        </div>

        <div class="modal-footer" part="footer">
          <button class="btn btn-primary" @click=${this._next}>Next</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'data-intro-modal': DataIntroModal;
  }
}
