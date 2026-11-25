// Import commands.js using ES2015 syntax:
// import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// add code coverage support
import "@cypress/code-coverage/support";
import('cypress-commands');

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
