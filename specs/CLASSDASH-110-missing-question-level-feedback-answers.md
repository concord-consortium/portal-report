# CLASSDASH-110: Missing Question Level Feedback Answers

## Problem Summary

Answers are not displaying (showing blank) in the Question Level Feedback panel. This is a regression between tagged versions v4.24.0 and v4.25.0.

**Key observations**:
- Bug does NOT appear with canned JSON data, only with real Firebase data (timing/race condition)
- Answer area shows **blank** (not "No response")
- Answers display correctly in Activity Level Feedback "Show Answers" and on the Dashboard
- Bug is specific to Question Level Feedback panel
- Only some student answers appear, not all

## Affected Versions

- **Working**: v4.24.0
- **Broken**: v4.25.0

## Root Cause Analysis

### Commit Introducing the Regression

The regression was introduced in commit `0ea2814` ("Updated report item answer loading logic") which modified:
- `js/components/report/iframe-answer.tsx`
- `js/reducers/report-reducer.ts`

### Bug 1: Reducer can only store one answer per question (primary bug)

In `report-reducer.ts`, the v4.25.0 refactor replaced a state lookup with a simple key-value map:

**v4.24.0** — correctly looked up each student's answer:
```tsx
case SET_REPORT_ITEM_ANSWER:
  const answer = getAnswer(state, action.questionId, action.reportItemAnswer.platformUserId);
  // ...
  return state.setIn([storageName, answer.get("id")], action.reportItemAnswer);

function getAnswer(state, questionId, platformUserId) {
  return state.answers.find(a =>
    a.get("questionId") === questionId && a.get("platformUserId") === platformUserId
  );
}
```

**v4.25.0** — broken map that only holds ONE answer per question:
```tsx
// In processReportItemRequests — multiple students overwrite the same key:
questionIdToAnswerId[questionId] = answer.get("id");  // <-- last student wins

// In SET_REPORT_ITEM_ANSWER — first response deletes the entry:
const answerId = questionIdToAnswerId[action.answer];
delete questionIdToAnswerId[action.answer];  // <-- gone for all other students
```

This means only the last student's answer ID for a given question gets stored. All other students' report item answers are lost.

### Bug 2: IframeAnswer never processes reportItemAnswer on initial mount (secondary bug)

In `iframe-answer.tsx`, the v4.25.0 refactor moved `reportItemAnswerItems` from being computed in `render()` to component state. But `updateReportItemAnswerItems()` is only called in `UNSAFE_componentWillReceiveProps`, never on initial mount. If `reportItemAnswer` is already available when the component mounts, the items remain `[]`.

## Implemented Fix ✅

### Fix 1: Restore getAnswer lookup in reducer

Replaced the broken `questionIdToAnswerId` map with the original `getAnswer()` function that correctly looks up each student's answer by both `questionId` and `platformUserId`.

**File**: `js/reducers/report-reducer.ts`

### Fix 2: Process reportItemAnswer on initial mount

Added a call to `updateReportItemAnswerItems()` in the constructor's `requestAnimationFrame` callback when `reportItemAnswer` is already available.

**File**: `js/components/report/iframe-answer.tsx`

## Testing Plan

1. **Reproduce the bug** (on v4.25.0 without fix):
   - Load dashboard with a real Firebase class
   - Navigate to Question Level Feedback panel
   - Select a question with interactive answers
   - Verify answers show blank for most/all students

2. **Verify fix**:
   - Apply both fixes
   - Repeat above steps
   - Verify ALL student answers display correctly

3. **Regression testing**:
   - Test with canned data (should still work)
   - Test history scrubber functionality (should still work)
   - Test activity level feedback "Show Answers" (should still work)
   - Test dashboard compact answer view (should still work)

## Answer History (v4.25.0) Compatibility Analysis

The v4.25.0 release introduced an "Answer History" / history scrubber feature (CLASSDASH-103, commit `eec3c8b`). This analysis verifies our fix does not break it.

### What the history feature added

The history feature allows teachers to scrub through a student's interactive state over time. It introduced:

| Component / File | Purpose |
|---|---|
| `interactive-state-history-cache.ts` | Fetches full interactive states from Firestore, with LRU caching |
| `interactive-state-history-range-input.tsx` | Scrubber UI component |
| `answer.tsx` changes | Manages `interactiveStateHistoryId` state, fetches cached states via `handleSetInteractiveStateHistoryId` |
| `iframe-answer.tsx` changes | Updates `answerState` / `answerStateVersion` when history ID changes (lines 67-85) |
| `report-tree.js` selectors | `getInteractiveStateHistoriesByQuestion` selector for history metadata |
| `report-reducer.ts` | `RECEIVE_INTERACTIVE_STATE_HISTORIES` action to store history metadata |
| `actions/index.ts` | Firebase watcher for `interactive_state_histories` collection |

### Why our fix does NOT affect the history feature

**Fix 1 (reducer):** Restored `getAnswer()` for `SET_REPORT_ITEM_ANSWER`.

- The history feature uses `RECEIVE_INTERACTIVE_STATE_HISTORIES` — a completely separate action/reducer path
- `SET_REPORT_ITEM_ANSWER` handles report item HTML rendering, not interactive state history
- The removed `questionIdToAnswerId` map was only used by `SET_REPORT_ITEM_ANSWER` and `processReportItemRequests`
- `processReportItemRequests` no longer writes to the removed map, but still correctly extracts `questionId`, `platformUserId`, and `reportState` from the `answer` Map and posts to the iframe phone — this is unchanged

**Fix 2 (iframe-answer.tsx constructor):** Added `updateReportItemAnswerItems()` on mount.

- `updateReportItemAnswerItems()` only processes `reportItemAnswer` props into `reportItemAnswerItems` state (the rendered HTML items)
- The history scrubber code path is in `UNSAFE_componentWillReceiveProps` lines 67-85, which updates `answerState` and `answerStateVersion` — completely separate state fields
- The constructor fix runs in `requestAnimationFrame` and does not touch `answerState`, `answerStateVersion`, or `interactiveStateHistoryId`

### Data flow isolation

```
Report Item Answers (our fix):
  getReportItemAnswer → processReportItemRequests → iframePhone.post
  → SET_REPORT_ITEM_ANSWER → getAnswer(state, qId, userId) → reportItemAnswersFull[answerId]
  → IframeAnswer.reportItemAnswer prop → updateReportItemAnswerItems → reportItemAnswerItems state

Answer History (untouched):
  Firebase interactive_state_histories → RECEIVE_INTERACTIVE_STATE_HISTORIES → reducer
  → getInteractiveStateHistoriesByQuestion selector → Answer.interactiveStateHistory prop
  → InteractiveStateHistoryRangeInput → setInteractiveStateHistoryId
  → interactiveStateHistoryCache.get → IframeAnswer.answerState / answerStateVersion state
```

These are fully independent data flows sharing no mutable state.

## Files Modified

- `js/reducers/report-reducer.ts` — Restored `getAnswer()` lookup, removed broken `questionIdToAnswerId` map
- `js/components/report/iframe-answer.tsx` — Added `updateReportItemAnswerItems()` call on initial mount

## References

- Regression commit: `0ea2814`
- Related Jira: CLASSDASH-110
- Previous working version: v4.24.0
