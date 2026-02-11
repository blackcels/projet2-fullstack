import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      // Event listeners pour intercepter et mocker les requêtes
      // Vous pouvez ajouter des plugins ici si nécessaire
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
    responseTimeout: 8000,
    // Configuration pour les tests E2E
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    // Autres configurations
    chromeWebSecurity: false,
    experimentalSessionSupport: true,
    retries: {
      runMode: 1,
      openMode: 0
    },
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    allowCypressEnv: false
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack'
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false  // Pas de tests de composants, uniquement E2E
  }
});

