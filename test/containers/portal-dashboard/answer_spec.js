import React from "react";
import { shallow } from "enzyme";
import { List, Map } from "immutable";
import Answer from "../../../js/containers/portal-dashboard/answer";
import { interactiveStateHistoryCache } from "../../../js/util/interactive-state-history-cache";
import { answerState } from "../../iframe-test-helpers";

const AnswerPanel = Answer.WrappedComponent;

describe("<Answer /> history selection", () => {
  const question = Map({ id: "q1", type: "iframe_interactive" });
  const makeAnswer = (id, value) => Map({ id, type: "interactive_state", questionId: "q1", answer: answerState(value) });
  let wrapper;
  let slowLoads;
  const panel = () => wrapper.instance();
  const shownAnswer = () => panel().state.answer.get("answer");
  const finishSlowLoads = () => {
    const loads = slowLoads.splice(0);
    expect(loads).toHaveLength(1);
    loads.forEach(finish => finish());
  };

  beforeEach(() => {
    // entries whose id starts with "slow" finish loading only when the test says so
    slowLoads = [];
    jest.spyOn(interactiveStateHistoryCache, "get").mockImplementation((sourceKey, id, callback) => {
      const finish = () => callback(null, { id, type: "interactive_state", answer: answerState(`history ${id}`) });
      if (id.startsWith("slow")) {
        slowLoads.push(finish);
      } else {
        finish();
      }
    });
    wrapper = shallow(
      <AnswerPanel
        student={Map({ id: "s1" })}
        question={question}
        currentAnswer={makeAnswer("answer1", "latest")}
        interactiveStateHistory={List()}
        sourceKey="source"
      />
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("ignores an entry that finishes loading after the teacher has moved on", () => {
    panel().handleSetInteractiveStateHistoryId("slow1");
    panel().handleSetInteractiveStateHistoryId("h2");
    finishSlowLoads();
    expect(shownAnswer()).toBe(answerState("history h2"));

    panel().handleSetInteractiveStateHistoryId("slow2");
    panel().handleSetInteractiveStateHistoryId(undefined);
    finishSlowLoads();
    expect(shownAnswer()).toBe(answerState("latest"));
  });

  it("ignores an entry that finishes loading after the panel moves to another student", () => {
    panel().handleSetInteractiveStateHistoryId("slow1");
    wrapper.setProps({ student: Map({ id: "s2" }), currentAnswer: makeAnswer("answer2", "other student") });
    finishSlowLoads();
    expect(shownAnswer()).toBe(answerState("other student"));
  });
});
