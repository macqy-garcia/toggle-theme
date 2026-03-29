# Checkmarx & Security Guide for `corepartydata`

> Lit web component · light/dark mode toggle · SAST pipeline integration

---

## Table of Contents

1. [What is Checkmarx?](#1-what-is-checkmarx)
2. [How Checkmarx Works in This Pipeline](#2-how-checkmarx-works-in-this-pipeline)
3. [Running Checkmarx Locally](#3-running-checkmarx-locally)
4. [Vulnerability Categories Checkmarx Scans For](#4-vulnerability-categories-checkmarx-scans-for)
5. [What This Project Does to Pass Checkmarx](#5-what-this-project-does-to-pass-checkmarx)
6. [Component-Level Security Rules (dark-mode-toggle)](#6-component-level-security-rules-dark-mode-toggle)
7. [ESLint Rules Aligned to Checkmarx](#7-eslint-rules-aligned-to-checkmarx)
8. [Patterns That Will Fail the Scan](#8-patterns-that-will-fail-the-scan)
9. [Patterns That Pass the Scan](#9-patterns-that-pass-the-scan)
10. [Pipeline Configuration Explained](#10-pipeline-configuration-explained)
11. [Quick Checklist Before You Push](#11-quick-checklist-before-you-push)

---

## 1. What is Checkmarx?

**Checkmarx** is a **Static Application Security Testing (SAST)** tool. It analyzes your source code — without running it — to find security vulnerabilities before the code ever reaches production.

| Term | Meaning |
|------|---------|
| **SAST** | Static Application Security Testing — source-code analysis, no runtime required |
| **DAST** | Dynamic Application Security Testing — tests a running app (different tool) |
| **CxSAST / Checkmarx One** | The Checkmarx product family; this project uses `checkmarx/ast-github-action` |
| **Query** | A built-in rule Checkmarx runs against your code (e.g., "find `innerHTML` assignments fed by user input") |
| **Finding / Result** | A specific line of code flagged by a query |
| **Severity** | Critical → High → Medium → Low → Info |

### Why does it matter?

Checkmarx is commonly required by enterprise organizations and regulated industries (finance, healthcare, government) as a security gate. Your pipeline is configured to **break the build** on `HIGH` or `CRITICAL` findings, meaning a failing Checkmarx scan blocks the merge.

---

## 2. How Checkmarx Works in This Pipeline

The scan runs as a separate GitHub Actions job (`sast-checkmarx`) in parallel with the unit-test job:

```
push / PR
    │
    ├── lint          ──→  ESLint (local, fast, catches many of the same issues)
    ├── test          ──→  Unit tests (after lint passes)
    ├── sast-checkmarx ──→  Checkmarx cloud scan (parallel, independent)
    └── build-storybook ──→  Storybook build (after tests pass)
```

The Checkmarx job (`.github/workflows/ci.yml`):

```yaml
sast-checkmarx:
  name: Checkmarx SAST
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Checkmarx SAST Scan
      uses: checkmarx/ast-github-action@main
      with:
        base_uri: ${{ secrets.CX_BASE_URI }}
        cx_client_id: ${{ secrets.CX_CLIENT_ID }}
        cx_client_secret: ${{ secrets.CX_CLIENT_SECRET }}
        cx_tenant: ${{ secrets.CX_TENANT }}
        project_name: corepartydata
        break_build: true       # ← fails the job on findings
        severity: HIGH          # ← threshold: HIGH and CRITICAL fail the build
        scan_types: sast
        output_name: checkmarx-results
        output_path: results/
```

Results (HTML/JSON/SARIF) are uploaded as a GitHub Actions artifact for every run — including passing runs — so you can always download and inspect them.

---

## 3. Running Checkmarx Locally

Run the scan on your machine before pushing to catch issues without waiting for the CI pipeline.

### Step 1 — Install the Checkmarx One CLI (`cx`)

```bash
# Via Homebrew (recommended)
brew tap checkmarx/ast && brew install cx

# Or download directly (Apple Silicon)
curl -L https://github.com/Checkmarx/ast-cli/releases/latest/download/ast-cli_darwin_arm64.tar.gz -o cx.tar.gz
tar -xzf cx.tar.gz
mv cx /usr/local/bin/cx
```

Verify the install:

```bash
cx version
```

### Step 2 — Authenticate

You need the same credentials stored as GitHub repository secrets. Get them from your DevSecOps / platform engineer if you don't have them.

```bash
cx configure set \
  --base-uri      <CX_BASE_URI>       \
  --client-id     <CX_CLIENT_ID>      \
  --client-secret <CX_CLIENT_SECRET>  \
  --tenant        <CX_TENANT>
```

Or export as environment variables (useful for scripting):

```bash
export CX_BASE_URI=...
export CX_CLIENT_ID=...
export CX_CLIENT_SECRET=...
export CX_TENANT=...
```

### Step 3 — Run the scan

From the project root:

```bash
cd /path/to/corepartydata

cx scan create \
  --project-name corepartydata \
  --scan-types   sast \
  --source       . \
  --output-name  checkmarx-results \
  --output-path  ./results/
```

The CLI will print a `scan-id` when the scan is submitted.

### Step 4 — View results

```bash
# Print a summary to the terminal
cx results show --scan-id <scan-id-from-output>

# Open the full HTML report in the browser
open ./results/checkmarx-results.html
```

### Alternative: ESLint as a fast local pre-check

If you don't have Checkmarx credentials yet, ESLint catches the majority of what Checkmarx would flag because `.eslintrc.cjs` includes all the Checkmarx-aligned rules (`no-unsanitized`, `no-eval`, etc.):

```bash
npm run lint        # check
npm run lint:fix    # auto-fix what can be auto-fixed
```

Run this first — it is instant and requires no credentials. Fix all ESLint errors before running the full Checkmarx scan.

---

## 4. Vulnerability Categories Checkmarx Scans For

These are the OWASP / CWE categories most relevant to a **frontend / Lit component** project:

### Critical / High (build-breaking)

| Category | CWE | What it looks like in JS/TS |
|----------|-----|---------------------------|
| **Cross-Site Scripting (XSS)** | CWE-79 | Assigning untrusted data to `innerHTML`, `outerHTML`, `document.write()` |
| **DOM-Based XSS** | CWE-79 | Reading `location.hash`, `URLSearchParams`, `document.referrer` and writing to DOM |
| **Code Injection / eval** | CWE-95 | Using `eval()`, `new Function()`, `setTimeout(string)` |
| **Open Redirect** | CWE-601 | Assigning untrusted input to `location.href` without validation |
| **Prototype Pollution** | CWE-1321 | Merging objects from untrusted sources without key filtering |

### Medium (will not break this build, but should be fixed)

| Category | CWE | What it looks like |
|----------|-----|-------------------|
| **Insecure Randomness** | CWE-338 | Using `Math.random()` for security-sensitive values |
| **Sensitive Data in Client Storage** | CWE-312 | Storing tokens/PII in `localStorage` / `sessionStorage` |
| **Missing CSP** | CWE-1021 | No `Content-Security-Policy` header configured |
| **Clickjacking** | CWE-1021 | Missing `X-Frame-Options` / `frame-ancestors` CSP directive |

---

## 5. What This Project Does to Pass Checkmarx

The project is intentionally designed with Checkmarx compliance in mind. Here is every decision and why it matters.

### 4.1 Lit's Tagged Template Literals — The Core Protection

Lit's `html` tag is the **single most important** security feature in this project.

```typescript
// SAFE — Lit's html`` tag escapes interpolated values
render() {
  return html`
    <button aria-label=${this.dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      ${this.dark ? '☀️' : '🌙'}
    </button>
  `;
}
```

Lit **automatically escapes** all expressions interpolated into `html` template literals when they are bound as text content or attribute values. This prevents XSS at the framework level.

**What Lit does internally:**
- Text interpolations → `textContent` (safe, never parsed as HTML)
- Attribute interpolations → `setAttribute()` (safe, no HTML parsing)
- Event listeners via `@event` → `addEventListener()` (not string-based)
- Only `unsafeHTML()` directive bypasses this — and we never use it

### 4.2 No `innerHTML`, `outerHTML`, or `document.write()`

The component never assigns raw strings to HTML-parsing sinks:

```typescript
// NEVER in this component:
// someEl.innerHTML = userInput;       ← XSS
// someEl.outerHTML = userInput;       ← XSS
// document.write(userInput);          ← XSS
```

### 4.3 No `eval()` or Dynamic Code Execution

```typescript
// NEVER in this component:
// eval(someString);
// new Function(someString)();
// setTimeout("someString", 100);     ← string form of setTimeout = eval
```

### 4.4 `data-theme` Attribute — Safe DOM Mutation

The component sets a theme attribute on `<html>` using `setAttribute`, not innerHTML:

```typescript
// SAFE — setAttribute does not parse HTML
document.documentElement.setAttribute(
  'data-theme',
  this.dark ? 'dark' : 'light'   // ← only ever one of two hardcoded strings
);
```

The value is **never derived from user input** — it is always the boolean result of `this.dark` mapped to the string `'dark'` or `'light'`.

### 4.5 CustomEvent with Typed Detail — No Prototype Pollution

```typescript
this.dispatchEvent(
  new CustomEvent<{ dark: boolean }>('dark-mode-change', {
    detail: { dark: this.dark },   // ← typed, single-property object
    bubbles: true,
    composed: true,
  })
);
```

The event detail is a new object literal with a single boolean. There is no `Object.assign` or spread from untrusted sources — no prototype pollution vector.

### 4.6 No External Data Sources

The toggle is **purely UI state**. It does not:
- Fetch any URLs
- Read from `localStorage` / `sessionStorage`
- Parse URL parameters (`location.search`, `location.hash`)
- Accept arbitrary string props from outside

Checkmarx traces data flow from **source** (untrusted input) to **sink** (dangerous operation). No external source → no taint flow → no finding.

### 4.7 Shadow DOM Encapsulation

Lit components use Shadow DOM by default. This means:

- Styles are scoped — no CSS injection leaks in or out
- `querySelector` from outside cannot reach internal elements
- The internal button is not accessible to external scripts

---

## 6. Component-Level Security Rules (dark-mode-toggle)

These are the concrete rules to follow when modifying `dark-mode-toggle.ts` or adding new components:

### Rule 1 — Always use Lit's `html` tag for markup

```typescript
// PASS
render() {
  return html`<span>${this.label}</span>`;
}

// FAIL — bypasses Lit's escaping
render() {
  const div = document.createElement('div');
  div.innerHTML = this.label;  // CWE-79 if label comes from outside
  return div;
}
```

### Rule 2 — Never use `unsafeHTML` or `unsafeSVG`

```typescript
// FAIL — forces Checkmarx to flag as potential XSS
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
html`${unsafeHTML(this.content)}`;

// PASS — trust Lit's escaping
html`${this.content}`;
```

If you genuinely need HTML content from a CMS or backend, sanitize it server-side and document why `unsafeHTML` is safe in that specific case.

### Rule 3 — Hardcode or enum all attribute values written to the DOM

```typescript
// PASS — only two possible values, both hardcoded
document.documentElement.setAttribute('data-theme', this.dark ? 'dark' : 'light');

// FAIL — arbitrary string from prop → setAttribute sink
document.documentElement.setAttribute('data-theme', this.theme);  // what if theme = 'dark onmouseover=...'?
```

### Rule 4 — Type all component properties explicitly

```typescript
// PASS — typed boolean, Lit converts attribute to boolean
@property({ type: Boolean, reflect: true })
dark = false;

// WARN — any-typed property loses Checkmarx's ability to prove safety
@property()
config: any;  // @typescript-eslint/no-explicit-any warning
```

### Rule 5 — Bind events with `@event` syntax, not string handlers

```typescript
// PASS — addEventListener at compile time, no string parsing
html`<button @click=${this._toggle}>`;

// FAIL — string-based event handler, flagged by lit/no-template-bind and Checkmarx
html`<button onclick="toggle()">`;
```

### Rule 6 — Never store secrets or tokens in component state

```typescript
// FAIL — PII / credentials in component property = CWE-312
@property() apiKey = '';

// PASS — component only holds UI state
@property({ type: Boolean }) dark = false;
```

---

## 7. ESLint Rules Aligned to Checkmarx

`.eslintrc.cjs` runs these rules on every `npm run lint` and in CI. Fixing ESLint errors locally prevents most Checkmarx findings:

| ESLint Rule | What it catches | Checkmarx CWE |
|-------------|----------------|---------------|
| `no-unsanitized/property` | `el.innerHTML = x`, `el.outerHTML = x` | CWE-79 |
| `no-unsanitized/method` | `document.write(x)`, `insertAdjacentHTML(x)` | CWE-79 |
| `no-eval` | `eval(x)` | CWE-95 |
| `no-implied-eval` | `setTimeout("x")`, `setInterval("x")` | CWE-95 |
| `lit/no-legacy-template-syntax` | `<button on-click="...">` old Polymer syntax | CWE-79 |
| `lit/no-template-bind` | `.bind()` in template — forces new function each render, style issue | Performance |
| `lit/attribute-value-entities` | Unquoted attribute values in html`` | CWE-79 |
| `@typescript-eslint/no-explicit-any` | Untyped `any` — reduces Checkmarx's taint tracking | Various |

Run locally before pushing:

```bash
npm run lint          # check
npm run lint:fix      # auto-fix what can be auto-fixed
```

---

## 8. Patterns That Will Fail the Scan

Avoid these patterns in any component in this project:

```typescript
// ❌ XSS — innerHTML with any dynamic value
element.innerHTML = someVariable;
element.innerHTML = `<span>${userInput}</span>`;

// ❌ XSS — unsafeHTML directive
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
html`${unsafeHTML(this.htmlContent)}`;

// ❌ Code injection
eval(dynamicCode);
new Function('return ' + dynamicCode)();
setTimeout('doSomething()', 1000);   // string form

// ❌ Open redirect
window.location.href = userProvidedUrl;

// ❌ DOM-based XSS from URL
const q = new URLSearchParams(location.search).get('q');
document.getElementById('output').innerHTML = q;   // taint flows from URL to sink

// ❌ Prototype pollution
const config = Object.assign({}, defaultConfig, JSON.parse(userInput));

// ❌ Sensitive data in storage
localStorage.setItem('token', authToken);
```

---

## 9. Patterns That Pass the Scan

```typescript
// ✅ Lit html tag — safe interpolation
render() {
  return html`<span class=${this.theme}>${this.label}</span>`;
}

// ✅ setAttribute with hardcoded/enum value
document.documentElement.setAttribute('data-theme', this.dark ? 'dark' : 'light');

// ✅ CustomEvent with typed, controlled detail
this.dispatchEvent(new CustomEvent<{ dark: boolean }>('dark-mode-change', {
  detail: { dark: this.dark },
  bubbles: true,
  composed: true,
}));

// ✅ Event binding via @event directive
html`<button @click=${this._handleClick}>Click</button>`;

// ✅ Typed properties only
@property({ type: Boolean }) dark = false;
@property({ type: String }) label = 'Toggle';

// ✅ Reading from URL params safely (display only, no DOM write)
const theme = new URLSearchParams(location.search).get('theme');
const safeTheme = theme === 'dark' ? 'dark' : 'light';  // allowlist
document.documentElement.setAttribute('data-theme', safeTheme);
```

---

## 10. Pipeline Configuration Explained

### Secrets Required

Set these in **GitHub → Settings → Secrets → Actions**:

| Secret | Description |
|--------|-------------|
| `CX_BASE_URI` | Your Checkmarx One tenant base URL (e.g., `https://eu.ast.checkmarx.net`) |
| `CX_CLIENT_ID` | OAuth2 client ID from Checkmarx IAM |
| `CX_CLIENT_SECRET` | OAuth2 client secret from Checkmarx IAM |
| `CX_TENANT` | Your Checkmarx tenant name |

### `break_build: true` + `severity: HIGH`

This configuration means:

- **INFO, LOW, MEDIUM** findings → scan reports them, build continues
- **HIGH, CRITICAL** findings → scan fails the job → PR cannot be merged (if branch protection is on)

### Results Artifact

Every run (pass or fail) uploads `checkmarx-results/` as a GitHub Actions artifact, retained for 7 days. Download it to see:
- `checkmarx-results.html` — human-readable report
- `checkmarx-results.json` — machine-readable, useful for custom reporting
- `checkmarx-results.sarif` — SARIF format, can be imported into GitHub Security tab

---

## 11. Quick Checklist Before You Push

Use this before every PR that touches component code:

```
[ ] All dynamic values rendered through Lit's html`` tag (not innerHTML)
[ ] No use of unsafeHTML, unsafeSVG, or unsafeCSS directives
[ ] No eval(), new Function(), or string-form setTimeout/setInterval
[ ] All setAttribute calls use hardcoded/allowlisted values only
[ ] All @property decorators have explicit types (Boolean, String, Number, Array, Object)
[ ] No external data (URL params, localStorage, fetch responses) written to DOM sinks
[ ] npm run lint passes with zero errors
[ ] npm test passes
[ ] No secrets, tokens, or credentials in component state or committed files
[ ] CustomEvent details are typed and contain only controlled values
```

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE-79: Cross-site Scripting](https://cwe.mitre.org/data/definitions/79.html)
- [CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code](https://cwe.mitre.org/data/definitions/95.html)
- [Lit Security FAQ](https://lit.dev/docs/templates/expressions/#security-considerations)
- [Checkmarx AST GitHub Action](https://github.com/Checkmarx/ast-github-action)
- [eslint-plugin-no-unsanitized](https://github.com/mozilla/eslint-plugin-no-unsanitized)
