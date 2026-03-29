# corepartydata

> Lit web component library — built with Vite, Storybook, MSW, and a full CI/CD pipeline.

## Requirements

- Node 20 (see `.nvmrc`)
- npm 10+

## Quick start

```bash
npm install
npm run msw:init   # generates public/mockServiceWorker.js (one-time)
npm run dev        # Vite dev server → http://localhost:5173
```

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Compile TypeScript + Vite library build → `dist/` |
| `npm run preview` | Preview the production build |
| `npm run storybook` | Storybook dev server → http://localhost:6006 |
| `npm run build-storybook` | Build static Storybook → `storybook-static/` |
| `npm run test` | Run unit tests with @web/test-runner + Playwright |
| `npm run test:watch` | Watch mode for tests |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run msw:init` | (Re-)generate `public/mockServiceWorker.js` |

---

## Components

### `<dark-mode-toggle>`

A toggle button that switches the page between light and dark mode.

```html
<dark-mode-toggle></dark-mode-toggle>
<dark-mode-toggle dark></dark-mode-toggle>
```

**Attributes / Properties**

| Name | Type | Default | Description |
|---|---|---|---|
| `dark` | `boolean` | `false` | When true, dark mode is active. Reflected as an HTML attribute. |

**Events**

| Event | Detail | Description |
|---|---|---|
| `dark-mode-change` | `{ dark: boolean }` | Fired on every toggle. Bubbles and crosses shadow DOM boundaries. |

**CSS custom properties** (set by the toggle on `<html data-theme="...">`)

| Property | Light value | Dark value |
|---|---|---|
| `--color-bg` | `#ffffff` | `#111111` |
| `--color-text` | `#111111` | `#f5f5f5` |
| `--color-surface` | `#f5f5f5` | `#1e1e1e` |

**CSS Shadow Parts**

| Part | Element |
|---|---|
| `button` | The inner `<button>` element |

**Example — listen for theme changes**

```js
document.querySelector('dark-mode-toggle')
  .addEventListener('dark-mode-change', ({ detail }) => {
    console.log('dark:', detail.dark);
  });
```

---

## MSW (Mock Service Worker)

MSW intercepts network requests in both the browser and Node environments without touching any real APIs.

### How it works

| Environment | Setup file | Mechanism |
|---|---|---|
| Browser / Storybook | `src/mocks/browser.ts` | Service worker (`public/mockServiceWorker.js`) |
| Tests (@web/test-runner) | `src/mocks/node.ts` | HTTP interceptors (no service worker) |

### Adding a new mock

Edit `src/mocks/handlers.ts`:

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/your-endpoint', () => {
    return HttpResponse.json({ key: 'value' });
  }),
];
```

The handler is automatically picked up by both the browser worker and the Node server.

### Re-initializing the service worker

If you change the `public/` directory or upgrade MSW, regenerate the worker:

```bash
npm run msw:init
```

Commit the updated `public/mockServiceWorker.js`.

---

## Dark mode

The `<dark-mode-toggle>` component writes `data-theme="dark"` or `data-theme="light"` to `document.documentElement`. Global styles in `index.html` and `.storybook/preview-head.html` use CSS custom properties scoped to `[data-theme="dark"]`.

To add dark-mode support to a new component, use the CSS custom properties:

```css
:host {
  background: var(--color-bg);
  color: var(--color-text);
}
```

CSS custom properties cross shadow DOM boundaries — no JavaScript needed in child components.

---

## Testing

Tests live alongside components: `src/**/*.test.ts`

```bash
npm test           # single run (Chromium headless via Playwright)
npm run test:watch # watch mode
```

MSW is wired up automatically in each test file via the imported `server` from `src/mocks/node.ts`.

---

## CI/CD pipeline

### CI (`ci.yml`) — runs on every push and PR

```
lint → test → build-storybook
           ↘
             sast-checkmarx (runs in parallel)
```

| Job | What it does |
|---|---|
| `lint` | ESLint |
| `test` | @web/test-runner + Playwright Chromium |
| `build-storybook` | Produces `storybook-static/` artifact (7-day retention) |
| `sast-checkmarx` | Checkmarx SAST — fails build on High/Critical findings |

### Staging deploy (`staging-deploy.yml`) — runs on prerelease tags

Triggered by tags matching `v*.*.*-*` (e.g., `v0.1.0-alpha.1`, `v1.0.0-rc.2`).

Steps: lint → test → build → CDN deploy (S3 + CloudFront).

Two CDN paths are updated:
- `/storybook/{version}/` — immutable permalink, 1-year cache
- `/storybook/latest-prerelease/` — alias, 5-min cache, CloudFront invalidated

### Tagging a prerelease

```bash
git tag v0.1.0-alpha.1
git push origin v0.1.0-alpha.1
```

The staging deploy workflow starts automatically.

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `CX_BASE_URI` | Checkmarx One base URL |
| `CX_CLIENT_ID` | Checkmarx OAuth client ID |
| `CX_CLIENT_SECRET` | Checkmarx OAuth client secret |
| `CX_TENANT` | Checkmarx tenant name |
| `AWS_ACCESS_KEY_ID` | AWS IAM key for S3/CloudFront writes |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret |
| `AWS_REGION` | AWS region (e.g., `eu-west-1`) |
| `STAGING_S3_BUCKET` | S3 bucket name for staging |
| `STAGING_CF_DISTRIBUTION` | CloudFront distribution ID |
| `STAGING_BASE_URL` | Public base URL for the CDN (e.g., `https://staging.example.com`) |

---

## Security

### Checkmarx SAST

The CI pipeline runs Checkmarx SAST on every push and blocks merges on **High** or **Critical** findings.

### ESLint rules

The following rules are active to prevent OWASP vulnerabilities:

| Rule | Prevents |
|---|---|
| `no-unsanitized/property` | Raw `innerHTML` / `outerHTML` assignment |
| `no-unsanitized/method` | `insertAdjacentHTML` with unvalidated data |
| `no-eval` / `no-implied-eval` | Code injection |
| `lit/no-template-bind` | XSS via inline event handler strings |
| `lit/no-legacy-template-syntax` | Deprecated template patterns |

### Safe Lit patterns

```ts
// SAFE — Lit html tagged template escapes values
render() { return html`<p>${this.userInput}</p>`; }

// UNSAFE — never do this
render() { this.shadowRoot!.innerHTML = this.userInput; }
```

---

## Project structure

```
corepartydata/
├── .github/
│   └── workflows/
│       ├── ci.yml               # Lint, test, SAST on every push/PR
│       └── staging-deploy.yml   # CDN deploy on prerelease tag
├── .storybook/
│   ├── main.ts                  # Storybook config + addons
│   ├── preview.ts               # MSW initialization
│   └── preview-head.html        # Global dark-mode CSS variables
├── public/
│   └── mockServiceWorker.js     # Generated by MSW — commit this file
├── src/
│   ├── components/
│   │   └── dark-mode-toggle/
│   │       ├── dark-mode-toggle.ts          # Lit component
│   │       ├── dark-mode-toggle.stories.ts  # Storybook stories
│   │       └── dark-mode-toggle.test.ts     # Unit tests
│   ├── mocks/
│   │   ├── browser.ts   # MSW browser worker
│   │   ├── node.ts      # MSW Node server
│   │   └── handlers.ts  # Shared request handlers
│   └── index.ts         # Library entry point
├── .eslintrc.cjs
├── .gitignore
├── .nvmrc
├── index.html           # Vite dev server entry
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── web-test-runner.config.mjs
```

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/).

Prerelease convention: `v{major}.{minor}.{patch}-{label}.{build}`

| Tag | Meaning |
|---|---|
| `v0.1.0-alpha.1` | Early unstable feature work |
| `v0.1.0-beta.1` | Feature-complete, under testing |
| `v0.1.0-rc.1` | Release candidate — no new features |
| `v1.0.0` | Stable release |
