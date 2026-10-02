# Implementation Plan: Redraw Report Interactives When a New State Arrives

**Jira**: https://concord-consortium.atlassian.net/browse/CLASSDASH-120
**Requirements Spec**: [requirements.md](requirements.md)
**Status**: **In Development**

## Implementation Plan

The work is in the two components that render an `InteractiveIframe` for an `interactive_state` answer: `IframeStandaloneApp` (`js/containers/report/iframe-standalone-app.js`, the standalone view) and `IframeAnswer` (`js/components/report/iframe-answer.tsx`, the dashboard's inline view), plus a small shared focus helper and tests for each. `InteractiveIframe` is unchanged: it keeps posting `initInteractive` once on mount, and each component decides when to remount it by changing its `key`.

Both components' props-to-state logic stays in `UNSAFE_componentWillReceiveProps`. Converting it to `componentDidUpdate` or `getDerivedStateFromProps` is out of scope, and one constraint follows from keeping it: React skips every `UNSAFE_` lifecycle on a component that defines `getSnapshotBeforeUpdate` or `getDerivedStateFromProps` (checked with a throwaway component under this repo's React 16.13: only `getSnapshotBeforeUpdate` ran, with React's "Unsafe legacy lifecycles will not be called" warning). So the focus check in the last step reads `document.activeElement` in `UNSAFE_componentWillReceiveProps`, which runs before the render that removes the old iframe, instead of in `getSnapshotBeforeUpdate`.

### Follow new saves in the standalone view

**Summary**: Remount the iframe when the student saves a new state while the latest answer is shown, keep a selected history entry on screen when a save arrives, and read the `interactiveStateHistoryId` URL parameter only until that entry has loaded. These three share one decision in `UNSAFE_componentWillReceiveProps` (does this props update change what is shown?), so they land together.

**Files affected**:
- `js/containers/report/iframe-standalone-app.js`: new `latestAnswerVersion` and `openedUrlHistoryEntry` state, the new-save check, the selected-entry branch, and a `getIframeKey` helper for the key
- `test/iframe-test-helpers.js`: new, readers for the `iframe-phone` mock (`settle`, `iframeCount`, `shownValue`) and the `answerState` fixture, shared by both views' tests
- `test/containers/report/iframe-standalone-app_spec.js`: new, six tests

**Estimated diff size**: 23 lines added and 10 removed in source; a new 16-line helper module and a new 148-line test file

How it works:

- **New-save detection.** A save is new when the latest answer's `answer` value differs from the one already in state, compared with Immutable's `is` (the value is a JSON string for `interactive_state` answers, but `is` also covers answers stored as maps). Comparing the answer object itself would not work, because `RECEIVE_ANSWERS` rebuilds every answer on each snapshot of the student's answers, including saves to other questions. Comparing `interactiveStateHistoryId` would miss activities that do not save history and would redraw on a touch. The first answer to arrive is not a new save; the iframe mounts with it as it does today.
- **The key.** `getIframeKey` returns `iframe-<answer id>-<history id>` when an entry is selected and `iframe-<answer id>-latest-<latestAnswerVersion>` otherwise. `latestAnswerVersion` goes up by one per new save, the same pattern as `answerStateVersion` in `IframeAnswer`. The version is bumped even while an entry is selected, which does nothing to the key then, but means returning to the latest after several saves shows the newest one (the key changes from the entry's id to `latest-<n>` either way).
- **A selected entry is left alone.** The branch that records only `latestAnswer`, `myInteractiveStateHistories` and the version, without touching `answer`, now also runs when `this.state.interactiveStateHistoryId` is set, not only while the URL's entry is loading. So the interactive, and the `answer` it is given for attachment requests, stay on the selected entry, and the scrubber still gains the new marker. Because the condition is the selected id rather than whether the entry has loaded, it also covers the window after the teacher picks an entry and before its state arrives from Firestore: the update no longer clears `isLoadingAnswer` or swaps in the latest answer, so the spinner stays up and the entry is what renders when it lands. `handleSetInteractiveStateHistoryId(undefined)` already switches to `state.latestAnswer`, which is kept current.
- **No guard against late loads.** Unlike the inline view, the standalone view needs no check that a finished history load is still the one wanted: while an entry loads it renders only the spinner, without the scrubber, so the teacher cannot pick another entry until the load lands. This depends on the selected-entry branch above leaving `isLoadingAnswer` alone during a load.
- **The URL's entry is read once.** `openedUrlHistoryEntry` is set in the same `setState` that shows the URL's entry, and while it is set the URL parameter is ignored. Until then the existing wait-and-load behavior is unchanged, including its 15-second timeout and error messages, so a slow or failed load behaves as today.

```diff
diff --git a/js/containers/report/iframe-standalone-app.js b/js/containers/report/iframe-standalone-app.js
index f3e0627..d66acaf 100644
--- a/js/containers/report/iframe-standalone-app.js
+++ b/js/containers/report/iframe-standalone-app.js
@@ -1,6 +1,6 @@
 import React, { PureComponent } from "react";
 import { connect } from "react-redux";
-import { Map } from "immutable";
+import { Map, is } from "immutable";
 import { fetchAndObserveData } from "../../actions/index";
 import DataFetchError from "../../components/report/data-fetch-error";
 import LoadingIcon from "../../components/report/loading-icon";
@@ -28,6 +28,10 @@ class IframeStandaloneApp extends PureComponent {
       interactiveStateHistory: null,
       myInteractiveStateHistories: null,
       interactiveStateHistoryId: null,
+      // Bumped each time the student saves a new state, so the iframe remounts with it.
+      latestAnswerVersion: 0,
+      // The interactiveStateHistoryId URL parameter picks the entry the view opens on, and only that.
+      openedUrlHistoryEntry: false,
     };
 
     this.handleSetInteractiveStateHistoryId = this.handleSetInteractiveStateHistoryId.bind(this);
@@ -68,7 +72,7 @@ class IframeStandaloneApp extends PureComponent {
     );
 
     // see if we need to get a specific interactive state history
-    const interactiveStateHistoryId = config("interactiveStateHistoryId");
+    const interactiveStateHistoryId = !this.state.openedUrlHistoryEntry && config("interactiveStateHistoryId");
     if (interactiveStateHistoryId) {
       // wait until we have interactive state histories loaded, timeout after 15 seconds
       if (interactiveStateHistories.size === 0) {
@@ -93,7 +97,8 @@ class IframeStandaloneApp extends PureComponent {
             this.setState({
               isLoadingAnswer: false,
               answer: Map(data),
-              interactiveStateHistoryId
+              interactiveStateHistoryId,
+              openedUrlHistoryEntry: true
             });
           }
         });
@@ -108,13 +113,17 @@ class IframeStandaloneApp extends PureComponent {
       a.get("platformUserId") === platformUserId
     ).first();
 
-    if (interactiveStateHistoryId) {
-      // isLoadingAnswer will be set false when the interactive state history load completes but we still want to
-      // set the latest answer and myInteractiveStateHistories in state so that the range input has a value
-      // to use when switching back to latest answer
-      this.setState({ latestAnswer: answer, myInteractiveStateHistories });
+    const { latestAnswer, latestAnswerVersion } = this.state;
+    const isNewSave = !!latestAnswer && !!answer && !is(latestAnswer.get("answer"), answer.get("answer"));
+    const nextVersion = isNewSave ? latestAnswerVersion + 1 : latestAnswerVersion;
+
+    if (interactiveStateHistoryId || this.state.interactiveStateHistoryId) {
+      // A history entry is shown or loading: keep it, but record the latest answer and histories for the scrubber.
+      this.setState({ latestAnswer: answer, myInteractiveStateHistories, latestAnswerVersion: nextVersion });
     } else {
-      this.setState({ isLoadingAnswer: false, latestAnswer: answer, answer, myInteractiveStateHistories });
+      this.setState({
+        isLoadingAnswer: false, latestAnswer: answer, answer, myInteractiveStateHistories, latestAnswerVersion: nextVersion
+      });
     }
   }
 
@@ -186,7 +195,7 @@ class IframeStandaloneApp extends PureComponent {
       return (
         <div className="container">
           <InteractiveIframe
-            key={`iframe-${answer.get("id")}-${interactiveStateHistoryId || "latest"}`}
+            key={getIframeKey(this.state)}
             src={url}
             state={state}
             answer={answer}
@@ -224,6 +233,10 @@ class IframeStandaloneApp extends PureComponent {
   }
 }
 
+// The iframe only reads its state on mount, so the key changes whenever the state to show does.
+const getIframeKey = ({ answer, interactiveStateHistoryId, latestAnswerVersion }) =>
+  `iframe-${answer?.get("id")}-${interactiveStateHistoryId || `latest-${latestAnswerVersion}`}`;
+
 function mapStateToProps(state) {
   const data = state.get("data");
   const error = data.get("error");
```

The tests render the unconnected component (`connect(...)` exposes it as `WrappedComponent`) with `@testing-library/react`, drive it by re-rendering with new props, and read what the interactive was sent from the `iframe-phone` mock (`__mocks__/iframe-phone.ts`) through the helpers in `test/iframe-test-helpers.js`: a redraw is a new `ParentEndpoint`, and the state shown is the last `initInteractive` it posted. The scrubber side is read from the rendered `InteractiveStateHistoryRangeInput`: the range input's `value` is the selected marker's index, and its date and time text comes from `localDateTime`. The fixture's history entries are an hour apart so that each renders a different time; entries within the same minute would make the timestamp check unable to fail. `config()` reads `window.location.search`, so each test sets it with `replaceState`. The history state cache is stubbed to return a recognizable state per entry id.

`test/iframe-test-helpers.js`:

```js
import { act } from "@testing-library/react";
import iframePhone from "iframe-phone";

export const answerState = value => JSON.stringify({ interactiveState: JSON.stringify({ value }) });

// iframe-phone mock is defined in __mocks__/iframe-phone.ts; it answers the phone after 1ms
export const settle = () => act(() => new Promise(resolve => setTimeout(resolve, 20)));

// Each mounted InteractiveIframe creates one ParentEndpoint, so a redraw is one more instance.
export const iframeCount = () => iframePhone._parentInstances.length;

export const shownValue = () => {
  const phone = iframePhone._parentInstances[iframeCount() - 1];
  const inits = phone.post.mock.calls.filter(([type]) => type === "initInteractive");
  return inits.length > 0 ? inits[inits.length - 1][1].interactiveState.value : undefined;
};
```

`test/containers/report/iframe-standalone-app_spec.js`:

```js
import React from "react";
import { render, act } from "@testing-library/react";
import { Map, List, fromJS } from "immutable";
import iframePhone from "iframe-phone";
import IframeStandaloneApp from "../../../js/containers/report/iframe-standalone-app";
import { interactiveStateHistoryCache } from "../../../js/util/interactive-state-history-cache";
import { localDateTime } from "../../../js/util/datetime";
import { answerState, settle, iframeCount, shownValue } from "../../iframe-test-helpers";

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
});
```

Each test was run against `master` and against this step. Five fail on `master`; the still-loading test fails on both of its checks independently, rendering an iframe during the load and then showing the latest save (3) instead of the entry once it has loaded. "does not redraw when the shown answer's state is unchanged" passes on `master`, because `master` never redraws; it guards the choice of comparison, and fails if the new-save check compares the answer object (another question's save redraws) or the history id (a touch redraws, and the no-history test fails too), both checked by mutating the check. The selected-entry test's scrubber checks fail if that branch stops recording the histories. The scrubber assertion was checked the same way: passing the range input a stale history id (always the first entry) fails it on the index, and expecting the previous entry's time fails it on the text.

---

### Follow new saves in the dashboard's inline view

**Summary**: Make `IframeAnswer` compute the state to show from the incoming props, remount its iframe only when that state actually changes, and drop a history load that finishes after the teacher has moved on.

**Files affected**:
- `js/components/report/iframe-answer.tsx`: `UNSAFE_componentWillReceiveProps` reads `nextProps`, a `showAnswerState` method that bumps `answerStateVersion` only on a change, and a `requestedHistoryId` field that guards the cache callback
- `test/components/report/iframe-answer_spec.js`: four tests in a new `describe` block

**Estimated diff size**: 20 lines added and 8 removed in source; 105 lines added and 1 changed in the test file

How it works:

- **`nextProps`.** The method already receives the incoming props; it now reads the answer, history id and source key from them, so each update shows the state that update carries. The report-item code further down the method already used `nextProps` and is unchanged.
- **Remount only on a change.** `showAnswerState` sets the state to show and bumps `answerStateVersion` only when it differs from the current one, compared with Immutable's `is` as in the standalone view. The key is still `<url>-<answerStateVersion>`, so an update that carries the same state, which on the dashboard is any save by anyone in the class, leaves the iframe mounted. When the dashboard's answer panel passes the selected entry's loaded state as the answer after its id, that second update carries the same state and does not remount again.
- **Late loads are dropped.** `requestedHistoryId` records the entry last asked for, set before the request (or to `undefined` when the latest answer is shown), and the cache callback applies its result only if it is still that entry. It is an instance field rather than a check of `this.props` because `interactiveStateHistoryCache.get` calls back synchronously on a cache hit, while `this.props` still holds the previous props.

```diff
diff --git a/js/components/report/iframe-answer.tsx b/js/components/report/iframe-answer.tsx
index 7aaf5e8..5787b88 100644
--- a/js/components/report/iframe-answer.tsx
+++ b/js/components/report/iframe-answer.tsx
@@ -1,6 +1,6 @@
 import React, { PureComponent } from "react";
 import { connect } from "react-redux";
-import { List, Map } from "immutable";
+import { List, Map, is } from "immutable";
 import { IReportItemAnswer, IReportItemAnswerItem, ReportItemsType } from "@concord-consortium/interactive-api-host";
 import { renderHTML } from "../../util/render-html";
 import { buildAnswerLink } from "../../util/answer-link";
@@ -41,6 +41,9 @@ interface IState {
 }
 
 export class IframeAnswer extends PureComponent<IProps, IState> {
+  // The history entry whose state was last asked for, so a load that finishes after the teacher moves on is dropped.
+  private requestedHistoryId?: string;
+
   constructor(props: IProps) {
     super(props);
     this.state = {
@@ -65,22 +68,22 @@ export class IframeAnswer extends PureComponent<IProps, IState> {
   }
 
   UNSAFE_componentWillReceiveProps(nextProps: Readonly<IProps>, nextContext: any): void {
-    const {answer, sourceKey, interactiveStateHistoryId} = this.props;
+    const {answer, sourceKey, interactiveStateHistoryId} = nextProps;
     if (answer.get("type") === "interactive_state") {
+      this.requestedHistoryId = interactiveStateHistoryId;
       if (interactiveStateHistoryId) {
         interactiveStateHistoryCache.get(sourceKey, interactiveStateHistoryId, (error, cachedAnswer) => {
+          if (this.requestedHistoryId !== interactiveStateHistoryId) {
+            return;
+          }
           if (error) {
             this.setState({error});
           } else {
-            this.setState(prev => {
-              return {answerState: cachedAnswer.answer, error: null, answerStateVersion: prev.answerStateVersion + 1};
-            });
+            this.showAnswerState(cachedAnswer.answer);
           }
         });
       } else {
-        this.setState(prev => {
-          return {answerState: answer.get("answer"), error: null, answerStateVersion: prev.answerStateVersion + 1};
-        });
+        this.showAnswerState(answer.get("answer"));
       }
     }
 
@@ -96,6 +99,15 @@ export class IframeAnswer extends PureComponent<IProps, IState> {
     }
   }
 
+  // The iframe only reads its state on mount, so it is remounted only when the state to show changes.
+  showAnswerState(answerState: any) {
+    this.setState(prev => ({
+      answerState,
+      error: null,
+      answerStateVersion: is(prev.answerState, answerState) ? prev.answerStateVersion : prev.answerStateVersion + 1
+    }));
+  }
+
   toggleIframe() {
     this.setState(prev => ({iframeVisible: !prev.iframeVisible}));
   }
```

The tests render `IframeAnswer` with `alwaysOpen`, so the iframe shows without clicking "View Work", and read the iframe from the `iframe-phone` mock the same way as the standalone tests. The history state cache is stubbed so that ids starting with `slow` finish loading only when the test calls them, which is how the late-load test holds one load open. `finishSlowLoads` checks that exactly one load is held before finishing it, so the test cannot pass with nothing arriving late.

```diff
diff --git a/test/components/report/iframe-answer_spec.js b/test/components/report/iframe-answer_spec.js
--- a/test/components/report/iframe-answer_spec.js
+++ b/test/components/report/iframe-answer_spec.js
@@ -1,7 +1,11 @@
 import React from "react";
 import { shallow } from "enzyme";
-import { Map } from "immutable";
+import { render, act } from "@testing-library/react";
+import { List, Map } from "immutable";
+import iframePhone from "iframe-phone";
 import { IframeAnswer } from "../../../js/components/report/iframe-answer";
+import { interactiveStateHistoryCache } from "../../../js/util/interactive-state-history-cache";
+import { answerState, settle, iframeCount, shownValue } from "../../iframe-test-helpers";
 
 const getReportItemAnswerMock = jest.fn();
 
@@ -59,4 +63,105 @@ describe("<IframeAnswer />", () => {
       expect(params.get("auth-domain")).toBe("https://learn.example.org");
     });
   });
+
+  describe("when the state to show changes", () => {
+    const iframeQuestion = Map({ id: "q1", url: "https://interactive.example.com/", displayInIframe: true });
+    const makeAnswer = value => Map({ id: "answer1", type: "interactive_state", questionId: "q1", answer: answerState(value) });
+    const renderAnswer = (answer, interactiveStateHistoryId) => (
+      <IframeAnswer
+        alwaysOpen={true}
+        answer={answer}
+        answerOrientation="wide"
+        getReportItemAnswer={getReportItemAnswerMock}
+        question={iframeQuestion}
+        responsive={false}
+        interactiveStateHistory={List()}
+        interactiveStateHistoryId={interactiveStateHistoryId}
+        setInteractiveStateHistoryId={jest.fn()}
+        sourceKey="source"
+      />
+    );
+
+    let view;
+    let slowLoads;
+    const finishSlowLoads = () => {
+      const loads = slowLoads.splice(0);
+      expect(loads).toHaveLength(1);
+      loads.forEach(finish => finish());
+    };
+    const update = (answer, interactiveStateHistoryId) => {
+      view.rerender(renderAnswer(answer, interactiveStateHistoryId));
+      return settle();
+    };
+
+    beforeEach(() => {
+      iframePhone._resetMock();
+      // entries whose id starts with "slow" finish loading only when the test says so
+      slowLoads = [];
+      jest.spyOn(interactiveStateHistoryCache, "get").mockImplementation((sourceKey, id, callback) => {
+        const finish = () => callback(null, { answer: answerState(`history ${id}`) });
+        if (id.startsWith("slow")) {
+          slowLoads.push(finish);
+        } else {
+          finish();
+        }
+      });
+    });
+
+    afterEach(() => {
+      jest.restoreAllMocks();
+    });
+
+    it("redraws with the new answer's state", async () => {
+      view = render(renderAnswer(makeAnswer(1)));
+      await settle();
+      expect(shownValue()).toBe(1);
+
+      await update(makeAnswer(2));
+      expect(iframeCount()).toBe(2);
+      expect(shownValue()).toBe(2);
+    });
+
+    it("does not redraw when an update leaves the state unchanged", async () => {
+      view = render(renderAnswer(makeAnswer(1)));
+      await settle();
+
+      await update(makeAnswer(1));
+      await update(makeAnswer(1));
+      expect(iframeCount()).toBe(1);
+    });
+
+    it("follows the scrubber to an entry and back to the latest", async () => {
+      view = render(renderAnswer(makeAnswer(2)));
+      await settle();
+
+      // the dashboard's answer panel passes the entry's id first and its state as the answer once loaded
+      await update(makeAnswer(2), "h1");
+      expect(shownValue()).toBe("history h1");
+      const iframesOnEntry = iframeCount();
+      await update(Map({ id: "answer1", type: "interactive_state", answer: answerState("history h1") }), "h1");
+      expect(iframeCount()).toBe(iframesOnEntry);
+
+      await update(makeAnswer(2));
+      expect(shownValue()).toBe(2);
+    });
+
+    it("ignores an entry that finishes loading after the teacher has moved on", async () => {
+      view = render(renderAnswer(makeAnswer(3)));
+      await settle();
+
+      await update(makeAnswer(3), "slow1");
+      await update(makeAnswer(3), "h2");
+      act(() => finishSlowLoads());
+      await settle();
+      expect(shownValue()).toBe("history h2");
+
+      await update(makeAnswer(3), "slow2");
+      await update(makeAnswer(3));
+      act(() => finishSlowLoads());
+      await settle();
+      expect(shownValue()).toBe(3);
+    });
+
+  });
 });
```

All four fail on `master`. The late-load test covers both ways of moving on, to another entry and back to the latest. Removing the `requestedHistoryId` check fails it, and so does setting `requestedHistoryId` only when an entry is selected (a late load then lands after the return to the latest, showing that entry instead of the latest answer); and bumping the version unconditionally fails the unchanged-state and scrubber tests, each checked by mutating the code.

---

### Keep keyboard focus in the interactive across a redraw

**Summary**: When a redraw remounts the iframe while focus is inside it, put focus on the new iframe, in both views, so a keyboard user is not sent to the top of the page on each save.

**Files affected**:
- `js/util/iframe-focus.ts`: new, `iframeHasFocus` and `focusIframe`
- `js/containers/report/iframe-standalone-app.js`: a ref on the container `div`, the focus check where a new save is applied, and a `componentDidUpdate` that refocuses
- `js/components/report/iframe-answer.tsx`: the same, on the `iframe-answer-content` `div` and in `showAnswerState`
- `test/iframe-test-helpers.js`: a `focusedElement` helper for the tests
- `test/containers/report/iframe-standalone-app_spec.js` and `test/components/report/iframe-answer_spec.js`: one test each, importing the helper

**Estimated diff size**: a 9-line helper; 23 lines added and 2 removed in the two components; a 4-line test helper; a 15-line and a 16-line test

When focus is inside a cross-origin iframe, the parent's `document.activeElement` is the `IFRAME` element, so a component can tell, before the render that replaces the iframe, whether focus is in its interactive. Both components record that as `this.refocusIframe` (an instance field, since nothing renders from it) only when they are about to remount: the standalone view in `UNSAFE_componentWillReceiveProps` for a new save in the latest view, the inline view in `showAnswerState` when the state differs. `componentDidUpdate` refocuses once the iframe has actually been remounted (the key changed in the standalone view, `answerStateVersion` changed in the inline view) and clears the flag. Focus the teacher has moved elsewhere is left alone, because the flag is only set if focus was in the iframe when the update arrived. Scrubbing is not affected: the scrubber's own input has focus while the teacher uses it.

The detection and refocus live in one helper so the two views cannot drift apart. Focus returns to the frame, not to the element inside the interactive that had it, which the parent cannot see. Checked in Chromium with Playwright on a two-origin page: the parent sees `IFRAME` as the active element while an inner button is focused, a remount leaves `BODY` active, `focus()` on the new iframe makes it active again, and the next Tab moves into the frame's content, whether `focus()` is called at once or on the frame's `load`. Calling it at once is enough.

`js/util/iframe-focus.ts`:

```ts
// While focus is inside a cross-origin iframe, the parent document reports the iframe element as active.
export const iframeHasFocus = (container: HTMLElement | null | undefined) => {
  const focused = document.activeElement;
  return focused?.tagName === "IFRAME" && !!container?.contains(focused);
};

export const focusIframe = (container: HTMLElement | null | undefined) => {
  container?.querySelector("iframe")?.focus();
};
```

```diff
diff --git a/js/components/report/iframe-answer.tsx b/js/components/report/iframe-answer.tsx
index 5787b88..8950e5f 100644
--- a/js/components/report/iframe-answer.tsx
+++ b/js/components/report/iframe-answer.tsx
@@ -9,6 +9,7 @@ import { getReportItemAnswer } from "../../actions";
 import { IframeAnswerReportItem } from "./iframe-answer-report-item";
 import { InteractiveStateHistoryRangeInput } from "../portal-dashboard/interactive-state-history-range-input";
 import { interactiveStateHistoryCache } from "../../util/interactive-state-history-cache";
+import { focusIframe, iframeHasFocus } from "../../util/iframe-focus";
 
 import "../../../css/report/iframe-answer.less";
 
@@ -43,6 +44,8 @@ interface IState {
 export class IframeAnswer extends PureComponent<IProps, IState> {
   // The history entry whose state was last asked for, so a load that finishes after the teacher moves on is dropped.
   private requestedHistoryId?: string;
+  private contentRef = React.createRef<HTMLDivElement>();
+  private refocusIframe = false;
 
   constructor(props: IProps) {
     super(props);
@@ -99,8 +102,16 @@ export class IframeAnswer extends PureComponent<IProps, IState> {
     }
   }
 
+  componentDidUpdate(prevProps: IProps, prevState: IState) {
+    if (this.refocusIframe && prevState.answerStateVersion !== this.state.answerStateVersion) {
+      this.refocusIframe = false;
+      focusIframe(this.contentRef.current);
+    }
+  }
+
   // The iframe only reads its state on mount, so it is remounted only when the state to show changes.
   showAnswerState(answerState: any) {
+    this.refocusIframe = !is(this.state.answerState, answerState) && iframeHasFocus(this.contentRef.current);
     this.setState(prev => ({
       answerState,
       error: null,
@@ -220,7 +231,7 @@ export class IframeAnswer extends PureComponent<IProps, IState> {
     }
 
     return (
-      <div className={`iframe-answer-content ${responsive ? "responsive" : ""}`}>
+      <div className={`iframe-answer-content ${responsive ? "responsive" : ""}`} ref={this.contentRef}>
         <InteractiveIframe key={key} src={url} state={state} answer={answer} width={question.get("width")} height={question.get("height")} />
       </div>
     );
diff --git a/js/containers/report/iframe-standalone-app.js b/js/containers/report/iframe-standalone-app.js
index d66acaf..e5e7828 100644
--- a/js/containers/report/iframe-standalone-app.js
+++ b/js/containers/report/iframe-standalone-app.js
@@ -11,6 +11,7 @@ import config from "../../config";
 import { interactiveStateHistoryCache } from "../../util/interactive-state-history-cache";
 import { InteractiveStateHistoryRangeInput } from "../../components/portal-dashboard/interactive-state-history-range-input";
 import { getObjectStorageConfig } from "../../util/object-storage-config";
+import { focusIframe, iframeHasFocus } from "../../util/iframe-focus";
 
 import "../../../css/report/report-app.less";
 import "../../../css/report/iframe-standalone-app.less";
@@ -34,9 +35,17 @@ class IframeStandaloneApp extends PureComponent {
       openedUrlHistoryEntry: false,
     };
 
+    this.containerRef = React.createRef();
     this.handleSetInteractiveStateHistoryId = this.handleSetInteractiveStateHistoryId.bind(this);
   }
 
+  componentDidUpdate(prevProps, prevState) {
+    if (this.refocusIframe && getIframeKey(prevState) !== getIframeKey(this.state)) {
+      this.refocusIframe = false;
+      focusIframe(this.containerRef.current);
+    }
+  }
+
   componentDidMount() {
     const { fetchAndObserveData } = this.props;
     fetchAndObserveData();
@@ -121,6 +130,7 @@ class IframeStandaloneApp extends PureComponent {
       // A history entry is shown or loading: keep it, but record the latest answer and histories for the scrubber.
       this.setState({ latestAnswer: answer, myInteractiveStateHistories, latestAnswerVersion: nextVersion });
     } else {
+      this.refocusIframe = isNewSave && iframeHasFocus(this.containerRef.current);
       this.setState({
         isLoadingAnswer: false, latestAnswer: answer, answer, myInteractiveStateHistories, latestAnswerVersion: nextVersion
       });
@@ -193,7 +203,7 @@ class IframeStandaloneApp extends PureComponent {
       }
 
       return (
-        <div className="container">
+        <div className="container" ref={this.containerRef}>
           <InteractiveIframe
             key={getIframeKey(this.state)}
             src={url}
```

Appended to `test/iframe-test-helpers.js`:

```js
// Jest crashes printing jsdom's document.body in a failure message, so focus assertions compare this name instead.
export const focusedElement = () =>
  document.activeElement === document.body ? "page" : document.activeElement.tagName.toLowerCase();
```

Each test file adds `focusedElement` to its import from the helpers module. A test that asserts `expect(document.activeElement).toBe(iframe)` and fails reports `TypeError: 'set' on proxy: trap returned falsish for property 'Symbol(impl)'` instead of the mismatch, because jest's printer cannot format jsdom's `body`; iframes print fine. After a remount the old iframe is detached, and a detached element cannot be the active element, so `"iframe"` can only mean the new one.

Added inside the `describe` block of `test/containers/report/iframe-standalone-app_spec.js`:

```js
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
```

Added inside the `describe("when the state to show changes")` block of `test/components/report/iframe-answer_spec.js`:

```js
    it("keeps focus in the interactive across a redraw, and leaves it alone otherwise", async () => {
      view = render(renderAnswer(makeAnswer(1)));
      await settle();
      const firstIframe = view.container.querySelector("iframe");
      firstIframe.focus();
      expect(focusedElement()).toBe("iframe");

      await update(makeAnswer(2));
      const secondIframe = view.container.querySelector("iframe");
      expect(secondIframe).not.toBe(firstIframe);
      expect(focusedElement()).toBe("iframe");

      secondIframe.blur();
      await update(makeAnswer(3));
      expect(focusedElement()).toBe("page");
    });
```

jsdom does not load iframe documents, so the tests check the parent side only (the active element is the new iframe); the Playwright check above covers what happens inside the frame. Both fail on `master`, with `Received: "page"` for the inline view and on the remount check for the standalone view.

## Testing

- `npm test` under Node 16, which is also what CI uses (`.github/workflows/ci.yml`). With all three steps, all 255 tests in 42 suites pass, the twelve new ones included; re-measure on the head commit before quoting a count.
- `npx eslint` on the changed files is clean after each step. `tsc --noEmit` reports no new errors (the two it reports, in `js/api.ts`, are on `master` too). `webpack --mode production` builds with all three steps.
- The Cypress standalone spec (`cypress/integration/standalone-iframe.spec.js`) runs on fake data with no history and no live updates, so it cannot exercise this change and is not extended. Its existing tests must still pass.
- Manual check on staging, following the Jira reproduction: open a student's answer in the standalone view from the Class Dashboard, have the student save, and confirm the interactive redraws with the new state and the scrubber's thumb and timestamp match it. Then scrub to an older marker, have the student save, and confirm the view stays put until the thumb is moved to the last marker. Then open the view from a dashboard scrubbed to an older marker, move to the last marker, have the student save, and confirm the new state shows. Repeat the first check on an activity without interactive state history. On the Class Dashboard, open "View Work" for one student's answer and have that student save: the inline interactive redraws with the new state. Have a different student save: the open interactive does not reload. Scrub to an older marker and back to the last one: the interactive shows the entry, then the latest answer.

## Open Questions

<!-- Implementation-focused questions only. Requirements questions go in requirements.md. -->

### RESOLVED: Judgment call: a version counter in the key rather than the answer's content or timestamp
**Context**: The key has to change on each new save and on nothing else.
**Options considered**:
- A) A counter bumped when the answer's `answer` value changes
- B) The answer's `created` timestamp in the key
- C) A hash of the `answer` value in the key

**Decision**: A. B changes on a touch, which re-saves the same state with a new timestamp, and so redraws for nothing. C would also work but hashes a potentially large state on every render for no gain over a counter. A matches `IframeAnswer`'s `answerStateVersion`.

### RESOLVED: Judgment call: capture focus before the update that remounts
**Context**: Focus has to be read before the old iframe leaves the DOM.
**Options considered**:
- A) Read `document.activeElement` where each component decides to remount (`UNSAFE_componentWillReceiveProps`, or `showAnswerState` which it calls), through a shared helper, and refocus in `componentDidUpdate`
- B) `getSnapshotBeforeUpdate`, the lifecycle made for this
- C) Have `InteractiveIframe` record focus in `componentWillUnmount` and the next instance restore it

**Decision**: A. B silently disables `UNSAFE_componentWillReceiveProps`, which holds both components' answer logic (verified, see above). C needs state shared between two `InteractiveIframe` instances, since the old one unmounts before the new one mounts, and only the parent knows whether a remount is a redraw of the same answer.

### RESOLVED: Judgment call: three steps
**Context**: The whole change is 75 added and 20 removed lines of source across two components and a new helper.
**Options considered**:
- A) One commit
- B) One step per view, focus included in each
- C) Standalone redraw, inline redraw, then focus for both

**Decision**: C. Each view's redraw logic is self-contained and reviews against its own reproduction. Focus is one concern with one helper, so it lands once for both views rather than being written in the first step and moved in the second. Each step's tests pass on that step alone.

## Self-Review

Roles: Senior Engineer, commit reviewer, test runner, operator. The plan's code blocks match the code on this branch: the 6 standalone and 4 inline tests pass with the first two steps, all 12 new tests pass with the third, and ESLint is clean on the changed files after each step. Each finding below was checked against that build and fixed in place.

### Test runner

#### RESOLVED: The suite count was measured with throwaway tests present
The Testing section quoted 254 tests, counted while the throwaway suites used to develop this plan were still under `test/`. Re-measured after deleting them: 253 tests in 42 suites with both steps applied. Corrected, with a note to re-measure on the head commit.

#### RESOLVED: A failing focus assertion reported a jsdom crash instead of the mismatch
Run against `master`, the inline view's focus test failed with `TypeError: 'set' on proxy: trap returned falsish for property 'Symbol(impl)'` rather than an assertion message. Rewriting the comparison as a boolean showed the assertion itself was failing (`Expected: true, Received: false`) and the crash came from jest printing `document.body` in the failure message. A future regression would have surfaced as an unexplained `TypeError`. Both focus tests now compare `focusedElement()`, a shared test helper, and on `master` the inline test reports `Expected: "iframe", Received: "page"`.

#### RESOLVED: The test mocked a module it does not need
The draft test file mocked `js/util/object-storage-config`. The tests pass unchanged without it, so it only hid real behavior. Removed.

### Commit reviewer

#### RESOLVED: Diff sizes were estimates
The per-step sizes were approximate. Replaced with the counts from the verified diffs.

### Senior Engineer

No further findings survived verification. Checked and dropped: `IframeAnswer`'s focus check compares against `this.state.answerState` while its updater compares against `prev`, which could only differ if another state update were pending, and each update calls `showAnswerState` once, before its own `setState`; `getIframeKey` is a `const` declared after the class, which is safe because it is only called from methods at run time (the tests exercise every call); `this.refocusIframe` starts undefined, which reads as false.

### Operator

No findings. The change is client-side only, adds no configuration, and rolls back with a revert.

