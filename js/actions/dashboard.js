export const SET_ACTIVITY_EXPANDED = 'SET_ACTIVITY_EXPANDED'
export const SET_STUDENT_EXPANDED = 'SET_STUDENT_EXPANDED'
export const SET_STUDENT_SORT = 'SET_STUDENT_SORT'

export const SORT_BY_NAME = 'NAME'
export const SORT_BY_MOST_PROGRESS = 'MOST_PROGRESS'
export const SORT_BY_LEAST_PROGRESS = 'LEAST_PROGRESS'

export function setActivityExpanded (activityId, value) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_ACTIVITY_EXPANDED,
      activityId,
      value
    })
    if (!value) {
      // When user collapses activity, check if anything else is expanded.
      // If not, collapse all the student rows too.
      const expandedActivities = getState().getIn(['dashboard', 'expandedActivities'])
      if (!expandedActivities.includes(true)) {
        getState().getIn(['dashboard', 'expandedStudents']).forEach((expanded, studentId) =>
          expanded && dispatch(setStudentExpanded(studentId, false))
        )
      }
    }
  }
}

export function setStudentExpanded (studentId, value) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_STUDENT_EXPANDED,
      studentId,
      value
    })
    if (value) {
      // When user expands student row, check if there's at least one expanded activity.
      // If not, expand the fist one.
      const expandedActivities = getState().getIn(['dashboard', 'expandedActivities'])
      if (!expandedActivities.includes(true)) {
        const firstActivity = getState().getIn(['report', 'activities']).first()
        dispatch(setActivityExpanded(firstActivity.get('id'), true))
      }
    }
  }
}

export function setStudentSort (value) {
  return {
    type: SET_STUDENT_SORT,
    value
  }
}
