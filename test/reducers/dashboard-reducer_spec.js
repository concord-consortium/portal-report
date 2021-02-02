import dashboardReducer from "../../js/reducers/dashboard-reducer";
import * as types from "../../js/actions/dashboard";

describe("dashboard reducer", () => {
  it("should return the initial state", () => {
    expect(dashboardReducer(undefined, {}).toJS()).toEqual({
      sortBy: types.SORT_BY_NAME,
      expandedActivities: {},
      expandedQuestions: {},
      expandedStudents: {},
      selectedQuestion: null,
      currentActivityId: null,
      currentQuestionId: null,
      currentStudentId: null,
      compactReport: false,
      hideFeedbackBadges: false,
      feedbackSortBy: types.SORT_BY_FEEDBACK_NAME,
      feedbackSortRefreshEnabled: true,
    });
  });

  it("should handle SET_ACTIVITY_EXPANDED", () => {
    const state1 = dashboardReducer(undefined, {
      type: types.SET_ACTIVITY_EXPANDED,
      activityId: 123,
      value: true
    });
    expect(state1.get("expandedActivities").toJS()).toEqual({ 123: true });

    const state2 = dashboardReducer(state1, {
      type: types.SET_ACTIVITY_EXPANDED,
      activityId: 123,
      value: false
    });
    expect(state2.get("expandedActivities").toJS()).toEqual({ 123: false });
  });

  it("should handle SET_STUDENT_EXPANDED", () => {
    const state1 = dashboardReducer(undefined, {
      type: types.SET_STUDENT_EXPANDED,
      studentId: 123,
      value: true
    });
    expect(state1.get("expandedStudents").toJS()).toEqual({ 123: true });

    const state2 = dashboardReducer(state1, {
      type: types.SET_STUDENT_EXPANDED,
      studentId: 123,
      value: false
    });
    expect(state2.get("expandedStudents").toJS()).toEqual({ 123: false });
  });

  it("should handle SET_STUDENTS_EXPANDED", () => {
    const state1 = dashboardReducer(undefined, {
      type: types.SET_STUDENTS_EXPANDED,
      studentIds: [1, 2, 3],
      value: true
    });
    expect(state1.get("expandedStudents").toJS()).toEqual({ 1: true, 2: true, 3: true });

    const state2 = dashboardReducer(state1, {
      type: types.SET_STUDENTS_EXPANDED,
      studentIds: [1, 2],
      value: false
    });
    expect(state2.get("expandedStudents").toJS()).toEqual({ 1: false, 2: false, 3: true });
  });

  it("should handle SELECT_QUESTION", () => {
    const someQuestion = {id: 1, prompt: "this is the prompt", answers: []};
    const state1 = dashboardReducer(undefined, {
      type: types.SELECT_QUESTION,
      value: someQuestion
    });
    expect(state1.get("selectedQuestion")).toEqual(someQuestion);

    const state2 = dashboardReducer(state1, {
      type: types.SELECT_QUESTION,
      value: null
    });
    expect(state2.get("selectedQuestion")).toBe(null);
  });
});
