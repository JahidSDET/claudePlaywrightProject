/**
 * env.config.js
 *
 * Centralises all environment-level configuration.
 * Values are read from process.env so the same code works
 * locally (via .env) and in CI (via pipeline variables).
 *
 * Usage:
 *   const { BASE_URL, TIMEOUT } = require('../config/env.config');
 */

require('dotenv').config();

const ENV = {
  // Base URL for the application under test
  BASE_URL: process.env.BASE_URL || 'https://www.wikipedia.org',

  // Default article to search when no keyword is passed
  DEFAULT_SEARCH_TERM: process.env.DEFAULT_SEARCH_TERM || 'Playwright',

  // Global timeouts (in milliseconds)
  TIMEOUT: {
    navigation: parseInt(process.env.NAVIGATION_TIMEOUT, 10) || 30_000,
    action:     parseInt(process.env.ACTION_TIMEOUT, 10)     || 10_000,
    element:    parseInt(process.env.ELEMENT_TIMEOUT, 10)    || 5_000,
  },

  // Whether the suite runs in a CI pipeline
  IS_CI: process.env.CI === 'true',
};

module.exports = ENV;
