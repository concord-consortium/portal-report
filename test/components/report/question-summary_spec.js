import React from "react";
import { render } from "@testing-library/react";
import { List, Map, fromJS } from "immutable";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import QuestionSummary from "../../../js/components/report/question-summary";

const mockStore = configureStore();

describe("<QuestionSummary />", () => {
  const prompt = "Why is the sky blue?";
  const answers = fromJS([
    {type: "multiple_choice", answer: "test"},
    {type: "open_response", answer: "test"}
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
    const { getByText } = render(
      <Provider store={mockStore(fromJS({feedback: {questionFeedbacks: {}, settings: {}}}))}>
        <QuestionSummary question={question} answers={List()} students={students} />
      </Provider>
    );
    expect(getByText(prompt)).toBeDefined();
  });

  it("should have a summary of answered questions", () => {
    const { container, getByText } = render(
      <Provider store={mockStore(fromJS({feedback: {questionFeedbacks: {}, settings: {}}}))}>
        <QuestionSummary question={question} answers={question.get("answers")} students={students} />
      </Provider>
    );
    const statsElt = container.querySelector(".stats");
    expect(statsElt).toBeDefined();
    expect(getByText((content, element) => {
      // need to check textContent in function: <div><strong>Not answered: </strong>1</div>
      return element.textContent === "Not answered: 1";
    })).toBeDefined();
  });
});
