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
  SORT_BY_FEEDBACK_PROGRESS,
  SET_HIDE_LAST_RUN,
} from "../actions/dashboard";

export type SortOption = typeof SORT_BY_NAME
  | typeof SORT_BY_MOST_PROGRESS
  | typeof SORT_BY_LEAST_PROGRESS
  | typeof SORT_BY_FEEDBACK_PROGRESS;

export const SORT_OPTIONS_CONFIG: Record<"default" | "question" | "feedback", ReadonlyArray<SortOption>> = {
  default: [SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS],
  feedback: [SORT_BY_NAME, SORT_BY_FEEDBACK_PROGRESS, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS],
  question: [SORT_BY_NAME]
} as const;

export interface IDashboardState {
  // Old dashboard props
  expandedActivities: Map<any, any>;
  expandedStudents: Map<any, any>;
  expandedQuestions: Map<any, any>;
  selectedQuestion: Map<any, any> | null;
  // New/common dashboard props
  sortBy: SortOption;
  currentActivityId: string | null;
  currentQuestionId: string | null;
  currentStudentId: string | null;
  compactReport: boolean;
  hideFeedbackBadges: boolean;
  hideLastRun: boolean;
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
  hideLastRun: false,
  feedbackSortRefreshEnabled: false,
});

export class DashboardState extends INITIAL_DASHBOARD_STATE implements IDashboardState {
  constructor(config: Partial<IDashboardState>) {
    super(config);
  }
  sortBy: SortOption;
  expandedActivities: Map<any, any>;
  expandedStudents: Map<any, any>;
  expandedQuestions: Map<any, any>;
  selectedQuestion: Map<any, any> | null;
  currentActivityId: string | null;
  currentQuestionId: string | null;
  currentStudentId: string | null;
  compactReport: boolean;
  hideFeedbackBadges: boolean;
  hideLastRun: boolean;
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
      const validSort = SORT_OPTIONS_CONFIG.default.indexOf(action.value) !== -1 ? action.value : SORT_BY_NAME;
      return state.set("sortBy", validSort);
    case SET_STUDENT_FEEDBACK_SORT:
     const validFeedbackSort = SORT_OPTIONS_CONFIG.feedback.indexOf(action.value) !== -1 ? action.value : SORT_BY_NAME;
      return state.set("sortBy", validFeedbackSort);
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
    case SET_HIDE_LAST_RUN:
      return state.set("hideLastRun", action.value);
    case SET_FEEDBACK_SORT_REFRESH_ENABLED:
      return state.set("feedbackSortRefreshEnabled", action.value);
    default:
      return state;
  }
}
