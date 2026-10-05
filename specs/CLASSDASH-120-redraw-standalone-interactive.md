# Redraw Report Interactives When a New State Arrives

**Jira**: https://concord-consortium.atlassian.net/browse/CLASSDASH-120

**Status**: **Closed**

## Overview

When a teacher has a student's interactive open in the standalone report view ("Open in new tab" from the Class Dashboard) and the student saves new work, the view shows the new work. Before this change the history scrubber updated but the interactive kept showing the previous state until the teacher scrubbed away and back or reloaded the tab. The Class Dashboard's inline view of the same interactive ("View Work") had its own version of the problem and was fixed alongside it.

When the teacher has deliberately scrubbed back to an older save, a new save adds its marker but leaves the teacher where they are. The inline view redraws only when the work it shows actually changes, rather than one update late, or on every save by any student in the class.

## Requirements

### Standalone view

- **Latest view follows new saves.** When the standalone view is showing the student's latest answer to an interactive (`interactive_state`) question and a newer save of that answer arrives, the interactive redraws with the new state, with no reload or scrubbing. This holds whether or not the activity saves interactive state history.
- **Only a changed answer redraws.** The interactive does not redraw when a props update leaves the shown answer's saved state unchanged, for example when the student saves a different question in the same activity, when only the history list updates, or when the Activity Player re-saves the same state with a new timestamp (a `"touch"`). A touch with history on still adds a marker, and the scrubber moves to it; since its state equals the one shown, the scrubber and the interactive still agree.
- **The scrubber and the interactive agree.** Once a new save has arrived in the latest view, the scrubber's thumb sits on the new marker, its timestamp is the new save's, and the interactive shows that save's state. The answer and its history entry arrive as separate Firestore snapshots, in either order, so for the moment between them one may be ahead of the other; the view settles once both have arrived, with no teacher action.
- **A redraw keeps keyboard focus in the interactive.** If focus was in the interactive when it redraws, focus is on the redrawn interactive's frame afterward rather than on the page.
- **A selected older entry is left alone.** When the teacher has scrubbed to an older entry, a new save adds its marker to the scrubber but does not change the selected entry, the interactive's state, or the answer data the interactive is given (so attachment requests resolve against the selected entry). This holds from the moment the teacher selects the entry, including while its state is still loading: the view shows the loading spinner until the entry arrives and then shows the entry. Moving the thumb to the last marker afterward shows the newest save.
- **The URL's history entry is only the starting point.** When the view is opened with an `interactiveStateHistoryId` URL parameter, it opens on that entry. After that, the teacher's scrubbing decides what is shown: a new save never moves the view back to the URL's entry.
- **Nothing else changes.** Opening the view, the loading and error states, scrubbing between entries, and the rendering of `external_link` answers and of non-interactive answers behave as before.

### Class Dashboard inline view

- **A new save shows at once.** When the inline view is open on a student's latest answer and a newer save arrives, the interactive redraws with the new state in that same update.
- **Only a changed state redraws.** The interactive does not redraw when an update leaves the state it shows unchanged, including updates caused by other students' saves and by saves to other questions.
- **The interactive follows the scrubber.** Selecting a history entry shows that entry's state, and returning to the last marker shows the latest answer, each without waiting for a later update. Selecting an entry redraws the interactive once, not again when the panel passes the entry's loaded state.
- **The latest choice wins.** When the teacher selects an entry and then another (or the latest) before the first has loaded, the first entry's state is never shown once it arrives.
- **A redraw keeps keyboard focus in the interactive**, as in the standalone view.
- **Nothing else changes.** The "View Work" and "Open in new tab" links, the report item answers, and `external_link` answers behave as before.

## Technical Notes

- `InteractiveIframe` (`js/components/report/interactive-iframe.js`) posts `initInteractive` once, on mount, so the only way to show a different state is to remount it with a new React `key`. Re-posting `initInteractive` to a mounted interactive is not something interactives are known to handle.
- The answer document id is the same for every save of one student's answer to one question, and answer object identity changes on every snapshot (`RECEIVE_ANSWERS` rebuilds the whole `answers` map). What changes per save is the answer's saved state (`answer`), its `created` timestamp, and, when history is on, its `interactiveStateHistoryId`.
- Saves arrive at most about every two seconds per interactive: `setInteractiveState` in `@concord-consortium/lara-interactive-api` debounces by 2000 ms, and the Activity Player saves only when the state differs (or on a touch).
- Only answers of type `interactive_state` take the iframe branch. Question-interactives save their own answer types and render through `Answer`, which already updates live.
- A parent page can tell that focus is inside a cross-origin iframe (`document.activeElement` is the `IFRAME`) and can refocus a new iframe with `focus()`; the next Tab then moves into the frame's content. Focus returns to the frame, not to the element inside it that had focus. Checked in Chromium with Playwright on a two-origin page.
- React 16.13 skips every `UNSAFE_` lifecycle on a component that defines `getSnapshotBeforeUpdate` or `getDerivedStateFromProps`, so both components read focus in `UNSAFE_componentWillReceiveProps` (or the method it calls) rather than in `getSnapshotBeforeUpdate`.
- Jest runs under Node 16 in this repo.

## Out of Scope

- Changing `InteractiveIframe` to push new state into a mounted interactive.
- Any change to how the Activity Player writes answers or history.
- Scrubber visuals and behavior beyond what the requirements state.
- Converting either component's props-to-state logic out of `UNSAFE_componentWillReceiveProps`.

## As Built

### Standalone view (`js/containers/report/iframe-standalone-app.js`)

- `getIframeKey` keys the iframe `iframe-<answer id>-<history id>` when an entry is selected and `iframe-<answer id>-latest-<latestAnswerVersion>` otherwise. `latestAnswerVersion` goes up when the latest answer's `answer` value differs from the one in state (compared with Immutable's `is`); the first answer to arrive is not a new save.
- When an entry is selected or the URL's entry is loading, a props update records only the latest answer, the histories and the version, so the selected entry, its spinner while loading, and the `answer` given to the iframe all stay put.
- `openedUrlHistoryEntry` is set when the URL's entry is shown, and the URL parameter is ignored from then on.
- Scrubber picks need no late-load guard: while an entry loads the view renders only the spinner, without the scrubber, so the teacher cannot pick another entry until the load lands. This depends on a props update leaving `isLoadingAnswer` alone during a load.
- The URL's entry does need one. The history cache does not merge requests still in flight, so each props update before the entry has loaded requests it again, and a later result could land after the teacher has scrubbed away. Its callback does nothing once `openedUrlHistoryEntry` is set.

### Inline view (`js/components/report/iframe-answer.tsx`)

- `UNSAFE_componentWillReceiveProps` reads `nextProps`. `showAnswerState` bumps `answerStateVersion` only when the state differs.
- `requestedHistoryId`, an instance field set before each request, drops a cache callback for an entry the teacher has moved away from. It is not a `this.props` check because the cache calls back synchronously on a hit, while `this.props` still holds the previous props.

### Dashboard answer panel (`js/containers/portal-dashboard/answer.tsx`)

- The panel's scrubber stays on screen while an entry loads, and it passes the loaded entry to `IframeAnswer` as its `answer` prop. Its handler keeps the same kind of `requestedHistoryId` guard, cleared when the panel switches to a new student or question, so a late load can neither replace the latest answer after the teacher returns to it nor leave an older entry's data under a newer selection.

### Focus (`js/util/iframe-focus.ts`)

- `iframeHasFocus(container)` and `focusIframe(container)` are shared by both views. Each view sets `refocusIframe` only when it is about to remount with focus in its iframe, and `componentDidUpdate` refocuses once the remount happened.

### Tests

- `test/containers/report/iframe-standalone-app_spec.js` (8 tests) and a `describe` block in `test/components/report/iframe-answer_spec.js` (5 tests) drive the components through the `iframe-phone` mock: a redraw is a new `ParentEndpoint`, and the shown state is the last `initInteractive` it posted. `test/containers/portal-dashboard/answer_spec.js` (2 tests) covers the panel's late-load guard. Shared readers live in `test/iframe-test-helpers.js`, including `focusedElement`, which exists because jest crashes printing jsdom's `document.body` in a failure message.
- Each new test fails with the code it covers removed or mutated, except "does not redraw when the shown answer's state is unchanged", which guards the choice of comparison (it fails if the new-save check compares answer objects or history ids).
- The Cypress standalone spec runs on fake data with no history or live updates, so it was not extended. A manual check on staging follows the Jira reproduction: the standalone view with and without history, scrubbed and URL-opened views, and the inline view for the saving student and for another student's save.

## Decisions

### Redraw by remounting the iframe rather than re-sending state
**Context**: The interactive could be redrawn by remounting the iframe or by posting new state to the mounted one.
**Options considered**:
- A) Remount, as scrubbing already does
- B) Re-post `initInteractive` from a `componentDidUpdate` in `InteractiveIframe`

**Decision**: A. It reuses the path scrubbing already exercises, and B assumes every interactive handles a second `initInteractive`, which nothing verifies.

---

### Cover activities without interactive state history
**Context**: The Jira fix suggested keying on the latest answer's `interactiveStateHistoryId`, which changes per save only when the activity saves history.
**Options considered**:
- A) Redraw on any change to the latest answer's saved state
- B) Redraw only when the history id changes

**Decision**: A. The underlying defect is the same without history, and B would leave the view stale for every activity that does not save history.

---

### Fix the two related standalone-view defects in this story
**Context**: A new save snapped a URL-opened view back to the URL's entry, and swapped the latest answer in underneath a selected older entry. Neither was in the Jira description, but both are triggered by a new save and live in the same method, and the main fix would make the second one visible.
**Options considered**:
- A) Fix both here
- B) Fix only the main defect and the swapped-in answer; file the URL snap-back separately
- C) Fix only the main defect; file both separately

**Decision**: A. C would ship a visible regression, and B would leave the story's own symptom reachable from any view opened from a scrubbed dashboard. Both are handled by one decision in `UNSAFE_componentWillReceiveProps` that the main fix touches anyway.

---

### Fix the Class Dashboard's inline view in this story
**Context**: The inline view showed a new save one update late and remounted on every rerender: the same user-visible symptom in a different view, with a different cause.
**Options considered**:
- A) Leave it out and file a follow-up story
- B) Fix it here as well

**Decision**: B (Doug Martin, 2026-10-01). Same symptom, a small fix, and the two views share the focus handling.

---

### Accept a redraw per save while a student works
**Context**: Each save remounts the interactive, so a teacher watching live sees it reload, losing any scrolling or zooming they did inside it.
**Options considered**:
- A) Accept a redraw per save
- B) Throttle redraws in the report

**Decision**: A. Saves are already rate-limited to about one every two seconds at the source, the same granularity as the history markers. A teacher who wants to hold a view can scrub to that save, which new saves leave alone.

---

### Require the view to settle once both snapshots arrive
**Context**: The answer and its history entry arrive as two independent Firestore snapshots, in either order, so no implementation can make them agree at every instant.
**Options considered**:
- A) Require the scrubber and interactive to agree on every update
- B) Require them to agree once both snapshots have arrived

**Decision**: B. The requirement was reworded so it can be met.

---

### Keep keyboard focus in the interactive across a redraw
**Context**: Remounting removes the focused iframe and focus falls to `document.body`. With live redraws that would happen on every student save while a keyboard user works in the interactive.
**Options considered**:
- A) Leave focus handling as it is
- B) Return focus to the redrawn frame when it was in the interactive

**Decision**: B, added as a requirement for both views.

---

### Key the iframe on a version counter
**Context**: The key has to change on each new save and on nothing else.
**Options considered**:
- A) A counter bumped when the answer's `answer` value changes
- B) The answer's `created` timestamp in the key
- C) A hash of the `answer` value in the key

**Decision**: A. B changes on a touch and so redraws for nothing; C hashes a potentially large state on every render for no gain. A matches `IframeAnswer`'s `answerStateVersion`.

---

### Capture focus before the update that remounts
**Context**: Focus has to be read before the old iframe leaves the DOM.
**Options considered**:
- A) Read `document.activeElement` where each component decides to remount, through a shared helper, and refocus in `componentDidUpdate`
- B) `getSnapshotBeforeUpdate`
- C) Have `InteractiveIframe` record focus in `componentWillUnmount` and the next instance restore it

**Decision**: A. B silently disables `UNSAFE_componentWillReceiveProps`, which holds both components' answer logic. C needs state shared between two `InteractiveIframe` instances, and only the parent knows whether a remount is a redraw of the same answer.

---

### Land the work in three steps
**Context**: The redraw logic of each view and the focus handling are separable concerns.
**Options considered**:
- A) One commit
- B) One step per view, focus included in each
- C) Standalone redraw, inline redraw, then focus for both

**Decision**: C. Each view's redraw logic reviews against its own reproduction, and focus is one concern with one helper, so it lands once for both views.

---

### Compare focus by name in tests
**Context**: A failing `expect(document.activeElement).toBe(iframe)` reported a jsdom `TypeError` instead of the mismatch, because jest cannot print jsdom's `body`.
**Options considered**:
- A) Compare the elements directly
- B) Compare a description of the focused element

**Decision**: B. `focusedElement()` returns `"page"` or the tag name, so a regression reports `Expected: "iframe", Received: "page"`.
