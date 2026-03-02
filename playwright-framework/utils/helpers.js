/**
 * helpers.js — Reusable utility functions
 *
 * Keep this file framework-agnostic where possible so utilities can
 * be unit-tested without spinning up a browser.
 */

// ─── String helpers ───────────────────────────────────────────────────────────

/**
 * Converts a search term into the URL slug Wikipedia uses.
 * e.g. "Playwright (software)" → "Playwright_(software)"
 *
 * @param {string} term
 * @returns {string}
 */
function toWikipediaSlug(term) {
  return term.trim().replace(/\s+/g, '_');
}

/**
 * Checks whether `haystack` contains `needle` (case-insensitive).
 *
 * @param {string} haystack
 * @param {string} needle
 * @returns {boolean}
 */
function containsIgnoreCase(haystack, needle) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

// ─── Playwright page helpers ──────────────────────────────────────────────────

/**
 * Waits for the network to be idle, then returns.
 * Useful after actions that trigger background XHR / fetch calls.
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} [timeout=5000]
 */
async function waitForNetworkIdle(page, timeout = 5_000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Scrolls an element into view and highlights it with a brief
 * yellow flash — handy when recording videos for test reports.
 *
 * @param {import('@playwright/test').Locator} locator
 */
async function highlightElement(locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate((el) => {
    const original = el.style.outline;
    el.style.outline = '3px solid gold';
    setTimeout(() => { el.style.outline = original; }, 800);
  });
}

/**
 * Takes a labelled screenshot and attaches it to the Playwright report.
 *
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').TestInfo} testInfo
 * @param {string} label   - Descriptive name for the screenshot
 */
async function attachScreenshot(page, testInfo, label) {
  // Viewport-only screenshot: fullPage is intentionally omitted because WebKit
  // enforces a hard 32 767 px dimension limit that long articles can exceed.
  // A viewport capture is sufficient for report debugging purposes.
  const screenshot = await page.screenshot({ timeout: 30_000 });
  await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
}

/**
 * Generates a random alphanumeric string — useful for creating unique
 * test data (usernames, email addresses, etc.).
 *
 * @param {number} [length=8]
 * @returns {string}
 */
function randomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

module.exports = {
  toWikipediaSlug,
  containsIgnoreCase,
  waitForNetworkIdle,
  highlightElement,
  attachScreenshot,
  randomString,
};
