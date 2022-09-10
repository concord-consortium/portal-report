import React from "react";
import AnswersTable from "../../../js/containers/report/answers-table";
import { mountWithStore } from "../../setupTest";

describe("<AnswersTable />", () => {
  const question = {
    id: "q1"
  };
  const hidden = false;
  const showCompare = false;
  const students = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Test Student" }
  ];
  const answers = {};
  const state = {
    report: {
      anonymous: false,
    },
    feedback: {
      questionFeedbacks: {},
      settings: {
        questionSettings: {
          q1: {
            scoreEnabled: true,
            feedbackEnabled: true
          }
        }
      }
    }
  };
  const params = { answers, hidden, showCompare, question, students };

  it("should render student names", () => {
    const wrapper = mountWithStore(<AnswersTable {...params} />, state);
    expect(wrapper.text()).toEqual(expect.stringContaining("John Doe"));
    expect(wrapper.text()).toEqual(expect.stringContaining("Test Student"));
  });

  describe("with a question", () => {
    it("should render <AnswersTable> with Score and Feedback text", () => {
      const wrapper = mountWithStore(<AnswersTable {...params} />, state);
      expect(wrapper.text()).toMatch(/Student/);
      expect(wrapper.text()).toMatch(/Response/);
      expect(wrapper.text()).toMatch(/Score/);
      expect(wrapper.text()).toMatch(/Feedback/);
    });
  });

  describe("With out a question", () => {
    const params = { answers, hidden, showCompare, students };

    it("should render <AnswersTable> without Score or Feedback text", () => {
      const wrapper = mountWithStore(<AnswersTable {...params} />, state);
      expect(wrapper.text()).toMatch(/Student/);
      expect(wrapper.text()).toMatch(/Response/);
      expect(wrapper.text()).not.toMatch(/Score/);
      expect(wrapper.text()).not.toMatch(/Feedback/);
    });
  });
});
