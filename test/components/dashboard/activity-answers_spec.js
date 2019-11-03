import React from "react";
import { mount } from "enzyme";
import { fromJS } from "immutable";
import ActivityAnswers from "../../../js/components/dashboard/activity-answers";
import Answer from "../../../js/containers/dashboard/answer";
import ProgressBar from "../../../js/components/dashboard/progress-bar";

import { mountWithStore } from "../../setupTest";

const state = fromJS({
  report: {
    answers: {
      a1 : {
        questionId: "1",
        platformUserId: "studentWithIncorrect",
        type: "multiple_choice_answer",
        answer: {
          choiceIds: [ "incorrectChoice" ]
        }
      },
      a2 : {
        questionId: "1",
        platformUserId: "studentWithCorrect",
        type: "multiple_choice_answer",
        answer: {
          choiceIds: [ "correctChoice" ]
        }
      }
    },
    students: {
      studentWithIncorrect: {},
      studentWithCorrect: {}
    },
    questions: {
      1: {
        choices: [
          { id: "incorrectChoice" },
          { id: "correctChoice", correct: true } ]
      }
    }
  }
});

describe("<ActivityAnswers />", () => {
  it("should render a progress bar when not expanded", () => {
    const activity = fromJS({questions: []});
    const wrapper = mountWithStore(<ActivityAnswers activity={activity} expanded={false} />, state);
    expect(wrapper.find(ProgressBar)).toHaveLength(1);
  });

  it("should render answers when expanded", () => {
    const activity = fromJS({questions: [{id: 1, visible: true}]});
    const expandedQuestions = fromJS({1: true});
    const wrapper = mountWithStore(<ActivityAnswers
      activity={activity} expanded={true} expandedQuestions={expandedQuestions}/>, state);
    expect(wrapper.find(Answer)).toHaveLength(1);
  });

  it("should render 0/1 when expanded with a scored incorrect answer", () => {
    const activity = fromJS({questions: [
      {id: "1", visible: true, type: "multiple_choice", scored: true }
    ]});
    const student = fromJS({id: "studentWithIncorrect"});
    const expandedQuestions = fromJS({1: true});
    const wrapper = mountWithStore(<ActivityAnswers
      activity={activity}
      expanded={true}
      multChoiceSummary={true}
      student={student}
      expandedQuestions={expandedQuestions}/>, state);
    expect(wrapper.find(".multChoiceSummary")).toHaveLength(1);
    expect(wrapper.find(".multChoiceSummary").text()).toBe("0 / 1");
  });

  it("should render 1/1 when expanded with a scored incorrect answer", () => {
    const activity = fromJS({questions: [
      {id: "1", visible: true, type: "multiple_choice", scored: true }
    ]});
    const student = fromJS({id: "studentWithCorrect"});
    const expandedQuestions = fromJS({1: true});
    const wrapper = mountWithStore(<ActivityAnswers
      activity={activity}
      expanded={true}
      multChoiceSummary={true}
      student={student}
      expandedQuestions={expandedQuestions}/>, state);
    expect(wrapper.find(".multChoiceSummary")).toHaveLength(1);
    expect(wrapper.find(".multChoiceSummary").text()).toBe("1 / 1");
  });

});
