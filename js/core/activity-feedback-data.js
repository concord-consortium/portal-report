import { fromJS, Map as IMap } from 'immutable'
import {
  AUTOMATIC_SCORE,
  MAX_SCORE_DEFAULT,
  RUBRIC_SCORE
} from '../util/scoring-constants'

function keyFor (activity, student) {
  return `${activity.get('id')}-${student.get('id')}`
}

function newFeedback (_activity, _student) {
  const student = _student.toJS()
  const key = keyFor(_activity, _student)
  const obj = {
    student: student,
    studentId: student.id,
    key: key,
    feedbacks: [{
      feedback: '',
      score: 0,
      hasBeenReviewed: false
    }]
  }
  return fromJS(obj)
}

function activityFeedbackFor (state, activity, student) {
  const key = keyFor(activity, student)
  const found = state.getIn(['activityFeedbacks', key])
  if (found) {
    return found.set('student', student)
  }
  return newFeedback(activity, student)
}

function addRealName (student) {
  return student.set('realName', `${student.get('firstName')} ${student.get('lastName')}`)
}

function feedbackIsMarkedComplete (_feedback) {
  const feedback = _feedback.get('feedbacks') && _feedback.get('feedbacks').first()
  return feedback && feedback.get('hasBeenReviewed')
}

function hasLearner (feedback) {
  return feedback.get('learnerId')
}

export function getFeedbacksNeedingReview (feedbacks) {
  return feedbacks
    .filter(f => !feedbackIsMarkedComplete(f))
    .filter(f => hasLearner(f))
}

export function getFeedbacksNotAnswered (feedbacks) {
  return feedbacks
    .filter(f => !hasLearner(f))
}

export function getQuestions (state, activityId) {
  const report = state.get('report')
  const activity = state.getIn(['report', 'activities', activityId.toString()])

  // activity → sections → pages → questions
  return activity.get('children')
    .map(sectionId => report.getIn(['sections', sectionId.toString()]))
    .map(section => section.get('children'))
    .flatten()
    .map(pageId => report.getIn(['pages', pageId.toString()]))
    .map(page => page.get('children'))
    .flatten()
    .map(key => report.getIn(['questions', key.toString()]))
}

function calculateStudentAutoScores (state, questions) {
  const report = state.get('report')
  const getFeedbackScore = (feedbackId) => {
    const score = state.getIn(['feedbacks', feedbackId, 'score'])
    const reviewed = state.getIn(['feedbacks', feedbackId, 'hasBeenReviewed'])
    const computedScore = reviewed ? (score || 0) : 0
    return computedScore
  }

  const scores = questions
    .filter(question => question.get('scoreEnabled'))
    .map(q => q.get('answers'))
    .flatten()
    .map(answerId => report.getIn(['answers', answerId]))
    .groupBy(answer => answer.get('studentId'))
    .map(studentAnswer => studentAnswer
      .filter(ans => ans.get('feedbacks'))
      .map(ans => ans.get('feedbacks').last())
      .map(feedbackId => getFeedbackScore(feedbackId))
    )
  const sums = scores.map(s => s.reduce((sum, v) => sum + v, 0))
  return sums
}

function calculateStudentRubricScores (rubric, feedbacks) {
  let scores = IMap({})
  feedbacks
    .forEach(feedbackRecord => {
      const feedback = feedbackRecord.get('feedbacks').last()
      const key = feedbackRecord.get('studentId')
      let score = null
      if (feedback.get('rubricFeedback')) {
        const rubricFeedback = feedback.get('rubricFeedback')
        score = rubricFeedback.map((k, v) => k.get('score')).reduce((p, n) => p + n)
        scores.set(key, score)
      }
      scores = scores.set(key, score)
    })
  return scores
}

export function calculateStudentScores (state, questions, rubric, feedbacks, scoreType) {
  const isNumeric = obj => obj !== undefined && typeof (obj) === 'number' && !isNaN(obj)
  switch (scoreType) {
    case RUBRIC_SCORE:
      return calculateStudentRubricScores(rubric, feedbacks).filter(isNumeric)
    case AUTOMATIC_SCORE:
    default:
      return calculateStudentAutoScores(state, questions)
  }
}

export function getComputedMaxScore (questions, rubric, scoreType) {
  switch (scoreType) {
    case AUTOMATIC_SCORE:
      return getComputedAutoMaxScore(questions)
    case RUBRIC_SCORE:
      return getComputedRubicMaxScore(rubric)
  }
  return MAX_SCORE_DEFAULT
}

export function getComputedAutoMaxScore (questions) {
  return questions
    .filter(question => question.get('scoreEnabled'))
    .map(question => question.get('maxScore') || MAX_SCORE_DEFAULT)
    .reduce((total, score) => total + score, 0)
}

export function getComputedRubicMaxScore (rubric) {
  const maxReducer = (prev, current) => current > prev ? current : prev
  const numCrit = rubric.criteria.length || 0
  const maxScore = rubric.ratings.map(r => r.score || 0).reduce(maxReducer, 0)
  return numCrit * maxScore
}

export function getActivityFeedbacks (state, activityId) {
  const students = state.getIn(['report', 'students']).sortBy(s => s.get('lastName'))
  const activity = state.getIn(['report', 'activities', activityId.toString()])
  return students.map(s => activityFeedbackFor(state, activity, addRealName(s))).toList()
}

export function getActivityRubric (state, activityId) {
  const activity = state.getIn(['report', 'activities', activityId.toString()])
  const rubricUrl = activity.get('rubricUrl')
  const rubric = state.getIn(['rubrics', rubricUrl])
  if (rubric) {
    return rubric.toJS ? rubric.toJS() : rubric
  }
  return null
}
