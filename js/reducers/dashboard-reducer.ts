import { RecordFactory } from "../util/record-factory";
import { Map } from "immutable";
import {
  SET_ACTIVITY_EXPANDED, SET_CURRENT_ACTIVITY, SET_CURRENT_QUESTION, SET_CURRENT_STUDENT,
  TOGGLE_CURRENT_ACTIVITY, TOGGLE_CURRENT_QUESTION, SET_STUDENT_FEEDBACK_SORT, SET_FEEDBACK_SORT_REFRESH_ENABLED,
  SET_STUDENT_EXPANDED, SET_STUDENTS_EXPANDED, SET_STUDENT_SORT, SET_COMPACT_REPORT, SET_HIDE_FEEDBACK_BADGES,
  SORT_BY_NAME, SET_QUESTION_EXPANDED,
  SELECT_QUESTION,
  SORT_BY_MOST_PROGRESS,
  SORT_BY_LEAST_PROGRESS,
  SORT_BY_FEEDBACK_NAME,
  SORT_BY_FEEDBACK_PROGRESS,
} from "../actions/dashboard";

type SortType = typeof SORT_BY_NAME | typeof SORT_BY_MOST_PROGRESS | typeof SORT_BY_LEAST_PROGRESS;
type FeedbackSortType = typeof SORT_BY_FEEDBACK_NAME | typeof SORT_BY_FEEDBACK_PROGRESS;

export interface IDashboardState {
  // Old dashboard props
  expandedActivities: Map<any, any>;
  expandedStudents: Map<any, any>;
  expandedQuestions: Map<any, any>;
  selectedQuestion: Map<any, any> | null;
  // New/common dashboard props
  sortBy: SortType;
  currentActivityId: string | null;
  currentQuestionId: string | null;
  currentStudentId: string | null;
  compactReport: boolean;
  hideFeedbackBadges: boolean;
  feedbackSortBy: FeedbackSortType;
  feedbackSortRefreshEnabled: boolean;
}

const INITIAL_DASHBOARD_STATE = RecordFactory<IDashboardState>({
  sortBy: SORT_BY_NAME,
  expandedActivities: Map(),
  expandedStudents: Map(),
  expandedQuestions: Map(),
  selectedQuestion: null,
  currentActivityId: null,
  currentQuestionId: null,
  currentStudentId: null,
  compactReport: false,
  hideFeedbackBadges: false,
  feedbackSortBy: SORT_BY_FEEDBACK_NAME,
  feedbackSortRefreshEnabled: false,
});

export class DashboardState extends INITIAL_DASHBOARD_STATE implements IDashboardState {
  constructor(config: Partial<IDashboardState>) {
    super(config);
  }
  sortBy: SortType;
  expandedActivities: Map<any, any>;
  expandedStudents: Map<any, any>;
  expandedQuestions: Map<any, any>;
  selectedQuestion: Map<any, any> | null;
  currentActivityId: string | null;
  currentQuestionId: string | null;
  currentStudentId: string | null;
  compactReport: boolean;
  hideFeedbackBadges: boolean;
  feedbackSortBy: FeedbackSortType;
  feedbackSortRefreshEnabled: boolean;
}

export default function dashboard(state = new DashboardState({}), action: any) {
  switch (action.type) {
    case SET_ACTIVITY_EXPANDED:
      return state.setIn(["expandedActivities", action.activityId.toString()], action.value);
    case SET_STUDENT_EXPANDED:
      return state.setIn(["expandedStudents", action.studentId.toString()], action.value);
    case SET_QUESTION_EXPANDED:
      return state.setIn(["expandedQuestions", action.questionId.toString()], action.value);
    case SET_STUDENTS_EXPANDED:
      action.studentIds.forEach((studentId: any) => {
        state = state.setIn(["expandedStudents", studentId.toString()], action.value);
      });
      return state;
    case SET_STUDENT_SORT:
      return state.set("sortBy", action.value);
    case SET_STUDENT_FEEDBACK_SORT:
      return state.set("feedbackSortBy", action.value);
    case SELECT_QUESTION:
      return state.set("selectedQuestion", action.value);
    case SET_CURRENT_ACTIVITY:
      return state.set("currentActivityId", action.value);
    case SET_CURRENT_QUESTION:
      return state.set("currentQuestionId", action.value);
    case SET_CURRENT_STUDENT:
      return state.set("currentStudentId", action.value);
    case TOGGLE_CURRENT_ACTIVITY:
      if (state.get("currentActivityId") === action.value) {
        return state.set("currentActivityId", null);
      } else {
        return state.set("currentActivityId", action.value);
      }
    case TOGGLE_CURRENT_QUESTION:
      if (state.get("currentQuestionId") === action.value) {
        return state.set("currentQuestionId", null);
      } else {
        return state.set("currentQuestionId", action.value);
      }
    case SET_COMPACT_REPORT:
      return state.set("compactReport", action.value);
    case SET_HIDE_FEEDBACK_BADGES:
      return state.set("hideFeedbackBadges", action.value);
    case SET_FEEDBACK_SORT_REFRESH_ENABLED:
      return state.set("feedbackSortRefreshEnabled", action.value);
    default:
      return state;
  }
}
