// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// The plugins file runs in Node as CommonJS.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  require('@cypress/code-coverage/task')(on, config);

  on("task", {
    // Removes a file if it exists, so a test can wait for a fresh download with the same name.
    deleteFile(path) {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
      return null;
    }
  });

  return config;
};
