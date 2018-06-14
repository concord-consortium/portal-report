export const SET_ACTIVITY_EXPANDED = 'SET_ACTIVITY_EXPANDED'
export const SET_STUDENT_EXPANDED = 'SET_STUDENT_EXPANDED'

export function setActivityExpanded (activityId, value) {
  return {
    type: SET_ACTIVITY_EXPANDED,
    activityId,
    value
  }
}

export function setStudentExpanded (studentId, value) {
  return {
    type: SET_ACTIVITY_EXPANDED,
    studentId,
    value
  }
}
