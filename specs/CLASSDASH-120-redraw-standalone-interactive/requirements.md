# Redraw Report Interactives When a New State Arrives

**Jira**: https://concord-consortium.atlassian.net/browse/CLASSDASH-120
**Repo**: https://github.com/concord-consortium/portal-report
**Implementation Spec**: [implementation.md](implementation.md)
**Status**: **In Development**

## Overview

When a teacher has a student's interactive open in the standalone report view ("Open in new tab" from the Class Dashboard) and the student saves new work, the view should show the new work. Today the history scrubber updates but the interactive keeps showing the previous state until the teacher scrubs away and back or reloads the tab. The Class Dashboard's inline view of the same interactive ("View Work") has its own version of the problem and is fixed alongside it.

## Project Owner Overview

The standalone report view is how a teacher looks at one student's interactive full-size, and with interactive state history turned on it is also where the teacher scrubs through the student's saved states. It is meant to be live: answers stream in from Firestore while it is open. Right now it is live in a confusing way. The scrubber gains a marker for the new save and its thumb moves to it with the new timestamp, so the view claims to be showing the newest work, but the interactive still shows the old state. A teacher watching a student work, or checking in during class, sees stale work labeled as current.

The fix makes the view honest: when it is showing the student's latest work and the student saves again, the interactive redraws with the new state. When the teacher has deliberately scrubbed back to an older save, a new save adds its marker but leaves the teacher where they are.

The dashboard's inline view gets the same treatment. Today it shows a new save one update late, can keep showing an older save after the teacher scrubs back to the latest, and reloads every open interactive whenever any student in the class saves anything. After the fix it redraws only when the work it shows actually changes.

## Background

The story's Jira description has the reproduction steps and the diagnosis, which the code confirms:

- `InteractiveIframe` (`js/components/report/interactive-iframe.js`) posts `initInteractive` once, from `connect()` in `componentDidMount`, and has no `componentDidUpdate`. A new `state` prop on a mounted iframe is ignored, so the only way to show a different state is to remount it with a new React `key`.
- `IframeStandaloneApp` (`js/containers/report/iframe-standalone-app.js`) keys the iframe `iframe-<answer id>-<interactiveStateHistoryId or "latest">`. The answer id is the Firestore answer document id, which is the same for every save of one student's answer to one question, and `interactiveStateHistoryId` in its state is `null` whenever the latest answer is shown. So a new save produces the same key and nothing redraws. Scrubbing to an older marker and back changes the key twice, which is why that works.
- The scrubber (`InteractiveStateHistoryRangeInput`) is fed from the separately watched `interactive_state_histories` collection and selects the last marker whenever no history id is selected, which is why it moves to the new save on its own.

How a save reaches the view: the Activity Player's `createOrUpdateAnswer` (`activity-player/src/firebase-db.ts`) writes the answer document with `merge: true`, and when the activity saves interactive state history it writes, in the same batch, a new history entry and history state document under a fresh id, and records that id on the answer as `interactive_state_history_id`. Every save also rewrites the answer's `created` timestamp. Portal-report watches the student's answers (`watchCollection` in `js/actions/index.ts`, filtered to the `studentId` URL parameter), and each snapshot replaces the whole `answers` map (`RECEIVE_ANSWERS` in `js/reducers/report-reducer.ts`), so every answer object in the view gets a new identity on any save the student makes to any question in the activity.

Two related defects in the same method surfaced while confirming the diagnosis, both triggered by the same event (a new save arriving while the view is open). They were reproduced with a throwaway Jest test that renders the unconnected `IframeStandaloneApp` with the `iframe-phone` mock and pushes new answer props:

- **Opened on a history entry, a new save snaps the view back to it.** The dashboard's "Open in new tab" link carries `interactiveStateHistoryId` when the teacher had scrubbed before clicking it (`getStandaloneLinkUrl` in `js/components/report/iframe-answer.tsx`). `UNSAFE_componentWillReceiveProps` re-reads that URL parameter on every props update and reloads that entry. So if the teacher scrubs to the latest save and the student then saves again, the view jumps back to the entry named in the URL. Reproduced: after scrubbing to latest, one new save left the view showing the URL's entry with its marker selected.
- **Scrubbed to an older entry, a new save swaps in the latest answer underneath it.** With no URL parameter, a props update sets `answer` to the latest answer while `interactiveStateHistoryId` stays on the selected entry. The iframe key does not change, so the interactive keeps showing the selected entry, but the `answer` the iframe gets (used to resolve `getAttachmentUrl` requests) and the one the scrubber gets are now the latest. Any fix that makes the key follow the latest answer would turn this into a visible bug, redrawing the latest state while the scrubber still points at the older one. The same update can already strand the view today: if it arrives while a just-selected entry is still loading from Firestore, it clears the spinner and renders the latest state under the entry's key, and when the entry finishes loading the key is unchanged, so the iframe never remounts and the interactive stays on the latest save with the scrubber on the older marker. Reproduced with the cache stub holding its callback until after the update.

### The Class Dashboard's inline view

`IframeAnswer` (`js/components/report/iframe-answer.tsx`) renders an `interactive_state` answer's iframe inline when the teacher clicks "View Work" on the dashboard, and always in the compare view. It keys its `InteractiveIframe` on an `answerStateVersion` counter, which is the right shape, but its `UNSAFE_componentWillReceiveProps` has three defects, each reproduced with a throwaway test that renders `IframeAnswer` with the `iframe-phone` mock:

- **It reads `this.props`, not `nextProps`.** On every update it bumps the version and remounts the iframe with the *previous* props' state. A new save remounts the iframe showing the old state; the new one appears only on the next unrelated update. Reproduced: after a new answer the iframe showed state 1, and showed 2 only after one more rerender. Scrubbing to an entry works only because the dashboard's answer panel (`js/containers/portal-dashboard/answer.tsx`) happens to update twice, first with the entry's id and then with its loaded state. Scrubbing back to the latest is a single update (the panel sets both values in one batched event handler), so the inline view keeps showing the entry: reproduced, it still showed the history entry after the id was cleared and the latest answer passed.
- **It remounts on every update.** The version goes up whether or not the state changed. Because `RECEIVE_ANSWERS` rebuilds every answer object on each snapshot, and the dashboard watches the whole class, any save by any student gives every `Answer` new props, so every open inline interactive reloads. Reproduced: two rerenders with an equal answer created two more iframes.
- **A slow history load can overwrite a newer choice.** Each update requests the selected entry's state from `interactiveStateHistoryCache` and applies whatever comes back. If the teacher moves on before an uncached entry finishes loading, the late result replaces the entry they moved to. Reproduced with one entry's load held until after the next was selected.

## Requirements

### Standalone view

- **Latest view follows new saves.** When the standalone view is showing the student's latest answer to an interactive (`interactive_state`) question and a newer save of that answer arrives, the interactive redraws with the new state, with no reload or scrubbing. This holds whether or not the activity saves interactive state history.
- **Only a changed answer redraws.** The interactive does not redraw when a props update leaves the shown answer's saved state unchanged, for example when the student saves a different question in the same activity, when only the history list updates, or when the Activity Player re-saves the same state with a new timestamp (a `"touch"`). A touch with history on still adds a marker, and the scrubber moves to it; since its state equals the one shown, the scrubber and the interactive still agree.
- **The scrubber and the interactive agree.** Once a new save has arrived in the latest view, the scrubber's thumb sits on the new marker, its timestamp is the new save's, and the interactive shows that save's state. The answer and its history entry arrive as separate Firestore snapshots, in either order, so for the moment between them one may be ahead of the other; the view settles once both have arrived, with no teacher action.
- **A redraw keeps keyboard focus in the interactive.** If focus was in the interactive when it redraws, focus is on the redrawn interactive's frame afterward rather than on the page, so a keyboard user is not sent back to the top of the page every time the student saves.
- **A selected older entry is left alone.** When the teacher has scrubbed to an older entry, a new save adds its marker to the scrubber but does not change the selected entry, the interactive's state, or the answer data the interactive is given (so attachment requests resolve against the selected entry, not the latest save). This holds from the moment the teacher selects the entry, including while its state is still loading: the view shows the loading spinner until the entry arrives and then shows the entry, whatever saves arrive in between. Moving the thumb to the last marker afterward shows the newest save. This matches the Class Dashboard, whose answer panel keeps a selected history entry when a new answer arrives (`js/containers/portal-dashboard/answer.tsx`).
- **The URL's history entry is only the starting point.** When the view is opened with an `interactiveStateHistoryId` URL parameter, it opens on that entry as today. After that, the teacher's scrubbing decides what is shown: a new save never moves the view back to the URL's entry, and if the teacher has moved to the latest save, a new save redraws it as in the first requirement.
- **Nothing else changes.** Opening the view, the loading and error states, scrubbing between entries, and the rendering of `external_link` answers and of non-interactive answers (open response, multiple choice, image) behave as they do now.

### Class Dashboard inline view

- **A new save shows at once.** When the inline view is open on a student's latest answer and a newer save arrives, the interactive redraws with the new state in that same update.
- **Only a changed state redraws.** The interactive does not redraw when an update leaves the state it shows unchanged, including updates caused by other students' saves and by saves to other questions.
- **The interactive follows the scrubber.** Selecting a history entry shows that entry's state, and returning to the last marker shows the latest answer, each without waiting for a later update. Selecting an entry redraws the interactive once, not again when the panel passes the entry's loaded state.
- **The latest choice wins.** When the teacher selects an entry and then another (or the latest) before the first has loaded, the first entry's state is never shown once it arrives.
- **A redraw keeps keyboard focus in the interactive**, as in the standalone view.
- **Nothing else changes.** The "View Work" and "Open in new tab" links, the report item answers, and `external_link` answers behave as they do now.

## Technical Notes

- Files: `js/containers/report/iframe-standalone-app.js` (the iframe key and `UNSAFE_componentWillReceiveProps`), `js/components/report/iframe-answer.tsx` (the inline view's `UNSAFE_componentWillReceiveProps` and `answerStateVersion`), `js/components/report/interactive-iframe.js` (mount-only `initInteractive`), `js/components/portal-dashboard/interactive-state-history-range-input.tsx` (marker selection).
- Remounting the iframe is the established way to show a different state here: scrubbing already does it, and `IframeAnswer` does it with an `answerStateVersion` counter in its key. Re-posting `initInteractive` to a mounted interactive is not something interactives are known to handle, so it is not assumed.
- The answer document id cannot distinguish saves, and neither can answer object identity, which changes on every snapshot of the student's answers. What changes per save is the answer's saved state (`answer`), its `created` timestamp, and, when history is on, its `interactiveStateHistoryId`. Which of these drives the redraw is an implementation choice, but `interactiveStateHistoryId` alone would miss activities without history.
- A redraw reloads the interactive, as scrubbing does today. Saves arrive at most about every two seconds per interactive: the interactive API debounces `interactiveState` posts by 2000 ms, and the Activity Player saves only when the state differs from the last one (or on a `"touch"`, which re-saves the same state).
- Tests: `test/components/report/interactive-iframe_spec.js` shows the `iframe-phone` mock pattern (`__mocks__/iframe-phone.ts`, `_parentInstances`, `post` spies). There is no existing unit test for `IframeStandaloneApp`; the throwaway reproduction rendered `connect(...)(IframeStandaloneApp).WrappedComponent` with `@testing-library/react` and set `window.location.search` for `config()`. The Cypress standalone spec (`cypress/integration/standalone-iframe.spec.js`) runs on fake data with no history and no live updates.
- Only answers of type `interactive_state` take the iframe branch that has this bug. The Activity Player saves question-interactives with their own answer types (`open_response_answer`, `multiple_choice_answer`, `image_question_answer`, from `getAnswerWithMetadata` in `activity-player/src/utilities/embeddable-utils.ts`), and the standalone view renders those through `Answer`, which renders from props and already updates live. Wildfire and other custom interactives save `interactive_state`.
- A parent page can tell that focus is inside a cross-origin iframe (`document.activeElement` is the `IFRAME` element) and can put focus back on a new iframe with `focus()`. Checked in Chromium with Playwright on a two-origin page: after refocusing, the next Tab moves into the frame's content. Focus returns to the frame, not to the element inside it that had focus.
- Jest runs under Node 16 in this repo.

## Out of Scope

- Changing `InteractiveIframe` to push new state into a mounted interactive.
- Any change to how the Activity Player writes answers or history.
- Scrubber visuals and behavior beyond what the requirements above state.

## Open Questions

### RESOLVED: Judgment call: redraw by remounting the iframe rather than re-sending state
**Context**: The interactive could be redrawn by remounting the iframe or by posting new state to the mounted one.
**Options considered**:
- A) Remount, as scrubbing already does
- B) Re-post `initInteractive` from a `componentDidUpdate` in `InteractiveIframe`

**Decision**: A. It reuses the path scrubbing already exercises, and B assumes every interactive handles a second `initInteractive`, which nothing here verifies. Recorded as a technical constraint, not a requirement, so the implementation spec can revisit it with evidence.

### RESOLVED: Judgment call: cover activities without interactive state history
**Context**: The Jira fix suggests keying on the latest answer's `interactiveStateHistoryId`, which only changes per save when the activity saves history. The story's reproduction has history turned on.
**Options considered**:
- A) Redraw on any change to the latest answer's saved state
- B) Redraw only when the history id changes

**Decision**: A. The underlying defect (mount-only `initInteractive` with a key that does not change per save) is the same without history, and the Jira description notes that any interactive shown in this view behaves the same. B would leave the view stale for every activity that does not save history.

### RESOLVED: Should this story also fix the two related standalone-view defects?
**Context**: Neither is in the Jira description, but both are triggered by the same event (a new save while the view is open) and live in the same method. One of them (a selected older entry having the latest answer swapped in underneath it) becomes a visible bug under any fix for the main defect unless it is handled. The other (the URL's history entry reasserting itself) makes the story's expected result false for any view opened from a dashboard that had been scrubbed.
**Options considered**:
- A) Fix both here; they are part of making the view follow new saves correctly
- B) Fix only the main defect and the swapped-in answer it would expose; file the URL-parameter snap-back separately
- C) Fix only the main defect; file both separately

**Decision**: A. C is not viable, because the main fix exposes the swapped-in answer as a visible regression (the reproduction shows the latest answer already sits in state under a selected older entry). B would ship a view that still shows the wrong state after a new save whenever it was opened from a scrubbed dashboard, which is the story's own symptom reached by a second route. Both are handled by deciding once, in `UNSAFE_componentWillReceiveProps`, whether a props update should change what is shown, which the main fix has to touch anyway.

### RESOLVED: Should the Class Dashboard's inline view be fixed in this story?
**Context**: The inline view (`IframeAnswer`) shows a new save one update late and remounts the interactive on every rerender. It is the same user-visible symptom in a different view, with a different cause and a different fix. The Jira story names only the standalone view.
**Options considered**:
- A) Leave it out and file a follow-up story with the reproduction
- B) Fix it here as well

**Decision**: B (Doug Martin, 2026-10-01). It is the same user-visible symptom, and the fix is small. The two views share the focus handling, which keeps one implementation rather than two.

### RESOLVED: Low confidence: a redraw per save while a student works actively
**Context**: Each save remounts the interactive, which reloads it. For an interactive that saves on every small change, a teacher watching live would see it reload repeatedly.
**Options considered**:
- A) Accept a redraw per save; it is what the story asks for and matches scrubbing
- B) Throttle redraws (for example, at most one per few seconds, always ending on the latest)

**Decision**: A. Saves are already rate-limited at the source: `setInteractiveState` in `@concord-consortium/lara-interactive-api` debounces the `interactiveState` post by `setInteractiveStateTimeout` (2000 ms, trailing), and the Activity Player's `iframe-runtime.tsx` only saves when the state actually differs. So a student typing continuously in an open response produces at most one save (and one redraw) about every two seconds, the same granularity as the history markers the teacher scrubs through. A throttle in the report would add a second, report-side delay nobody asked for. The accepted cost is that a redraw discards anything the teacher did inside the interactive (scrolling, zooming, a selected tab), as scrubbing does today; a teacher who wants to hold a view while the student works can scrub to that save, which a new save leaves alone.

## Verification

Before the implementation spec, the requirements were checked together against a throwaway prototype of the fix in `iframe-standalone-app.js` (a counter in the iframe key bumped when the latest answer's `answer` value changes, the URL's history id honored only until it has loaded once, and `answer` left alone while an entry is selected), with a throwaway Jest suite rendering the unconnected component through the `iframe-phone` mock. The suite covers: redraw on a new save with history arriving before and after the answer; no redraw for another question's save, a history-only update or a touch; redraw without history; a selected older entry left alone, including the answer it is given, until the teacher returns to the last marker; and a URL-opened view that stops snapping back once the teacher moves to the latest save. All four tests passed with the prototype and all four failed on `master`, so each requirement is both achievable alongside the others and observable. The prototype and suite were discarded. The inline view's requirements were checked the same way once it came into scope, with a throwaway suite rendering `IframeAnswer`: each of the three defects in Background reproduced on `master` and passed against the fix.

## Self-Review

Roles: Senior Engineer, QA Engineer, Teacher, WCAG Accessibility Expert. Each finding was checked against the code or a throwaway test before being recorded, and each was fixed in place.

### Senior Engineer

#### RESOLVED: The answer and its history entry arrive separately
`fetchAndObserveData` watches `answers` and `interactive_state_histories` with two independent `onSnapshot` queries (`watchCollection` in `js/actions/index.ts`), and each dispatches its own action (`RECEIVE_ANSWERS`, `RECEIVE_INTERACTIVE_STATE_HISTORIES`), so the view receives the new answer and the new marker as two props updates in either order, even though the Activity Player writes them in one batch. "The scrubber and the interactive agree" was written as if they arrive together, which no implementation can meet. Reworded to require that the view settles once both have arrived.

### Teacher

#### RESOLVED: A redraw discards the teacher's interaction with the interactive
A remount reloads the interactive, so whatever the teacher did inside it (scrolling a table, zooming a graph) is lost at each save, up to about every two seconds while a student works. This follows from redrawing by remount and matches scrubbing, and the teacher already has a way to hold a view: scrubbing to a save, which new saves leave alone. Recorded as the accepted cost in the redraw-frequency decision rather than as a new requirement.

### WCAG Accessibility Expert

#### RESOLVED: A redraw drops keyboard focus to the page
Remounting the iframe removes the focused element, and focus falls to `document.body`: a throwaway test that focused an iframe and re-keyed it showed `document.activeElement` going from `IFRAME` to `BODY`. Today that only happens when the teacher scrubs, with focus on the slider rather than the frame; with live redraws it would happen on every student save while a keyboard user is working in the interactive. Added the requirement that focus returns to the redrawn frame when it was in the interactive.

### QA Engineer

No findings survived verification. Each requirement is observable through the `iframe-phone` mock (a redraw is a new `ParentEndpoint` whose `initInteractive` carries the new state; no redraw is no new endpoint), the scrubber's rendered thumb and timestamp, and `document.activeElement`.
