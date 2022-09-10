export const SET_ACTIVITY_EXPANDED = "SET_ACTIVITY_EXPANDED";
export const SET_STUDENT_EXPANDED = "SET_STUDENT_EXPANDED";
export const SET_STUDENTS_EXPANDED = "SET_STUDENTS_EXPANDED";
export const SET_STUDENT_SORT = "SET_STUDENT_SORT";
export const SET_STUDENT_FEEDBACK_SORT = "SET_STUDENT_FEEDBACK_SORT";

export const SET_CURRENT_ACTIVITY = "SET_CURRENT_ACTIVITY";
export const SET_CURRENT_QUESTION = "SET_CURRENT_QUESTION";
export const SET_CURRENT_STUDENT = "SET_CURRENT_STUDENT";
export const TOGGLE_CURRENT_ACTIVITY = "TOGGLE_CURRENT_ACTIVITY";
export const TOGGLE_CURRENT_QUESTION = "TOGGLE_CURRENT_QUESTION";
export const TOGGLE_ALL_RESPONSES_TO_CURRENT_QUESTION = "TOGGLE_ALL_RESPONSES_TO_CURRENT_QUESTION";

export const SORT_BY_NAME = "NAME";
export const SORT_BY_MOST_PROGRESS = "MOST_PROGRESS";
export const SORT_BY_LEAST_PROGRESS = "LEAST_PROGRESS";
export const SORT_BY_FEEDBACK_NAME = "FEEDBACK_NAME";
export const SORT_BY_FEEDBACK_PROGRESS = "FEEDBACK_PROGRESS";

export const SET_QUESTION_EXPANDED = "SET_QUESTION_EXPANDED";
export const SELECT_QUESTION = "SELECT_QUESTION";

export const SET_COMPACT_REPORT = "SET_COMPACT_REPORT";
export const SET_HIDE_FEEDBACK_BADGES = "SET_HIDE_FEEDBACK_BADGES";
export const SET_FEEDBACK_SORT_REFRESH_ENABLED = "SET_FEEDBACK_SORT_REFRESH_ENABLED";

export const TRACK_EVENT = "TRACK_EVENT";

export function setActivityExpanded(activityId, value) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_ACTIVITY_EXPANDED,
      activityId,
      value,
    });
    if (!value) {
      // When user collapses activity, check if anything else is expanded.
      // If not, collapse all the student rows too.
      const expandedActivities = getState().getIn(["dashboard", "expandedActivities"]);
      if (!expandedActivities.includes(true)) {
        getState().getIn(["dashboard", "expandedStudents"]).forEach((expanded, studentId) =>
          expanded && dispatch(setStudentExpanded(studentId, false)),
        );
      }
    }
  };
}


export function setQuestionExpanded(questionId, value) {
  return {
    type: SET_QUESTION_EXPANDED,
    questionId,
    value,
  };
}

function checkActivityExpanded(dispatch, getState) {
  const expandedActivities = getState().getIn(["dashboard", "expandedActivities"]);
  if (!expandedActivities.includes(true)) {
    const firstActivity = getState().getIn(["report", "activities"]).first();
    dispatch(setActivityExpanded(firstActivity?.id, true));
  }
}

export function setStudentExpanded(studentId, value) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_STUDENT_EXPANDED,
      studentId,
      value,
    });
    if (value) {
      // When user expands student row, check if there's at least one expanded activity.
      // If not, expand the fist one.
      checkActivityExpanded(dispatch, getState);
    }
  };
}

export function setStudentsExpanded(studentIds, value) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_STUDENTS_EXPANDED,
      studentIds,
      value,
    });
    if (value) {
      checkActivityExpanded(dispatch, getState);
    }
  };
}

export function setStudentSort(value) {
  return {
    type: SET_STUDENT_SORT,
    value,
  };
}

export function setStudentFeedbackSort(value) {
  return {
    type: SET_STUDENT_FEEDBACK_SORT,
    value,
  };
}

export function selectQuestion(value) {
  return {
    type: SELECT_QUESTION,
    value,
  };
}

export function setCurrentActivity(activityId) {
  return {
    type: SET_CURRENT_ACTIVITY,
    value: activityId,
  };
}

export function setCurrentQuestion(questionId) {
  return {
    type: SET_CURRENT_QUESTION,
    value: questionId,
  };
}

export function setCurrentStudent(studentId) {
  return {
    type: SET_CURRENT_STUDENT,
    value: studentId,
  };
}

export function toggleCurrentActivity(activityId) {
  return {
    type: TOGGLE_CURRENT_ACTIVITY,
    value: activityId,
  };
}

export function toggleCurrentQuestion(questionId) {
  return {
    type: TOGGLE_CURRENT_QUESTION,
    value: questionId,
  };
}

export function setCompactReport(isCompact) {
  return {
    type: SET_COMPACT_REPORT,
    value: isCompact,
  };
}

export function setHideFeedbackBadges(hideFeedbackBadges) {
  return {
    type: SET_HIDE_FEEDBACK_BADGES,
    value: hideFeedbackBadges,
  };
}

export function setFeedbackSortRefreshEnabled(refreshEnabled) {
  return {
    type: SET_FEEDBACK_SORT_REFRESH_ENABLED,
    value: refreshEnabled,
  };
}
