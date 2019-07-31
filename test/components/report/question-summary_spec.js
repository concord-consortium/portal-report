import React from "react";
import { renderIntoDocument, findRenderedDOMComponentWithClass } from "react-dom/test-utils";
import { List, Map, fromJS } from "immutable";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import QuestionSummary from "../../../js/components/report/question-summary";

const mockStore = configureStore();

describe("<QuestionSummary />", () => {
  const prompt = "Why is the sky blue?";
  const answers = fromJS([
    {type: "multiple_choice"},
    {type: "open_response"}
  ]);
  const students = fromJS({
    "test1@student": {},
    "test2@student": {},
    "test3@student": {}
  });
  const question = Map({
    prompt: prompt,
    answers: answers
  });

  it("should have the specified prompt", () => {
    const component = renderIntoDocument(
      <Provider store={mockStore(fromJS({feedback: {questionFeedbacks: {}, settings: {}}}))}>
        <QuestionSummary question={question} answers={List()} students={students} />
      </Provider>
    );
    const promptComp = findRenderedDOMComponentWithClass(component, "prompt");
    expect(promptComp.textContent).toBe(prompt);
  });

  it("should have a summary of answered questions", () => {
    const component = renderIntoDocument(
      <Provider store={mockStore(fromJS({feedback: {questionFeedbacks: {}, settings: {}}}))}>
        <QuestionSummary question={question} answers={question.get("answers")} students={students} />
      </Provider>
    );
    const statsComp = findRenderedDOMComponentWithClass(component, "stats");
    expect(statsComp.textContent).toEqual(expect.stringContaining("Not answered: 1"));
  });
});
