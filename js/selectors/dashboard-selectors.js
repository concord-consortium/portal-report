import { fromJS } from 'immutable'
import { createSelector } from 'reselect'
import { getActivityTrees } from './report-tree'

// Inputs
const getStudents = state => state.getIn(['report', 'students'])
const getDashboardSortBy = state => state.getIn(['dashboard', 'sortBy'])

// Selectors

// Returns following hash:
// {
//   <activity_id_1>: {
//     <student_id_1>: 0.8,
//     <student_id_2>: 0.45,
//     (...)
//   },
//   <activity_id_2>: {
//     <student_id_1>: 0.15,
//     <student_id_2>: 0.8,
//     (...)
//   },
//   (...)
// }
export const getActivityProgress = createSelector(
  [ getActivityTrees ],
  (activities) => {
    return activities.map(activity => {
      const activityQuestions = activity.get('children').map(
        section => section.get('children').map(
          page => page.get('children')
        )
      // Flatten 2 levels only, so ImmutableJS doesn't try to flatten question object.
      ).flatten(2)
      const completedQuestions = {}
      activityQuestions.forEach(question => {
        question.get('answers').forEach(answer => {
          const studentId = answer.get('student').get('id')
          if (completedQuestions[studentId] === undefined) {
            completedQuestions[studentId] = 0
          }
          // Question is completed by student only if it's there's some answer and it's submitted.
          // Note that non-required answers are "submitted" by default.
          if (answer.get('type') !== 'NoAnswer' && answer.get('submitted')) {
            completedQuestions[studentId] += 1
          }
        })
      })
      // Return map which has progress in [0, 1] range.
      const questionsCount = activityQuestions.count()
      return fromJS(completedQuestions).map(count => count / questionsCount)
    })
  }
)

// Returns sorted students.
export const sortedStudents = createSelector(
  [ getStudents, getDashboardSortBy ],
  (students, sortBy) => {
    if (sortBy === 'name') {
      return students.toList().sortBy(student =>
        (student.get('lastName') + student.get('firstName')).toLowerCase()
      )
    }
  }
)
