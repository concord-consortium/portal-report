/* global describe, it, beforeEach, cy */
/* eslint-disable-next-line */
import React from 'react'
import fakeData from '../../js/data/report.json'
import sampleRubric from '../../public/sample-rubric'

describe('Provide Feedback', function () {
  beforeEach(() => {
    // cypress currently doesn't handle window.fetch so:
    // diable browser's fetch this way the fetch polyfill is used which uses XHR
    cy.on('window:before:load', win => {
      win.fetch = null
    })

    cy.server()

    // Return the fake report data
    cy.route({
      method: 'GET',
      url: '/',
      response: fakeData
    })

    // Fake report data references sample-rubric.json file, so it has to be stubbed too
    cy.route({
      method: 'GET',
      url: '/sample-rubric.json',
      response: sampleRubric
    })

    // On first load portal-report does a PUT request to save some report settings
    cy.route({
      method: 'PUT',
      url: '/',
      response: {}
    })

    let fakeServer = 'http://portal.test'
    cy.visit(`http://localhost:8080/?reportUrl=${encodeURIComponent(fakeServer)}`)
  })

  it('Is visible', function () {
    cy.get('.question [data-cy=feedbackButton]').should('be.visible')
  })

  it('Shows dialog when clicked', function () {
    cy.get('.question [data-cy=feedbackButton]').first().click()
    // do I need to wait here?
    cy.get('[data-cy=feedbackBox]').should('be.visible')
  })
})
