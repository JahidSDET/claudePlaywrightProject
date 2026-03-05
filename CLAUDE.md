# CLAUDE.md

## Project Overview

Playwright automation framework using the Page Object Model (POM) pattern. Tests are located in the `playwright-framework/` subdirectory.

## Structure

```
playwright-framework/
  config/
    env.config.js       # Centralised env config (reads from .env or CI vars)
  .env.example          # Template for local environment variables
  package.json
```

## Commands

All commands must be run from inside `playwright-framework/`:

```bash
cd playwright-framework

npm test                        # Run all tests (headless)
npm run test:headed             # Run with browser visible
npm run test:chromium           # Chromium only
npm run test:firefox            # Firefox only
npm run test:webkit             # WebKit only
npm run test:debug              # Debug mode
npm run test:ui                 # Playwright UI mode
npm run test:wikipedia          # Wikipedia-specific spec
npm run report                  # Open HTML report
```

## Environment Configuration

Copy `.env.example` to `.env` and set values:

| Variable             | Default                      | Description                        |
|----------------------|------------------------------|------------------------------------|
| `BASE_URL`           | `https://www.wikipedia.org`  | Application under test             |
| `DEFAULT_SEARCH_TERM`| `Playwright`                 | Fallback search keyword            |
| `NAVIGATION_TIMEOUT` | `30000`                      | Navigation timeout (ms)            |
| `ACTION_TIMEOUT`     | `10000`                      | Action timeout (ms)                |
| `ELEMENT_TIMEOUT`    | `5000`                       | Element timeout (ms)               |
| `CI`                 | `false`                      | Set to `true` in CI pipelines      |

## Conventions

- Framework: `@playwright/test` v1.42+
- Pattern: Page Object Model (POM)
- Config centralised in `config/env.config.js` — import from there, not directly from `process.env`
- `.env` is gitignored; use `.env.example` as the source of truth for required variables
