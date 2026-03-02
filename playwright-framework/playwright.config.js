// @ts-check

/**
 * Playwright Test Configuration
 * Centralizes browser settings, reporter setup, and global test options.
 * @see https://playwright.dev/docs/test-configuration
 */

const { defineConfig, devices } = require('@playwright/test');

// Load environment variables from .env file (if present)
require('dotenv').config();

module.exports = defineConfig({
  // ─── Test Discovery ──────────────────────────────────────────────────────────
  testDir: './tests',

  // Run all tests in a file in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only is accidentally left in source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests on CI; no retries locally
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI; locally uses all CPU cores
  workers: process.env.CI ? 1 : undefined,

  // ─── Reporters ───────────────────────────────────────────────────────────────
  reporter: [
    // Human-readable output in the terminal
    ['list'],

    // Rich HTML report — open with: npx playwright show-report
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],

    // JUnit XML — useful for CI (Jenkins, GitHub Actions)
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],

  // Global per-test timeout (60 s); covers slow networks and WebKit cold-starts
  timeout: 60_000,

  // ─── Global Test Settings ────────────────────────────────────────────────────
  use: {
    // Base URL for all page.goto() calls that use a relative path
    baseURL: process.env.BASE_URL || 'https://www.wikipedia.org',

    // Capture a screenshot only when a test fails
    screenshot: 'only-on-failure',

    // Record a video only when a test retries (useful for debugging)
    video: 'on-first-retry',

    // Attach a trace on the first retry for post-mortem debugging
    trace: 'on-first-retry',

    // Global navigation timeout (45 s)
    navigationTimeout: 45_000,

    // Global action timeout (20 s — covers full-page screenshots on slow pages)
    actionTimeout: 20_000,
  },

  // ─── Browser Projects ────────────────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        // WebKit on Windows cold-starts slowly; give it more headroom
        navigationTimeout: 60_000,
        actionTimeout: 30_000,
      },
    },

    // Mobile viewports (bonus — comment in to activate)
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'mobile-safari',
    //   use: { ...devices['iPhone 13'] },
    // },
  ],

  // ─── Output Directory ────────────────────────────────────────────────────────
  // Screenshots, videos and traces land here
  outputDir: 'reports/test-results',
});
