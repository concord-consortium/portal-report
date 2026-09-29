# Add a Downloadable CSV to the Class Dashboard

**Jira**: https://concord-consortium.atlassian.net/browse/CLASSDASH-116

**Status**: **Closed**

## Overview

Teachers can download their class's answers for the current assignment as a CSV file from the class dashboard. The file follows the researcher "student answers" report, trimmed to the columns a teacher needs.

## Requirements

### Download control

- Show a "Download as CSV" button in the dashboard header between the Assignment selector and the teacher's name, styled per the Zeplin mockup: an outlined button with a download icon and the label "Download as CSV". It looks the same as the view dropdown at the far left of the header, with the same outline, height, text and per-view background, hover and pressed colors.
- The button is a native button: it can be reached with Tab and activated with Enter or Space, has a visible focus indicator, and its accessible name is its label. The icon is decorative and hidden from screen readers.
- "Download as CSV" is always an item in the hamburger menu. The header button is a shortcut to it: show the button whenever the header has room for it without overlapping, squeezing or wrapping the Assignment selector or the teacher's name, and hide it when it doesn't. Because the space depends on the length of the teacher's name, this is decided by fit rather than by a fixed window width. For reference, with the demo teacher's name the button fits at a 1366px-wide window but not at 1300px.
- The switch updates as the window is resized.
- When the button isn't shown (a narrow window), the header's layout is unchanged from today: the logo, view dropdown, Assignment selector, teacher's name and menu sit where they do now at every window width.
- The button never makes the teacher's name wrap, shrink or truncate, and never moves the Assignment selector.
- In the menu, "Download as CSV" appears after a divider below the view toggles ("Compact student list", "Hide Last Run column", "Hide feedback badges") and above "Help", with the download icon.
- Show the control in all three views: Progress Dashboard, Response Details and Feedback Report.
- Color the download icon to match the current view: teal for Progress Dashboard, orange for Response Details and green for Feedback Report, the same colors the header's other icons use.
- Show the control to teachers and to researchers viewing the dashboard. A researcher's download is always anonymized (see Anonymized students).
- The hamburger menu can be opened from the keyboard, and its "Download as CSV" item can be reached and activated from the keyboard, so a keyboard user can download at any window width.
- The control is available once the dashboard has finished loading the class and the assignment.
- Clicking the control saves the CSV immediately, with no page navigation, server job or confirmation step. The file holds the answers the dashboard has at the moment of the click. Answers arrive live, so a later download can include newer answers.
- Log a download event through the dashboard's existing event logging, the same way other header and menu actions are logged.

### File

- The file name is `<class name> - <assignment name> - <YYYY-MM-DD>.csv`, using the teacher's local date. Characters that aren't allowed in file names on Windows or macOS are replaced.
- The file is UTF-8 with a byte order mark, so Excel detects the encoding. It opens correctly in Excel, Google Sheets and Numbers, including non-ASCII characters, commas, quotes and line breaks in prompts and answers.
- The CSV has the same content whichever view it was downloaded from.
- A cell whose text starts with `=`, `+`, `-`, `@`, a tab or a carriage return is prefixed with a single quote (`'`), so a spreadsheet doesn't run a student's answer as a formula.

### Rows

- The first row is the column headers, named as the dashboard names things (see Columns).
- The second row is the "Prompt" row. Its first cell is `Prompt`. Each question column holds `Q<question number>: <prompt>`, the way the dashboard labels a question with its prompt, e.g. `Q7: Watch the video…`, or `Q7: (no prompt)` when the question has no prompt. The column header already names the activity. A question with several columns repeats its prompt in each.
- Prompts are plain text: HTML tags are removed, HTML entities such as `&nbsp;` and `&amp;` are decoded, and the text is not truncated. An image question's prompt is its drawing prompt followed by its prompt, as in the dashboard's answer view. Fill-in-the-blank markers such as `[blank-verb]` are shown as `__________`, as the dashboard shows them.
- The third row is the "Correct answer" row. Its first cell is `Correct answer`. It's filled in only for multiple choice questions that have correct choices, as `Correct answer(s): <choice>, <choice>`.
- The rest are student rows, one per student in the class roster. Students who haven't started have empty answer cells.
- Student rows are ordered by last name, then first name, the same order as the dashboard's name sort.

### Columns

Column headers use the dashboard's own labels where it has one (Student Name, Assignment, Last Run, Activity n, Qn), and plain names otherwise. None has a `res_1_` prefix: Trudi asked for it to go, since a report covers one resource.

| Header | Replaces (report-service) | Content |
|---|---|---|
| `Student Name` | `student_name` | "Last, First", as the dashboard shows it. |
| `Username` | `username` | The student's portal login. |
| `Class` | `class` | The class name. |
| `Teachers` | `teacher_names` | Every teacher of the class, joined with ", ". |
| `Assignment` | `res_1_name` | The sequence or activity name, as in the header's Assignment selector. |
| `Last Run` | `res_1_last_run` | The student's last run in the teacher's local time as `YYYY-MM-DD HH:MM`, or empty if the student hasn't run the assignment. |
| `Questions` | `res_1_total_num_questions` | The number of questions the dashboard shows. |
| `Answered` | `res_1_total_num_answers` | How many of those the student has answered. A required question counts only once submitted. |
| `Progress (%)` | `res_1_total_percent_complete` | Answered ÷ Questions × 100, rounded to one decimal place. Empty if the assignment has no visible questions. |

- `Questions`, `Answered` and `Progress (%)` use the dashboard's own progress calculation, so they agree with what the teacher sees.
- The answer columns follow, one set per question, in the order the dashboard shows the questions. Questions the dashboard hides are not included.
- `school` is not included: no portal API provides the school's name, and it would be the same in every row of a one-class download.
- These columns are not included: `student_id`, `user_id`, `primary_user_id`, `class_id`, `permission_forms`, `teacher_user_ids`, `teacher_districts`, `teacher_states`, `teacher_emails`, `res_1_offering_id`, `res_1_learner_id`, `res_1_remote_endpoint`, `res_1_resource_url`, `res_1_num_required_questions` and `res_1_num_required_answers`.
- No `_url` answer columns are included. In report-service these link to portal-report's single-question view of an answer. That link goes in the question's own answer column instead, for interactives without readable text and for audio-only open responses (see Answer columns). Open responses with text don't get one.

### Answer columns

Answer columns are named `Activity <activity number> Q<question number>`, combining the dashboard's activity label (`Activity 1: <name>`) and question label (`Q1`), e.g. `Activity 2 Q7`. The activity number is the activity's position in the sequence; a single activity is `Activity 1`. An image question has two columns, `Activity 1 Q6 Image` and `Activity 1 Q6 Text`. If an author gave two questions in one activity the same number, their headers repeat; the file is still valid, and the Prompt row tells them apart.

| question type | columns | content |
|---|---|---|
| multiple choice | `Activity n Qn` | The text of the selected choices, joined with ", ". No correct or wrong markers. |
| open response | `Activity n Qn` | The student's text. An audio-only answer shows a link to portal-report's single-question view, where the recording can be played. |
| image question | `Activity n Qn Image`, `Activity n Qn Text` | The snapshot or drawing image URL, and the student's text. |
| interactive, or any other type | `Activity n Qn` | The interactive's own readable answer text (HTML removed, entities decoded) when it provides one, which few do. A link answer (`external_link`) shows its URL. Otherwise, if the student has a response, a link to portal-report's single-question view of that answer, the same view report-service's `_url` column links to. Empty if the student has no response. |

- Whether a student has answered follows the dashboard's rules: an empty interactive state is not an answer. An answer to a required question counts only once submitted, and until then its cells are empty, as the dashboard shows no answer.
- A selected choice that the author has since deleted shows the dashboard's placeholder, `[the selected choice has been deleted by question author]`.
- A malformed answer that the dashboard can't display produces an empty cell, not an error, and the rest of the file is still generated.

### Answer links

- The link has the same parameters as report-service's (their order differs): `<portal-report>?auth-domain=<portal>&firebase-app=<app>&sourceKey=<key>&iframeQuestionId=<question id>&class=<class URL>&offering=<offering URL>&studentId=<user id>&answersSourceKey=<key>`. `<portal-report>` is the address the dashboard is running at, and every parameter comes from the dashboard's own launch or state. `firebase-app` and `answersSourceKey` are only included when the dashboard has them.
- The link never includes the teacher's `token`. The page signs in through the portal instead, so it only opens for someone with portal access to that class, and a shared file doesn't expose answers to anyone else.
- Links stay in anonymized downloads. They carry the student's portal user ID, not their name, and open only for people with access to the class.

### Anonymized students

- A researcher's download is always anonymized, whatever the toggle says, as the dashboard always is for researchers.
- When the "Anonymize students" toggle is on, the CSV follows it: `Student Name` holds the same anonymized name the dashboard shows ("Student 1" and so on), and `Username` is empty.

## Technical Notes

### Zeplin design

- Screen: https://app.zeplin.io/project/5e96f4b8527afa7d28bb1468/screen/6ab69236e7bdb88025d639d8. The Zeplin MCP server wasn't connected, so these notes come from a screenshot of the screen, plus the icon and the button's CSS, which Doug exported.
- The button is outlined, with a download icon and the label "Download as CSV". It sits in the header's center/right area, between the Assignment selector and the teacher's name.
- Button CSS from Zeplin: the outline layer (named `Assignment-Dropdown-back`, the same symbol as the header dropdowns) is 166×30px, `padding: 5px 10px 5px 5px`, `border-radius: 4px`, `border: solid 1.5px var(--cc-charcoal-light-1)`, `background-color: var(--cc-teal-light-6)`. The label (`Download-as-CSV`) is Lato 16px bold in `var(--cc-charcoal)`, 5px from the icon.
- Those values match the header's view dropdown (`css/portal-dashboard/custom-select.less`: 30px, 1.5px `@cc-charcoal-light1`, 4px radius, 16px bold). Its `progressNavigation` background is also `@cc-teal-light6`, and its `responseNavigation` and `feedbackNavigation` themes give the Response Details and Feedback Report colors, with hover and pressed shades.
- In the narrow layout the menu is open (the hamburger shows as an X). The menu lists the three toggles, a divider, then "Download as CSV" with the download icon, then "Help" with its icon.
- The icon colors per view are shown as three variants: teal, orange and green.
- The icon exported from Zeplin is an arrow into a tray (20×20 viewBox). It differs from the repo's unused `img/svg-icons/download-icon.svg`, a cloud with a down arrow that is referenced only by the commented-out menu item, so the Zeplin icon replaces that file. The export hardcodes `fill="#0592AF"` on its path and wraps it in a `<g fill="none">` with a transparent 20×20 bounding-box path. The header's other icons (e.g. `help-icon.svg`) have no fill and get their color from the `.menuItemIcon`/`.icon` theme classes, so the fill attributes and the bounding-box path need to be removed for the per-view colors to apply.

### Existing code

- **Header:** `js/components/portal-dashboard/header.tsx` lays out three flex groups: `.appInfo` (logo and view dropdown), `.headerCenter` (Assignment selector) and `.headerRight` (teacher name and hamburger menu). The CSS in `css/portal-dashboard/header.less` sets `min-width: 1100px` on `.dashboardHeader`, and nothing in the header responds to width yet. Each group has `flex: 1`. The teacher's name is right-aligned in `.headerRight`, so the free space between the Assignment selector and the name grows with the window: measured in the demo at about 102px (1100px window), 153px (1200px), 193px (1280px), 236px (1366px), 273px (1440px) and 353px (1600px).
- **Hamburger menu:** `js/components/portal-dashboard/header-menu.tsx` builds the toggle items from optional setter props and the icon items from a static array. The array still has a commented-out "Download (.csv)" item using `img/svg-icons/download-icon.svg`, from before the MVP.
- **View and colors:** the view mode (`"ProgressDashboard" | "ResponseDetails" | "FeedbackReport"`, `js/util/misc.ts`) is React state in `js/containers/portal-dashboard/portal-dashboard-app.tsx` and maps to the color themes `progress`, `response` and `feedback`. The icon classes in `header.less` set `fill` from `@cc-teal`, `@cc-orange` and `@feedback-green` in `css/portal-dashboard/variables.less`.
- **Researchers:** `getIsResearcher` (`js/selectors/dashboard-selectors.js`) identifies researcher sessions. Researchers always see anonymized names: `PortalDashboardApp` passes `anonymous: getAnonymous(state) || isResearcher`, and the portal's own APIs anonymize names for researcher requests. The demo data can't produce a researcher session, because `fakeUserType` accepts only `teacher` and `learner`.
- **Launching:** the portal opens the dashboard with a redirect to a top-level page (`rigse` `Portal::OfferingsController#external_report`), not in an iframe, so a browser-side file download isn't blocked by iframe sandboxing.
- **Students:** `state.report.students` holds `name`, `realName`, `firstName`, `lastName`, `lastRun`, `id` and `userId`. `getFormattedStudentName` (`js/util/student-utils.ts`) gives "Last, First" or the anonymized name. `sortByName` / `compareStudentsByName` (`js/util/sort-utils.js`, `js/util/misc.ts`) sort by the real last name, then first name, even when names are anonymized.
- **Portal data the dashboard discards:** `fetchPortalDataAndAuthFirestore` in `js/api.ts` fetches both the offering and the class from the portal and merges each student's `last_run` from the offering into the class data.
  - The offering API's students (`rigse` `API::V1::Offering::OfferingStudent`) also carry `username` (the portal login), which is sent unanonymized even when names are anonymized.
  - The class API (`rigse` `API::V1::ClassesController#get_info`) returns `teachers` with first and last names, and each student's `email`. For the school it returns only its state.
  - None of these fields are kept today, and the demo data (`js/data/offering-data.json`, `js/data/small-class-data.json`) has no usernames or teachers.
- **Structure and answers:** the `report-tree.js` selectors build activity → section → page → question trees, and `getQuestionTrees` marks questions `visible` in the dashboard view. `getAnswersByQuestion` returns answers keyed by question and student, and `getAnswerTrees` resolves MC `selectedChoices` with `correct` flags. `portal-dashboard-app.tsx` builds `sortedQuestionIds` by activity index, then question number. Prompts elsewhere are converted to plain text with `striptags`.
- **Progress:** `getStudentProgress` in `js/selectors/dashboard-selectors.js` computes the per-activity completion the dashboard displays with `countCompletedAnswers`. It counts any stored answer to a visible question, and an answer to a required question only once it's submitted. It does not use `hasResponse` (`js/util/answer-utils.tsx`), so an empty interactive state counts toward progress even though the dashboard's answer cell shows no answer. The CSV follows both rules as the dashboard does: counts from `countCompletedAnswers`, cells from `hasResponse`. A student's `Answered` count can therefore be one higher than their non-empty cells when an interactive saved an empty state.
- **Answer shapes in the demo data:**
  - MC answers are `{choiceIds}`.
  - Image question answers are `{imageUrl, text}`.
  - Open response answers are usually a string. A managed open response can instead be an object, with an `answerText` and, for audio, an attachment.
  - Interactive answers are `interactive_state` JSON strings with a `reportState`; only 9 of the 32 in the demo have an `answerText`. There are also `external_link` answers (a URL) and one `unknown_answer_type`.
  - One image question answer has no `answer` at all (the demo's deliberately broken answer).
- **Prompts in the dashboard:** components read `question.get("prompt")` and convert it with `striptags`, which removes tags but leaves entities (`answer-modal.tsx` also replaces `&nbsp;`). For image questions `answer-modal.tsx` shows `drawingPrompt` followed by `prompt`. In the demo, 9 of the 19 questions have an empty prompt, and two image questions have a `drawingPrompt`.
- **Answer loading:** answers come from a live Firestore listener (`watchCollection(... "answers", RECEIVE_ANSWERS)` in `js/actions/index.ts`), so the store keeps changing after the first render. `data-reducer.ts` has an `isFetching` flag for the initial portal and report data.
- **Keyboard access:** nothing in the dashboard header can be focused today. The view and Assignment selectors are custom components, and the hamburger menu (`header-menu.tsx`) and its items are `div`s with `onClick` handlers.
- **Testing the new columns:** the demo data has no usernames or teachers, so the demo's offering and class data need them added to exercise the `Username` and `Teachers` columns and anonymized downloads in development and Cypress.
- **No CSV or download code exists:** there's no CSV library in `package.json` and no Blob or download helper in `js/`. The `origin/export-report` branch only dumps the answers JSON and isn't reusable.
- **Demo data:** the dev server's default data is `js/data/sequence-structure.json` (two activities, 19 questions: 10 interactive, 3 MC, 3 image, 2 open response and 1 of an unknown type) with `js/data/answers.json` and a six-student class in `js/data/small-class-data.json`. `?resourceType=activity` switches to the single-activity data.

### Verification

These checks were run against the dev server's demo data while writing this spec. None of the throwaway code is in the repo.

- **Header space:** measured the gap between the Assignment selector and the teacher's name at window widths from 1100px to 1600px (figures under Existing code). Then inserted a 165px button as the first child of `.headerRight`. Flexbox doesn't overlap the teacher's name when space runs out; it squeezes it until it wraps (189px wide at 1366px, 172px at 1300px, 133px at 1100px). So fit has to be judged against the name's natural width, not the gap alone.
- **Test environment:** a throwaway Jest spec confirmed that `striptags` followed by `DOMParser` decodes entities under the repo's jsdom setup, and that pushing `?portal-dashboard` into the URL makes `getSequenceTree` apply the dashboard's visibility rule in tests.
- **Format rules on the demo data:** built the CSV columns in the browser from the Redux store using this spec's rules. The result has 22 answer columns for the 19 questions. Every answer type produced a sensible cell:
  - multiple choice, including a scored question and one whose choices were all deleted
  - plain and required open responses
  - image questions with drawing prompts
  - link answers (LabBook, CODAP)
  - interactives with readable answer text (the fill-in-the-blank and "Clues" interactives)
  - interactives without it (at the time, `(response recorded)`; now a link, checked separately below) and with an empty state (empty)

  The run found two rules the draft was missing, now in the requirements: unsubmitted required answers are left empty, and fill-in-the-blank prompt markers become underscores.
- **Browser download:** saved a Blob CSV through an `<a download>` click in Chromium. The file kept its UTF-8 byte order mark and the name `Test Class - Report Test Sequence - 2026-09-25.csv`. It parsed back exactly with Python's `csv` module, including a formula-like answer (prefixed with `'`), embedded quotes and commas, a line break, and non-ASCII characters.
- **Answer link:** with the dev server's demo data, `/?sourceKey=fake.authoring.system&iframeQuestionId=mw_interactive_29&studentId=1` (the link the CSV would build in the demo) loaded the single-question view and rendered that student's interactive, with no errors.
- **Portal APIs:** read `rigse`'s `API::V1::Offering`, `API::V1::ClassesController#get_info` and `Portal::OfferingsController#external_report` for the username, teacher, school and launch findings.

### Answer links

- report-service builds its `_url` link in `get_columns_for_question` (`report-service/server/lib/report_server/reports/athena/shared_queries.ex`): for `iframe_interactive` only when the student has an answer, and for `open_response` always, because an audio-only answer leaves no text.
- `iframeQuestionId` switches portal-report to `IframeStandaloneApp` (`js/containers/app.tsx`), which renders that one interactive in report mode with the student's saved state.
- The portal opens the dashboard with `class`, `offering`, a `token` valid for 2 hours (`rigse` `ExternalReport#url_for_offering`, `ReportTokenValidFor = 2.hours`) and `username`, plus the `sourceKey` and `answersSourceKey` in the report's configured URL. There is no `auth-domain`, so the link derives it from the class URL, or the offering URL without one, through `getPortalBaseUrl` in `js/api.ts`, the same way teacher-edition links do. `firebase-app` falls back to portal-report's default when absent (`getFirebaseAppName` in `js/db.ts`).
- With `auth-domain` set, portal-report runs the portal's OAuth flow (`initializeAuthorization` in `js/api.ts`).
- `buildAnswerLink` in `js/util/answer-link.ts` builds both this link and the report's "Open in new tab" link (`getStandaloneLinkUrl` in `iframe-answer.tsx`). The new-tab link keeps every launch parameter, token included, because it opens in the teacher's own browser. `getAnswerLink` passes only the parameters listed above.

### The report-service format

The student answers report is built in `report-service/server/lib/report_server/reports/athena/` (`student_answers_report.ex`, `shared_queries.ex`, `resource_data.ex`).

- **Column names:** `res_<n>_<question_id>_<suffix>`. The question ID carries its type, e.g. `managed_interactive_369370`.
- **Suffix by question type:**

  | type | columns |
  |---|---|
  | multiple choice | `_choice` |
  | open response | `_text`, `_url` |
  | image question | `_image_url`, `_text`, `_answer` |
  | iframe interactive | `_json`, `_url` |
  | anything else | `_json` |

- **`_url`:** a link to portal-report's single-question view of that student's answer, not a link to an image or attachment.
- **Prompt row:** `"<question number>: <prompt>"`, with HTML stripped and `(no prompt)` used when a prompt is missing. Question numbers are authored per activity, so in a sequence they restart at 1 in each activity, and nothing marks where one activity ends and the next begins.
- **Correct answer row:** `"Correct answer(s): <choice>, <choice>"` in MC columns only.
- **MC correctness markers:** `_choice` is meant to append " (correct)" or " (wrong)" when the question has correct choices, but a key mismatch in the Elixir code means the markers never appear, and they aren't in Trudi's sample.
- **Totals and percent complete:** computed from every stored answer, including blank open-response placeholders, so the report's percent complete can differ from the dashboard's progress.
- **`last_run`:** ISO-8601 with no time zone.

### Differences from the report-service format

- Column headers use the dashboard's labels (`Student Name`, `Last Run`, `Activity 2 Q7`) instead of report-service's IDs (`student_name`, `res_1_last_run`, `res_1_managed_interactive_369376_text`), and have no `res_1_` prefix.
- Interactive answers are readable text when the interactive provides it, otherwise a link to the answer, instead of the raw answer JSON in `_json` plus a separate `_url` column.
- Image questions drop `_answer`, the raw JSON.
- There is no `school` column.
- There are no `_url` columns.
- Progress columns use the dashboard's calculation.
- `last_run` is local time without seconds.
- Only the questions the dashboard shows are included.
- There is one row per rostered student, including students who haven't started.

## Out of Scope

- A different CSV per dashboard view, such as feedback or rubric scores from the Feedback Report view or a single question from Response Details. Trudi and Michael confirmed one report for every view.
- Feedback, scores or rubric data in the CSV.
- Changes to report-service or its student answers report, including the missing MC correct/wrong markers.
- Downloading several classes or several assignments at once.
- Other file formats (Excel, PDF).
- A pre-test/post-test comparison report (Trudi's comment: "we don't have to worry about that now").
- Any column or summary for Hazbot's thoughts (Trudi's comment: a possible future option, "not for this story").

## Not Yet Implemented

- Manual QA in Excel and Numbers — no Excel or Numbers was available while implementing. The Google Sheets and single-activity checks passed (see As Built). Download the file from the dev server's demo data (`?portal-dashboard`) and check, in Excel (Windows or macOS) and Numbers:
  - it opens by double-click with no import dialog questions about encoding
  - `Café ✓` and the "Cupcake ipsum" text show correctly, not as `CafÃ©`
  - Student 6's (Jerome Wu's) open response is in one cell, on two lines, with its quotes and commas
  - Student 5's (Kate Crosby's) image note shows `=1+1 isn't a formula` as text, not `2` or an error
  - `Last Run` values show as dates and times, and sort in time order
  - `Progress (%)` values are numbers (they right-align and can be summed)
  - the Prompt row's long prompts are complete, not cut off
- Answer link from a real portal launch — no staging portal launch was available while implementing. From a file downloaded through a staging launch, an interactive's link should open the single-question view after signing in to the portal, and the link should have no `token`.

## As Built

Where the code departs from the implementation plan.

### CSV text helpers

- **`htmlToText` escapes a bare `<` before `striptags`.** `striptags` treats any `<` as the start of a tag, so student text such as `I <3 science` or `2<5` lost everything after the `<`. A `<` that isn't followed by a letter, `/`, `!` or `?` (so can't start a tag, comment or doctype) is replaced with `&lt;` first, and `DOMParser` decodes it back. Text such as `a<b then c>d` is still read as a tag, as a browser would read it.
- **The `formatCsvDateTime` test builds its input from a local-time `Date`** instead of setting `process.env.TZ`. Node picked up only the first `TZ` change in a Jest worker, so a test that switched zones was unreliable. A timestamp made with `new Date(2025, 4, 10, 6, 3, 45).toISOString()` must format as `2025-05-10 06:03` in any zone, which checks the UTC-to-local conversion without depending on the machine's zone.

### Dashboard CSV rows

- **An open response whose `answer` is an empty string falls through to `answerText` and the audio check.** The planned `typeof value === "string"` check returned `""` for a student who recorded audio and left the text empty, so the audio link never appeared.
- **`choiceCell` uses each selected choice's `content` as is.** The plan kept its own copy of the deleted-choice placeholder and matched on id `-1`. `getAnswerTrees` already puts the placeholder text in the deleted choice's `content`, so the CSV now uses that one definition and can't drift from the dashboard.
- **Fill-in-the-blank markers are matched with `/\[[^\]]+\]/g`**, not the dashboard's old `/\[([^)]+)\]/g`. The old pattern stops at `)` rather than `]`, so two markers with no parenthetical label between them, as in `Choose [blank-a] or [blank-b]`, became one blank and lost the text between them. Found in the PR's Copilot review. [CLASSDASH-119](https://concord-consortium.atlassian.net/browse/CLASSDASH-119) moved the corrected pattern into a shared `replaceBlankMarkers` helper in `js/util/misc.ts`, used by the CSV and by the dashboard's four prompt views (`iframe-question.tsx`, `popup-question-answer-list.tsx`, `show-student-answers.tsx`, `feedback-question-rows.tsx`).
- **`getAnswerBadges` lost its unused `type` variable** once the audio check moved into `hasAudioResponse`.
- **The tests build the rows in `beforeAll`**, after `?portal-dashboard` is pushed into the URL. Built at `describe` time, the rows were computed before the URL changed and the hidden question was included.

### Saving the file

- **The download test checks the byte order mark in the Blob's raw bytes** (`EF BB BF`, read with `readAsArrayBuffer`). `FileReader.readAsText` decodes the text and drops the mark, so the planned check on the decoded text's first character failed even though the file had it.

### Hamburger menu

- **"Download as CSV" is always in the menu**, not only when the header button is hidden, at Trudi's request after trying the test branch (see the decision on this below). The menu's `showDownloadCsv` prop was removed, and the item appears whenever the dashboard passes a download handler.
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
- **Manual QA status:** the single-activity row of the checklist passed (`?portal-dashboard&resourceType=activity` downloads with `Activity 1` answer headers throughout). The demo sequence's file also parsed back correctly with Python's `csv` module, with a byte order mark, CRLF line endings and 22 answer columns for 19 questions. The Google Sheets rows passed: the demo sequence's file, with the edge-case answers, was uploaded to Google Drive and converted to a Sheet, then exported back as CSV and compared cell by cell. All 279 cells matched except the expected ones. Sheets used the formula guard's `'` as its text marker, so `=1+1 isn't a formula` is stored as text, not calculated. It read `Last Run` as a date-time and exports it as `2025-05-10 6:01`. The byte order mark didn't end up in cell A1, and `Café ✓`, the quotes, the commas and the line break came through intact. The Excel and Numbers rows and the staging-link row are still to do: no Excel, Numbers or staging portal launch was available while implementing.

### Review findings not applied

- **Step 5, "delete the commented-out Print item and its import":** not applied. The plan says the Print block stays commented as it is, and removing a planned-for-later item is outside this story. The block went back to its original untyped form, so it no longer looks like a ready-to-use `MenuItemWithIcon`.

- **Step 2, "return a managed open response's plain-text `answerText` without `htmlToText`":** not applied. The dashboard renders a managed open response's `answerText` as HTML (`renderHTML` in `iframe-answer.tsx`), so converting it with `htmlToText` gives the text the teacher sees. The truncation that prompted the suggestion (a bare `<` in student text) is fixed in `htmlToText` itself.

## Decisions

### Should the CSV differ depending on the dashboard view?
**Context**: The Zeplin mockup shows the control on all three views with the icon in each view's color, which could mean each view exports something different.
**Options considered**:
- A) The same answers CSV from every view
- B) A different file per view: answers, one question's answers, feedback
- C) Answers everywhere, plus feedback columns from the Feedback Report view

**Decision**: A, decided by Doug and confirmed on Slack. Michael Tirenin (the designer): "I'd think the same, but @trudi should answer this one." Trudi: "Agree! Same, same, please!" The icon color is the header's normal per-view theming.

---

### What does Trudi's red shading mean?
**Context**: The markup has no legend or comments.
**Options considered**:
- A) Red means "remove this column"
- B) Red means "keep" or "important"

**Decision**: A, confirmed by Trudi's ticket comment: "I suggest we remove the columns highlighted in red."

---

### Which students get a row?
**Context**: The report-service report only has rows for learners who started the assignment. The dashboard lists the whole class roster.
**Options considered**:
- A) Every student in the class roster, with empty answers for students who haven't started
- B) Only students who have started

**Decision**: A. It matches what the teacher sees in the dashboard, and a teacher using the file for record keeping needs to see who hasn't started.

---

### Should the file be built in the browser or by report-service?
**Context**: The existing report is an Athena query that runs as a background job for researchers. The dashboard already has the roster, structure and answers loaded.
**Options considered**:
- A) Build the CSV in the browser from the data the dashboard has already loaded
- B) Request the student answers report from report-service with a teacher-specific column set

**Decision**: A. The download is immediate, needs no new server permissions for teachers, and exactly matches what the teacher sees. The trade-off is that the format is maintained separately from report-service's. The dashboard opens as a top-level page, so a browser download works.

---

### Where do `username` and `teacher_names` come from?
**Context**: Trudi's markup keeps these columns, and the dashboard doesn't store them.
**Options considered**:
- A) Keep the fields the dashboard already receives from the portal and currently discards
- B) Add the fields to the portal's APIs
- C) Drop the columns

**Decision**: A. Checked in `rigse`: the offering API that `js/api.ts` already calls returns each student's `username`, and the class API it already calls returns the class's `teachers` with names. No portal change is needed. The offering API sends the real username even for anonymized sessions, so the CSV blanks it when names are anonymized. The `school` column is the one field no API returns, and it is split out below.

---

### Keep the `school` column, even though no portal API provides it?
**Context**: Trudi's markup keeps `school`, but neither the class API nor the offering API returns the school's name (the class API returns only the school's state). Filling it in needs a portal API change in `rigse` (adding the school name to the class API response), a second repo and deploy for this story. A teacher's download covers one class, so every row would hold the same school.
**Options considered**:
- A) Drop the `school` column
- B) Keep `school` and add the school name to the portal's class API as part of this story
- C) Keep `school` as an empty column for now, and fill it in later with a portal change

**Decision**: A, decided by Doug. The teacher knows their school, the value would be the same in every row, and filling it in would add a portal change and deploy to this story. This is final; it doesn't need Trudi's confirmation.

---

### What should happen to the `_url` answer columns?
**Context**: Trudi shaded 5 of the 64 `_url` columns orange: the first five in the sheet, and otherwise the same as the rest. Each `_url` links to portal-report's single-question view of a student's answer. A teacher could open it, but the teacher already has the dashboard, and the link needs the portal's authentication parameters, which a CSV shared outside the portal won't carry. The spec currently leaves `_url` out.
**Options considered**:
- A) Remove all `_url` columns (the orange marks were the start of removing them)
- B) Keep all `_url` columns
- C) Ask Trudi before deciding

**Decision**: A, decided by Doug and matching Trudi's ticket comment, which asks to remove the orange columns because they'd be confusing for teachers. She thought they were Firebase links for voice responses; they're links to portal-report's single-answer view, so the reply to her should say so. The teacher already has the dashboard for viewing an answer, and the links don't open outside the portal. The snapshot `_image_url` columns she asked to keep are a different kind of column and stay.

---

### How should percent complete and the answer counts be calculated?
**Context**: report-service counts every stored answer, including blank open-response placeholders and unsubmitted answers to required questions. The dashboard's progress counts only visible questions, and a required question only once it's submitted.
**Options considered**:
- A) Match the dashboard's progress calculation
- B) Match report-service's calculation

**Decision**: A. The teacher compares the file with the dashboard, not with the researcher report, and a CSV that disagrees with the dashboard would look wrong. The dashboard's calculation (`countCompletedAnswers`, behind `getStudentProgress`) also counts only the questions the teacher sees, and a required answer only once it's submitted.

---

### Should the column headers stay research-style or be teacher-friendly?
**Context**: report-service's headers are IDs like `res_1_managed_interactive_369376_text`, with a readable prompt only in the second row.
**Options considered**:
- A) Keep report-service's column names and the Prompt row
- B) Readable headers and drop the Prompt row
- C) Readable headers named as the dashboard names things, and keep the Prompt row
- D) report-service's names with only the `res_1_` prefix removed (Trudi's minimum)

**Decision**: C, decided by Doug. Trudi's ticket comment says she doesn't love the `res_1_blahblah` headings and isn't sure there's a good generic way to rename them. The dashboard's labels are that generic way, and they match what the teacher sees on screen. The Prompt row keeps the full question text below each header.

---

### How should a sequence's activities be told apart?
**Context**: Question numbers restart at 1 in each activity. report-service puts every activity under `res_1` with nothing marking the boundaries.
**Options considered**:
- A) Same as report-service (no marker)
- B) Name each answer column with its activity number, as the dashboard does: `Activity 2 Q7`
- C) Add an "Activity" row above the Prompt row with each column's activity name

**Decision**: B. It makes every question unambiguous without changing the file's row layout, which C would, and follows the column-naming decision above. A single activity uses `Activity 1`, so the format is the same for activities and sequences.

---

### Should multiple choice answers be marked correct or wrong?
**Context**: report-service meant to append " (correct)" or " (wrong)" to scored MC answers, but a bug keeps the markers out. They aren't in Trudi's sample.
**Options considered**:
- A) Append " (correct)" or " (wrong)" when the question has correct choices
- B) Choice text only, as in Trudi's sample

**Decision**: B. It matches the sample Trudi marked up, and the Correct answer row already gives the correct choices for comparison. Markers would be an easy follow-up if teachers ask for them.

---

### Should the "Anonymize students" toggle apply to the CSV?
**Context**: With the toggle on, the dashboard shows "Student 1", "Student 2" and so on.
**Options considered**:
- A) The CSV follows the toggle
- B) The CSV always has real names
- C) The CSV always has real names, and the anonymized file is a separate choice

**Decision**: A. The download matches what's on screen, and a teacher who has anonymized the class (for example to share results) won't be surprised by a file of real names. When anonymized, `username` is blank too, since the portal sends the real login regardless.

---

### Can researchers download the CSV?
**Context**: Researchers open the dashboard too, and always see anonymized names. They already get the student answers report from report-service.
**Options considered**:
- A) Teachers only; hide the control for researchers
- B) Show it to researchers too, always anonymized

**Decision**: B, decided by Doug. The ticket is "for teachers" but doesn't exclude researchers, who use the same dashboard. Their download is always anonymized, the same as the dashboard they see, and `Username` is blank. The answer links carry student user IDs but only open for people with access to the class.

---

### What goes in the columns for interactives and other non-standard questions?
**Context**: report-service puts the raw answer JSON in a `_json` column. Raw JSON means nothing to a teacher. In the demo data only 9 of the 32 interactive answers provide a readable `answerText`.
**Options considered**:
- A) The raw JSON, as in report-service
- B) The readable answer text when there is one, otherwise empty
- C) The readable answer text when there is one, otherwise the raw JSON
- D) The readable answer text when there is one, otherwise `(response recorded)` when the student has a response
- E) The readable answer text when there is one, otherwise a link to portal-report's single-question view of the answer when the student has a response

**Decision**: E, decided by Doug. Most interactives don't provide readable text: the Activity Player only records `answer_text` for a plain interactive when the interactive puts `answerText` in its own state (`activity-player/src/utilities/embeddable-utils.ts`). For those, the link is the only way for a teacher to see what the student did, and it opens the answer as the dashboard shows it. Text is used when it exists, because it's more useful to read than a link. A would put unreadable JSON in a teacher's file, and B would make answered and unanswered students look the same.

---

### What goes in an audio-only open response's cell?
**Context**: An audio-only open response has no text. report-service always links open responses to the single-question view for this reason. The earlier draft showed `(audio response)`, which told the teacher a recording existed but gave no way to hear it from the file.
**Options considered**:
- A) The link to the single-question view, in place of `(audio response)`
- B) The link also for answers with both text and audio, after the text
- C) Keep `(audio response)`

**Decision**: A, decided by Doug. It's the only way to reach the recording from the file, and it follows the same rule as interactives: text when there is some, otherwise the link. Trudi asked to remove the open-response link columns; this brings the link back only where an answer has no text, inside the answer's own column, and the reply to her should mention it. Answers with both text and audio show only the text.

---

### Should questions hidden from the dashboard be included?
**Context**: The dashboard hides questions not marked to show in the featured question report. The report-service report includes every question.
**Options considered**:
- A) Only the questions the dashboard shows
- B) Every question in the assignment

**Decision**: A. The CSV should match the dashboard the teacher downloaded it from, including the question and answer counts. None of the demo questions are hidden, so this only matters for real content that hides questions.

---

### How should the student rows be ordered?
**Context**: The dashboard can sort students by name, by progress or by feedback.
**Options considered**:
- A) Last name, then first name, always
- B) The dashboard's current sort order

**Decision**: A. A file used for record keeping should come out in the same order every time, and a spreadsheet can re-sort it. This is the dashboard's own name sort (`compareStudentsByName`).

---

### What are the file name and the last run date format?
**Context**: The file name should tell a teacher which class and assignment it holds. report-service's `last_run` is ISO-8601 with no time zone, while the dashboard shows the teacher's local date and time.
**Options considered**:
- A) `<class name> - <assignment name> - <YYYY-MM-DD>.csv`, and last run in the teacher's local time as `YYYY-MM-DD HH:MM`
- B) Same file name, and last run as ISO-8601, as in report-service

**Decision**: A. Local time matches what the dashboard's Last Run column shows, and `YYYY-MM-DD HH:MM` sorts correctly and is recognized as a date by Excel and Google Sheets.

---

### Does the file need a byte order mark, given most teachers use Macs?
**Context**: report-service's CSVs have no byte order mark: Athena reports are Athena's own output served from S3, and portal reports are streamed without one, and no one has reported an encoding problem with them. Their users are mostly researchers who open the files in Google Sheets, R or Python, and their columns are mostly IDs, numbers and English prompts. Teachers are more likely to double-click the file into Excel, and student answers are free text with accents, curly quotes and emoji. Excel, on Mac as well as Windows, reads a CSV without a byte order mark in a legacy encoding when it's opened by double-click, so non-ASCII text is garbled (`Café` as `CafÃ©`). Numbers and Google Sheets detect UTF-8 either way and ignore the mark.
**Options considered**:
- A) Keep the byte order mark
- B) Drop it, matching report-service

**Decision**: A, decided by Doug. It costs nothing in Numbers and Google Sheets and keeps Excel from garbling non-ASCII answers. The manual QA checklist's Excel row confirms it on a Mac.

---

### Should "Download as CSV" be in the menu only when the header button doesn't fit?
**Context**: As first built, the menu item appeared only in a narrow window, when the header button was hidden, so the control was in exactly one place at a time. After trying the test branch, Trudi asked: "Is it possible to always have it in the Hamburger Menu and just have it at the top as a shortcut?"
**Options considered**:
- A) Only in the menu when the header button doesn't fit
- B) Always in the menu, with the header button as a shortcut whenever it fits

**Decision**: B, requested by Trudi and agreed by Doug. The download is always in the same place in the menu, whatever the window width, and the header button is a quicker way to it when there's room. The fit check still decides whether the header button is shown.

### When exactly is the window "too narrow" for the button?
**Context**: Zeplin shows the two layouts but no breakpoint, and the header has a fixed `min-width` of 1100px.
**Options considered**:
- A) Switch to the menu item whenever the header can't fit the button without overlap or truncation
- B) A fixed breakpoint (e.g. 1300px)

**Decision**: A. Measured in the running dashboard, the free space between the Assignment selector and the teacher's name depends on the window width and the length of the teacher's name. With the demo name the ~165px button fits at 1366px but not at 1300px, and a longer name needs a wider window, so a fixed breakpoint would overlap long names or hide the button needlessly for short ones.

---

### Prompt text rules didn't match how the dashboard shows prompts
**Context**: Image questions can put their prompt in `drawingPrompt` (two of the three demo image questions do), and the dashboard's answer view shows the drawing prompt followed by the prompt. `striptags` removes tags but leaves entities such as `&nbsp;`, which would reach the CSV. (Found in the requirements self-review.)

**Decision**: The Prompt row requirement now includes the drawing prompt, decodes entities, repeats the prompt in each of a question's columns, and keeps the question number when there is no prompt.

---

### The spec didn't say what "the answers" are while answers are still arriving
**Context**: Answers come from a live Firestore listener, so the store changes after the first render and keeps changing as students work. (Found in the requirements self-review.)

**Decision**: The control is available once the dashboard has loaded, and the file is defined as a snapshot of the answers the dashboard has at the moment of the click.

---

### Link answers had no defined content
**Context**: The demo has four `external_link` answers, whose answer is a URL that the dashboard shows as a link. Under the interactive rule they would have become `(response recorded)`. (Found in the requirements self-review.)

**Decision**: A link answer shows its URL.

---

### Percent complete was undefined when no questions are visible
**Context**: answers ÷ questions divides by zero when the dashboard shows no questions. (Found in the requirements self-review.)

**Decision**: `Progress (%)` is empty in that case, as report-service does with `nullif`.

---

### Student answers could run as spreadsheet formulas
**Context**: Open response and interactive text is typed by students, and a cell starting with `=`, `+`, `-` or `@` is evaluated as a formula when the CSV is opened in Excel or Google Sheets (CSV injection). Nothing in the codebase escapes CSV output today, since no CSV code exists. (Found in the requirements self-review.)

**Decision**: Cells starting with those characters, a tab or a carriage return are prefixed with a single quote, following the OWASP guidance.

---

### The download control wasn't required to be keyboard accessible
**Context**: Nothing in the dashboard header can be focused today, and the hamburger menu and its items are `div`s with click handlers. In a narrow window the menu is the only way to download, so a keyboard user couldn't download at all. (Found in the requirements self-review.)

**Decision**: The header button must be a native button with a visible focus indicator and its label as its accessible name, with the icon hidden from screen readers. The hamburger menu must open from the keyboard, and its Download item must be reachable and activatable from the keyboard. Making the rest of the header's existing controls keyboard accessible remains outside this story.

---

### The new columns couldn't be exercised with the demo data
**Context**: The demo offering and class data have no usernames and no teachers, so the `Username` and `Teachers` columns and the anonymized-username rule would be untestable in development and Cypress. (Found in the requirements self-review.)

**Decision**: The Technical Notes record that the demo data needs usernames and teachers added.

---

### Build the CSV from Redux selectors or from the rendered components?
**Context**: The dashboard's components already format answers for display, so the CSV could reuse them.
**Options considered**:
- A) A pure function over the Redux state, reusing the selectors and small helpers (`hasResponse`, `getAnswerBadges`, `getFormattedStudentName`, `sortByName`, `countCompletedAnswers`)
- B) Render the answer components off-screen and read their text

**Decision**: A. The components produce HTML for display and depend on layout, iframes and interactive state history, while the selectors are already pure and tested. A keeps the CSV testable with a `fromJS` state and runs synchronously on click.

---

### How is "fits" detected?
**Context**: The requirements decide by fit rather than a fixed breakpoint, and the speccing check showed flexbox squeezes the teacher's name instead of overlapping.
**Options considered**:
- A) A ResizeObserver on the header, `flex-shrink: 0` on the name, and a measured check (the shown-case and hidden-case formulas above)
- B) A CSS-only container query or media query
- C) A fixed window-width breakpoint measured against the demo name

**Decision**: A. The browsers portal-report supports don't all have container queries. A media query can't account for the teacher's name length, and moving the item into the menu needs React to know the result anyway. The existing `@types/resize-observer-browser` dependency already types the native API. (Since changed: the menu item is now always shown, and React uses the result only to show or hide the header button. See the decision on whether "Download as CSV" should be in the menu only when the header button doesn't fit.)

---

### Should the menu toggle become a button inside the existing `div`, or replace it?
**Context**: The existing Cypress header spec clicks `[data-cy=header-menu]`, and the click-outside logic uses the `div`'s ref.
**Options considered**:
- A) Keep the `div` with its `data-cy`, `onClick` and ref, and put a `button` inside it
- B) Replace the `div` with a `button`

**Decision**: A. Existing tests and the outside-click handling keep working unchanged. Keyboard activation of the inner button fires a `click` that bubbles to the `div`'s handler.

---

### Should Escape close the hamburger menu?
**Context**: The plan makes the menu reachable from the keyboard: the toggle is a button, and the items are focusable while it's open. It doesn't say how a keyboard user closes it other than activating the toggle or an item. The ARIA menu button pattern closes a menu on Escape.
**Options considered**:
- A) Escape closes the open menu and, when focus was inside the list, returns focus to the toggle
- B) No Escape handling, as planned

**Decision**: A, decided during implementation. It's a few lines on the menu's existing container, reuses the focus-return logic the plan already adds, and a keyboard user who opens the menu by mistake expects Escape to close it. It changes nothing for mouse users.

---

### The rows code didn't type-check
**Context**: `tsc` under the repo's `strict` settings rejected the `getIn` results used as strings and as a `Map` (`TS2322`, `TS2571`, `TS2345`). (Found in the implementation plan self-review.)

**Decision**: The image-question cells and the answer lookup cast the `getIn` results. With the casts, the only remaining error was `clazzTeacherNames` being unknown, which the first step adds before this one.

---

### `safeFileNamePart` broke the webpack build
**Context**: The regex's `\u0000-\u001f` range tripped the repo's ESLint `no-control-regex` rule, which the dev server's `eslint-loader` reports as a build error. (Found in the implementation plan self-review.)

**Decision**: Control characters are checked by code point instead.

---

### The Blob URL was revoked too soon
**Context**: Revoking the object URL right after `click()` can cancel the download in some browsers. FileSaver.js waits 40 seconds for this reason. (Found in the implementation plan self-review.)

**Decision**: Revoke after 40 seconds.

---

### Font loading could leave a stale fit decision
**Context**: The observer only watched the header, whose size doesn't change when the web font finishes loading and widens the button or the teacher's name. (Found in the implementation plan self-review.)

**Decision**: The observer also watches the name and the button.

---

### The download test relied on `Blob.text()`
**Context**: The repo's Jest uses jsdom 15.2.1, which has no `Blob.text()`. (Found in the implementation plan self-review.)

**Decision**: The test reads the Blob with `FileReader`, and uses fake timers for the 40-second revoke.

---

### The Cypress keyboard check depended on unverified Cypress behavior
**Context**: Cypress's `type("{enter}")` simulates key events rather than sending native ones, and whether it activates a button in Cypress 8 couldn't be checked here: the Cypress binary wasn't installed for this session. (Found in the implementation plan self-review.)

**Decision**: The spec checks that the control is a focusable `button` and relies on native button behavior for Enter and Space, so the test doesn't depend on that behavior either way.

---

### Focus was stranded inside the closed menu
**Context**: With the menu items as buttons, activating Download from the keyboard closes the menu, which sets `aria-hidden` and `tabIndex` -1 on the list, while focus stays on the Download button inside it. (Found in the implementation plan self-review.)

**Decision**: Closing the menu with focus inside it moves focus to the toggle button, with a test.

---
