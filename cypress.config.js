const { defineConfig } = require("cypress");

module.exports = defineConfig({
  fixturesFolder: "js/data",
  projectId: "er5qci",
  video: false,
  defaultCommandTimeout: 30000,
  viewportWidth: 1400,
  viewportHeight: 1000,
  // Slow CI machines make some timing-sensitive tests fail now and then.
  retries: {
    runMode: 2,
    openMode: 0
  },
  e2e: {
    baseUrl: "http://localhost:8080",
    specPattern: "cypress/e2e/**/*.spec.js",
    supportFile: "cypress/support/e2e.js",
    // Some test files load the page once and share it across their tests.
    testIsolation: false,
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    }
  }
});
