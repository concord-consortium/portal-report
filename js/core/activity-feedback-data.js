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

function feedbackIsMarkedComplete(_feedback) {
  const feedback = _feedback.get('feedbacks') && _feedback.get('feedbacks').first()
  return feedback && feedback.get("hasBeenReviewed")
}

function hasLearner(feedback) {
  return feedback.get("learnerId")
}

export function getFeedbacksNeedingReview(feedbacks) {
  return feedbacks
    .filter( f => ! feedbackIsMarkedComplete(f))
    .filter( f => hasLearner(f))
}

export function getFeedbacksNotAnswered(feedbacks) {
  return feedbacks
    .filter( f => ! hasLearner(f))
}


export function getQuestions(state, activityId) {
  const report = state.get('report')
  const activity = state.getIn(['report','activities', activityId.toString()])

  // activity → sections → pages → questions
  return activity.get('children')
    .map(sectionId => report.getIn(['sections', sectionId.toString()]))
    .map(section   => section.get('children'))
    .flatten()
    .map(pageId    => report.getIn(['pages', pageId.toString()]))
    .map(page      => page.get('children'))
    .flatten()
    .map(key       => report.getIn(['questions', key.toString()]))
}

export function getComputedMaxScore(questions) {
  return questions
    .map(question  => question.get('maxScore') || 0)
    .reduce( (total, score) => total + score)
}

export function getActivityFeedbacks(state, activityId) {
  const students = state.getIn(['report','students']).sortBy(s => s.get('lastName'))
  const activity = state.getIn(['report','activities', activityId.toString()])
  const result = students.map( s => activityFeedbackFor(state, activity, s))
  return students.map( s => activityFeedbackFor(state, activity, addRealName(s))).toList()
}