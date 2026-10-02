const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1, // the demo server is slow; one worker avoids load-related flakiness
  retries: 0, // retries are deliberately off so real failures are not hidden
  expect: { timeout: 10000 }, // web-first assertions auto-wait up to 10s
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://demo.ozcart.com',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
