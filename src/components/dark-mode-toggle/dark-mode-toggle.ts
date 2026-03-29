import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * A toggle button that switches between light and dark mode.
 *
 * @fires dark-mode-change - Fired when the mode changes. Detail: `{ dark: boolean }`
 * @attr {boolean} dark - When present, dark mode is active
 * @csspart button - The inner toggle button element
 *
 * @example
 * <dark-mode-toggle></dark-mode-toggle>
 * <dark-mode-toggle dark></dark-mode-toggle>
 */
@customElement('dark-mode-toggle')
export class DarkModeToggle extends LitElement {
  @property({ type: Boolean, reflect: true })
  dark = false;

  static styles = css`
    :host {
      display: inline-block;
    }

    button {
      cursor: pointer;
      border: none;
      background: transparent;
      font-size: 1.5rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
      line-height: 1;
    }

    button:hover {
      background: rgba(128, 128, 128, 0.15);
    }

    button:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  `;

  private _toggle(): void {
    this.dark = !this.dark;

    this.dispatchEvent(
      new CustomEvent<{ dark: boolean }>('dark-mode-change', {
        detail: { dark: this.dark },
        bubbles: true,
        composed: true,
      })
    );

    // Reflect preference to <html> for global CSS custom properties
    document.documentElement.setAttribute(
      'data-theme',
      this.dark ? 'dark' : 'light'
    );
  }

  render() {
    return html`
      <button
        part="button"
        @click=${this._toggle}
        aria-label=${this.dark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed=${String(this.dark)}
        title=${this.dark ? 'Light mode' : 'Dark mode'}
      >
        ${this.dark ? '☀️' : '🌙'}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dark-mode-toggle': DarkModeToggle;
  }
}
