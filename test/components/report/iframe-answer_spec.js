import React from "react";
import { shallow } from "enzyme";
import { render, act } from "@testing-library/react";
import { List, Map } from "immutable";
import iframePhone from "iframe-phone";
import { IframeAnswer } from "../../../js/components/report/iframe-answer";
import { interactiveStateHistoryCache } from "../../../js/util/interactive-state-history-cache";

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

  describe("when the state to show changes", () => {
    const iframeQuestion = Map({ id: "q1", url: "https://interactive.example.com/", displayInIframe: true });
    const answerState = value => JSON.stringify({ interactiveState: JSON.stringify({ value }) });
    const makeAnswer = value => Map({ id: "answer1", type: "interactive_state", questionId: "q1", answer: answerState(value) });
    const renderAnswer = (answer, interactiveStateHistoryId) => (
      <IframeAnswer
        alwaysOpen={true}
        answer={answer}
        answerOrientation="wide"
        getReportItemAnswer={getReportItemAnswerMock}
        question={iframeQuestion}
        responsive={false}
        interactiveStateHistory={List()}
        interactiveStateHistoryId={interactiveStateHistoryId}
        setInteractiveStateHistoryId={jest.fn()}
        sourceKey="source"
      />
    );

    // iframe-phone mock is defined in __mocks__/iframe-phone.ts; it answers the phone after 1ms
    const settle = () => act(() => new Promise(resolve => setTimeout(resolve, 20)));
    const iframeCount = () => iframePhone._parentInstances.length;
    const shownValue = () => {
      const phone = iframePhone._parentInstances[iframeCount() - 1];
      const inits = phone.post.mock.calls.filter(([type]) => type === "initInteractive");
      return inits.length > 0 ? inits[inits.length - 1][1].interactiveState.value : undefined;
    };

    let view;
    let slowLoads;
    const finishSlowLoads = () => {
      const loads = slowLoads.splice(0);
      expect(loads).toHaveLength(1);
      loads.forEach(finish => finish());
    };
    const update = (answer, interactiveStateHistoryId) => {
      view.rerender(renderAnswer(answer, interactiveStateHistoryId));
      return settle();
    };

    beforeEach(() => {
      iframePhone._resetMock();
      // entries whose id starts with "slow" finish loading only when the test says so
      slowLoads = [];
      jest.spyOn(interactiveStateHistoryCache, "get").mockImplementation((sourceKey, id, callback) => {
        const finish = () => callback(null, { answer: answerState(`history ${id}`) });
        if (id.startsWith("slow")) {
          slowLoads.push(finish);
        } else {
          finish();
        }
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("redraws with the new answer's state", async () => {
      view = render(renderAnswer(makeAnswer(1)));
      await settle();
      expect(shownValue()).toBe(1);

      await update(makeAnswer(2));
      expect(iframeCount()).toBe(2);
      expect(shownValue()).toBe(2);
    });

    it("does not redraw when an update leaves the state unchanged", async () => {
      view = render(renderAnswer(makeAnswer(1)));
      await settle();

      await update(makeAnswer(1));
      await update(makeAnswer(1));
      expect(iframeCount()).toBe(1);
    });

    it("follows the scrubber to an entry and back to the latest", async () => {
      view = render(renderAnswer(makeAnswer(2)));
      await settle();

      // the dashboard's answer panel passes the entry's id first and its state as the answer once loaded
      await update(makeAnswer(2), "h1");
      expect(shownValue()).toBe("history h1");
      const iframesOnEntry = iframeCount();
      await update(Map({ id: "answer1", type: "interactive_state", answer: answerState("history h1") }), "h1");
      expect(iframeCount()).toBe(iframesOnEntry);

      await update(makeAnswer(2));
      expect(shownValue()).toBe(2);
    });

    it("ignores an entry that finishes loading after the teacher has moved on", async () => {
      view = render(renderAnswer(makeAnswer(3)));
      await settle();

      await update(makeAnswer(3), "slow1");
      await update(makeAnswer(3), "h2");
      act(() => finishSlowLoads());
      await settle();
      expect(shownValue()).toBe("history h2");

      await update(makeAnswer(3), "slow2");
      await update(makeAnswer(3));
      act(() => finishSlowLoads());
      await settle();
      expect(shownValue()).toBe(3);
    });

  });
});
