import { student } from "./report-data"
import { fromJS } from "immutable"

function keyFor(activity, student) {
  return `${activity.get("id")}-${student.get("id")}`
}

function newFeedback(_activity, _student) {
  const student = _student.toJS()
  const activity = _activity.toJS()
  const key = keyFor(_activity, _student)
  const obj = {
    student: student,
    studentId: student.id,
    key: key,
    feedbacks: [{
      feedback: "",
      score: 0,
      hasBeenReviewed: false
    }]
  }
  return fromJS(obj)
}

function activityFeedbackFor(state, activity, student) {
  const key = keyFor(activity,student)
  const found = state.getIn(['activityFeedbacks', key])
  if(found) {
    return found.set('student', student)
  }
  return newFeedback(activity, student)
}

function addRealName(student) {
  return student.set('realName', `${student.get('firstName')} ${student.get('lastName')}`)
}

export function activityFeedbacks(state, activityId) {
  const students = state.getIn(['report','students']).sortBy(s => s.get('lastName'))
  const activity = state.getIn(['report','activities', activityId.toString()])
  const result = students.map( s => activityFeedbackFor(state, activity, s))
  return students.map( s => activityFeedbackFor(state, activity, addRealName(s))).toList()
}