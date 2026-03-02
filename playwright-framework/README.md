# Playwright Automation Framework

A production-ready, scalable E2E automation framework built with **Playwright Test** and the **Page Object Model (POM)** pattern.

---

## Folder Structure

```
playwright-framework/
├── config/
│   └── env.config.js          # Environment variables & timeout constants
├── pages/
│   └── WikipediaPage.js        # POM — locators + actions for Wikipedia
├── tests/
│   └── wikipedia.spec.js       # Test scenarios (thin — no DOM logic here)
├── utils/
│   helpers.js                  # Reusable utility functions
├── reports/                    # Auto-generated (gitignored)
│   ├── html-report/
│   ├── junit/
│   └── test-results/
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

### Run all tests (headless, all browsers)
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

An **HTML report** is generated automatically after every run.

```bash
# Open the last report in your browser
npm run report
# or
npx playwright show-report reports/html-report
```

A **JUnit XML** report is written to `reports/junit/results.xml` — import this into Jenkins, GitHub Actions, or any CI tool.

---

## Environment Variables

| Variable              | Default                        | Description                         |
|-----------------------|--------------------------------|-------------------------------------|
| `BASE_URL`            | `https://www.wikipedia.org`    | Application base URL                |
| `DEFAULT_SEARCH_TERM` | `Playwright`                   | Article searched in default tests   |
| `NAVIGATION_TIMEOUT`  | `30000`                        | Navigation timeout in ms            |
| `ACTION_TIMEOUT`      | `10000`                        | Action timeout in ms                |
| `ELEMENT_TIMEOUT`     | `5000`                         | Element wait timeout in ms          |
| `CI`                  | `false`                        | Enables retries & single-worker mode|

---

## Extending the Framework

### Add a new page object
1. Create `pages/MyPage.js` following the `WikipediaPage` pattern.
2. Inject the `page` fixture in the constructor.
3. Import and use it in your test file.

### Add a new test file
1. Create `tests/myFeature.spec.js`.
2. Import the relevant page object(s) and utilities.
3. Playwright auto-discovers any `*.spec.js` inside `tests/`.

---

## CI Integration (GitHub Actions example)

```yaml
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
    name: playwright-report
    path: reports/html-report/
```
