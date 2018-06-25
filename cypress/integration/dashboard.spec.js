import React from 'react'
import { getByCypressTag } from '../utils'

describe('Dashboard', function () {
  beforeEach(() => {
    cy.visit('http://localhost:8080/?dashboard=true')
  })

  let rowHeight = null
  it ('Has equal height rows', function () {
    getByCypressTag('studentName').should('be.visible').then((students) => {
      Array.from(students).forEach((student) => {
        if (rowHeight == null) {
          rowHeight = student.clientHeight
        }
        expect(student.clientHeight).to.equal(rowHeight)
      })
    })
  })

  let expandedRowHeight = null
  it ('Has equal height rows after a student is clicked', function () {
    getByCypressTag('studentName').click({ multiple: true })
    cy.wait(1000) // Wait for the animations to finish
    getByCypressTag('studentName').should('be.visible').then((students) => {
      Array.from(students).forEach((student) => {
        if (expandedRowHeight == null) {
          expandedRowHeight = student.clientHeight
          expect(expandedRowHeight).to.be.greaterThan(rowHeight)
        }
        expect(student.clientHeight).to.equal(expandedRowHeight)
      })
    })
  })
})