import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://d1iioxb0yhodky.cloudfront.net',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
  },
});
