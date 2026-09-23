// playwright.config.js
// Uses the Chrome browser already installed on this machine (channel: 'chrome')
// instead of downloading Playwright's own bundled Chromium — avoids the
// network/firewall download issue from last time.

module.exports = {
  testDir: './tests',
  timeout: 30000,
  use: {
    channel: 'chrome',
    headless: true,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
};
