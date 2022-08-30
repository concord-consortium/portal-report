import React from "react";
import { shallow } from "enzyme";
import { Map } from "immutable";
import { IframeAnswer } from "../../../js/components/report/iframe-answer";

const getReportItemAnswerMock = jest.fn(() => {
    return [
      {
        type: "attachment",
        name: "test_attachment"
      },
      {
        type: "answerText"
      }
    ];
  }
);

const answerText = "testing 123";
const textAnswer = Map([
  ["answer", answerText],
  ["answerText", answerText]
]);
const linkAnswer = Map([
  ["answer", answerText]
]);
const attachmentAnswer = Map([
  ["answer", answerText],
  ["answerText", answerText],
  ["attachments", {
    test_attachment: {
      contentType: "audio/mpeg"
    }
  }]
]);

const question = Map([
  ["questionType", "open_response"],
]);
const attachmentQuestion = Map([
  ["id", 1],
  ["questionType", "open_response"],
  ["audioEnabled", true]
]);

const reportItemAnswer = {
  version: "2.1.0",
  platformUserId: "1",
  items: [
    {type: "attachment", name: "test_attachment"},
    {type: "answerText"}
  ]
};

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
  it("should render a 'Play audio response' button for an answer with an audio attachment", () => {
    const wrapper = shallow(
      <IframeAnswer
        alwaysOpen={false}
        answer={attachmentAnswer}
        answerOrientation="wide"
        getReportItemAnswer={getReportItemAnswerMock}
        reportItemAnswer={reportItemAnswer}
        question={attachmentQuestion}
        responsive={true}
      />
    );
    expect(wrapper.html()).toContain("Play audio response");
  });
});
