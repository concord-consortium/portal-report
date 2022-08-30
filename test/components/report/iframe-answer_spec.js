import React from "react";
import { shallow } from "enzyme";
import { Map } from "immutable";
import { IframeAnswer } from "../../../js/components/report/iframe-answer";

const getReportItemAnswerMock = jest.fn();

const answerText = "testing 123";
const textAnswer = Map([
  ["answer", answerText],
  ["answerText", answerText]
]);
const linkAnswer = Map([
  ["answer", answerText]
]);
const question = Map([
  ["questionType", "open_response"]
]);

describe("<IframeAnswer />", () => {
  it("should render answerText", () => {
    const wrapper = shallow(
      <IframeAnswer
        alwaysOpen={true}
        answer={textAnswer}
        answerOrientation="wide"
        getReportItemAnswer={getReportItemAnswerMock}
        question={question}
        responsive={true}
      />
    );
    expect(wrapper.find(".iframe-answer-header").text()).toContain(answerText);
  });
  it("should render a link for an answer with no answerText", () => {
    const wrapper = shallow(
      <IframeAnswer
        alwaysOpen={false}
        answer={linkAnswer}
        answerOrientation="wide"
        getReportItemAnswer={getReportItemAnswerMock}
        question={question}
        responsive={true}
      />
    );
    expect(wrapper.find(".iframe-answer-header").html()).toContain("View work in new tab");
  });
});
