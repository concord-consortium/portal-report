import { createSelector } from 'reselect'
import { fromJS, Map as IMap } from 'immutable'
import {
  AUTOMATIC_SCORE,
  MAX_SCORE_DEFAULT,
  RUBRIC_SCORE
} from '../util/scoring-constants'

/* These functions compute data for views.
 * Some of the computations are expensive, so we use reselect to memoize
 * the results. Because we use the selectors on multiple components and
 * because we use the components `props` for our calculations, we use
 * `makeGet<property>` to bind each memoized function with a single component.
 * See: https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances
 *
 * When we compose selectors, we must first instantiate the parent
 * selectors by something like `const getFoo = makeGetFoo()` and then
 * pass the memoized selectors as arguments to `createSelector`
 * See the reselect docs: https://github.com/reduxjs/reselect
 /

/*************************************************************************
 * Simple helper functions:
 *************************************************************************/
const keyFor = (activity, student) => `${activity.get('id')}-${student.get('id')}`

const isNumeric = obj => obj !== undefined && typeof (obj) === 'number' && !isNaN(obj)

// If a student has no feedback yet, use this template:
const newFeedback = (_activity, _student) => {
  const student = _student.toJS()
  const key = keyFor(_activity, _student)
  const newFeedbackRecord = {
    student,
    key,
    studentId: student.id,
    feedbacks: [{ feedback: '', score: 0, hasBeenReviewed: false }]
  }
  return fromJS(newFeedbackRecord)
}

// Add the students realname to the student record.
const addRealName = (student) => {
  return student.set('realName', `${student.get('firstName')} ${student.get('lastName')}`)
}

// return existing or now activityFeedback for a student
// Includes merged student data
const activityFeedbackFor = (activity, student, feedbacks) => {
  const key = keyFor(activity, student)
  const found = feedbacks.get(key)
  if (found) {
    return found.set('student', student)
  }
  return newFeedback(activity, student)
}

const feedbackIsMarkedComplete = (fb) => {
  const feedback = fb.get('feedbacks') && fb.get('feedbacks').first()
  return feedback && feedback.get('hasBeenReviewed')
}

const hasLearner = (feedback) => !!feedback.get('learnerId')

const getFeedbacksNotAnswered = (fbs) => fbs.filter(f => !hasLearner(f))

const getFeedbacksNeedingReview = (feedbacks) => {
  return feedbacks
    .filter(f => !feedbackIsMarkedComplete(f))
    .filter(f => hasLearner(f))
}

const formatStudents = (students) => students
  .sortBy(s => s.get('lastName'))
  .map(s => addRealName(s))

/*************************************************************************
 * Simple selectors:
 *************************************************************************/
const getReport = (state) => state.get('report')
const getActivity = (state, props) => props.activity
const getActivityFeedbacks = (state) => state.get('activityFeedbacks')
const getQuestionFeedbacks = (state) => state.get('feedbacks')
const getStudents = (state) => state.getIn(['report', 'students'])
const getRubics = (state) => state.get('rubrics')

/*************************************************************************
 * Composite selectors (composed of other selectors).
 * These are created via factory methods so each component has its own instance.
 * Most of these depend (via cascaded selector input) on the activty.
 * We partition our selectors based on the activity to limit cascading cache
 * invadliations. Because the activityID is not part of the state tree
 * we get the value from the component `props`.
 *************************************************************************/

// Memoization factory for thes score type
// Updates when the activity Changes
const makeGetScoreType = () => createSelector(
  getActivity,
  (activity) => activity.get('scoreType')
)

// Memoization factory for the rubric
// Updates when the rubric, or activity Changes
export const makeGetRubric = () => createSelector(
  getRubics,
  getActivity,
  (rubrics, activity) => {
    const rubricUrl = activity.get('rubricUrl')
    const rubric = rubrics.get(rubricUrl) ? rubrics.get(rubricUrl).toJS() : null
    return rubric
  }
)

/*******************************************************************************
IActivity {
  id: int,
  type: 'Activity',
  maxScore: int
  name: string,
  scoreType: string 'manual|atuo|rubric|none'
  activityFeedback: string[] // feedback id's
  activityFeedbackId: int // ID for feedback ?? Can we get rid of this?
  enableTextFeedback: boolean
  children: Map[] // a nested tree of sections → pages → questions → answers …
  questions: nested tree of questions …
  pages: nested tree of pages …
}

IStudent{
  firstName: string,
  id: integer,
  lastName: string,
  name: string,
  realName: string,  // duplicate of 'name'
  startedOffering: boolean
}

IAFeedback {
  feedback: string,
  hasBeenReviewed: boolean,
  rubricFeedback: {IRubricFeedback},
  score
}

IActivityFeedbacks {
  key: string,
  learnerID: integer,
  studentID: integer,
  feedbacks: [IAFeedback]
}
 ******************************************************************************/

/*******************************************************************************
 * @function getStudentFeedbacks : blah
 * @argument activity : IActivity
 * @argument students : Map <IStudent> - description
 * @argument activityFeedbacks : Map <activityID: <IActivityFeedback>
 * @returns {
    feedbacks:
    activityFeedbacks:
    feedbacksNeedingReview:
    feedbacksNotAnswered:
    numFeedbacksNeedingReview:
    scores:
    rubricFeedbacks:
  }
 ******************************************************************************/
export const getStudentFeedbacks = (activity, _students, _activityFeedbacks) => {

  const students = formatStudents(_students)
  const feedbacks = students.map(s => activityFeedbackFor(activity, s, _activityFeedbacks)).toList()
  const feedbacksNeedingReview = getFeedbacksNeedingReview(feedbacks)
  const activityFeedbacks = _activityFeedbacks
  const feedbacksNotAnswered = getFeedbacksNotAnswered(feedbacks)
  const numFeedbacksNeedingReview = feedbacksNeedingReview.size

  const lastFeedbacks = activityFeedbacks
    .map(f => f.get('feedbacks').first())
    .filter(f => f && f.get('hasBeenReviewed'))

  const scores = lastFeedbacks
    .map(f => f.get('score'))
    .filter(x => x)
    .toList()
    .toJS()

  const rubricFeedbacks = lastFeedbacks
    .map(f => f.get('rubricFeedback'))
    .filter(x => x)
    .toList()
    .toJS()

  const returnValue = {
    feedbacks,
    activityFeedbacks,
    feedbacksNeedingReview,
    feedbacksNotAnswered,
    numFeedbacksNeedingReview,
    scores, // This value is an array with length 1 …
    rubricFeedbacks
  }
  return returnValue
}

// Memoization factory for student activty feedback
// changes to activity, students, or actFeedbacks cause update.
export const makeGetStudentFeedbacks = () => {
  return createSelector(
    getActivity,
    getStudents,
    getActivityFeedbacks,
    (activity, _students, _activityFeedbacks) => getStudentFeedbacks(activity, _students, _activityFeedbacks)
  )
}

// Memoization factory: all Activity questions
// changes to report, or activity cause update.
export const makeGetQuestions = () => createSelector(
  getReport,
  getActivity,
  (report, activity) => {
    const sections = activity.get('children')
    const pages = sections.flatMap(s => s.get('children'))
    const questions = pages.flatMap(page => page.get('children'))
    return questions.map((v, i) => report.getIn(['questions', v.get('key')]))
  }
)

// Memoization factory: Automatic scores.
// updates when report, question, or question feedback changs.
export const makeGetQuestionAutoScores = () => {
  const getQuestions = makeGetQuestions()
  return createSelector(
    getReport,
    getQuestions,
    getQuestionFeedbacks,
    (report, questions, questionFeedbacks) => {
      const getFeedbackScore = (feedbackId) => {
        const score = questionFeedbacks.getIn([feedbackId, 'score'])
        const reviewed = questionFeedbacks.getIn([feedbackId, 'hasBeenReviewed'])
        const computedScore = reviewed ? (score || 0) : false
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
          .filter(a => isNumeric(a))
        )
      const sums = scores.map(s => s.reduce((sum, v) => sum + v, 0))
      return sums
    }
  )
}

/*******************************************************************************
 * @function getRubricScores : return scores from most recent rubric feedback
 * TODO: We `export` this function so we can test it.
 * TODO: We should consider cleaning up the function arguments so they are more
 * consistent. e.g. make them all Immutable ... also: `feedbacks.feedbacks`?
 * @argument rubric : Plain JSObj (not immutable?!) type IRubricDef
 * @argument feedbacks : Plain JSObj containing {feedbacks: <Immutable Map> }
 * @returns scores : IMap  ( {'<student-id>': score} )
 ******************************************************************************/
export const getRubricScores = (rubric, feedbacks) => {
  let scores = IMap({})
  feedbacks.feedbacks
    .forEach(feedbackRecord => {
      const feedback = feedbackRecord.get('feedbacks').first()
      const key = feedbackRecord.get('studentId')
      let score = null
      if (feedback && feedback.get('rubricFeedback')) {
        const rubricFeedback = feedback.get('rubricFeedback')
        score = rubricFeedback.map((v, k) => v.get('score')).reduce((p, n) => p + n)
        scores.set(key, score)
      }
      scores = scores.set(key, score)
    })
  return scores
}

// Memoization factory: rubric feedback
// updates whenever rubric or feedbacks change
const makeGetRubricScores = () => {
  const getFeedbacks = makeGetStudentFeedbacks()
  const getRubric = makeGetRubric()
  return createSelector(
    getRubric,
    getFeedbacks,
    getRubricScores
  )
}

export const getAutoscores = (scoreType, rubricScores, questionAutoScores) => {
  switch (scoreType) {
    case RUBRIC_SCORE:
      return rubricScores.filter(isNumeric)
    case AUTOMATIC_SCORE:
    default:
      return questionAutoScores
  }
}

// Memoization factory: for automatic scoring (both types)
// updates when rubricscores or question scores changes.
export const makeGetAutoScores = () => {
  const getScoreType = makeGetScoreType()
  const getRubricScores = makeGetRubricScores()
  const getQuestionAutoScores = makeGetQuestionAutoScores()
  return createSelector(
    getScoreType,
    getRubricScores,
    getQuestionAutoScores,
    getAutoscores
  )
}

// Memoization factory for the maximum auto score
// Updates when questions are changed.
const makeGetAutoMaxScore = () => {
  const getQuestions = makeGetQuestions()
  return createSelector(
    getQuestions,
    (questions) => {
      return questions
        .filter(question => question.get('scoreEnabled'))
        .map(question => isNumeric(question.get('maxScore'))
          ? question.get('maxScore')
          : MAX_SCORE_DEFAULT)
        .reduce((total, score) => total + score, 0)
    }
  )
}

// Memoization factory for the maximum rubric score
// Updates when rubric changes.
const makeGetRubricMaxScore = () => {
  const maxReducer = (prev, current) => current > prev ? current : prev
  const getRubric = makeGetRubric()
  return createSelector(
    getRubric,
    (rubric) => {
      if (!rubric) { return 0 }
      const criteria = rubric.criteria
      const ratings = rubric.ratings
      const numCrit = (criteria && criteria.length) || 0
      const maxScore = ratings.map((r, i) => r.score || i).reduce(maxReducer, 0)
      return numCrit * maxScore
    }
  )
}

// Memoization factory for the maximum score,
// Updates when scoreType, autoMaxScore, or rubricMaxScore changes.
export const makeGetComputedMaxScore = (questions, rubric, scoreType) => {
  const getScoreType = makeGetScoreType()
  const getAutoMaxScore = makeGetAutoMaxScore()
  const getRubricMaxScore = makeGetRubricMaxScore()
  return createSelector(
    getScoreType,
    getAutoMaxScore,
    getRubricMaxScore,
    (scoreType, autoMaxScore, rubicMaxScore) => {
      switch (scoreType) {
        case AUTOMATIC_SCORE:
          return autoMaxScore
        case RUBRIC_SCORE:
          return rubicMaxScore
      }
      return MAX_SCORE_DEFAULT
    }
  )
}
