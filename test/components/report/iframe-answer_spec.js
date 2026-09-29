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

  describe("getStandaloneLinkUrl", () => {
    afterEach(() => {
      window.history.replaceState({}, "Test", "/");
    });

    it("keeps the launch and adds the question, student, history and auth-domain", () => {
      window.history.replaceState({}, "Test", "/?class=https://learn.example.org/api/v1/classes/34" +
        "&token=abc&sourceKey=authoring.example.org");
      const wrapper = shallow(
        <IframeAnswer
          alwaysOpen={true}
          answer={textAnswer}
          answerOrientation="wide"
          getReportItemAnswer={getReportItemAnswerMock}
          question={question}
          responsive={true}
          interactiveStateHistoryId="hist-1"
        />
      );
      const link = wrapper.instance().getStandaloneLinkUrl(Map([["id", "mw_interactive_29"]]), Map([["platformUserId", "7"]]));
      const params = new URL(link).searchParams;
      expect(params.get("class")).toBe("https://learn.example.org/api/v1/classes/34");
      expect(params.get("token")).toBe("abc");
      expect(params.get("sourceKey")).toBe("authoring.example.org");
      expect(params.get("interactiveStateHistoryId")).toBe("hist-1");
      expect(params.get("iframeQuestionId")).toBe("mw_interactive_29");
      expect(params.get("studentId")).toBe("7");
      expect(params.get("auth-domain")).toBe("https://learn.example.org");
    });
  });
});
