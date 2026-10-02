import React from "react";
import { render, act } from "@testing-library/react";
import { Map, List, fromJS } from "immutable";
import iframePhone from "iframe-phone";
import IframeStandaloneApp from "../../../js/containers/report/iframe-standalone-app";
import { interactiveStateHistoryCache } from "../../../js/util/interactive-state-history-cache";
import { localDateTime } from "../../../js/util/datetime";
import { answerState, settle, iframeCount, shownValue, focusedElement } from "../../iframe-test-helpers";

const App = IframeStandaloneApp.WrappedComponent;

const report = Map({ questions: Map({ q1: Map({ id: "q1", url: "https://interactive.example.com/" }) }) });
const makeAnswer = (historyId, value) => Map({
  id: "answer1", type: "interactive_state", questionId: "q1", platformUserId: "s1",
  interactiveStateHistoryId: historyId, answer: answerState(value)
});
const otherQuestionAnswer = Map({ id: "answer2", type: "interactive_state", questionId: "q2", platformUserId: "s1", answer: "{}" });
// an hour apart, so each entry's time renders differently in the scrubber
const createdAtSeconds = index => 1000000 + index * 3600;
const makeHistories = ids => List(ids.map((id, index) =>
  fromJS({ id, questionId: "q1", platformUserId: "s1", createdAt: { seconds: createdAtSeconds(index) } })
));
const makeProps = (answer, histories, otherAnswer = otherQuestionAnswer) => ({
  fetchAndObserveData: jest.fn(), report, isFetching: false, error: null, sourceKey: "source",
  answers: Map({ answer1: answer, answer2: otherAnswer }), interactiveStateHistories: histories
});

describe("<IframeStandaloneApp /> when a new state arrives", () => {
  let app;
  let view;
  const expectScrubberOn = index => {
    const { date, time } = localDateTime(new Date(createdAtSeconds(index) * 1000));
    expect(view.container.querySelector("input[type='range']").value).toBe(String(index));
    expect(view.container.querySelector(".rangeDatetime").textContent).toBe(`${date}${time}`);
  };
  // The answer lookup runs in UNSAFE_componentWillReceiveProps, so the first props are sent twice.
  const open = props => {
    view = render(<App ref={ref => app = ref} {...props} />);
    view.rerender(<App ref={ref => app = ref} {...props} />);
    return settle();
  };
  const update = props => {
    view.rerender(<App ref={ref => app = ref} {...props} />);
    return settle();
  };

  beforeEach(() => {
    iframePhone._resetMock();
    jest.spyOn(interactiveStateHistoryCache, "get").mockImplementation((sourceKey, id, callback) =>
      callback(null, makeAnswer(id, `history ${id}`).toJS())
    );
    window.history.replaceState({}, "Test", "/?iframeQuestionId=q1&studentId=s1");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("redraws the latest view for each new save, whichever snapshot arrives first", async () => {
    await open(makeProps(makeAnswer("h1", 1), makeHistories(["h1"])));
    expect(iframeCount()).toBe(1);
    expect(shownValue()).toBe(1);

    await update(makeProps(makeAnswer("h1", 1), makeHistories(["h1", "h2"])));
    expect(iframeCount()).toBe(1);
    await update(makeProps(makeAnswer("h2", 2), makeHistories(["h1", "h2"])));
    expect(iframeCount()).toBe(2);
    expect(shownValue()).toBe(2);
    expectScrubberOn(1);

    await update(makeProps(makeAnswer("h3", 3), makeHistories(["h1", "h2"])));
    expect(iframeCount()).toBe(3);
    expect(shownValue()).toBe(3);
    await update(makeProps(makeAnswer("h3", 3), makeHistories(["h1", "h2", "h3"])));
    expect(iframeCount()).toBe(3);
    expectScrubberOn(2);
  });

  it("does not redraw when the shown answer's state is unchanged", async () => {
    await open(makeProps(makeAnswer("h1", 1), makeHistories(["h1"])));

    await update(makeProps(makeAnswer("h1", 1), makeHistories(["h1"]), otherQuestionAnswer.set("answer", "{\"x\":1}")));
    // a touch re-saves the same state under a new history entry
    await update(makeProps(makeAnswer("h2", 1), makeHistories(["h1", "h2"])));

    expect(iframeCount()).toBe(1);
  });

  it("redraws when the activity does not save history", async () => {
    await open(makeProps(makeAnswer(undefined, 1), List()));
    await update(makeProps(makeAnswer(undefined, 2), List()));

    expect(iframeCount()).toBe(2);
    expect(shownValue()).toBe(2);
  });

  it("leaves a selected older entry alone until the teacher returns to the latest", async () => {
    await open(makeProps(makeAnswer("h2", 2), makeHistories(["h1", "h2"])));
    act(() => app.handleSetInteractiveStateHistoryId("h1"));
    await settle();
    const iframesWhileSelected = iframeCount();
    expect(shownValue()).toBe("history h1");

    await update(makeProps(makeAnswer("h3", 3), makeHistories(["h1", "h2", "h3"])));
    expect(iframeCount()).toBe(iframesWhileSelected);
    expect(app.state.answer.get("interactiveStateHistoryId")).toBe("h1");
    expectScrubberOn(0);
    expect(view.container.querySelector("input[type='range']").max).toBe("2");

    act(() => app.handleSetInteractiveStateHistoryId(undefined));
    await settle();
    expect(shownValue()).toBe(3);
  });

  it("keeps a selected entry that is still loading when a save arrives", async () => {
    await open(makeProps(makeAnswer("h2", 2), makeHistories(["h1", "h2"])));
    let finishLoading;
    interactiveStateHistoryCache.get.mockImplementation((sourceKey, id, callback) => {
      finishLoading = () => callback(null, makeAnswer(id, `history ${id}`).toJS());
    });
    act(() => app.handleSetInteractiveStateHistoryId("h1"));

    await update(makeProps(makeAnswer("h3", 3), makeHistories(["h1", "h2", "h3"])));
    // still loading: the spinner shows rather than an interactive
    expect(view.container.querySelector("iframe")).toBeNull();

    act(() => finishLoading());
    await settle();
    expect(shownValue()).toBe("history h1");
  });

  it("opens on the URL's history entry but does not return to it on a new save", async () => {
    window.history.replaceState({}, "Test", "/?iframeQuestionId=q1&studentId=s1&interactiveStateHistoryId=h1");
    await open(makeProps(makeAnswer("h2", 2), makeHistories(["h1", "h2"])));
    expect(shownValue()).toBe("history h1");

    await update(makeProps(makeAnswer("h3", 3), makeHistories(["h1", "h2", "h3"])));
    expect(shownValue()).toBe("history h1");

    act(() => app.handleSetInteractiveStateHistoryId(undefined));
    await settle();
    expect(shownValue()).toBe(3);

    await update(makeProps(makeAnswer("h4", 4), makeHistories(["h1", "h2", "h3", "h4"])));
    expect(shownValue()).toBe(4);
    expect(app.state.interactiveStateHistoryId).toBe(null);
  });

  it("applies the URL's history entry once when it was requested more than once", async () => {
    window.history.replaceState({}, "Test", "/?iframeQuestionId=q1&studentId=s1&interactiveStateHistoryId=h1");
    const urlLoads = [];
    interactiveStateHistoryCache.get.mockImplementation((sourceKey, id, callback) => {
      urlLoads.push(() => callback(null, makeAnswer(id, `history ${id}`).toJS()));
    });
    const props = makeProps(makeAnswer("h2", 2), makeHistories(["h1", "h2"]));
    await open(props);
    await update(props);
    expect(urlLoads).toHaveLength(2);

    act(() => urlLoads[0]());
    await settle();
    expect(shownValue()).toBe("history h1");

    act(() => app.handleSetInteractiveStateHistoryId(undefined));
    await settle();
    act(() => urlLoads[1]());
    await settle();
    expect(shownValue()).toBe(2);
    expect(app.state.interactiveStateHistoryId).toBe(null);
  });

  it("keeps focus in the interactive across a redraw, and leaves it alone otherwise", async () => {
    await open(makeProps(makeAnswer("h1", 1), makeHistories(["h1"])));
    const firstIframe = view.container.querySelector("iframe");
    firstIframe.focus();
    expect(focusedElement()).toBe("iframe");

    await update(makeProps(makeAnswer("h2", 2), makeHistories(["h1", "h2"])));
    const secondIframe = view.container.querySelector("iframe");
    expect(secondIframe).not.toBe(firstIframe);
    expect(focusedElement()).toBe("iframe");

    secondIframe.blur();
    await update(makeProps(makeAnswer("h3", 3), makeHistories(["h1", "h2", "h3"])));
    expect(focusedElement()).toBe("page");
  });
});
