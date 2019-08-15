module.exports = {

  // CSS modules randomize class names, so it is safest to select with explicit data-* attributes
  // https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
  getByCypressTag: function ( cypressTag ) {
    return cy.get(`[data-cy=${cypressTag}]`)
}

};