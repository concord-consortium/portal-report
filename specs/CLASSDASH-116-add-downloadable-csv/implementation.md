# Implementation Plan: Add a Downloadable CSV to the Class Dashboard

**Jira**: https://concord-consortium.atlassian.net/browse/CLASSDASH-116
**Requirements Spec**: [requirements.md](requirements.md)
**Status**: **In Development**

## Implementation Plan

The CSV is built in the browser from the Redux store, reusing the selectors the dashboard renders from, so the file matches the screen by construction. The work splits into a data step (keep the portal fields the dashboard currently discards), two pure steps (CSV text helpers, then the dashboard's rows), a small side-effect step (save the file and log it), and two UI steps (the menu item with keyboard access, then the header button with its fit detection), followed by a Cypress step that exercises the whole path.

### Keep student usernames and class teachers from the portal

**Summary**: The portal's offering API already returns each student's `username`, and its class API returns the class's `teachers`, but the dashboard drops both. Keep them in the report state so the CSV can use them. This is a discrete commit because it changes the data layer and the demo data without touching any UI.

**Files affected**:
- `js/api.ts`: move the `last_run` merge into an exported `mergeOfferingStudentData` that also merges `username`, and add `username` and `teachers` to the raw types
- `js/core/transform-json-response.ts`: add `username` to `IStudentData` and `teachers` to `IPortalData.classInfo`
- `js/reducers/report-reducer.ts`: add `clazzTeacherNames: List<string>` to the report state
- `js/data/offering-data.json`: add a `username` to each demo student
- `js/data/small-class-data.json`: add a `teachers` list
- `test/api_spec.js`: tests for `mergeOfferingStudentData`
- `test/reducers/report-reducer_spec.js`: test for `clazzTeacherNames`

**Estimated diff size**: ~120 lines

`js/api.ts`, raw types:

```ts
export interface IPortalRawData extends ILTIPartial{
  offering: {
    id: number;
    activity_url: string;
    rubric_url: string;
  };
  classInfo: {
    id: number;
    name: string;
    students: IStudentRawData[];
    teachers?: IClassTeacherRawData[];
  };
  // ...unchanged
}

export interface IStudentRawData {
  first_name: string;
  last_name: string;
  last_run: string | null;
  user_id: string;
  username?: string | null;
}

export interface IClassTeacherRawData {
  first_name: string;
  last_name: string;
}
```

`js/api.ts`, the merge. It replaces the inline `lastRunMap` block at the top of `fetchPortalDataAndAuthFirestore`, which then calls `mergeOfferingStudentData(offeringData, classData)` before the existing `resourceLinkId` line:

```ts
// The students' last_run timestamp and username are only available in the offering data,
// so they are merged into the class data for streamlined access.
export function mergeOfferingStudentData(offeringData: any, classData: any) {
  const offeringStudents: Record<string, {last_run?: string | null; username?: string | null}> = {};
  (offeringData.students || []).forEach((student: any) => {
    if (student.user_id) {
      offeringStudents[student.user_id] = student;
    }
  });
  (classData.students || []).forEach((student: any) => {
    const offeringStudent = student.user_id && offeringStudents[student.user_id];
    if (offeringStudent) {
      if (offeringStudent.last_run !== undefined) {
        student.last_run = offeringStudent.last_run;
      }
      if (offeringStudent.username !== undefined) {
        student.username = offeringStudent.username;
      }
    }
  });
}
```

`js/core/transform-json-response.ts`:

```ts
  classInfo: {
    id: number;
    name: string;
    classHash: string;
    students: IStudentData[];
    teachers?: {firstName: string; lastName: string}[];
  };

export interface IStudentData {
  name: string;
  realName: string;
  firstName: string;
  lastName: string;
  lastRun: string | null;
  username?: string | null;
  id: string;
  userId: number;
}
```

`js/reducers/report-reducer.ts`: add `clazzTeacherNames: List<string>` to `IReportState`, to `ReportState` and to `INITIAL_REPORT_STATE` (default `List()`). In the `RECEIVE_PORTAL_DATA` case, next to `clazzName`:

```ts
        .set("clazzTeacherNames", List((data.classInfo.teachers || []).map(t => `${t.firstName} ${t.lastName}`)))
```

The students map needs no change: `username` rides along on each student `Map`, and `setAnonymous` only rewrites `name`, so the real username is still there for anonymized sessions. The rows step blanks it.

Demo data: give each of the six students in `offering-data.json` a `username` (e.g. `"jjenkins"` for John Jenkins), and add `"teachers": [{"first_name": "Kristen", "last_name": "Teachername"}, {"first_name": "Pat", "last_name": "Coteacher"}]` to `small-class-data.json`. Two teachers exercise the ", " join.

Tests:
- `mergeOfferingStudentData`:
  - copies `last_run` and `username` onto matching class students
  - leaves unmatched students alone
  - tolerates missing `students` arrays
  - doesn't overwrite a field the offering omits
- Report reducer: `RECEIVE_PORTAL_DATA` with two teachers gives `clazzTeacherNames` `["Kristen Teachername", "Pat Coteacher"]`, and no `teachers` gives an empty list.

---

### Add CSV text helpers

**Summary**: Pure helpers for everything format-related: cell escaping (with the formula guard), joining rows into a file with a BOM, HTML-to-text, dates and safe file names. They're a separate commit because they have no dependency on the dashboard and are the part most worth unit testing on their own.

**Files affected**:
- `js/util/csv.ts`: new
- `test/util/csv_spec.ts`: new

**Estimated diff size**: ~170 lines

```ts
import striptags from "striptags";

const FORMULA_START = /^[=+\-@\t\r]/;
const NEEDS_QUOTES = /[",\r\n]/;

// Formats one CSV cell. Text a spreadsheet would treat as a formula is prefixed with a
// single quote (OWASP CSV injection guidance), then the cell is quoted if needed.
export const csvCell = (value: string | number | null | undefined): string => {
  let text = value == null ? "" : String(value);
  if (FORMULA_START.test(text)) {
    text = "'" + text;
  }
  return NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// Joins rows into a CSV file. The byte order mark makes Excel read the file as UTF-8.
export const csvFromRows = (rows: Array<Array<string | number | null | undefined>>): string =>
  "﻿" + rows.map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";

// Converts authored or student HTML to plain text: tags removed, entities decoded,
// whitespace (including &nbsp;) collapsed.
export const htmlToText = (html: string | null | undefined): string => {
  if (!html) {
    return "";
  }
  const stripped = striptags(html, [], " ");
  const doc = new DOMParser().parseFromString(stripped, "text/html");
  return (doc.documentElement.textContent || "").replace(/\s+/g, " ").trim();
};

const pad = (n: number) => n.toString().padStart(2, "0");

// YYYY-MM-DD in the browser's local time zone.
export const formatCsvDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// YYYY-MM-DD HH:MM in the browser's local time zone, or "" for a missing or invalid date.
export const formatCsvDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return "";
  }
  return `${formatCsvDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Replaces characters that Windows or macOS don't allow in file names. Control characters are
// checked by code point, since the repo's ESLint config rejects them in a regex (no-control-regex).
export const safeFileNamePart = (name: string): string =>
  Array.from(name)
    .map(ch => ch.charCodeAt(0) < 32 || '\\/:*?"<>|'.includes(ch) ? "_" : ch)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
```

Tests:
- `csvCell`:
  - plain text passes through
  - commas, quotes and line breaks are quoted, with quotes doubled
  - `=SUM(A1)`, `+1`, `-5`, `@x`, a leading tab and a leading CR get the `'` prefix
  - a prefixed value that also needs quotes is both prefixed and quoted
  - `null` and `undefined` become empty
  - numbers are stringified
- `csvFromRows`: starts with `﻿`, uses CRLF, ends with CRLF, and round-trips a row with every special case through a small parser in the test.
- `htmlToText`:
  - `<p>Hot&nbsp;&amp; dry</p><p>next</p>` becomes `Hot & dry next`
  - empty and `null` give `""`
  - a `<script>` tag's text is returned as text, not run (jsdom's `DOMParser` doesn't execute scripts)
- `formatCsvDateTime`: an ISO string with `Z` formats in local time. The test sets `process.env.TZ` before importing, or compares against a `Date` built from the same value. Also covers `null`, `""` and an invalid string.
- `safeFileNamePart`: `a/b:c*?` becomes `a_b_c__`.

---

### Build the dashboard CSV rows

**Summary**: One pure function turns the Redux state into the CSV's rows (header, Prompt, Correct answer, one per student) and another gives the file name. They reuse the dashboard's selectors, so question order, visibility, anonymized names, deleted-choice text and progress counts all come from the same code the screen uses. This is the core of the story and gets its own commit with thorough tests.

**Files affected**:
- `js/util/dashboard-csv.ts`: new
- `js/selectors/dashboard-selectors.js`: export `countCompletedAnswers`
- `js/util/answer-utils.tsx`: pull the audio check out of `getAnswerBadges` into an exported `hasAudioResponse`
- `js/util/answer-link.ts`: new, the link to an answer's single-question view
- `test/util/dashboard-csv_spec.ts`: new
- `test/util/answer-link_spec.ts`: new

**Estimated diff size**: ~500 lines, about 250 of them tests

`js/selectors/dashboard-selectors.js`: change `function countCompletedAnswers` to `export function countCompletedAnswers`. There is no behavior change.

`js/util/answer-utils.tsx`: `getAnswerBadges` checks for audio inline, after its feedback check. Calling it with an empty feedback map would take the feedback branch (`Map().get("feedback") !== ""` is true), so the audio check moves into its own function, which `getAnswerBadges` then calls:

```ts
export const hasAudioResponse = (answer: Map<string, any>) => {
  if (answer?.get("questionType") !== "open_response") {
    return false;
  }
  try {
    const reportState = JSON.parse(answer.get("reportState"));
    return !!JSON.parse(reportState?.interactiveState)?.audioFile;
  } catch (e) {
    return false;
  }
};
```

In `getAnswerBadges`, the `if (type === "open_response") { ... }` block becomes `if (hasAudioResponse(answer)) { badges.add("audioAttachment"); }`. The existing badge behavior is unchanged.

`js/util/dashboard-csv.ts`:

```ts
import { List, Map } from "immutable";
import getSequenceTree, { getAnswersByQuestion } from "../selectors/report-tree";
import { getAnonymous, getIsResearcher, countCompletedAnswers } from "../selectors/dashboard-selectors";
import { sortByName } from "./sort-utils";
import { getFormattedStudentName } from "./student-utils";
import { hasResponse, hasAudioResponse } from "./answer-utils";
import { htmlToText, formatCsvDate, formatCsvDateTime, safeFileNamePart } from "./csv";
import { getAnswerLink } from "./answer-link";
import { RootState } from "../reducers";

type Cell = string | number;
type AnswerCell = (answer: Map<string, any>, question: Map<string, any>, student: Map<string, any>) => string;

interface IAnswerColumn {
  header: string;
  prompt: string;
  correctAnswer: string;
  question: Map<string, any>;
  cell: AnswerCell;
}

const BLANK_MARKER = /\[([^)]+)\]/g;          // the same pattern the dashboard's prompts use
const DELETED_CHOICE = "[the selected choice has been deleted by question author]";

const safely = (fn: AnswerCell): AnswerCell => (answer, question, student) => {
  try {
    return fn(answer, question, student) || "";
  } catch (e) {
    return "";   // a malformed answer gives an empty cell, not a failed download
  }
};

const choiceCell: AnswerCell = answer =>
  (answer.get("selectedChoices") || List())
    .map((choice: Map<string, any>) => choice.get("id") === -1 ? DELETED_CHOICE : htmlToText(choice.get("content")))
    .join(", ");

// An audio-only answer has no text, so its cell links to the single-question view,
// where the recording can be played.
const openResponseCell = (sourceKey: string): AnswerCell => (answer, question, student) => {
  const value = answer.get("answer");
  if (typeof value === "string") {
    return value;
  }
  if (answer.get("answerText")) {
    return htmlToText(answer.get("answerText"));
  }
  return hasAudioResponse(answer) ? getAnswerLink(sourceKey, question.get("id"), student.get("userId")) : "";
};

// Few interactives provide readable text, so most cells hold a link to the answer instead.
const interactiveCell = (sourceKey: string): AnswerCell => (answer, question, student) => {
  if (answer.get("type") === "external_link") {
    return answer.get("answer") || "";
  }
  if (answer.get("answerText")) {
    return htmlToText(answer.get("answerText"));
  }
  return hasResponse(answer, question) ? getAnswerLink(sourceKey, question.get("id"), student.get("userId")) : "";
};

// Each question's columns, as [header suffix, cell]. Only image questions have two.
const columnsForQuestion = (question: Map<string, any>, sourceKey: string): Array<[string, AnswerCell]> => {
  switch (question.get("type")) {
    case "multiple_choice":
      return [["", choiceCell]];
    case "open_response":
      return [["", openResponseCell(sourceKey)]];
    case "image_question":
      return [[" Image", answer => (answer.getIn(["answer", "imageUrl"]) as string) || ""],
              [" Text", answer => (answer.getIn(["answer", "text"]) as string) || ""]];
    default:
      return [["", interactiveCell(sourceKey)]];
  }
};

const promptText = (question: Map<string, any>) => {
  const html = [question.get("drawingPrompt"), question.get("prompt")].filter(Boolean).join(" ");
  return htmlToText(html).replace(BLANK_MARKER, "__________") || "(no prompt)";
};

const correctAnswerText = (question: Map<string, any>) => {
  const correct = (question.get("choices") || List()).filter((c: Map<string, any>) => c.get("correct"));
  return correct.size > 0
    ? `Correct answer(s): ${correct.map((c: Map<string, any>) => htmlToText(c.get("content"))).join(", ")}`
    : "";
};

export const getAssignmentName = (sequenceTree: Map<string, any>) =>
  sequenceTree.get("name") || sequenceTree.get("children").first()?.get("name") || "";

const getVisibleActivityQuestions = (sequenceTree: Map<string, any>) =>
  sequenceTree.get("children").map((activity: Map<string, any>) =>
    activity.get("questions").filter((q: Map<string, any>) => q.get("visible")));

// Named as the dashboard names things (Student Name, Assignment, Last Run), with no res_1_ prefix.
const STUDENT_HEADERS = ["Student Name", "Username", "Class", "Teachers", "Assignment",
  "Last Run", "Questions", "Answered", "Progress (%)"];

export const buildDashboardCsvRows = (state: RootState): Cell[][] => {
  const report = state.get("report");
  const sequenceTree = getSequenceTree(state);
  const answers = getAnswersByQuestion(state);
  const anonymous = getAnonymous(state) || getIsResearcher(state);
  const assignmentName = getAssignmentName(sequenceTree);
  const teacherNames = (report.get("clazzTeacherNames") || List()).join(", ");
  const activityQuestions: List<List<Map<string, any>>> = getVisibleActivityQuestions(sequenceTree);
  const visibleQuestions = activityQuestions.flatten(1) as List<Map<string, any>>;

  const answerColumns: IAnswerColumn[] = [];
  activityQuestions.forEach((questions, activityIndex) => {
    questions.forEach(question => {
      // The dashboard's labels: "Activity 2" for the activity and "Q7" for the question.
      const label = `Activity ${(activityIndex as number) + 1} Q${question.get("questionNumber")}`;
      const prompt = `Q${question.get("questionNumber")}: ${promptText(question)}`;
      const correctAnswer = question.get("type") === "multiple_choice" ? correctAnswerText(question) : "";
      columnsForQuestion(question, report.get("sourceKey")).forEach(([suffix, cell]) => {
        answerColumns.push({ header: `${label}${suffix}`, prompt, correctAnswer, question, cell: safely(cell) });
      });
    });
  });

  const blanks = STUDENT_HEADERS.map(() => "");
  const headerRow = [...STUDENT_HEADERS, ...answerColumns.map(c => c.header)];
  const promptRow = ["Prompt", ...blanks.slice(1), ...answerColumns.map(c => c.prompt)];
  const correctRow = ["Correct answer", ...blanks.slice(1), ...answerColumns.map(c => c.correctAnswer)];

  const studentRows = sortByName(report.get("students")).map((student: Map<string, any>) => {
    const numQuestions = visibleQuestions.size;
    const numAnswers = countCompletedAnswers(visibleQuestions, answers, student);
    const percent = numQuestions > 0 ? Math.round(1000 * numAnswers / numQuestions) / 10 : "";
    const cells = answerColumns.map(column => {
      const answer = answers.getIn([column.question.get("id"), student.get("id")]) as Map<string, any> | undefined;
      // An unsubmitted answer to a required question isn't shown, as in the dashboard.
      if (!answer || (column.question.get("required") && !answer.get("submitted"))) {
        return "";
      }
      return column.cell(answer, column.question, student);
    });
    return [
      getFormattedStudentName(anonymous, student),
      anonymous ? "" : (student.get("username") || ""),
      report.get("clazzName"),
      teacherNames,
      assignmentName,
      formatCsvDateTime(student.get("lastRun")),
      numQuestions,
      numAnswers,
      percent,
      ...cells
    ];
  }).toArray();

  return [headerRow, promptRow, correctRow, ...studentRows];
};

export const getDashboardCsvFileName = (state: RootState, now: Date) => {
  const clazzName = safeFileNamePart(state.getIn(["report", "clazzName"]) || "Class");
  const assignmentName = safeFileNamePart(getAssignmentName(getSequenceTree(state)) || "Assignment");
  return `${clazzName} - ${assignmentName} - ${formatCsvDate(now)}.csv`;
};
```

`js/util/answer-link.ts`:

```ts
import { urlParam } from "./misc";
import { ensureScheme } from "../api";

// A link to portal-report's single-question view of one student's answer, in the form
// report-service uses for its _url column. The teacher's token is deliberately left out:
// with auth-domain set, the page signs in through the portal, so it only opens for someone
// with access to the class.
export const getAnswerLink = (sourceKey: string, questionId: string, studentUserId: string | number) => {
  const offering = ensureScheme(urlParam("offering"));
  const clazz = ensureScheme(urlParam("class"));
  const firebaseApp = urlParam("firebase-app");
  const answersSourceKey = urlParam("answersSourceKey");
  const params = new URLSearchParams();
  if (offering) {
    params.set("auth-domain", new URL(offering).origin);
  }
  if (firebaseApp) {
    params.set("firebase-app", firebaseApp);
  }
  params.set("sourceKey", sourceKey);
  params.set("iframeQuestionId", questionId);
  if (clazz) {
    params.set("class", clazz);
  }
  if (offering) {
    params.set("offering", offering);
  }
  params.set("studentId", String(studentUserId));
  if (answersSourceKey) {
    params.set("answersSourceKey", answersSourceKey);
  }
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};
```

Without a portal launch (the dev server's demo data), there is no `offering` or `class`, so the link is just `?sourceKey=…&iframeQuestionId=…&studentId=…`, which opens the single-question view with the same demo data. That was checked while speccing.

Notes on the reused pieces:
- **Question order:** `getSequenceTree`'s `children` are the activities in sequence order, and each activity's `questions` are in page order, which is the order the dashboard renders its question columns. For a single activity, the tree is the fake sequence with an empty name, so `getAssignmentName` falls back to the activity's name, as `PortalDashboardApp` does today.
- **Multiple choice answers:** `getAnswersByQuestion` is built on `getAnswerTrees`, so MC answers already carry `selectedChoices` with the deleted-choice placeholder (id `-1`). `choiceCell` checks the id rather than the content, so the placeholder text is defined once, here.
- **Anonymized names:** `getFormattedStudentName(true, student)` returns the anonymized `name`. `sortByName` sorts by the real last and first names, as the dashboard does.

Tests (`test/util/answer-link_spec.ts`):
- With `?portal-dashboard&offering=https://learn.example.org/api/v1/offerings/12&class=https://learn.example.org/api/v1/classes/34&token=abc&answersSourceKey=activity-player.concord.org&firebase-app=report-service-pro` pushed into the URL, the link:
  - starts with the page's origin and path
  - has `auth-domain=https://learn.example.org`, the `class`, `offering`, `firebase-app` and `answersSourceKey`, and the given `sourceKey`, `iframeQuestionId` and `studentId`
  - has no `token` and no `portal-dashboard`
- With none of those parameters, it has only `sourceKey`, `iframeQuestionId` and `studentId`.

Tests (`test/util/dashboard-csv_spec.ts`): set `?portal-dashboard` with `window.history.pushState` in `beforeAll` so `isQuestionVisible` applies the dashboard's rule (the throwaway check during speccing confirmed this works). Build a `fromJS` state with:
- a two-activity sequence
- visible and hidden questions (`showInFeaturedQuestionReport: false`)
- a scored MC question, an unscored MC question and an MC question whose selected choice was deleted
- a plain open response, a required open response with one submitted and one unsubmitted answer, and an audio-only managed open response
- an image question with a `drawingPrompt`
- an interactive with `answerText`, an interactive with a non-empty state but no text (its cell is `getAnswerLink`'s result), an interactive with an empty state, and an `external_link`
- a malformed answer (image question with no `answer`)
- three students, one with no answers and one with no `lastRun`
- two teachers

Assert:
- the exact header row, from `Student Name` through `Progress (%)` and then `Activity 1 Q1`, `Activity 1 Q6 Image`, `Activity 1 Q6 Text`, `Activity 2 Q1` and so on, and that the hidden question's columns are absent
- the Prompt row: `Q1: …` under `Activity 1 Q1`, `Q1: …` again under `Activity 2 Q1`, the drawing prompt first, `(no prompt)`, entities decoded, blanks as `__________`
- the Correct answer row: only in the scored MC column, and `Correct answer(s): a`
- every answer cell in the list above, including the deleted-choice placeholder, the audio-only open response's link, the interactive's link, the empty-state interactive as empty, the unsubmitted required answer as empty, the link URL and the malformed answer as empty
- the student rows in last-name order, the no-answer student with empty cells and `0` answers, and the progress numbers matching `getStudentProgress`'s counting
- anonymized, both via `report.anonymous` and via `userType: "researcher"`: names come from `name` and `Username` is empty
- `getDashboardCsvFileName` with a fixed `Date` and a class name containing `/`

---

### Save the CSV and log the download

**Summary**: A thunk action that builds the rows from the current state, saves the file through a Blob and a temporary `<a download>`, and logs the event. It's separate from the pure steps so the side effects sit in one small, mockable place.

**Files affected**:
- `js/util/save-file.ts`: new
- `js/actions/download-csv.ts`: new
- `test/actions/download-csv_spec.ts`: new

**Estimated diff size**: ~110 lines

`js/util/save-file.ts`:

```ts
// Saves text as a file through a temporary object URL. The dashboard is a top-level page
// (the portal redirects to it), so downloads aren't blocked by an iframe sandbox.
export const saveTextFile = (fileName: string, text: string, mimeType: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking right away can cancel the download in some browsers; FileSaver.js waits 40 seconds.
  setTimeout(() => URL.revokeObjectURL(url), 40 * 1000);
};
```

`js/actions/download-csv.ts`:

```ts
import { buildDashboardCsvRows, getDashboardCsvFileName } from "../util/dashboard-csv";
import { csvFromRows } from "../util/csv";
import { saveTextFile } from "../util/save-file";
import { trackEvent } from "./index";

export const downloadDashboardCsv = () => (dispatch: any, getState: any) => {
  const state = getState();
  const csv = csvFromRows(buildDashboardCsvRows(state));
  saveTextFile(getDashboardCsvFileName(state, new Date()), csv, "text/csv;charset=utf-8");
  dispatch(trackEvent("Portal-Dashboard", "DownloadCSV"));
};
```

Tests:
- Mock `URL.createObjectURL`/`revokeObjectURL` (jsdom lacks them) and spy on `HTMLAnchorElement.prototype.click`.
- Dispatch `downloadDashboardCsv()` against a small `fromJS` state with a mock `dispatch`.
- Assert that one anchor was clicked with the expected `download` name, that the Blob's text (read with a `FileReader`, since jsdom 15 has no `Blob.text()`) starts with the BOM. Use Jest fake timers so the revoke timeout doesn't keep the test running and the header row, and that `trackEvent` was dispatched with `"DownloadCSV"`. Mock `./index`'s `trackEvent` with `jest.mock` so no logging request is made.

---

### Add the Download item to the hamburger menu, reachable from the keyboard

**Summary**: The menu gets an optional "Download as CSV" item, shown only when the header button doesn't fit, above Help and below the existing divider. The menu toggle becomes a real button, and the icon items become buttons that are focusable only while the menu is open, so a keyboard user can open the menu and download. The icon is replaced with the Zeplin one. This is the UI half that doesn't need layout measurement, so it can be reviewed and tested on its own.

**Files affected**:
- `img/svg-icons/download-icon.svg`: replaced with the Zeplin icon, fills and bounding-box path removed
- `js/components/portal-dashboard/header-menu.tsx`: Download item, toggle button, keyboard focusability
- `css/portal-dashboard/header.less`: button resets for the toggle and menu items, focus styles
- `test/components/portal-dashboard/header-menu_spec.tsx`: new

**Estimated diff size**: ~170 lines

`img/svg-icons/download-icon.svg`, the Zeplin path with the fill attributes and the transparent bounding-box path removed:

```svg
<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 12.986v3.51h13v-3.51h2v3.76a1.75 1.75 0 0 1-1.75 1.75H3.25a1.75 1.75 0 0 1-1.75-1.75v-3.76h2Zm10.303-5.492 1.414 1.414L10 14.126l-.707-.708-4.51-4.51 1.414-1.414L9 10.296V1.5h2v8.796l2.803-2.802Z"/>
</svg>
```

`header-menu.tsx`:
- **Import and props:** uncomment the `DownloadIcon` import. Add the props `onDownloadCsv?: () => void` and `showDownloadCsv?: boolean`. Delete the commented-out "Download (.csv)" block, which this item replaces. The "Print" block stays commented as it is.
- **Item list:** the static `items` array becomes a method so the Download item can be conditional. The Download item logs through `onDownloadCsv` itself (the thunk dispatches `DownloadCSV`), so it has no `logEvent`.

  ```ts
  private getIconItems(): MenuItemWithIcon[] {
    const { onDownloadCsv, showDownloadCsv } = this.props;
    const downloadItem: MenuItemWithIcon[] = onDownloadCsv && showDownloadCsv
      ? [{ MenuItemIcon: DownloadIcon, name: "Download as CSV", dataCy: "download-csv-menu-item", onSelect: onDownloadCsv }]
      : [];
    return [...downloadItem, helpItem];
  }
  ```

  `helpItem` is today's Help entry, unchanged.
- **Toggle button:** in `render`, the icons move inside a button. The surrounding `div` keeps `data-cy="header-menu"`, `onClick` and `ref`, so the existing Cypress header spec and the click-outside handler are unaffected. Keyboard activation of the button fires `click`, which bubbles to the `div`'s handler.

  ```tsx
  <button type="button" className={css.menuButton} aria-label="Menu" aria-expanded={showMenuItems}
          data-cy="header-menu-button">
    { showMenuItems ? <CloseIcon .../> : <MenuIcon .../> }
  </button>
  ```
- **Menu items:** in `renderMenuItems`, each icon item becomes a button. The list is always in the DOM (it fades with `opacity`), so `tabIndex` keeps closed items out of the tab order and `aria-hidden` hides them from screen readers. A click still bubbles to the container, which closes the menu, as today.

  ```tsx
  <div className={`${css.menuList} ${showMenuItems ? css.show : ""}`} data-cy="menu-list" aria-hidden={!showMenuItems}>
    ...
    {this.getIconItems().map((item, i) => (
      <button type="button" key={`item ${i}`} className={`${css.menuItem} ${colorClass}`} onClick={onSelect}
              tabIndex={showMenuItems ? 0 : -1}>
        <item.MenuItemIcon className={`${css.menuItemIcon} ${colorClass}`} aria-hidden="true" />
        <div className={css.menuItemName} data-cy={item.dataCy}>{item.name}</div>
      </button>
    ))}
  ```
- **Divider and order:** the existing `.topMenu` bottom border is the divider in the Zeplin screen. Download comes before Help, matching Zeplin.
- **Focus on close:** when the menu closes (a toggle, an item, or a click outside) and focus is inside the menu list, focus moves to the toggle button (`this.toggleRef.current?.focus()`). Otherwise a keyboard user who activated Download would be left focused on a button inside the now `aria-hidden` list.

`header.less`:
- `.menuButton`: `background: none; border: none; padding: 0; cursor: pointer; display: flex;`, plus a `:focus-visible` outline in `@cc-charcoal`.
- `.menuItem` as a button: `width: 100%; border: none; background: none; font: inherit; text-align: left;`, plus the same `:focus-visible` outline. The existing `.menuItem` layout, hover and active rules still apply.

Tests (`@testing-library/react`, as `answer-compact_spec.tsx` does):
- Without `onDownloadCsv`, there is no Download item. With `onDownloadCsv` and `showDownloadCsv: false`, there's still none. With both, the Download item is above Help.
- Clicking the Download item calls `onDownloadCsv` once.
- The toggle is a `button` with `aria-expanded` false, then true after a click.
- The menu items have `tabIndex` -1 while closed and 0 while open.
- After the Download item is clicked with focus on it, the menu is closed and focus is on the toggle button.

---

### Show the Download button in the header when it fits

**Summary**: The header gets the outlined "Download as CSV" button as the first item in `.headerRight`. A ResizeObserver decides whether it fits next to the teacher's name at full width; when it doesn't, the button is hidden (kept in the DOM so it can still be measured) and the menu shows the item instead. The dashboard wires the thunk in for every session, teachers and researchers alike. This is the step with the layout logic, so it is kept apart from the menu step.

**Files affected**:
- `js/components/portal-dashboard/header.tsx`: button, fit state, ResizeObserver, passes `showDownloadCsv` to the menu
- `js/components/portal-dashboard/download-button-fit.ts`: new, the pure fit calculation
- `js/components/portal-dashboard/account-owner.tsx`: optional `divRef` prop
- `js/containers/portal-dashboard/portal-dashboard-app.tsx`: `downloadDashboardCsv` in `mapDispatchToProps`, passed to `Header`
- `css/portal-dashboard/header.less`: button styles, hidden state, `flex-shrink: 0` on the teacher's name
- `test/components/portal-dashboard/download-button-fit_spec.ts`: new
- `test/components/portal-dashboard/header_spec.tsx`: new

**Estimated diff size**: ~230 lines

`download-button-fit.ts`:

```ts
export const MIN_DOWNLOAD_BUTTON_GAP = 16;

// All edges and widths are "outer": they include the element's horizontal margins.
interface IFitMeasurements {
  assignmentRight: number;   // right edge of the Assignment selector
  ownerOuterLeft: number;    // left margin edge of the teacher's name, which never shrinks
  buttonOuterWidth: number;  // the button's width plus its margins
  buttonShown: boolean;
  buttonOuterLeft: number;   // only meaningful while the button is shown
}

// When the button is shown it sits between the Assignment selector and the name, so it fits
// if its left margin edge clears the selector. When it is hidden it takes no space, so it fits
// if the gap in front of the name could hold it. With .headerRight at min-width 0, the two
// checks give the same answer at every width, so the button can't flip back and forth.
export const downloadButtonFits = (m: IFitMeasurements) =>
  m.buttonShown
    ? m.buttonOuterLeft - m.assignmentRight >= MIN_DOWNLOAD_BUTTON_GAP
    : m.ownerOuterLeft - m.assignmentRight >= MIN_DOWNLOAD_BUTTON_GAP + m.buttonOuterWidth;

// Reads an element's box plus its horizontal margins.
export const outerBox = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  const marginLeft = parseFloat(style.marginLeft) || 0;
  const marginRight = parseFloat(style.marginRight) || 0;
  return { left: rect.left - marginLeft, right: rect.right + marginRight, width: rect.width + marginLeft + marginRight };
};
```

**Two CSS changes make the measurement trustworthy.** Both were verified in the running dashboard with an injected 165px button (see Verification below).
- **`flex-shrink: 0` on `.accountOwner`.** Without it, flexbox squeezes and wraps the teacher's name before anything overlaps, so an overlap check would pass while the name was being crushed. With it, the name keeps its natural width, and a too-wide button shows up as its left edge crossing the selector.
- **`min-width: 0` on `.headerRight`.** Without it, the button raises `.headerRight`'s minimum content width and flexbox rebalances the three header groups, moving the Assignment selector. The shown and hidden checks then disagree across a band of widths (1310–1320px in the demo), which would make the button flip back and forth.

With both in place, the selector and the name don't move when the button appears. The shown and hidden checks agree at every 5px step from 1290px to 1350px, and the switch happens at about 1330px with the demo teacher's name. Without the button, the header's layout is identical to today's at 1100px and 1440px.

**Hiding without losing the measurement.** When the button doesn't fit it gets `.downloadButtonHidden` (`position: absolute; visibility: hidden; pointer-events: none;`). It stays measurable but takes no space, and `visibility: hidden` removes it from the tab order and the accessibility tree. `buttonOuterWidth` comes from `outerBox(button)` on every check, so it follows font and label changes. A hidden button still has its width, since `visibility: hidden` keeps its box.

`header.tsx`:
- **Props and state:** new optional prop `onDownloadCsv?: () => void`, and state `{ downloadButtonFits: true }` (the button starts shown so its width is known on the first check).
- **Refs:** `headerRef` on `.dashboardHeader`, `assignmentRef` on a wrapper `div` around `renderAssignmentSelect()` inside `.headerCenter`, `downloadButtonRef` on the button, and `ownerRef` passed to `AccountOwnerDiv` as `divRef`.
- **Observing:** `componentDidMount` creates a `ResizeObserver` (guarded with `typeof ResizeObserver !== "undefined"`, since jsdom lacks it) that calls `updateDownloadButtonFit`. It observes `headerRef` for window resizes, and `ownerRef` and `downloadButtonRef` for size changes that don't resize the header, such as the web font finishing loading. `componentDidUpdate` calls it too when `userName` or `assignmentName` changes. `componentWillUnmount` disconnects the observer.
- **`updateDownloadButtonFit`:** reads `assignmentRef`'s right edge, and `outerBox` of the name and the button. It calls `downloadButtonFits` with `buttonShown: this.state.downloadButtonFits`, and calls `setState` only when the result changes. It returns early when `onDownloadCsv` is missing.
- **Rendering:** the button is rendered first in `.headerRight` when `onDownloadCsv` is set:

  ```tsx
  <button type="button" ref={this.downloadButtonRef} data-cy="download-csv-button" onClick={onDownloadCsv}
          className={`${css.downloadButton} ${colorClass} ${downloadButtonFits ? "" : css.downloadButtonHidden}`}>
    <DownloadIcon className={`${css.downloadButtonIcon} ${colorClass}`} aria-hidden="true" />
    <span>Download as CSV</span>
  </button>
  ```

  `HeaderMenuContainer` gets `onDownloadCsv={onDownloadCsv}` and `showDownloadCsv={!downloadButtonFits}`.

`header.less`:
- **`.downloadButton`:** the Zeplin button, which looks the same as the view dropdown at the far left of the header:
  - `display: flex; align-items: center; flex: none; box-sizing: border-box; height: 30px; padding: 5px 10px 5px 5px; margin: 0 12px;`
  - `border: solid 1.5px @cc-charcoal-light1; border-radius: 4px;`
  - the label in 16px bold `@cc-charcoal` (the page font is already Lato), `white-space: nowrap`, `cursor: pointer`
  - a `:focus-visible` outline
  - per-view colors, the same as the view dropdown's `*Navigation` themes in `custom-select.less`:

    | theme class | background | hover | pressed |
    |---|---|---|---|
    | `.progress` | `@cc-teal-light6` | `@cc-teal-light4` | `@cc-teal` |
    | `.response` | `@cc-orange-light4B` | `@cc-orange-light3` | `@cc-orange` |
    | `.feedback` | `@feedback-green-light4B` | `@feedback-green-light3B` | `@feedback-green` |

    While pressed, the label and the icon turn white and the border turns white, as the dropdown does, so the icon stays visible on the full-color background.
  - Zeplin draws the button 166px wide. The CSS doesn't fix the width; the padding, icon and label give about that, and the fit check measures the real width.
- **`.downloadButtonIcon`:** 20×20 with a 5px right margin (the Zeplin label's `margin-left`). `fill` comes from the theme classes `.progress`, `.response` and `.feedback` (`@cc-teal`, `@cc-orange`, `@feedback-green`), as `.menuItemIcon` does.
- **`.downloadButtonHidden`:** as above.
- **`.accountOwner`:** add `flex-shrink: 0`.
- **`.headerRight`:** add `min-width: 0`.

These two rules implement the requirements that the header's layout is unchanged when the button isn't shown, and that the button never squeezes the name or moves the selector. The Cypress step checks both: at 1150px, removing the hidden button from the page doesn't move the selector or the name. At 1400px, with the button shown, the name is on one line.

`account-owner.tsx`: add `divRef?: React.Ref<HTMLDivElement>` and put it on the root `div`.

`portal-dashboard-app.tsx`:
- Add `downloadDashboardCsv: () => void` to `IProps` and `downloadDashboardCsv: () => dispatch(downloadDashboardCsv())` to `mapDispatchToProps`.
- In `renderHeader`, pass `onDownloadCsv={this.props.downloadDashboardCsv}`, for teachers and researchers alike. The rows step's `anonymous = getAnonymous(state) || getIsResearcher(state)` makes a researcher's file anonymized, as the dashboard is for them.
- The header is only rendered once `sequenceTree` exists, so the control can't be used before the data has loaded.

Tests:
- **`downloadButtonFits`:**
  - shown and clearing the selector by 16px or more is true, by less is false
  - hidden with enough room in front of the name is true, with 1px too little is false
  - consistency: for a layout where `buttonOuterLeft = ownerOuterLeft - buttonOuterWidth` (what flex-end packing gives with the CSS above), the shown and hidden checks agree for every `assignmentRight` in a range around the threshold
- **`outerBox`:** with a stubbed `getBoundingClientRect` and inline margins, returns the margin-inclusive left, right and width.
- **`Header` (RTL):**
  - with `onDownloadCsv`, a button named "Download as CSV" exists, and clicking it calls the handler
  - without `onDownloadCsv`, there's no button and no menu item. The header keeps this optional prop so it stays usable without a download handler.
  - the icon has `aria-hidden`

  Layout itself isn't testable in jsdom and is covered by the Cypress step.

---

### Cover the download end to end in Cypress, and check the file in real spreadsheets

**Summary**: A Cypress spec runs the real dashboard with the demo data, downloads the file from the header button and from the menu, and checks its contents. It also checks the anonymized download. This is the only place the fit detection and the browser download run together. Two demo answers get edge-case content, and a manual checklist covers opening the file in Excel, Google Sheets and Numbers, which no automated test can do.

**Files affected**:
- `cypress/integration/portal-dashboard/portal-dashboard-download-csv.spec.js`: new
- `js/data/answers.json`: edge-case content in two answers no existing test references
- `.gitignore`: add `/cypress/downloads`

**Estimated diff size**: ~120 lines

**Demo answers.** The demo data has non-ASCII text (the "Cupcake ipsum" answers) but no multi-line, quoted or formula-like answers. Two answers that no Jest or Cypress test references change:
- Student 6's `open_response_60` answer ("test answer 3") becomes `He said "it's hot, dry" and windy,` + a line break + `then the fire spread. Café ✓`. That's a quote, commas, a line break and non-ASCII in one cell.
- Student 5's `image_question_4` note ("test note 2") becomes `=1+1 isn't a formula`.

The spec:
- **At the default 1400×1000 viewport**, `[data-cy=download-csv-button]` is visible. Clicking it saves `cypress/downloads/Test Class - Report Test Sequence - <today>.csv`, where the test computes `<today>` from `new Date()` in local time. `cy.readFile` it and check:
  - the BOM
  - the first 9 header cells: `Student Name`, `Username`, `Class`, `Teachers`, `Assignment`, `Last Run`, `Questions`, `Answered`, `Progress (%)`
  - the Prompt row cell `Q1: Open response question prompt` under `Activity 1 Q1`
  - the Correct answer row cell `Correct answer(s): a`
  - John Jenkins's `test answer 1` in `Activity 1 Q1`
  - John Jenkins's `Activity 2 Q5` cell (an interactive with a response but no text) is a link on the dev server with `iframeQuestionId=mw_interactive_28` and `studentId=1`. `cy.visit` it, and check that the single-question view renders an `iframe`.
  - `Teachers` `Kristen Teachername, Pat Coteacher`
  - each student's `Username`
- **Layout regression:** at 1400px with the button shown, `[data-cy=account-owner]` is one line tall. At 1150px, with the button hidden, record `[data-cy=choose-assignment]`'s and `[data-cy=account-owner]`'s bounding boxes, remove `[data-cy=download-csv-button]` from the DOM (`.invoke("remove")`), and check that both boxes are unchanged. (The demo data can't produce a researcher session, since `fakeUserType` accepts only `teacher` and `learner`, so a no-button page is made this way.)
- **At a 1150px viewport** (`cy.viewport(1150, 1000)`), the button is not visible. Open `[data-cy=header-menu]`, click `[data-cy=download-csv-menu-item]`, and check that the file is saved again.
- **Anonymized:** after toggling "Anonymize students" (as `portal-dashboard-anonymize.spec.js` does), the downloaded `Student Name` cells start with `Student` and the `Username` cells are empty.
- **Keyboard:** `[data-cy=download-csv-button]` is a `button` element and can take focus (`.focus().should("have.focus")`). Enter and Space activating it is native button behavior, so the spec doesn't simulate key presses.

The spec also checks the two edge-case cells: the multi-line open response reads back exactly, and the note reads `'=1+1 isn't a formula`.

**Manual QA checklist**, run once before the PR is marked ready, with the file downloaded from the dev server's demo data. Record the result in the PR description.

| Check | Excel (Windows or macOS) | Google Sheets (File → Import) | Numbers |
|---|---|---|---|
| Opens by double-click (Excel, Numbers) or import (Sheets) with no import dialog questions about encoding | | | |
| `Café ✓` and the "Cupcake ipsum" text show correctly, not as `CafÃ©` | | | |
| Student 6's open response is in one cell, on two lines, with its quotes and commas | | | |
| Student 5's image note shows `=1+1 isn't a formula` as text, not `2` or an error | | | |
| `Last Run` values show as dates and times, and sort in time order | | | |
| `Progress (%)` values are numbers (they right-align and can be summed) | | | |
| The Prompt row's long prompts are complete, not cut off | | | |
| A single-activity download (`?portal-dashboard&resourceType=activity`) looks the same, with `Activity 1` answer headers throughout | | | |
| From a file downloaded through a real portal launch (staging), an interactive's link opens the single-question view after signing in to the portal, and the link has no `token` | | | |

Cypress 8 saves downloads in `cypress/downloads` for Chrome and Electron by default. `trashAssetsBeforeRuns` clears it per run, and the repo's `cypress:test` script sets `trashAssetsBeforeRuns=false`, so the spec deletes the expected file with `cy.task` in `beforeEach`. It adds a small `deleteFile` task to `cypress/plugins/index.js` if none exists.

## Verification

Checks run while writing this plan, against the dev server's demo data. None of the throwaway code is in the repo.

- **Header fit, first attempt:** a 165px button was injected as the first child of `.headerRight`, and the plan's shown and hidden checks were computed at widths from 1100px to 1440px. With only `flex-shrink: 0` on the name, the checks disagreed at 1310–1320px, because the button's presence moved the Assignment selector. That would have made the button oscillate.
- **Header fit, final version:** with `min-width: 0` on `.headerRight` added, the selector and the name didn't move when the button appeared. The checks, using margin-inclusive edges, agreed at every 5px step from 1290px to 1350px and switched at about 1330px. Positions without the button were identical to today's at 1100px and 1440px.
- **Jest environment:** a throwaway spec confirmed that `striptags` followed by `DOMParser` decodes entities under the repo's jsdom, and that `window.history.pushState({}, "", "/?portal-dashboard")` makes `getSequenceTree` apply the dashboard's visibility rule, which the rows tests rely on.
- **Format rules and browser download:** covered in the requirements spec's Verification section. The rows step's cell rules are the ones that were run there, with the two fixes that run found (unsubmitted required answers empty, blank markers as underscores).

## As built

Where the code departs from the plan above.

### CSV text helpers

- **`htmlToText` escapes a bare `<` before `striptags`.** `striptags` treats any `<` as the start of a tag, so student text such as `I <3 science` or `2<5` lost everything after the `<`. A `<` that isn't followed by a letter, `/`, `!` or `?` (so can't start a tag, comment or doctype) is replaced with `&lt;` first, and `DOMParser` decodes it back. Text such as `a<b then c>d` is still read as a tag, as a browser would read it.
- **The `formatCsvDateTime` test builds its input from a local-time `Date`** instead of setting `process.env.TZ`. Node picked up only the first `TZ` change in a Jest worker, so a test that switched zones was unreliable. A timestamp made with `new Date(2025, 4, 10, 6, 3, 45).toISOString()` must format as `2025-05-10 06:03` in any zone, which checks the UTC-to-local conversion without depending on the machine's zone.

### Dashboard CSV rows

- **An open response whose `answer` is an empty string falls through to `answerText` and the audio check.** The planned `typeof value === "string"` check returned `""` for a student who recorded audio and left the text empty, so the audio link never appeared.
- **`choiceCell` uses each selected choice's `content` as is.** The plan kept its own copy of the deleted-choice placeholder and matched on id `-1`. `getAnswerTrees` already puts the placeholder text in the deleted choice's `content`, so the CSV now uses that one definition and can't drift from the dashboard.
- **`getAnswerBadges` lost its unused `type` variable** once the audio check moved into `hasAudioResponse`.
- **The tests build the rows in `beforeAll`**, after `?portal-dashboard` is pushed into the URL. Built at `describe` time, the rows were computed before the URL changed and the hidden question was included.

### Saving the file

- **The download test checks the byte order mark in the Blob's raw bytes** (`EF BB BF`, read with `readAsArrayBuffer`). `FileReader.readAsText` decodes the text and drops the mark, so the planned check on the decoded text's first character failed even though the file had it.

### Hamburger menu

- **Escape closes the menu** (see the RESOLVED question on Escape below), with a test.
- **The commented-out Print item stays as the same commented-out object literal**, now on its own since the static `items` array it sat in is gone.
- **`.menuItem` keeps its existing `width: 210px` and white background** rather than the planned `width: 100%; background: none`. The list is also 210px wide and white, so the result is the same, and the toggle items that share the class are unchanged.
- **`.menuItem` resets `font` before setting `font-size`**, since the `font: inherit` shorthand would otherwise reset the 16px size.

### Header button

- **The base `.downloadButton` rule has its own hover (`@cc-teal-light4`) and pressed (`@cc-teal`) backgrounds**, as the view dropdown's base rule does, so a `Header` rendered without a `colorTheme` still shows hover feedback and a readable pressed label. The theme classes override them as planned.
- **Checked in Chromium against the demo data:** the button measures 168px wide. It shows at 1336px and wider and hides at 1334px and narrower, the same going up and down in 2px steps, so it doesn't flip back and forth. The Assignment selector and the teacher's name move continuously across the switch and don't move when the hidden button is removed at 1150px. The name stays one line (32px tall) at every width from 1100px to 1600px. A keyboard-only download from the narrow window's menu worked and returned focus to the toggle.
- **The `Header` test mocks `img/cc-logo.png` with a proxy.** Images and styles both map to `identity-obj-proxy` in Jest, which throws when React converts the logo's `src` to a string. The mock returns a file name for `src` and each class name as itself. jsdom measures every element as 0 wide, so the tests stub `getBoundingClientRect` for the case where the button fits and use the unstubbed layout for the case where it doesn't.

### Cypress and manual QA

- **The answer link is visited at the end of the header-button download test**, not in a test of its own. Cypress clears aliases between tests, so a later test can't read a link saved with `.as()`. The wide-window tests reload the dashboard in `beforeEach` as a result.
- **The keyboard check also ran for real in Chromium** (Playwright, outside the Cypress spec): Enter on the menu toggle opened the menu, Tab reached "Download as CSV", Enter saved the file, and focus returned to the toggle.
- **The new `require("fs")` in `cypress/plugins/index.js` has an `eslint-disable-next-line`** for `@typescript-eslint/no-var-requires`, since the plugins file runs in Node as CommonJS. The existing code-coverage `require` in the same file already fails that rule on `master` and is left alone.
- **Cypress was run against a dev server on port 8081** (`--config baseUrl=http://localhost:8081`), because another project's dev server was using 8080.
- **Manual QA status:** the single-activity row of the checklist passed (`?portal-dashboard&resourceType=activity` downloads with `Activity 1` answer headers throughout). The demo sequence's file also parsed back correctly with Python's `csv` module, with a byte order mark, CRLF line endings and 22 answer columns for 19 questions. The Excel, Google Sheets and Numbers rows and the staging-link row are still to do: no spreadsheet app or staging portal launch was available while implementing.

### Review findings not applied

- **Step 5, "delete the commented-out Print item and its import":** not applied. The plan says the Print block stays commented as it is, and removing a planned-for-later item is outside this story. The block went back to its original untyped form, so it no longer looks like a ready-to-use `MenuItemWithIcon`.

- **Step 2, "return a managed open response's plain-text `answerText` without `htmlToText`":** not applied. The dashboard renders a managed open response's `answerText` as HTML (`renderHTML` in `iframe-answer.tsx`), so converting it with `htmlToText` gives the text the teacher sees. The truncation that prompted the suggestion (a bare `<` in student text) is fixed in `htmlToText` itself.

## Open Questions

<!-- Implementation-focused questions only. Requirements questions go in requirements.md. -->

### RESOLVED: Judgment call: build the CSV from Redux selectors or from the rendered components?
**Context**: The dashboard's components already format answers for display, so the CSV could reuse them.
**Options considered**:
- A) A pure function over the Redux state, reusing the selectors and small helpers (`hasResponse`, `getAnswerBadges`, `getFormattedStudentName`, `sortByName`, `countCompletedAnswers`)
- B) Render the answer components off-screen and read their text

**Decision**: A. The components produce HTML for display and depend on layout, iframes and interactive state history, while the selectors are already pure and tested. A keeps the CSV testable with a `fromJS` state and runs synchronously on click.

### RESOLVED: Judgment call: how is "fits" detected?
**Context**: The requirements decide by fit rather than a fixed breakpoint, and the speccing check showed flexbox squeezes the teacher's name instead of overlapping.
**Options considered**:
- A) A ResizeObserver on the header, `flex-shrink: 0` on the name, and a measured check (the shown-case and hidden-case formulas above)
- B) A CSS-only container query or media query
- C) A fixed window-width breakpoint measured against the demo name

**Decision**: A. The browsers portal-report supports don't all have container queries. A media query can't account for the teacher's name length, and moving the item into the menu needs React to know the result anyway. The existing `@types/resize-observer-browser` dependency already types the native API.

### RESOLVED: Judgment call: should the menu toggle become a button inside the existing `div`, or replace it?
**Context**: The existing Cypress header spec clicks `[data-cy=header-menu]`, and the click-outside logic uses the `div`'s ref.
**Options considered**:
- A) Keep the `div` with its `data-cy`, `onClick` and ref, and put a `button` inside it
- B) Replace the `div` with a `button`

**Decision**: A. Existing tests and the outside-click handling keep working unchanged. Keyboard activation of the inner button fires a `click` that bubbles to the `div`'s handler.

### RESOLVED: Judgment call: should Escape close the hamburger menu?
**Context**: The plan makes the menu reachable from the keyboard: the toggle is a button, and the items are focusable while it's open. It doesn't say how a keyboard user closes it other than activating the toggle or an item. The ARIA menu button pattern closes a menu on Escape.
**Options considered**:
- A) Escape closes the open menu and, when focus was inside the list, returns focus to the toggle
- B) No Escape handling, as planned

**Decision**: A, decided during implementation. It's a few lines on the menu's existing container, reuses the focus-return logic the plan already adds, and a keyboard user who opens the menu by mistake expects Escape to close it. It changes nothing for mouse users.

## Self-Review

Roles: Senior Engineer, Commit Reviewer, Test Runner, WCAG Accessibility Expert and Security Engineer. Each finding was checked by building the proposed code: the rows, CSV and fit modules were copied from this spec into the working tree, type-checked with the project's `tsc`, compiled by the dev server and run against the demo store, then removed. Findings that didn't survive aren't listed.

### Senior Engineer

#### RESOLVED: The rows code didn't type-check
`tsc` under the repo's `strict` settings rejected the `getIn` results used as strings and as a `Map` (`TS2322`, `TS2571`, `TS2345`). **Fix:** the image-question cells and the answer lookup cast the `getIn` results. With the casts, the only remaining error was `clazzTeacherNames` being unknown, which the first step adds before this one.

---

#### RESOLVED: `safeFileNamePart` broke the webpack build
The regex's `\u0000-\u001f` range tripped the repo's ESLint `no-control-regex` rule, which the dev server's `eslint-loader` reports as a build error. **Fix:** control characters are checked by code point instead.

---

#### RESOLVED: The Blob URL was revoked too soon
Revoking the object URL right after `click()` can cancel the download in some browsers. FileSaver.js waits 40 seconds for this reason. **Fix:** revoke after 40 seconds.

---

#### RESOLVED: Font loading could leave a stale fit decision
The observer only watched the header, whose size doesn't change when the web font finishes loading and widens the button or the teacher's name. **Fix:** the observer also watches the name and the button.

---

### Commit Reviewer

No confirmed issues. Each step compiles against the steps before it:
- The rows step references nothing from later steps. Its one dependency, `clazzTeacherNames`, comes from the first step.
- The menu step's new props are unused until the header step passes them, so it ships inert.
- The header step is the first to show anything.

---

### Test Runner

#### RESOLVED: The download test relied on `Blob.text()`
The repo's Jest uses jsdom 15.2.1, which has no `Blob.text()`. **Fix:** the test reads the Blob with `FileReader`, and uses fake timers for the 40-second revoke.

---

#### RESOLVED: The Cypress keyboard check depended on unverified Cypress behavior
Cypress's `type("{enter}")` simulates key events rather than sending native ones, and whether it activates a button in Cypress 8 couldn't be checked here: the Cypress binary wasn't installed for this session. **Fix:** the spec checks that the control is a focusable `button` and relies on native button behavior for Enter and Space, so the test doesn't depend on that behavior either way.

---

### WCAG Accessibility Expert

#### RESOLVED: Focus was stranded inside the closed menu
With the menu items as buttons, activating Download from the keyboard closes the menu, which sets `aria-hidden` and `tabIndex` -1 on the list, while focus stays on the Download button inside it. **Fix:** closing the menu with focus inside it moves focus to the toggle button, with a test.

---

### Security Engineer

No confirmed issues. `htmlToText` strips tags before parsing, and `DOMParser` documents are inert (no scripts run, no resources load), so student HTML can't run while the file is built. The formula guard is applied to every cell by `csvCell`, including prompts and headers.
