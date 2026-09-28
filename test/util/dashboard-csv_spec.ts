import { fromJS, Map } from "immutable";
import { buildDashboardCsvRows, getDashboardCsvFileName } from "../../js/util/dashboard-csv";
import { getStudentProgress } from "../../js/selectors/dashboard-selectors";
import { formatCsvDateTime } from "../../js/util/csv";

const SOURCE_KEY = "fake.authoring.system";
const linkTo = (questionId: string, userId: number) =>
  `${window.location.origin}/?sourceKey=${SOURCE_KEY}&iframeQuestionId=${questionId}&studentId=${userId}`;
const keyBy = (items: Array<{id: string}>) =>
  items.reduce((map: Record<string, any>, item) => { map[item.id] = item; return map; }, {});
const reportState = (interactiveState: any) => JSON.stringify({ interactiveState: JSON.stringify(interactiveState) });

const questions: Record<string, any> = {
  // Activity 1
  open_response_1: { type: "open_response", questionNumber: 1, prompt: "<p>Describe&nbsp;the fire &amp; smoke</p>" },
  multiple_choice_1: { type: "multiple_choice", questionNumber: 2, prompt: "Pick one", scored: true,
    choices: [{ id: 1, content: "a", correct: true }, { id: 2, content: "b", correct: false }] },
  multiple_choice_2: { type: "multiple_choice", questionNumber: 3, prompt: "", scored: false,
    choices: [{ id: 3, content: "<b>yes</b>" }, { id: 4, content: "no" }] },
  open_response_2: { type: "open_response", questionNumber: 4, prompt: "Required", required: true },
  open_response_3: { type: "open_response", questionNumber: 5, prompt: "Record" },
  open_response_4: { type: "open_response", questionNumber: 8, prompt: "Record and type" },
  image_question_1: { type: "image_question", questionNumber: 6, drawingPrompt: "<p>Draw it</p>", prompt: "Explain" },
  mw_interactive_hidden: { type: "iframe_interactive", questionNumber: 7, prompt: "Hidden", showInFeaturedQuestionReport: false },
  // Activity 2
  mw_interactive_1: { type: "iframe_interactive", questionNumber: 1, prompt: "The [blank-1] ran" },
  mw_interactive_2: { type: "iframe_interactive", questionNumber: 2, prompt: "No text" },
  mw_interactive_3: { type: "iframe_interactive", questionNumber: 3, prompt: "Empty" },
  mw_interactive_4: { type: "iframe_interactive", questionNumber: 4, prompt: "Link" },
  multiple_choice_3: { type: "multiple_choice", questionNumber: 5, prompt: "Deleted",
    choices: [{ id: 5, content: "kept" }] },
};
const activity1Questions = ["open_response_1", "multiple_choice_1", "multiple_choice_2", "open_response_2",
  "open_response_3", "image_question_1", "mw_interactive_hidden", "open_response_4"];
const activity2Questions = ["mw_interactive_1", "mw_interactive_2", "mw_interactive_3", "mw_interactive_4",
  "multiple_choice_3"];

const answer = (id: string, questionId: string, platformUserId: string, fields: Record<string, any>) =>
  ({ id, questionId, platformUserId, questionType: questions[questionId].type, ...fields });

const answers = [
  // John Jenkins answers everything.
  answer("a1", "open_response_1", "1", { type: "open_response_answer", answer: 'He said "hi", then\nleft' }),
  answer("a2", "multiple_choice_1", "1", { type: "multiple_choice_answer", answer: { choiceIds: [1] } }),
  answer("a3", "multiple_choice_2", "1", { type: "multiple_choice_answer", answer: { choiceIds: [3, 4] } }),
  answer("a4", "open_response_2", "1", { type: "open_response_answer", answer: "done", submitted: true }),
  answer("a5", "open_response_3", "1", { type: "open_response_answer", answer: {},
    reportState: reportState({ audioFile: "audio.mp3" }) }),
  answer("a13", "open_response_4", "1", { type: "open_response_answer", answer: {},
    answerText: "spoken <b>and</b> typed", reportState: reportState({ audioFile: "audio.mp3" }) }),
  answer("a6", "image_question_1", "1", { type: "image_question_answer",
    answer: { imageUrl: "https://example.com/snapshot.png", text: "my note" } }),
  answer("a7", "mw_interactive_hidden", "1", { type: "interactive_state", reportState: reportState({ a: 1 }) }),
  answer("a8", "mw_interactive_1", "1", { type: "interactive_state", answerText: "The <b>dog</b>&nbsp;ran",
    reportState: reportState({ a: 1 }) }),
  answer("a9", "mw_interactive_2", "1", { type: "interactive_state", reportState: reportState({ a: 1 }) }),
  answer("a10", "mw_interactive_3", "1", { type: "interactive_state", reportState: reportState({}) }),
  answer("a11", "mw_interactive_4", "1", { type: "external_link", answer: "https://codap.example.org/doc" }),
  answer("a12", "multiple_choice_3", "1", { type: "multiple_choice_answer", answer: { choiceIds: [99] } }),
  // Amy Galloway has an unsubmitted required answer and a malformed image answer.
  answer("b1", "open_response_2", "3", { type: "open_response_answer", answer: "draft", submitted: false }),
  answer("b2", "image_question_1", "3", { type: "image_question_answer" }),
  answer("b4", "open_response_3", "3", { type: "open_response_answer", answer: "",
    reportState: reportState({ audioFile: "audio.mp3" }) }),
  answer("b3", "multiple_choice_1", "3", { type: "multiple_choice_answer", answer: { choiceIds: [2] } }),
];

const students = {
  1: { id: "1", userId: 1, firstName: "John", lastName: "Jenkins", name: "Student 3", realName: "John Jenkins",
    username: "jjenkins", lastRun: "2025-05-10T10:03:00Z" },
  2: { id: "2", userId: 2, firstName: "Jenna", lastName: "Armstrong", name: "Student 1", realName: "Jenna Armstrong",
    username: "jarmstrong", lastRun: null },
  3: { id: "3", userId: 3, firstName: "Amy", lastName: "Galloway", name: "Student 2", realName: "Amy Galloway",
    username: "agalloway", lastRun: "2025-05-09T08:00:00Z" },
};

// fromJS turns clazzTeacherNames into a List and every nested object into a Map, as the reducers do.
const makeState = (reportOverrides: Record<string, any> = {}) => {
  const report = fromJS({
    clazzName: "Period 3/4 Science",
    clazzTeacherNames: ["Kristen Teachername", "Pat Coteacher"],
    sourceKey: SOURCE_KEY,
    anonymous: false,
    userType: "teacher",
    showFeaturedQuestionsOnly: true,
    hideSectionNames: false,
    students,
    sequences: { seq: { id: "seq", name: "Fire Sequence", children: ["activity_1", "activity_2"] } },
    activities: {
      activity_1: { id: "activity_1", name: "Fires", children: ["section_1"] },
      activity_2: { id: "activity_2", name: "Smoke", children: ["section_2"] },
    },
    sections: {
      section_1: { id: "section_1", children: ["page_1"] },
      section_2: { id: "section_2", children: ["page_2"] },
    },
    pages: {
      page_1: { id: "page_1", children: activity1Questions },
      page_2: { id: "page_2", children: activity2Questions },
    },
    questions: keyBy(Object.keys(questions).map(id => ({ id, ...questions[id] }))),
    answers: keyBy(answers),
    ...reportOverrides
  });
  return Map({ report }) as any;
};

describe("dashboard CSV", () => {
  beforeAll(() => {
    // The dashboard's visibility rule for questions only applies in the portal dashboard view.
    window.history.pushState({}, "Test", "/?portal-dashboard");
  });
  afterAll(() => {
    window.history.replaceState({}, "Test", "/");
  });

  const STUDENT_HEADERS = ["Student Name", "Username", "Class", "Teachers", "Assignment", "Last Run",
    "Questions", "Answered", "Progress (%)"];
  const ANSWER_HEADERS = ["Activity 1 Q1", "Activity 1 Q2", "Activity 1 Q3", "Activity 1 Q4", "Activity 1 Q5",
    "Activity 1 Q6 Image", "Activity 1 Q6 Text", "Activity 1 Q8", "Activity 2 Q1", "Activity 2 Q2", "Activity 2 Q3", "Activity 2 Q4",
    "Activity 2 Q5"];
  const column = (header: string) => STUDENT_HEADERS.length + ANSWER_HEADERS.indexOf(header);

  describe("buildDashboardCsvRows", () => {
    let headerRow: Array<string | number>;
    let promptRow: Array<string | number>;
    let correctRow: Array<string | number>;
    let studentRows: Array<Array<string | number>>;
    let armstrong: Array<string | number>;
    let galloway: Array<string | number>;
    let jenkins: Array<string | number>;
    beforeAll(() => {
      [headerRow, promptRow, correctRow, ...studentRows] = buildDashboardCsvRows(makeState());
      [armstrong, galloway, jenkins] = studentRows;
    });

    it("names the columns as the dashboard does, leaving out hidden questions", () => {
      expect(headerRow).toEqual([...STUDENT_HEADERS, ...ANSWER_HEADERS]);
    });

    it("gives each question's prompt as plain text in the Prompt row", () => {
      expect(promptRow.slice(0, STUDENT_HEADERS.length)).toEqual(["Prompt", "", "", "", "", "", "", "", ""]);
      expect(promptRow.slice(STUDENT_HEADERS.length)).toEqual([
        "Q1: Describe the fire & smoke",
        "Q2: Pick one",
        "Q3: (no prompt)",
        "Q4: Required",
        "Q5: Record",
        "Q6: Draw it Explain",
        "Q6: Draw it Explain",
        "Q8: Record and type",
        "Q1: The __________ ran",
        "Q2: No text",
        "Q3: Empty",
        "Q4: Link",
        "Q5: Deleted",
      ]);
    });

    it("fills in the Correct answer row only for multiple choice questions with correct choices", () => {
      expect(correctRow[0]).toBe("Correct answer");
      expect(correctRow.slice(1).filter(cell => cell !== "")).toEqual(["Correct answer(s): a"]);
      expect(correctRow[column("Activity 1 Q2")]).toBe("Correct answer(s): a");
    });

    it("has one row per student, in last-name order", () => {
      expect(studentRows.map(row => row[0])).toEqual(["Armstrong, Jenna", "Galloway, Amy", "Jenkins, John"]);
    });

    it("fills in the student, class and progress columns", () => {
      expect(jenkins.slice(0, STUDENT_HEADERS.length)).toEqual([
        "Jenkins, John", "jjenkins", "Period 3/4 Science", "Kristen Teachername, Pat Coteacher", "Fire Sequence",
        formatCsvDateTime("2025-05-10T10:03:00Z"), 12, 12, 100
      ]);
      expect(armstrong.slice(5, STUDENT_HEADERS.length)).toEqual(["", 12, 0, 0]);
      expect(galloway.slice(6, STUDENT_HEADERS.length)).toEqual([12, 3, 25]);
    });

    it("counts progress the way the dashboard does", () => {
      const progress = getStudentProgress(makeState());
      // The dashboard's progress is per activity; the CSV totals the visible questions across activities.
      const activityQuestionCounts = [7, 5];
      const studentIdsInRowOrder = ["2", "3", "1"];
      studentRows.forEach((row, i) => {
        const answered = progress.get(studentIdsInRowOrder[i]).toList().toArray()
          .reduce((sum: number, fraction: number, i: number) => sum + Math.round(fraction * activityQuestionCounts[i]), 0);
        expect(row[7]).toBe(answered);
      });
    });

    it("formats each kind of answer", () => {
      const cell = (header: string) => jenkins[column(header)];
      expect(cell("Activity 1 Q1")).toBe('He said "hi", then\nleft');
      expect(cell("Activity 1 Q2")).toBe("a");
      expect(cell("Activity 1 Q3")).toBe("yes, no");
      expect(cell("Activity 1 Q4")).toBe("done");
      expect(cell("Activity 1 Q5")).toBe(linkTo("open_response_3", 1));
      expect(cell("Activity 1 Q6 Image")).toBe("https://example.com/snapshot.png");
      expect(cell("Activity 1 Q6 Text")).toBe("my note");
      expect(cell("Activity 1 Q8")).toBe("spoken and typed");
      expect(cell("Activity 2 Q1")).toBe("The dog ran");
      expect(cell("Activity 2 Q2")).toBe(linkTo("mw_interactive_2", 1));
      expect(cell("Activity 2 Q3")).toBe("");
      expect(cell("Activity 2 Q4")).toBe("https://codap.example.org/doc");
      expect(cell("Activity 2 Q5")).toBe("[the selected choice has been deleted by question author]");
    });

    it("leaves unsubmitted required answers and malformed answers empty", () => {
      expect(galloway[column("Activity 1 Q4")]).toBe("");
      expect(galloway[column("Activity 1 Q6 Image")]).toBe("");
      expect(galloway[column("Activity 1 Q6 Text")]).toBe("");
      expect(galloway[column("Activity 1 Q2")]).toBe("b");
    });

    it("links an audio answer whose text is empty", () => {
      expect(galloway[column("Activity 1 Q5")]).toBe(linkTo("open_response_3", 3));
    });

    it("leaves every answer cell empty for a student with no answers", () => {
      expect(armstrong.slice(STUDENT_HEADERS.length).every(cell => cell === "")).toBe(true);
    });

    it("gives an empty cell rather than failing when an answer can't be read", () => {
      const state = makeState().setIn(["report", "answers", "a9", "reportState"], "{not json");
      const row = buildDashboardCsvRows(state)[5];
      expect(row[column("Activity 2 Q2")]).toBe("");
      expect(row[column("Activity 2 Q1")]).toBe("The dog ran");
    });

    it("rounds Progress (%) to one decimal place", () => {
      const state = makeState().setIn(["report", "questions", "open_response_4", "showInFeaturedQuestionReport"], false);
      const galloway11 = buildDashboardCsvRows(state)[4];
      expect(galloway11.slice(6, STUDENT_HEADERS.length)).toEqual([11, 3, 27.3]);
    });

    it("leaves Progress (%) empty when no questions are visible", () => {
      const hidden = makeState().updateIn(["report", "questions"], (qs: any) =>
        qs.map((q: any) => q.set("showInFeaturedQuestionReport", false)));
      const [header, , , first] = buildDashboardCsvRows(hidden);
      expect(header).toEqual(STUDENT_HEADERS);
      expect(first.slice(6)).toEqual([0, 0, ""]);
    });

    it("labels a single activity as Activity 1 and uses its name as the assignment", () => {
      const single = makeState()
        .setIn(["report", "sequences"], fromJS({ seq: { id: "seq", name: "", children: ["activity_2"] } }));
      const [header, , , first] = buildDashboardCsvRows(single);
      expect(header.slice(STUDENT_HEADERS.length)).toEqual(
        ["Activity 1 Q1", "Activity 1 Q2", "Activity 1 Q3", "Activity 1 Q4", "Activity 1 Q5"]);
      expect(first[4]).toBe("Smoke");
    });

    describe("anonymized", () => {
      const expectAnonymized = (anonRows: any[][]) => {
        const anonStudents = anonRows.slice(3);
        expect(anonStudents.map(row => row[0])).toEqual(["Student 1", "Student 2", "Student 3"]);
        expect(anonStudents.map(row => row[1])).toEqual(["", "", ""]);
        // Links carry the user ID, not the name, so they stay.
        expect(anonStudents[2][column("Activity 2 Q2")]).toBe(linkTo("mw_interactive_2", 1));
      };

      it("follows the Anonymize students toggle", () => {
        expectAnonymized(buildDashboardCsvRows(makeState({ anonymous: true })));
      });

      it("is always anonymized for researchers", () => {
        expectAnonymized(buildDashboardCsvRows(makeState({ userType: "researcher" })));
      });
    });
  });

  describe("getDashboardCsvFileName", () => {
    it("names the file after the class, assignment and local date", () => {
      expect(getDashboardCsvFileName(makeState(), new Date(2026, 8, 5, 23, 30)))
        .toBe("Period 3_4 Science - Fire Sequence - 2026-09-05.csv");
    });
  });
});
