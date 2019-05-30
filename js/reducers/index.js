import Immutable, { Map, Set} from "immutable";
import {
  REQUEST_PORTAL_DATA, RECEIVE_RESOURCE_STRUCTURE, FETCH_ERROR, SET_NOW_SHOWING, SET_ANONYMOUS,
  SET_QUESTION_SELECTED, HIDE_UNSELECTED_QUESTIONS, SHOW_UNSELECTED_QUESTIONS, RECEIVE_PORTAL_DATA,
  SET_ANSWER_SELECTED_FOR_COMPARE, SHOW_COMPARE_VIEW, HIDE_COMPARE_VIEW, ENABLE_FEEDBACK, ENABLE_ACTIVITY_FEEDBACK,
} from "../actions";
import { MANUAL_SCORE, RUBRIC_SCORE } from "../util/scoring-constants";
import feedbackReducer from "./feedback-reducer";
import { rubricReducer } from "./rubric-reducer";
import { activityFeedbackReducer } from "./activity-feedback-reducer";
import dashboardReducer from "./dashboard-reducer";
import config from "../config";
import { normalizeResourceJSON, preprocessPortalDataJSON } from "../core/transform-json-response";

export const FULL_REPORT = "fullReport";
export const DASHBOARD = "dashboard";

const INITIAL_VIEW = Map({
  type: config("dashboard") ? DASHBOARD : FULL_REPORT,
});

// Defines which view / app is going to be used. A full report or a compact dashboard.
function view(state = INITIAL_VIEW, action) {
  switch (action.type) {
    // Nothing to do here now. In the future, we might let users toggle between full report and dashboard.
    // Implementation can look like:
    // case SWITCH_REPORT_VIEW:
    //   return state.set('type', action.viewType)
    default:
      return state;
  }
}

const INITIAL_DATA = Map({
  isFetching: true
});
function data(state = INITIAL_DATA, action) {
  switch (action.type) {
    case REQUEST_PORTAL_DATA:
      return state.set("isFetching", true);
    case RECEIVE_RESOURCE_STRUCTURE:
      return state.set("isFetching", false)
        .set("error", null);
    case FETCH_ERROR:
      return state.set("isFetching", false)
        .set("error", action.response);
    default:
      return state;
  }
}

function setAnonymous(state, anonymous) {
  let idx = 1;
  const newStudents = state.get("students").map(s => s.set("name", anonymous ? `Student ${idx++}` : s.get("realName")));
  return state.set("anonymous", anonymous)
    .set("students", newStudents);
}

// This action has to be explicit and requires additional property. Otherwise, a question will disappear immediately
// when teacher has selection filter active and unselects given question. Instead, the question should stay visible
// until teacher clicks "Show selected" again.
function hideUnselectedQuestions(state) {
  if (!state.get("questions").some(question => question.get("selected"))) {
    // Make sure that at least one question is selected. Never let user hide all the questions.
    // This is necessary due to compatibility with Portal API and old report. Portal API by default states
    // that the visibility filter is active, but no questions are selected. Without this check, nothing would be visible.
    return state;
  }
  return state.withMutations(state => {
    state.get("questions").forEach((value, key) => {
      state = state.setIn(["questions", key, "hiddenByUser"], !state.getIn(["questions", key, "selected"]));
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

function enableFeedback(state, action) {
  const {embeddableKey, feedbackFlags} = action;
  return state.mergeIn(["questions", embeddableKey], feedbackFlags);
}

function enableActivityFeedback(state, action) {
  const {activityId, feedbackFlags} = action;
  const statePath = ["activities", activityId.toString()];
  // We have to unset 'RUBRIC_SCORE' scoretypes when
  // we are no longer using rubric...
  if (feedbackFlags.useRubric === false) {
    const scoreType = state.getIn(statePath).get("scoreType");
    if (scoreType === RUBRIC_SCORE) {
      feedbackFlags.scoreType = MANUAL_SCORE;
    }
  }
  return state.mergeIn(statePath, feedbackFlags);
}

const INITIAL_REPORT_STATE = Map({
  // Type: 'class' or 'student'. Used by regular report only. 'class' displays all the answers,
  // while 'student' focuses on one student only.
  type: "class",
  nowShowing: "class",
  clazzName: "",
  clazzId: "",
  students: Immutable.fromJS([]),
  answers: Immutable.fromJS([]),
  selectedStudentId: null,
  hideControls: false,
  hideSectionNames: false,
  // Note that this filter will be respected only in Dashboard report. Check report-tree.js and isQuestionVisible helper.
  showFeaturedQuestionsOnly: true,
});

function report(state = INITIAL_REPORT_STATE, action) {
  let data;
  switch (action.type) {
    case RECEIVE_PORTAL_DATA:
      data = preprocessPortalDataJSON(action.response);
      // Report type depends on what kind of user is launching the report. Teachers will see class report,
      // while students will see their answers (student report).
      const type = data.userType === "teacher" ? "class" : "student";
      state = state
        .set("type", type)
        .set("nowShowing", type)
        .set("clazzName", data.classInfo.name)
        .set("clazzId", data.classInfo.id)
        .set("students", Map(data.classInfo.students.map(student => [student.id.toString(), Map(student)])));
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
    case SET_NOW_SHOWING:
      return state.set("nowShowing", action.value);
    case SET_QUESTION_SELECTED:
      return state.setIn(["questions", action.key, "selected"], action.value);
    case HIDE_UNSELECTED_QUESTIONS:
      return hideUnselectedQuestions(state);
    case SHOW_UNSELECTED_QUESTIONS:
      return showUnselectedQuestions(state);
    case SET_ANONYMOUS:
      return setAnonymous(state, action.value);
    case SET_ANSWER_SELECTED_FOR_COMPARE:
      const compareViewAns = state.get("compareViewAnswers");
      if (compareViewAns) {
        // If compare view is open and user unselect given answer, remove it from the compare set too.
        // It's possible, as there is "Remove" link in the compare view.
        state = state.set("compareViewAnswers", compareViewAns.delete(action.key));
      }
      return state.setIn(["answers", action.key, "selectedForCompare"], action.value);
    case SHOW_COMPARE_VIEW:
      const selectedAnswerKeys = state.get("answers")
        .filter(a => a.get("selectedForCompare") && a.get("embeddableKey") === action.embeddableKey)
        .map(a => a.get("key"))
        .values();
      return state.set("compareViewAnswers", Set(selectedAnswerKeys));
    case HIDE_COMPARE_VIEW:
      return state.set("compareViewAnswers", null);
    case ENABLE_FEEDBACK:
      return enableFeedback(state, action);
    case ENABLE_ACTIVITY_FEEDBACK:
      return enableActivityFeedback(state, action);
    default:
      return state;
  }
}

export default function reducer(state = Map(), action) {
  return Map({
    view: view(state.get("view"), action),
    data: data(state.get("data"), action),
    report: report(state.get("report"), action),
    feedbacks: feedbackReducer(state.get("feedbacks"), action),
    rubrics: rubricReducer(state.get("rubrics"), action),
    activityFeedbacks: activityFeedbackReducer(state.get("activityFeedbacks"), action),
    dashboard: dashboardReducer(state.get("dashboard"), action),
  });
}
