Cypress doesn't support network mocking of window.fetch.
This seems to be the best work around:
https://github.com/cypress-io/cypress/issues/95#issuecomment-347607198

Cypress also doesn't support iframes very well. There are work arounds for this. To work with cross domain iframes it is necessary to disable browser security.
