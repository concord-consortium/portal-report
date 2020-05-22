import { RecordFactory } from "../util/record-factory";
import { Map } from "immutable";
import {
  SET_ACTIVITY_EXPANDED, SET_STUDENT_EXPANDED,
  SET_STUDENTS_EXPANDED, SET_STUDENT_SORT,
  SORT_BY_NAME, SET_QUESTION_EXPANDED,
  SELECT_QUESTION,
  SORT_BY_MOST_PROGRESS,
  SORT_BY_LEAST_PROGRESS,
} from "../actions/dashboard";

type SortType = typeof SORT_BY_NAME | typeof SORT_BY_MOST_PROGRESS | typeof SORT_BY_LEAST_PROGRESS;

export interface IDashboardState {
  sortBy: SortType;
  expandedActivities: Map<any, any>;
  expandedStudents: Map<any, any>;
  expandedQuestions: Map<any, any>;
  selectedQuestion: Map<any, any> | null;
}

const INITIAL_DASHBOARD_STATE = RecordFactory<IDashboardState>({
  sortBy: SORT_BY_NAME,
  expandedActivities: Map(),
  expandedStudents: Map(),
  expandedQuestions: Map(),
  selectedQuestion: null,
});

export default function dashboard(state = new INITIAL_DASHBOARD_STATE({}), action: any) {
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
    case SELECT_QUESTION:
      return state.set("selectedQuestion", action.value);
    default:
      return state;
  }
}
