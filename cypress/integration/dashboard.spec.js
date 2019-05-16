/* global describe, it, beforeEach, cy, expect */
/* eslint-disable-next-line */
import React from "react";
import { getByCypressTag } from "../utils";

describe("Dashboard", function() {
  beforeEach(() => {
    cy.visit("/?dashboard=true");
  });

  it("Renders cells in a row with the same height", function() {
    getByCypressTag("studentName").each((student, i) => {
      getByCypressTag("studentAnswersRow").eq(i).within((studentAnswersRow) => {
        getByCypressTag("activityAnswers").each((answerCell) => {
          expect(answerCell.height()).to.equal(student.height());
        });
      });
    });
  });

  it("Renders cells in a column with the same width", function() {
    getByCypressTag("activityName").each((activity, i) => {
      getByCypressTag("studentAnswersRow").each((studentAnswersRow) => {
        cy.wrap(studentAnswersRow).within((studentAnswersRow) => {
          getByCypressTag("activityAnswers").eq(i).invoke("width").should("eq", activity.width());
        });
      });
    });
  });

  let rowHeight = null;
  it("Has equal height rows", function() {
    getByCypressTag("studentName").should("be.visible").then((students) => {
      Array.from(students).forEach((student) => {
        if (rowHeight == null) {
          rowHeight = student.clientHeight;
        }
        expect(student.clientHeight).to.equal(rowHeight);
      });
    });
  });

  let expandedRowHeight = null;
  it("Has equal height rows after a student is clicked", function() {
    getByCypressTag("studentName").click({ multiple: true });
    cy.wait(1000); // Wait for the animations to finish
    getByCypressTag("studentName").should("be.visible").then((students) => {
      Array.from(students).forEach((student) => {
        if (expandedRowHeight == null) {
          expandedRowHeight = student.clientHeight;
          expect(expandedRowHeight).to.be.greaterThan(rowHeight);
        }
        expect(student.clientHeight).to.equal(expandedRowHeight);
      });
    });
  });
});
