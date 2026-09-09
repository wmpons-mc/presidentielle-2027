import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',fullyParallel:false,workers:1,
  use:{baseURL:'http://127.0.0.1:4173',browserName:'chromium',channel:process.env.PLAYWRIGHT_CHANNEL === 'chrome' ? 'chrome' : undefined},
  webServer:{command:'node scripts/serve-test-site.ts',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:15_000},
});
