import Immutable, { Map, Set } from "immutable";
import queryString from "query-string";
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

const INITIAL_REPORT_STATE = Map({
  // Type: 'class' or 'student'. Used by regular report only. 'class' displays all the answers,
  // while 'student' focuses on one student only.
  type: "class",
  nowShowing: "class",
  clazzName: "",
  clazzId: "",
  students: Immutable.fromJS([]),
  answers: Immutable.fromJS([]),
  selectedStudentIds: null,
  hideControls: false,
  hideSectionNames: false,
  // Note that this filter will be respected only in Dashboard report. Check report-tree.js and isQuestionVisible helper.
  showFeaturedQuestionsOnly: true,
  iframeQuestionId: config("iframeQuestionId") || "",
});

export default function report(state = INITIAL_REPORT_STATE, action) {
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
      let type;
      let hideControls;
      if (studentId) {
        type = "student";
        hideControls = true;
      } else if (data.userType === "teacher") {
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
        .set("contextId", data.contextId)
        .set("resourceLinkId", data.offering.id.toString())
        .set("platformId", data.platformId)
        .set("sourceKey", data.sourceKey);
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
function hideUnselectedQuestions(state) {
  return state.withMutations(state => {
    const someSelected = state.get("questions").size > 0;
    state.get("questions").forEach((value, key) => {
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

function showUnselectedQuestions(state) {
  return state.withMutations(state => {
    state.get("questions").forEach((value, key) => {
      state = state.setIn(["questions", key, "hiddenByUser"], false);
    });
    return state;
  });
}

function setUserSettings(state, response) {
  const {visibility_filter, anonymous_report} = response;
  let selectedQuestions = [];
  // The visibility_filter might not be setup on the user settings yet
  if (visibility_filter && visibility_filter.questions) {
    selectedQuestions = visibility_filter.questions;
  }
  return state.withMutations(state => {
    state.get("questions").forEach((value, key) => {
      const selected = selectedQuestions.indexOf(key) > -1;
      state = state.setIn(["questions", key, "selected"], selected);
    });
    state = setAnonymous(state, anonymous_report);
    return state;
  });
}

function setAnonymous(state, anonymous) {
  let idx = 1;
  const newStudents = state.get("students")
    .map(s => s.set("name", anonymous ? `Student ${idx++}` : s.get("realName")));
  return state.set("anonymous", anonymous).set("students", newStudents);
}
