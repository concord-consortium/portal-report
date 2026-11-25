const { defineConfig } = require("cypress");

module.exports = defineConfig({
  fixturesFolder: "js/data",
  projectId: "er5qci",
  video: false,
  defaultCommandTimeout: 30000,
  viewportWidth: 1400,
  viewportHeight: 1000,
  // Slow CI machines make some timing-sensitive tests fail now and then.
  // `cypress run` retries a failed test up to 2 times. `cypress open` does not retry.
  retries: {
    runMode: 2,
    openMode: 0
  },
  e2e: {
    baseUrl: "http://localhost:8080",
    specPattern: "cypress/e2e/**/*.spec.js",
    supportFile: "cypress/support/e2e.js",
    // 13 test files load the page once and share it across their tests. A separate story will rewrite them.
    testIsolation: false,
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    }
  }
});
