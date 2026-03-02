/**
 * WikipediaPage.js — Page Object Model for https://www.wikipedia.org
 *
 * Encapsulates all locators and actions for the Wikipedia home page
 * and the article results page.  Tests should never query the DOM
 * directly; they interact exclusively through this class.
 *
 * Design principles:
 *  - One method  = one user action or assertion helper
 *  - Locators are assigned in the constructor as instance properties
 *  - Async methods return `this` where chaining makes sense; sync helpers do not
 */

class WikipediaPage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright Page instance
   */
  constructor(page) {
    this.page = page;

    // ─── Home-page locators ───────────────────────────────────────────────────
    // Using role-based / accessible locators wherever possible (ARIA-friendly)

    /** The search input on the Wikipedia homepage */
    this.searchInput = page.locator('#searchInput');

    /** The magnifying-glass "Search" button on the homepage */
    this.searchButton = page.getByRole('button', { name: 'Search' });

    // ─── Article-page locators ────────────────────────────────────────────────

    /**
     * The main <h1> heading on an article page.
     * Wikipedia renders it inside a <span> inside <h1 id="firstHeading">.
     */
    this.articleHeading = page.locator('#firstHeading');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Navigation
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Navigate to the Wikipedia homepage.
   * Uses the baseURL from playwright.config.js, so no hard-coded URL here.
   */
  async goto() {
    // waitUntil: 'domcontentloaded' is faster and more reliable across all
    // browsers (especially WebKit on Windows, which can stall on 'load' due
    // to slow third-party font/image resources).
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    return this;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Actions
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Core reusable search method.
   *
   * Types `searchTerm` into the search field and submits the query either
   * by pressing Enter (default) or by clicking the Search button.
   *
   * @param {string} searchTerm  - The keyword to search for
   * @param {'enter'|'button'} [submitMethod='enter'] - How to submit
   * @returns {Promise<WikipediaPage>}
   */
  async search(searchTerm, submitMethod = 'enter') {
    // Clear any existing text, then type the new search term
    await this.searchInput.clear();
    await this.searchInput.fill(searchTerm);

    // Snapshot the current URL so we can detect when navigation actually occurs.
    // On WebKit, waitForLoadState('domcontentloaded') can resolve prematurely
    // if the page is already in that state before navigation starts.
    const urlBefore = this.page.url();

    if (submitMethod === 'button') {
      await this.searchButton.click();
    } else {
      // Pressing Enter is the most natural keyboard interaction
      await this.searchInput.press('Enter');
    }

    // Wait until the browser has navigated away from the current page.
    // waitForURL with a predicate is the most reliable cross-browser approach.
    await this.page.waitForURL(
      (url) => url.toString() !== urlBefore,
      { waitUntil: 'domcontentloaded', timeout: 30_000 },
    );
    return this;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Assertion helpers  (return values used in tests with expect())
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Returns the visible text of the article's <h1> heading.
   * @returns {Promise<string>}
   */
  async getArticleHeadingText() {
    return this.articleHeading.innerText();
  }

  /**
   * Returns the current page <title>.
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return this.page.title();
  }

  /**
   * Returns the current page URL.
   * @returns {string}
   */
  getCurrentUrl() {
    return this.page.url();
  }
}

module.exports = { WikipediaPage };
