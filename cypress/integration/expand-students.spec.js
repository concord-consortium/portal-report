import React from 'react'
import { getByCypressTag } from '../utils'

describe('Expand Students button', function () {
  let initialHeight = 0
  beforeEach(() => {
    cy.visit('http://localhost:8080/?dashboard=true')
  })

  it ('Expands students after click, and then closes them again', function () {
    getByCypressTag('studentName').first().then((row) => {
      initialHeight = row.height()
      cy.contains('Expand Students').click()
      cy.wait(1000)
      getByCypressTag('studentName').first().invoke('height').should('be.gt', initialHeight)
      getByCypressTag('studentName').last().invoke('height').should('be.gt', initialHeight)
      cy.contains('Close Students').click()
      cy.wait(1000)
      getByCypressTag('studentName').first().invoke('height').should('be.eq', initialHeight)
      getByCypressTag('studentName').last().invoke('height').should('be.eq', initialHeight)
    })
  })
})