export default {
  testDir: './tests/browser', timeout: 30000, fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:5173', browserName: 'chromium', headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHANNEL ? {channel: process.env.PLAYWRIGHT_CHANNEL} : {} },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI, timeout: 15000 },
  reporter: [['list'], ['json',{outputFile:'reports/logs/playwright-results.json'}]]
};
