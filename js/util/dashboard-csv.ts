import { List, Map } from "immutable";
import getSequenceTree, { getAnswersByQuestion } from "../selectors/report-tree";
import { getAnonymous, getIsResearcher, countCompletedAnswers } from "../selectors/dashboard-selectors";
import { sortByName } from "./sort-utils";
import { getFormattedStudentName } from "./student-utils";
import { hasResponse, hasAudioResponse } from "./answer-utils";
import { htmlToText, formatCsvDate, formatCsvDateTime, safeFileNamePart } from "./csv";
import { getAnswerLink } from "./answer-link";
import { replaceBlankMarkers } from "./misc";
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

const safely = (fn: AnswerCell): AnswerCell => (answer, question, student) => {
  try {
    return fn(answer, question, student) || "";
  } catch (e) {
    return "";   // a malformed answer gives an empty cell, not a failed download
  }
};

const choiceCell: AnswerCell = answer =>
  (answer.get("selectedChoices") || List())
    .map((choice: Map<string, any>) => htmlToText(choice.get("content")))
    .join(", ");

// Audio-only answers link to the single-question view, where the recording plays.
const openResponseCell = (sourceKey: string): AnswerCell => (answer, question, student) => {
  const value = answer.get("answer");
  if (typeof value === "string" && value !== "") {
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
  return replaceBlankMarkers(htmlToText(html)) || "(no prompt)";
};

const correctAnswerText = (question: Map<string, any>) => {
  const correct = (question.get("choices") || List()).filter((c: Map<string, any>) => c.get("correct"));
  return correct.size > 0
    ? `Correct answer(s): ${correct.map((c: Map<string, any>) => htmlToText(c.get("content"))).join(", ")}`
    : "";
};

export const getAssignmentName = (sequenceTree: Map<string, any>): string =>
  sequenceTree.get("name") || sequenceTree.get("children").first()?.get("name") || "";

const getVisibleActivityQuestions = (sequenceTree: Map<string, any>): List<List<Map<string, any>>> =>
  sequenceTree.get("children").map((activity: Map<string, any>) =>
    activity.get("questions").filter((q: Map<string, any>) => q.get("visible")));

// The dashboard's own labels, so the file reads like the screen.
const STUDENT_HEADERS = ["Student Name", "Username", "Class", "Teachers", "Assignment",
  "Last Run", "Questions", "Answered", "Progress (%)"];

export const buildDashboardCsvRows = (state: RootState): Cell[][] => {
  const report = state.get("report");
  const sequenceTree = getSequenceTree(state);
  const answers = getAnswersByQuestion(state);
  const anonymous = getAnonymous(state) || getIsResearcher(state);
  const assignmentName = getAssignmentName(sequenceTree);
  const teacherNames = (report.get("clazzTeacherNames") || List()).join(", ");
  const activityQuestions = getVisibleActivityQuestions(sequenceTree);
  const visibleQuestions = activityQuestions.flatten(1) as List<Map<string, any>>;

  const answerColumns: IAnswerColumn[] = [];
  activityQuestions.forEach((questions, activityIndex) => {
    questions.forEach(question => {
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

  const numQuestions = visibleQuestions.size;
  const studentRows = sortByName(report.get("students")).map((student: Map<string, any>) => {
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
