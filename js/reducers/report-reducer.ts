import Immutable, { Map, List, Set } from "immutable";
import queryString from "query-string";
import { RecordFactory } from "../util/record-factory";
import config from "../config";
import {
  normalizeResourceJSON,
  preprocessPortalDataJSON,
  preprocessAnswersJSON
} from "../core/transform-json-response";
import {
  RECEIVE_RESOURCE_STRUCTURE,
  RECEIVE_USER_SETTINGS,
  SET_NOW_SHOWING,
  HIDE_UNSELECTED_QUESTIONS,
  SHOW_UNSELECTED_QUESTIONS,
  RECEIVE_PORTAL_DATA,
  SET_ANSWER_SELECTED_FOR_COMPARE,
  SHOW_COMPARE_VIEW,
  HIDE_COMPARE_VIEW,
  RECEIVE_ANSWERS
} from "../actions";

export type ReportType = "class" | "student";

export interface IReportState {
  // Type: 'class' or 'student'. Used by regular report only. 'class' displays all the answers,
  // while 'student' focuses on one student only.
  type: ReportType;
  nowShowing: ReportType;
  clazzName: string;
  clazzId: number;
  students: Map<any, any>;
  answers: Map<any, any>;
  sequences: Map<any, any>;
  activities: Map<any, any>;
  sections: Map<any, any>;
  pages: Map<any, any>;
  questions: Map<any, any>;
  selectedStudentIds: List<string>;
  hideControls: boolean;
  hideSectionNames: boolean;
  platformUserId: string;
  platformUserName: string;
  contextId: string;
  resourceLinkId: string;
  platformId: string;
  sourceKey: string;
  anonymous: boolean;
  compareViewAnswers: Set<string> | null;
  // Note that this filter will be respected only in Dashboard report. Check report-tree.js and isQuestionVisible helper.
  showFeaturedQuestionsOnly: boolean;
  iframeQuestionId: string;
  hasTeacherEdition: boolean;
}

const INITIAL_REPORT_STATE = RecordFactory<IReportState>({
  type: "class",
  nowShowing: "class",
  clazzName: "",
  clazzId: -1,
  students: Immutable.fromJS([]),
  answers: Immutable.fromJS([]),
  sequences: Immutable.fromJS([]),
  activities: Immutable.fromJS([]),
  sections: Immutable.fromJS([]),
  pages: Immutable.fromJS([]),
  questions: Immutable.fromJS([]),
  selectedStudentIds: Immutable.fromJS([]),
  hideControls: false,
  hideSectionNames: false,
  platformUserId: "",
  platformUserName:"",
  contextId: "",
  resourceLinkId: "",
  platformId: "",
  sourceKey: "",
  anonymous: false,
  compareViewAnswers: null,
  showFeaturedQuestionsOnly: true,
  iframeQuestionId: config("iframeQuestionId") as string || "",
  hasTeacherEdition: false,
});

export class ReportState extends INITIAL_REPORT_STATE implements IReportState {
  constructor(config: Partial<IReportState>) {
    super(config);
  }
  type: ReportType;
  nowShowing: ReportType;
  clazzName: string;
  clazzId: number;
  students: Map<any, any>;
  answers: Map<any, any>;
  sequences: Map<any, any>;
  activities: Map<any, any>;
  sections: Map<any, any>;
  pages: Map<any, any>;
  questions: Map<any, any>;
  selectedStudentIds: List<string>;
  hideControls: boolean;
  hideSectionNames: boolean;
  platformUserId: string;
  platformUserName: string;
  contextId: string;
  resourceLinkId: string;
  platformId: string;
  sourceKey: string;
  anonymous: boolean;
  compareViewAnswers: Set<string> | null;
  showFeaturedQuestionsOnly: boolean;
  iframeQuestionId: string;
  hasTeacherEdition: boolean;
}

export default function report(state = new ReportState({}), action?: any) {
  let data;
  // Report type depends on what kind of user is launching the report and whether `studentId` URL param is provided.
  // Students can only see their own report. Teachers can see either class report or individual student report.
  // Theoretically student can easily modify URL parameter to open report of the other student. But this report
  // will be always empty, as student-oriented report queries only student own answers (student user id is coming
  // from JWT info) and Firestore security rules also ensure that.
  const { studentId } = queryString.parse(window.location.search);
  const urlBasedStudentSelection = studentId ? Immutable.fromJS([ studentId ]) : null;
  switch (action.type) {
    case RECEIVE_PORTAL_DATA:
      data = preprocessPortalDataJSON(action.response);
      
      let type: ReportType = "student";
      let hideControls = true;
      if (!studentId && data.userType === "teacher") {
        // Ensure that Portal data also indicates that the user is a teacher. Otherwise, student could just
        // remove "studentId" URL parameter to see the full class report.
        type = "class";
        hideControls = false;
      }
      state = state
        .set("type", type)
        .set("nowShowing", type)
        .set("selectedStudentIds", urlBasedStudentSelection)
        .set("hideControls", hideControls)
        .set("clazzName", data.classInfo.name)
        .set("clazzId", data.classInfo.id)
        .set("students", Map(data.classInfo.students.map(student => [student.id, Map(student)])))
        .set("platformUserId", data.platformUserId)
        .set("platformUserName",data.offering.teacher)
        .set("contextId", data.contextId)
        .set("resourceLinkId", data.offering.id.toString())
        .set("platformId", data.platformId)
        .set("sourceKey", data.sourceKey)
        .set("hasTeacherEdition", data.offering.hasTeacherEdition);
      return state;
    case RECEIVE_RESOURCE_STRUCTURE:
      data = normalizeResourceJSON(action.response);
      state = state
        .set("sequences", Immutable.fromJS(data.entities.sequences))
        .set("activities", Immutable.fromJS(data.entities.activities))
        .set("sections", Immutable.fromJS(data.entities.sections))
        .set("pages", Immutable.fromJS(data.entities.pages))
        .set("questions", Immutable.fromJS(data.entities.questions));
      return state;
    case RECEIVE_ANSWERS:
      return state.set("answers", Immutable.fromJS(preprocessAnswersJSON(action.response)));
    case SET_NOW_SHOWING:
      return state
        .set("nowShowing", action.nowShowingValue)
        .set("selectedStudentIds", action.selectedStudentIds ? action.selectedStudentIds : urlBasedStudentSelection);

    // The following actions trigger API middleware that invokes the FireStore API.
    // The results of middleware invocation are handled by the `RECEIVE_USER_SETTINGS` action.
    // These FireStore API calls return immediately.
    // See: https://firebase.google.com/docs/firestore/query-data/listen

    // Two NO-OP Named actions only call the FireStore middleware:
    // case SET_ANONYMOUS: ; // No direct reducer action, only API middleware.
    // case SET_QUESTION_SELECTED: ; // No direct reducer action, only API middleware.
    case HIDE_UNSELECTED_QUESTIONS:
      return hideUnselectedQuestions(state);
    case SHOW_UNSELECTED_QUESTIONS:
      return showUnselectedQuestions(state);

    // The middleware triggered API from above will result in invokation of:
    case RECEIVE_USER_SETTINGS:
      if (action.response) {
        return setUserSettings(state, action.response);
      }
      return state;

    case SET_ANSWER_SELECTED_FOR_COMPARE:
      const compareViewAns = state.get("compareViewAnswers");
      if (compareViewAns) {
        // If compare view is open and user unselect given answer, remove it from the compare set too.
        // It's possible, as there is "Remove" link in the compare view.
        state = state.set("compareViewAnswers", compareViewAns.delete(action.id));
      }
      return state.setIn(["answers", action.id, "selectedForCompare"], action.value);
    case SHOW_COMPARE_VIEW:
      const selectedAnswerIds = state.get("answers")
        .filter(a => a.get("selectedForCompare") && a.get("questionId") === action.questionId)
        .map(a => a.get("id"))
        .values();
      return state.set("compareViewAnswers", Set(selectedAnswerIds));
    case HIDE_COMPARE_VIEW:
      return state.set("compareViewAnswers", null);
    default:
      return state;
  }
}

// This action has to be explicit, otherwise, a question will disappear
// immediately when teacher has selection filter active and unselects given
// question. Instead, the question should stay visible until teacher clicks
// "Show selected" again.
function hideUnselectedQuestions(state: ReportState) {
  return state.withMutations(state => {
    const someSelected = state.get("questions").size > 0;
    state.get("questions").forEach((value: any, key: any) => {
      const selected = state.getIn(["questions", key, "selected"]);
      if (someSelected) {
        state = state.setIn(["questions", key, "hiddenByUser"], !selected);
      } else {
        state = state.setIn(["questions", key, "hiddenByUser"], false);
      }
    });
    return state;
  });
}

function showUnselectedQuestions(state: ReportState) {
  return state.withMutations(state => {
    state.get("questions").forEach((value, key) => {
      state = state.setIn(["questions", key, "hiddenByUser"], false);
    });
    return state;
  });
}

function setUserSettings(state: ReportState, response: any) {
  const {visibility_filter, anonymous_report} = response;
  let selectedQuestions: any[] = [];
  // The visibility_filter might not be setup on the user settings yet
  if (visibility_filter?.questions) {
    selectedQuestions = visibility_filter.questions;
  }
  return state.withMutations((state: ReportState) => {
    state.get("questions").forEach((value, key) => {
      const selected = selectedQuestions.indexOf(key) > -1;
      state = state.setIn(["questions", key, "selected"], selected);
    });
    state = setAnonymous(state, anonymous_report);
    return state;
  });
}

function setAnonymous(state: ReportState, anonymous: boolean) {
  let idx = 1;
  const newStudents = state.get("students")
    .map(s => s.set("name", anonymous ? `Student ${idx++}` : s.get("realName"))) as Map<any, any>;
  return state.set("anonymous", anonymous).set("students", newStudents);
}
