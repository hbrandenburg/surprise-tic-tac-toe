const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'mobile-landscape',
      use: { 
        ...devices['iPhone 13 landscape'],
        viewport: { width: 844, height: 390 }
      },
    },
  ],
  webServer: {
    command: 'python3 -m http.server 3000',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});