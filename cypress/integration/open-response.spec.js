import React from 'react'

describe('Open response questions', function () {
  beforeEach(() => {
    cy.visit('http://localhost:8080/?dashboard=true')
  })

  it ('Initially show a text icon', function () {
    cy.get('.icomoon-file-text').should('not.exist')
    cy.get('[class*=activityName-]').first().click()
    cy.get('.icomoon-file-text').should('exist')
  })

  it ('Expand to show full answer text', function () {
    cy.contains('open response answer').should('not.exist')
    cy.get('[class*=studentName-]').first().click()
    cy.contains('open response answer').should('exist')
  })
})