# Playwright Automation Framework

A production-ready, scalable E2E automation framework built with **Playwright Test** and the **Page Object Model (POM)** pattern. Verified green across **Chromium, Firefox, and WebKit** (15/15 tests).

---

## Folder Structure

```
playwright-framework/
├── config/
│   └── env.config.js           # Environment variables & timeout constants
├── pages/
│   └── WikipediaPage.js        # POM — locators + actions for Wikipedia
├── tests/
│   └── wikipedia.spec.js       # Test scenarios (thin — no DOM logic here)
├── utils/
│   └── helpers.js              # Reusable utility functions
├── reports/                    # Auto-generated (gitignored)
│   ├── html-report/            # Rich visual report (npx playwright show-report)
│   ├── junit/                  # JUnit XML for CI dashboards
│   └── test-results/           # Screenshots, videos, traces
├── .env.example                # Copy to .env and fill in values
├── .gitignore
├── playwright.config.js        # Central Playwright configuration
└── package.json
```

---

## Prerequisites

| Tool    | Minimum version |
|---------|----------------|
| Node.js | 18 LTS          |
| npm     | 9+              |

---

## Installation

```bash
# 1. Clone / download the repository
cd playwright-framework

# 2. Install Node dependencies
npm install

# 3. Install Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install

# 4. (Optional) Set up environment variables
cp .env.example .env
# Edit .env as needed
```

---

## Running Tests

### Run all tests — headless, all browsers (default)
```bash
npm test
```

### Run in headed mode (browser window visible)
```bash
npm run test:headed
```

### Run in headless mode (explicit)
```bash
npm run test:headless
```

### Run on a specific browser
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Run only the Wikipedia suite
```bash
npm run test:wikipedia
```

### Run in debug mode (step through actions)
```bash
npm run test:debug
```

### Open the interactive Playwright UI
```bash
npm run test:ui
```

---

## Reports

Three reporters run simultaneously on every execution:

| Reporter | Output | Purpose |
|----------|--------|---------|
| `list`   | Terminal | Human-readable pass/fail output |
| `html`   | `reports/html-report/` | Rich visual report with screenshots and traces |
| `junit`  | `reports/junit/results.xml` | CI integration (Jenkins, GitHub Actions) |

```bash
# Open the HTML report after a run
npm run report
# or
npx playwright show-report reports/html-report
```

On failure, Playwright automatically captures:
- **Screenshot** — saved to `reports/test-results/`
- **Video** — recorded on the first retry
- **Trace** — attached on the first retry (open with `npx playwright show-trace`)

---

## Test Suite

All tests live in `tests/wikipedia.spec.js` and target `https://www.wikipedia.org`.

| Test ID | Description | Assertions |
|---------|-------------|------------|
| **TC-01** | Search via **Enter key** | Page title, `<h1>` heading, URL slug |
| **TC-02** | Search via **Search button** | Page title (regex), heading visible + text, URL (regex) |
| **TC-03** | Homepage smoke test | Search input visible & enabled, page title matches Wikipedia |
| **TC-04** | Data-driven search loop (`JavaScript`, `Automation testing`) | URL changed, heading visible, URL matches keyword pattern |

**Results (last run): 15/15 passed in ~30 s across Chromium, Firefox, WebKit.**

---

## Architecture

### Page Object Model (`pages/WikipediaPage.js`)

All DOM interaction is encapsulated here. Tests never query the DOM directly.

```
WikipediaPage
├── constructor(page)         — assigns locators as instance properties
│   ├── searchInput           — #searchInput (homepage)
│   ├── searchButton          — role="button" name="Search" (homepage)
│   └── articleHeading        — #firstHeading (article page)
├── goto()                    — navigates to baseURL with domcontentloaded
├── search(term, method)      — fills input, submits, waits for URL change
├── getArticleHeadingText()   — returns <h1> inner text
├── getPageTitle()            — returns document <title>
└── getCurrentUrl()           — returns current page URL (sync)
```

### Key design decisions

| Decision | Reason |
|----------|--------|
| `waitUntil: 'domcontentloaded'` in `goto()` | Avoids stalling on slow third-party font/image CDNs, especially on WebKit/Windows |
| `waitForURL(url => url !== urlBefore)` in `search()` | `waitForLoadState('domcontentloaded')` resolves immediately if the page is already loaded; this predicate guarantees navigation actually occurred |
| Role-based locators (`getByRole`) | Resilient to CSS/class changes; aligned with accessibility best practices |
| `expect.soft()` for TC-04 URL slug | Wikipedia may redirect to a related article; soft assertion lets the test continue and report the discrepancy without hard-failing |
| Viewport-only screenshot (no `fullPage`) | WebKit enforces a hard 32,767 px dimension limit that long articles exceed |

### Utilities (`utils/helpers.js`)

| Function | Description |
|----------|-------------|
| `attachScreenshot(page, testInfo, label)` | Captures a viewport screenshot and attaches it to the HTML report |
| `toWikipediaSlug(term)` | Converts `"Playwright (software)"` → `"Playwright_(software)"` |
| `containsIgnoreCase(haystack, needle)` | Case-insensitive string contains check |
| `waitForNetworkIdle(page, timeout)` | Waits for network idle state |
| `highlightElement(locator)` | Gold outline flash for video recordings |
| `randomString(length)` | Generates unique test data strings |

---

## Timeout Configuration

| Setting | Value | Scope |
|---------|-------|-------|
| Test timeout | 60 s | All browsers |
| Navigation timeout | 45 s | Chromium, Firefox |
| Action timeout | 20 s | Chromium, Firefox |
| Navigation timeout | 60 s | WebKit (override) |
| Action timeout | 30 s | WebKit (override) |

> WebKit on Windows cold-starts significantly slower than Chromium/Firefox and requires higher timeouts.

---

## Environment Variables

Copy `.env.example` to `.env` and override values as needed.

| Variable              | Default                     | Description                          |
|-----------------------|-----------------------------|--------------------------------------|
| `BASE_URL`            | `https://www.wikipedia.org` | Application base URL                 |
| `DEFAULT_SEARCH_TERM` | `Playwright`                | Article searched in TC-01 / TC-02    |
| `NAVIGATION_TIMEOUT`  | `30000`                     | Navigation timeout in ms (env layer) |
| `ACTION_TIMEOUT`      | `10000`                     | Action timeout in ms (env layer)     |
| `ELEMENT_TIMEOUT`     | `5000`                      | Element wait timeout in ms           |
| `CI`                  | `false`                     | Enables retries & single-worker mode |

---

## Extending the Framework

### Add a new page object
1. Create `pages/MyPage.js` following the `WikipediaPage` pattern.
2. Accept `page` in the constructor and assign locators as instance properties.
3. Import and instantiate it inside the test's `beforeEach`.

### Add a new test file
1. Create `tests/myFeature.spec.js`.
2. Import the relevant page object(s) and utilities.
3. Playwright auto-discovers any `*.spec.js` file inside `tests/`.

### Add a new browser project
Uncomment the mobile presets in `playwright.config.js`:
```js
// {
//   name: 'mobile-chrome',
//   use: { ...devices['Pixel 5'] },
// },
// {
//   name: 'mobile-safari',
//   use: { ...devices['iPhone 13'] },
// },
```

---

## CI Integration (GitHub Actions)

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npm test
        env:
          CI: true
          BASE_URL: ${{ secrets.BASE_URL }}

      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-html-report
          path: reports/html-report/
          retention-days: 30

      - name: Upload JUnit results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-junit
          path: reports/junit/results.xml
```
