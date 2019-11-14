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

  it("Has equal height rows after a student is clicked", function() {
    getByCypressTag("studentName").click({ multiple: true });
    // there is an animation that happens here, but because of cypress' automatic retry
    // behavior it will keep running the expectations until they pass
    getByCypressTag("studentName")
      .should("be.visible")
      .and(($students) => {
        let expandedRowHeight = $students[0].clientHeight;
        expect(expandedRowHeight).to.be.greaterThan(rowHeight);

        $students.each((index, student) => {
          expect(student.clientHeight).to.equal(expandedRowHeight);
        });
      });
  });

  function getStudentAnswerRow(studentName) {
    return getByCypressTag("studentName")
      .filter(":contains('" + studentName + "')")
       // this is counting on the [data-cy=studentName] elements to be siblings
       // jQuery's index function looks at the index of the element compared to its siblings
      .invoke("index")
      .then(function(studentIndex){
        getByCypressTag("studentAnswersRow").eq(studentIndex);
      });
  }

  it("Shows 0/1 in the correct column for a user without correct answers", function() {
    // expand the first activity
    getByCypressTag("activityName").eq(0).click();

    getStudentAnswerRow("Jenkins").within((studentAnswersRow) => {
      getByCypressTag("correctCell").should("contain", "0 / 1");
    });

  });

  it("Shows 1/1 in the correct column for a user with correct answers", function() {
    // expand the first activity
    getByCypressTag("activityName").eq(0).click();

    getStudentAnswerRow("Jerome").within((studentAnswersRow) => {
      getByCypressTag("correctCell").should("contain", "1 / 1");
    });

  });
});
