/**
 * wikipedia.spec.js
 *
 * End-to-end tests for the Wikipedia homepage search flow.
 *
 * What is covered:
 *  ✔  Page title contains the searched keyword
 *  ✔  The article <h1> heading matches the searched keyword
 *  ✔  The URL contains the searched keyword
 *
 * The test file is intentionally kept thin — all DOM interaction
 * lives inside WikipediaPage; only assertions and orchestration
 * belong here.
 */

const { test, expect } = require('@playwright/test');
const { WikipediaPage }  = require('../pages/WikipediaPage');
const { attachScreenshot, toWikipediaSlug } = require('../utils/helpers');
const ENV = require('../config/env.config');

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe('Wikipedia Search', () => {
  /** @type {WikipediaPage} */
  let wikiPage;

  // Runs before every test in this describe block
  test.beforeEach(async ({ page }) => {
    wikiPage = new WikipediaPage(page);
    await wikiPage.goto();
  });

  // ─── TC-01: Search via Enter key ───────────────────────────────────────────

  test('TC-01 | Search for an article using the Enter key', async ({ page }, testInfo) => {
    const searchTerm = ENV.DEFAULT_SEARCH_TERM; // "Playwright"

    // ── Act ────────────────────────────────────────────────────────────────
    await wikiPage.search(searchTerm, 'enter');

    // ── Screenshot (attached to HTML report) ───────────────────────────────
    await attachScreenshot(page, testInfo, `After search: ${searchTerm}`);

    // ── Assert: Page title ─────────────────────────────────────────────────
    const pageTitle = await wikiPage.getPageTitle();
    expect(pageTitle, 'Page title should contain the search term').toContain(searchTerm);

    // ── Assert: Article heading ────────────────────────────────────────────
    const headingText = await wikiPage.getArticleHeadingText();
    expect(headingText.trim(), 'Article <h1> should match or include the search term')
      .toContain(searchTerm);

    // ── Assert: URL ────────────────────────────────────────────────────────
    const currentUrl = wikiPage.getCurrentUrl();
    expect(currentUrl, 'URL should contain the Wikipedia slug for the search term')
      .toContain(toWikipediaSlug(searchTerm));
  });

  // ─── TC-02: Search via Search button ───────────────────────────────────────

  test('TC-02 | Search for an article using the Search button', async ({ page }, testInfo) => {
    const searchTerm = ENV.DEFAULT_SEARCH_TERM;

    // ── Act ────────────────────────────────────────────────────────────────
    await wikiPage.search(searchTerm, 'button');

    await attachScreenshot(page, testInfo, `Button search: ${searchTerm}`);

    // ── Assert: Page title ─────────────────────────────────────────────────
    await expect(page, 'Page title should contain the search term')
      .toHaveTitle(new RegExp(searchTerm, 'i'));

    // ── Assert: Article heading visible ────────────────────────────────────
    await expect(wikiPage.articleHeading, '<h1> heading should be visible on the page')
      .toBeVisible();

    // ── Assert: Heading text ───────────────────────────────────────────────
    await expect(wikiPage.articleHeading, 'Article heading should include search term')
      .toContainText(searchTerm);

    // ── Assert: URL ────────────────────────────────────────────────────────
    await expect(page, 'URL should contain the Wikipedia slug')
      .toHaveURL(new RegExp(toWikipediaSlug(searchTerm), 'i'));
  });

  // ─── TC-03: Homepage loads correctly ───────────────────────────────────────

  test('TC-03 | Wikipedia homepage loads and search input is present', async ({ page }) => {
    // ── Assert: Search input is ready ──────────────────────────────────────
    await expect(wikiPage.searchInput, 'Search input should be visible').toBeVisible();
    await expect(wikiPage.searchInput, 'Search input should be enabled').toBeEnabled();

    // ── Assert: Page has the correct title ─────────────────────────────────
    await expect(page, 'Homepage title should identify Wikipedia')
      .toHaveTitle(/Wikipedia/i);
  });

  // ─── TC-04: Custom search term (data-driven example) ───────────────────────

  const articles = [
    { keyword: 'JavaScript', pattern: /JavaScript/i },
    // Wikipedia may redirect to /wiki/Test_automation OR /wiki/Automation_testing
    // depending on the browser — both match /automation/i.
    { keyword: 'Automation testing', pattern: /automation/i },
  ];

  for (const { keyword, pattern } of articles) {
    test(`TC-04 | Search for "${keyword}" and verify navigation`, async ({ page }, testInfo) => {
      // ── Act ──────────────────────────────────────────────────────────────
      await wikiPage.search(keyword, 'enter');

      await attachScreenshot(page, testInfo, `Search: ${keyword}`);

      // ── Assert: URL navigated away from homepage ──────────────────────────
      const currentUrl = wikiPage.getCurrentUrl();
      expect(currentUrl, `URL should change after searching for "${keyword}"`)
        .not.toBe(ENV.BASE_URL);

      // ── Assert: Article heading is visible ────────────────────────────────
      await expect(wikiPage.articleHeading, 'A heading should appear on the result page')
        .toBeVisible();

      // ── Soft assertion: URL matches expected pattern (case-insensitive) ───
      // Soft so the test continues even if Wikipedia redirects to a
      // related article or disambiguation page.
      expect.soft(currentUrl, `URL ideally matches pattern for "${keyword}"`)
        .toMatch(pattern);
    });
  }
});
