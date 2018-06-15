export const SET_ACTIVITY_EXPANDED = 'SET_ACTIVITY_EXPANDED'
export const SET_STUDENT_EXPANDED = 'SET_STUDENT_EXPANDED'

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
      const expandedActivities = getState().get('dashboard').get('expandedActivities')
      if (!expandedActivities.includes(true)) {
        getState().get('dashboard').get('expandedStudents').forEach((expanded, studentId) =>
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
      const expandedActivities = getState().get('dashboard').get('expandedActivities')
      if (!expandedActivities.includes(true)) {
        const firstActivity = getState().get('report').get('activities').first()
        dispatch(setActivityExpanded(firstActivity.get('id'), true))
      }
    }
  }
}
